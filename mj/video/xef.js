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

function xef_decrypt(bStr, mask) {
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
    result[fn] = new Blob([xU8A].concat(rU8As), { type: 'video/mp4' })
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
