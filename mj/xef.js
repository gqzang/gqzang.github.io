const strToBytes = str => Array.from(str, char => char.charCodeAt(0))

function bytesToStr(byteArray) {
  let result = '';
  for (let i = 0; i < byteArray.length; i++)
    result += String.fromCharCode(byteArray[i]);
  return result;
}

function xor_crypt(src, mask) {
  const result = []
  const l = mask.length
  for(let i = 0; i < src.length; i ++ )
    result.push(src[i] ^ mask[i % l])
  return result
}

/*
  This version is about 50% faster than v0, by decoding a 190MB video, it takes
  about ~18S, while v0 takes ~28S.
  It reduces the the passing around long string, by using inner function.

  NOTE: after many various test of eliminating that 18S, which cause the browser un-responsive,
        looks like it is used for forming the response string (res->body), and all the other ops
        like decrypt large blook, allocate memory for Uint8Array, etc does not really take much
        time at all, and can't be reduced further.
  SO: we have to bear with the un-responsive time.
*/
function xef_decrypt(bStr, mask, bType='image/jpg') {
  var bytes = strToBytes(bStr.slice(0, 2))
  const linfo = bytes[0] * 256 + bytes[1]
  var cp = 2 + linfo                  // current position in bytes
  bytes = strToBytes(bStr.slice(2, cp))
  const info = bytesToStr(xor_crypt(bytes, mask)).split('|')
  const min_len = parseInt(info[0])

  const result = {}
  for(let i = 1; i < info.length; i += 2) {
    const fn = info[i], size = parseInt(info[i+1])
    const xStr = bStr.slice(cp, cp + Math.min(min_len, size))
    const xU8A = new Uint8Array(xor_crypt(strToBytes(xStr), mask))

    const batch = [], rU8As = [], BS = 1024*1024
    const a = cp + Math.min(min_len, size), b = cp + size, n = Math.floor((b-a)/BS)
    for(var p = a; p < b; p += BS ) rU8As.push(block_proc(p, Math.min(p+BS, b)))
    
    function block_proc(a, b)  {
      const u8A = new Uint8Array(b-a);
      for(let i = 0; i < b-a; i++) u8A[i] = bStr.charCodeAt(a+i)
      return u8A
    }

    result[fn] = new Blob([xU8A].concat(rU8As), { type: bType })
    cp += size
  }
  return result  
}

function xef_decrypt_v0(bStr, mask, bType='image/jpg') {
  var bytes = strToBytes(bStr.slice(0, 2))
  const linfo = bytes[0] * 256 + bytes[1]
  var cp = 2 + linfo                  // current position in bytes
  bytes = strToBytes(bStr.slice(2, cp))
  const info = bytesToStr(xor_crypt(bytes, mask)).split('|')
  const min_len = parseInt(info[0])

  const result = {}
  for(let i = 1; i < info.length; i += 2) {
    const fn = info[i], size = parseInt(info[i+1])
    const xStr = bStr.slice(cp, cp + Math.min(min_len, size))
    const xU8A = new Uint8Array(xor_crypt(strToBytes(xStr), mask))
    const rU8As = createU8As(bStr, cp + Math.min(min_len, size), cp + size)
    result[fn] = new Blob([xU8A].concat(rU8As), { type: bType })
    cp += size
  }
  return result
}

function createU8As(bStr, a, b) {
  const U8As = [], MAX = 10*1024*1024                      // 10MB
  for(var p = a; p < a + Math.floor((b-a)/MAX) * MAX; p += MAX )
    U8As.push(new Uint8Array(strToBytes(bStr.slice(p, p+MAX))))
  if(p < b) U8As.push(new Uint8Array(strToBytes(bStr.slice(p, b))))
  return U8As
}

const VUX = "VideoUrlXor"
const loadPswd = () => (localStorage.getItem(VUX) || "")
const setPswd = () => localStorage.setItem(VUX, document.getElementById("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())
var pswd = loadPswd()

function decrypt(id) {
  const id_ = id.slice(1)
  const bytes1 = atob(id_).split('').map(char => char.charCodeAt(0))
  const bytes2 = atob(pswd.repeat(2)).split('').map(char => char.charCodeAt(0))
  const length = Math.min(bytes1.length, bytes2.length)
  const result = []
  for (let i = 0; i < length; i++) 
    result.push(bytes1[i] ^ bytes2[i])

  const resultString = String.fromCharCode(...result)       // Convert a base64 string
  return id.charAt(0) + btoa(resultString).replace(/\+/g, '-').replace(/\//g, '_')
}

function getRandIntIn(min, max) {
  min = Math.ceil(min);    max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setProp(id, disabled, background) {
  const ele = document.getElementById(id)
  ele.disabled = disabled
  ele.style.background = background
}

function createSlide(win, key, url, slideFuncName) {
  win.document.open()
  const doc = `
<html style="overscroll-behavior: none;">
<head>
  <title>${key}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    window.addEventListener('beforeunload', function(e) {
      e.preventDefault()
      e.returnValue = ''
    })
  </script>
</head>
<body style="background-image: url(${url}); background-size: contain; background-position: center; 
             background-repeat: no-repeat; background-color:black; overscroll-behavior: none; color: gold;">
  <div style="font-size:large;" onclick="window.opener.${slideFuncName}()">
    ${key}
    ${("<br>" + "&nbsp;".repeat(50)).repeat(15)}
  </div>
</body>
</html>
`
  win.document.write(doc)
  win.document.close()
}

var slideTimer = null           // initial state
const slideIsRunning = () => slideTimer != null
const stopSlide = () => slideTimer = slideTimer && clearInterval(slideTimer) || null
const startSlide = () => slideTimer = slideTimer || setInterval(nextSlide, 6000)

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))

// warning before left (close, refresh-button, back-button, F5 and Ctrl+R)
window.addEventListener('beforeunload', function(e) {
  e.preventDefault()
  e.returnValue = ''
})