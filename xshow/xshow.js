"use strict"

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
    for (let i = 0; i < src.length; i++)
        result.push(src[i] ^ mask[i % l])
    return result
}

function xef_decrypt(buffer, mask, bType = 'image/jpg') {
    const buf = new Uint8Array(buffer);
    const linfo = buf[0] * 256 + buf[1]
    var cp = 2 + linfo                  // current position in bytes
    const bytes = buf.slice(2, cp)
    const info = bytesToStr(xor_crypt(bytes, mask)).split('|')
    const min_len = parseInt(info[0])

    const result = {}
    for(let i = 1; i < info.length; i += 2) {
        const fn = info[i], size = parseInt(info[i + 1])
        const xLen = Math.min(min_len, size)
        const aBuf = buf.slice(cp, cp + xLen)
        const xU8A = new Uint8Array(xor_crypt(aBuf, mask))
        const rU8A = buf.slice(cp + xLen, cp + size)
        result[fn] = new Blob([xU8A].concat(rU8A), { type: bType })
        cp += size
    }
    return result
}

const pswd = "103993oveR/++102"

const imageBuffer = [], maxLen = 100
var loading = false
async function get_image() {
    if(loading || imageBuffer.length > maxLen) return
    loading = true

    const mask = strToBytes(atob(pswd))
    const baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
    const baseUrl = bytesToStr(xor_crypt(strToBytes(atob(baseUrlX)), mask))
    const ref = get_rand_image_ref(['1/B-sel-x/', '1/B-sel/', '4/MA-x/'])

    try {
        const response = await fetch(baseUrl + ref)
        const buf = await response.arrayBuffer()
        const iObjs = xef_decrypt(buf, mask)
        for(const [fn, img] of Object.entries(iObjs)) {
            imageBuffer.push(URL.createObjectURL(img))
            break               // only first image to show
        }
        console.log("get " + ref, imageBuffer.length)
    }
    catch (error) {
        console.error("Error fetching binary data:", error);
    }
    loading = false
}
setInterval(() => get_image(), 1000)

setInterval(() => {
    const url = imageBuffer.shift()
    if(url) document.body.style.backgroundImage = `url(${url})`
}, 5000)
