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
var pswd = loadPswd()
const setPswd = () => localStorage.setItem(VUX, document.getElementById("pswd").value.trim())
export const savePswd = () => setPswd() || alert(pswd = loadPswd())
window.savePswd = savePswd

const baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const src_lst =[]
var er = 0                  // extra rotation

const imageBuffer = [], maxLen = 32, imageRepo = []
var loading = false, stop = false
async function get_image() {
    if(loading || imageBuffer.length >= maxLen || stop) return
    loading = true

    const mask = strToBytes(atob(pswd))
    const baseUrl = bytesToStr(xor_crypt(strToBytes(atob(baseUrlX)), mask))
    const ref = get_rand_image_ref(src_lst)
    try {
        const response = await fetch(baseUrl + ref)
        const buf = await response.arrayBuffer()
        const iObjs = xef_decrypt(buf, mask)
        const url = URL.createObjectURL(Object.values(iObjs)[0])
        const deg = get_rotation(ref)
        const urlR = await get_rotate_image_url(url, deg + er)
        imageBuffer.push([urlR, ref])
        if(imageBuffer.length == 1 && imageRepo.length == 0) showImage()
        console.log("get " + ref, imageBuffer.length)
    }
    catch (error) {
        console.error("Error fetching binary data:", error);
    }
    loading = false
}

function showImage() {
    var url_ref = imageBuffer.shift(), i = -1
    if( ! url_ref ) {
        if( imageRepo.length == 0 ) return    // no image in Repo to be backup
        i = Math.floor(Math.random() * imageRepo.length)
        url_ref = imageRepo[i]              // randomly select 1 image from Repo
    } else imageRepo.push(url_ref)
    document.body.style.backgroundImage = `url(${url_ref[0]})`
    const tt = url_ref[1].split("/x")
    const name = Object.keys(src_info).indexOf(tt[0] + '/') + '~' + tt[1].split(".").slice(0, -1)
    const pos = i < 0 ? 'B' + imageBuffer.length + ' R' + imageRepo.length: 
                        'R' + i + '/' + imageRepo.length
    // console.log("show: " + name + " (" + pos + ")")
    document.getElementById("info").innerHTML = name + " (" + pos + ")"
}

function showTimedAlert(message, duration) {
    const alertBox = document.getElementById('customAlert');
    alertBox.innerHTML = message;
    alertBox.style.display = 'block'; // Show the alert box

    // Use setTimeout to hide the alert after the specified duration (in milliseconds)
    setTimeout(function() {
        alertBox.style.display = 'none'; // Hide the alert box
    }, duration);
}

function startX() {
    if( ! get_image_source_list() ) return
    er = document.getElementById("er").checked ? 90 : 0
    const delay = parseInt(document.getElementById("delay").value.trim(), 10)
    setInterval(() => get_image(), 1000)
    setInterval(() => showImage(), delay * 1000)
    document.getElementById('ctrl').style.display = 'none'    
    document.addEventListener('click', () => console.log("next") || showImage() )
    document.addEventListener('contextmenu', event => {
        event.preventDefault()
        stop = ! stop
        showTimedAlert((stop ? "stop" : "resume") + " loading new images.", 1000);
    });
}

window.startX = startX

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
    if(deg % 360 == 0) return url
    const image = (await fetchURL(url)).rotate(deg)
    const blob = await get_blob_from_image(image)
    return URL.createObjectURL(blob)
}

function createCheckboxes() {
    const container = document.getElementById("checkboxContainer")
    Object.keys(src_info).forEach(x => {
        // Create the checkbox input element
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox"
        checkbox.id = x.toLowerCase()
        checkbox.value = x
        checkbox.checked = x == Object.keys(src_info)[0]

        // Create the label element
        const label = document.createElement("label")
        label.htmlFor = x.toLowerCase(); // Associate the label with the checkbox ID
        label.appendChild(document.createTextNode(x))

        // Append the checkbox and label to the container
        container.appendChild(checkbox)
        container.appendChild(label)

        // Optional: Add a line break for better display
        container.appendChild(document.createElement("br"))
    });
}

// Call the function to create the checkboxes
createCheckboxes()

function get_image_source_list() {
    Object.keys(src_info).forEach(x => {
        const checkbox = document.getElementById(x.toLowerCase())
        if(checkbox.checked) src_lst.push(x)
    })
    return src_lst.length > 0 || alert("No image source is selected!") 
}