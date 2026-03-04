"use strict"

const { min, random, floor, ceil, PI } = Math
const de = x => document.getElementById(x), dc = x => document.createElement(x)
const sty = x => de(x).style, dsp = (x, y) => sty(x).display = y
const get_rotation = ref => src_info[ref.split("/x")[0] + '/'][1]
const b64StrToBytes = str => Array.from(atob(str), char => char.charCodeAt(0))
const bytesToStr = bArr => { let res = '', i = 0
    for(; i < bArr.length; i++) res += String.fromCharCode(bArr[i]); return res } 
const xor_crypt = (src, mask) => { let res = [], i = 0
    for(; i < src.length; i++) res.push(src[i] ^ mask[i % (mask.length)]); return res }

const VUX = "VideoUrlXor", baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const loadPswd = () => localStorage.getItem(VUX) || ""
const setPswd = () => localStorage.setItem(VUX, de("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())
const showTimedAlert = (msg, time) => { const aBox = de('customAlert'), aBs = aBox.style;
    aBox.innerHTML = msg; aBs.display = 'block'; setTimeout(() => aBs.display = 'none', time) }
const impl_temp = async (file, kvP) => { var txt = await (await fetch(file)).text()
    for(let [k, v] of Object.entries(kvP)) txt = txt.replaceAll('${' +k+ '}', v); return txt}

const r_s = [], src_info = {      // numbers, rotations, default
    '1/B-sel/': [6811, 0, true],    '1/B-sel-x/': [2026, 0, true],
    '2/MA-p1/': [4198, 270, false], '3/MA-p2/':   [4158, 270, false],
    '4/MA-x/':  [7561, 270, true] }, sia = Object.entries(src_info)

function get_rand_image_ref() { for(let m = 0; m < 10; m ++) { 
    let n = sia.reduce((a, [k, v]) => de(k).checked ? a + v[0] : a, 0), i = floor(random() * n)
    for(var [k, v] of sia) if( de(k).checked ) if(i >= v[0]) i -= v[0]; else break
    const ref = `${k}x${String(i).padStart(4, '0')}.xef`
    if( ! r_s.includes(ref) ) return n && r_s.push(ref) && ref 
}}

function xef_decrypt(buffer, mask, bType = 'image/jpg') {
    const buf = new Uint8Array(buffer), cp = 2 + buf[0] * 256 + buf[1]
    const info = bytesToStr(xor_crypt(buf.slice(2, cp), mask)).split('|')
    const size = parseInt(info[2]), xLen = min(parseInt(info[0]), size)
    const xU8A = new Uint8Array(xor_crypt(buf.slice(cp, cp + xLen), mask))
    return new Blob([xU8A].concat(buf.slice(cp + xLen, cp + size)), { type: bType })
}

async function get_image_url(blob, deg) { if(deg % 360 == 0) return URL.createObjectURL(blob)
    const ibm = await createImageBitmap(blob), cvs = dc("canvas"), ctx = cvs.getContext("2d")
    const r = (deg + 90) % 180 == 0, iw = ibm.width, ih = ibm.height
    const ch = cvs.height = r ? iw : ih, cw = cvs.width = de("hw").checked ? ch/2 : (r ? ih : iw)
    ctx.translate(cw/2, ch/2);   ctx.rotate(deg * PI / 180);  ctx.drawImage(ibm, -iw/2, -ih/2)
    return URL.createObjectURL(await new Promise(res => cvs.toBlob(b => res(b), blob.type)))
}