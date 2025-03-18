"use strict"

// refer to: https://www.softpost.org/web-development/why-we-use-blob-urls-in-video-source-in-html

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))
  
const VUX = "VideoUrlXor"
const savePswd = () => localStorage.setItem(VUX, document.getElementById("pswd").value.trim())
const loadPswd = () => (localStorage.getItem(VUX) || "")
const pswd = loadPswd()

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

const objLen = x => Object.keys(x).length
  
const cid = document.getElementById("count")
const lid = document.getElementById("load")
var count = 0
setInterval(() => {
  count = lid.disabled ? count + 1 : 0
  if(! lid.disabled) cid.style.color = "black"
  cid.textContent = count
}, 1000)

function loadVideo() {
  if(! videoInfo.hasOwnProperty(xl))
    return alert("No video is selected.")

  setProp("load", true, "black")
  const [id_, size] = videoInfo[xl].split("~~")
  const id = decrypt(id_), MB = parseInt(size) / (1024*1024)
  // console.log(`loading ${xl} -- ${id} -- ${MB.toFixed(2)} MB`)

  cid.style.color = "green"            // data is loading
  gapi.client.drive.files.get({fileId: id, alt: "media"})
  .then(res => res.body)
  .then(blob => {       // blob is already a string type
    const bytes = strToBytes(blob), mask = strToBytes(atob(pswd))
    const res = xef_decrypt(bytes, mask)
    return res['video.mp4']
  })
  .then(blob => {
    document.querySelector('video').src = URL.createObjectURL(blob)
    new Audio("../sound/win.wav").play()
  })
  .catch(err => console.log(err) || (new Audio("../sound/error.wav").play()))
  .finally(() => setProp("load", false, "lightgoldenrodyellow"))
}

var xl = ''
loadList()
function loadList() {
  const listMap = {
    "a": document.getElementById("list_a"),
    "g": document.getElementById("list_g"),
    "f": document.getElementById("list_f")
  }

  Object.keys(videoInfo).sort().forEach(key => {
    const [id_, size] = videoInfo[key].split("~~")
    const newItem = document.createElement('li')
    newItem.textContent = `${key} --- ${(parseInt(size)/(1024*1024)).toFixed(2)} MB`
    newItem.setAttribute('tabindex', 1)
    listMap[key.charAt(0)].appendChild(newItem)    
  })  
  
  Object.values(listMap).forEach(le => le.onclick = e => {
    xl = e.target.innerHTML.substring(0, 3)
    document.getElementById('load').innerText = "Load Video " + xl
  })
}

// warning before left (close, refresh-button, back-button, F5 and Ctrl+R)
window.addEventListener('beforeunload', function(e) {
  e.preventDefault()
  e.returnValue = ''
})