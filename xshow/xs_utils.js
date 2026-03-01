"use strict"

window.addEventListener('beforeunload', e => {e.preventDefault(); e.returnValue = ''})

const de = x => document.getElementById(x)
const get_rotation = ref => src_info[ref.split("/x")[0] + '/'][1]
const b64StrToBytes = str => Array.from(atob(str), char => char.charCodeAt(0))
const VUX = "VideoUrlXor", baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const loadPswd = () => (localStorage.getItem(VUX) || "")
const setPswd = () => localStorage.setItem(VUX, de("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())
const showTimedAlert = (msg, time) => { const alertBox = de('customAlert')
    alertBox.innerHTML = msg; alertBox.style.display = 'block'     // Show the alert box
    setTimeout(() => { alertBox.style.display = 'none' }, time) }

const src_info = {      // numbers, rotations, default
    '1/B-sel/': [6811, 0, true],
    '1/B-sel-x/': [2026, 0, true],
    '2/MA-p1/': [4198, 270, false],
    '3/MA-p2/': [4158, 270, false],
    '4/MA-x/': [7561, 270, true]
}, r_s = []

function get_rand_image_ref() { 
    for(let m = 0; m < 10; m ++) {            // only try 10 times
        let i = Math.floor(Math.random() * nsi) + 1
        for(var [k, v] of Object.entries(src_info)) if( ! de(k).checked ) continue
            else if(i < v[0]) break
            else i -= v[0]
        const ref = `${k}x${String(i).padStart(4, '0')}.xef`
        if( ! r_s.includes(ref) ) return r_s.push(ref) && ref
    }
}

function bytesToStr(byteArray) {
    let result = '', i = 0
    for(; i < byteArray.length; i++) result += String.fromCharCode(byteArray[i])
    return result
}

function xor_crypt(src, mask) {
    let result = [], l = mask.length, i = 0
    for(; i < src.length; i++) result.push(src[i] ^ mask[i % l])
    return result
}

function xef_decrypt(buffer, mask, bType = 'image/jpg') {
    const buf = new Uint8Array(buffer), linfo = buf[0] * 256 + buf[1]
    const cp = 2 + linfo, bytes = buf.slice(2, cp)
    const info = bytesToStr(xor_crypt(bytes, mask)).split('|')
    const min_len = parseInt(info[0])

    const size = parseInt(info[2]), xLen = Math.min(min_len, size)
    const aBuf = buf.slice(cp, cp + xLen)
    const xU8A = new Uint8Array(xor_crypt(aBuf, mask))
    const rU8A = buf.slice(cp + xLen, cp + size)
    return new Blob([xU8A].concat(rU8A), { type: bType })
}

async function get_image_url(blob, deg) {
    if(deg % 360 == 0) return URL.createObjectURL(blob)
    const rot = (deg + 90) % 180 == 0
    const ibm = await createImageBitmap(blob), cvs = document.createElement("canvas")
    cvs.height = rot ? ibm.width : ibm.height
    cvs.width = de("hw").checked ? cvs.height / 2 : (rot ? ibm.height : ibm.width)

    const ctx = cvs.getContext("2d")
    ctx.translate(cvs.width / 2, cvs.height / 2); ctx.rotate((deg * Math.PI) / 180)
    ctx.drawImage(ibm, -ibm.width / 2, -ibm.height / 2)
    const blob2 = await new Promise(resolve => cvs.toBlob(b => resolve(b), blob.type))
    return URL.createObjectURL(blob2)
}

let nsi; function get_image_count() { nsi = 0;
    for(let [k, v] of Object.entries(src_info)) de(k).checked && (nsi += v[0])
    return nsi > 0 || showTimedAlert("No image source is selected!", 1000) 
}