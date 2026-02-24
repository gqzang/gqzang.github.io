"use strict"

const docEle = x => document.getElementById(x)

const src_info = {
    '1/B-sel/': 6811,
    '1/B-sel-x/': 2026,
    '2/MA-p1/': 4198,
    '3/MA-p2/': 4158,
    '4/MA-x/': 7561
}

const r_s = [],  src_lst =[]
function get_rand_image_ref(src_lst) {
    var n = 0; for(const x of src_lst) n += src_info[x]
    if( n > 0 )
        for(let k = 0; k < 10; k ++) {            // only try 10 times
            var i = Math.floor(Math.random() * n) + 1, j
            for(j = 0; j < src_lst.length; j ++) {
                if(i <= src_info[src_lst[j]]) break
                i -= src_info[src_lst[j]]
            }
            const ref = src_lst[j] + 'x' + String(i).padStart(4, '0') + '.xef'   
            if(r_s.includes(ref)) continue
            r_s.push(ref)
            return ref
        }
    return null
}

const src_rotation = {
    '1/B-sel/': 0,
    '1/B-sel-x/': 0,
    '2/MA-p1/': 270,
    '3/MA-p2/': 270,
    '4/MA-x/': 270
}

function get_rotation(ref) {
    const src = ref.split("/x")[0] + '/'
    return src_rotation[src]
}

const b64StrToBytes = str => Array.from(atob(str), char => char.charCodeAt(0))

function bytesToStr(byteArray) {
    let result = ''
    for (let i = 0; i < byteArray.length; i++)
        result += String.fromCharCode(byteArray[i])
    return result
}

function xor_crypt(src, mask) {
    const result = [], l = mask.length
    for (let i = 0; i < src.length; i++)
        result.push(src[i] ^ mask[i % l])
    return result
}

function xef_decrypt(buffer, mask, bType = 'image/jpg') {
    const buf = new Uint8Array(buffer)
    const linfo = buf[0] * 256 + buf[1]
    var cp = 2 + linfo                  // current position in bytes
    const bytes = buf.slice(2, cp)
    const info = bytesToStr(xor_crypt(bytes, mask)).split('|')
    const min_len = parseInt(info[0])

    const size = parseInt(info[2])
    const xLen = Math.min(min_len, size)
    const aBuf = buf.slice(cp, cp + xLen)
    const xU8A = new Uint8Array(xor_crypt(aBuf, mask))
    const rU8A = buf.slice(cp + xLen, cp + size)
    return new Blob([xU8A].concat(rU8A), { type: bType })
}

async function get_image_url(blob, deg) {
    if(deg % 360 == 0) return URL.createObjectURL(blob)

    const ibm = await createImageBitmap(blob)
    const rot = (deg + 90) % 180 == 0
    const cvs = document.createElement("canvas")
    cvs.height = rot ? ibm.width : ibm.height
    cvs.width = docEle("hw").checked ? cvs.height / 2 : (rot ? ibm.height : ibm.width)

    const ctx = cvs.getContext("2d")
    ctx.translate(cvs.width / 2, cvs.height / 2); ctx.rotate((deg * Math.PI) / 180)
    ctx.drawImage(ibm, -ibm.width / 2, -ibm.height / 2)

    const blob2 = await new Promise(resolve => cvs.toBlob(b => resolve(b), blob.type))
    return URL.createObjectURL(blob2)
}

function get_image_source_list() {
    src_lst.length = 0
    Object.keys(src_info).forEach( x => { if(docEle(x).checked) src_lst.push(x) })
    return src_lst.length > 0 || showTimedAlert("No image source is selected!", 1000) 
}
