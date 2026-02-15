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

const VUX = "VideoUrlXor"
const loadPswd = () => (localStorage.getItem(VUX) || "")
const setPswd = () => localStorage.setItem(VUX, document.getElementById("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())
var pswd = loadPswd()
const mask = strToBytes(atob(pswd))

const baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const baseUrl = bytesToStr(xor_crypt(strToBytes(atob(baseUrlX)), mask))
var src_lst =['1/B-sel-x/', '1/B-sel/', '4/MA-x/']

const imageBuffer = [], maxLen = 32, imageRepo = []
var loading = false
async function get_image() {
    if(loading || imageBuffer.length > maxLen) return
    loading = true
    const ref = get_rand_image_ref(src_lst)

    try {
        const response = await fetch(baseUrl + ref)
        const buf = await response.arrayBuffer()
        const iObjs = xef_decrypt(buf, mask)
        for(const [fn, img] of Object.entries(iObjs)) {
            const url = URL.createObjectURL(img)
            const deg = get_rotation(ref)
            const urlR = await get_rotate_image_url(url, deg)
            imageBuffer.push(urlR)
            break               // only first image to show
        }
        console.log("get " + ref, imageBuffer.length)
    }
    catch (error) {
        console.error("Error fetching binary data:", error);
    }
    loading = false
}

function startX() {
    setInterval(() => get_image(), 1000)

    setInterval(() => {
        const url = imageBuffer.shift()
        if(url) document.body.style.backgroundImage = `url(${url})`
    }, 5000)
    
    document.getElementById('ctrl').style.display = 'none'    
}

import {fetchURL, writeCanvas} from 'https://cdn.jsdelivr.net/npm/image-js@latest/+esm'

async function get_blob_from_image(image) {
    // 1. Convert the image-js Image object to an HTMLCanvasElement
    writeCanvas(image, document.getElementById('canvas'))

    // 2. Use the canvas.toBlob() method to create a Blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if(blob) resolve(blob)
            else reject(new Error('Canvas toBlob failed'))
        }, 'image/png', 1.0)    // Specify the desired MIME type and quality
    })
}

async function get_rotate_image_url(url, deg) {
    if(deg == 0) return url
    const image = (await fetchURL(url)).rotate(deg)
    const blob = await get_blob_from_image(image)
    return URL.createObjectURL(blob)
}

export async function startY() {
    await get_image()
    const ib = imageBuffer
    const url = await get_rotate_image_url(ib[0], 270)
    document.body.style.backgroundImage = `url(${url})`
    console.log("here")
}

window.startX = startX
