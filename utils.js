"use strict"

const de = x => document.getElementById(x), dc = x => document.createElement(x)

const b64StrToBytes = str => Array.from(atob(str), char => char.charCodeAt(0))
const bytesToStr = bArr => { let res = '', i = 0
    for(; i < bArr.length; i++) res += String.fromCharCode(bArr[i]); return res }
const xor_crypt = (src, mask) => { let res = [], i = 0
    for(; i < src.length; i++) res.push(src[i] ^ mask[i % (mask.length)]); return res }
const xefDecrypt = (buffer, mask, bType = 'image/jpg') => {
    const buf  = new Uint8Array(buffer), cp = 2 + buf[0] * 256 + buf[1]
    const info = bytesToStr(xor_crypt(buf.slice(2, cp), mask)).split('|')
    const size = parseInt(info[2]), xLen = Math.min(parseInt(info[0]), size)
    const xU8A = new Uint8Array(xor_crypt(buf.slice(cp, cp + xLen), mask))
    return new Blob([xU8A].concat(buf.slice(cp + xLen, cp + size)), { type: bType }) }

const VUX = "VideoUrlXor", baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const loadPswd = () => localStorage.getItem(VUX) || ""
const setPswd = () => localStorage.setItem(VUX, de("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())