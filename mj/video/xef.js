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
  const bytes = strToBytes(bStr)
  const linfo = bytes[0] * 256 + bytes[1]
  var cp = 2 + linfo                  // current position in bytes
  const info = bytesToStr(xor_crypt(bytes.slice(2, cp), mask)).split('|')
  const min_len = parseInt(info[0])
  const result = {}
  for(let i = 1; i < info.length; i += 2) {
    const fn = info[i], size = parseInt(info[i+1])
    const buf = bytes.slice(cp, cp + size)
    const xbuf = xor_crypt(buf.slice(0, Math.min(min_len, size)), mask)
    for(let j = min_len; j < size; j ++)
        xbuf.push(buf[j])
    const blob = new Blob([new Uint8Array(xbuf)], { type: 'video/mp4' });
    result[fn] = blob
    cp += size
  }
  return result  
}