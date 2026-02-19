"use strict"

const b64StrToBytes = str => Array.from(atob(str), char => char.charCodeAt(0))

function bytesToStr(byteArray) {
    let result = ''
    for (let i = 0; i < byteArray.length; i++)
        result += String.fromCharCode(byteArray[i])
    return result
}

function xor_crypt(src, mask) {
    const result = []
    const l = mask.length
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

const VUX = "VideoUrlXor"
const loadPswd = () => (localStorage.getItem(VUX) || "")
var pswd = loadPswd()
const setPswd = () => localStorage.setItem(VUX, document.getElementById("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())

const baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const src_lst =[]
var er = 0                  // extra rotation

const imageBuffer = [], maxLen = 32, imageRepo = []
var loading = false, stop = false
async function get_image() {
    if(loading || imageBuffer.length >= maxLen || stop) return
    loading = true

    const mask = b64StrToBytes(pswd)
    const baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
    const ref = get_rand_image_ref(src_lst)
    try {
        const response = await fetch(baseUrl + ref)
        const buf = await response.arrayBuffer()
        const url = await get_image_url(xef_decrypt(buf, mask), get_rotation(ref) + er)
        imageBuffer.push([url, ref])
        if(imageBuffer.length == 1 && imageRepo.length == 0) showImage()
        console.log("get " + ref, imageBuffer.length)
    }
    catch (error) {
        console.error("Error fetching binary data:", error)
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
    const name = Object.keys(src_info).indexOf(tt[0] + '/') + '~' + tt[1].split(".")[0]
    const pos = i < 0 ? 'B' + imageBuffer.length + ' R' + imageRepo.length: 
                        'R' + i + '/' + imageRepo.length
    document.getElementById("info").innerHTML = name + " (" + pos + ")"
}

function showTimedAlert(message, duration) {
    const alertBox = document.getElementById('customAlert')
    alertBox.innerHTML = message
    alertBox.style.display = 'block'     // Show the alert box

    // Use setTimeout to hide the alert after the specified duration (in milliseconds)
    setTimeout(() => { alertBox.style.display = 'none' }, duration)
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
        showTimedAlert((stop ? "stop" : "resume") + " loading new images.", 1000)
    })
}

async function get_image_url(blob, deg) {
    if(deg % 360 == 0) return URL.createObjectURL(blob)

    const imageBitmap = await createImageBitmap(blob)

    const radians = (deg * Math.PI) / 180
    const sideways = (deg + 90) % 180 == 0
    const width = sideways ? imageBitmap.height : imageBitmap.width
    const height = sideways ? imageBitmap.width : imageBitmap.height

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    ctx.translate(width / 2, height / 2)
    ctx.rotate(radians)
    ctx.drawImage(imageBitmap, -imageBitmap.width / 2, -imageBitmap.height / 2)

    const blob2 = await new Promise((resolve) => {
        canvas.toBlob((newBlob) => {
            resolve(newBlob)
        }, blob.type)    // Use the original blob type for the output
    })
    return URL.createObjectURL(blob2)
}

function createCheckboxes() {
    const container = document.getElementById("checkboxContainer")
    Object.keys(src_info).forEach(x => {
        // Create the checkbox input element
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.id = x.toLowerCase()
        checkbox.value = x
        checkbox.checked = x == Object.keys(src_info)[0]

        // Create the label element
        const label = document.createElement("label")
        label.htmlFor = x.toLowerCase() // Associate the label with the checkbox ID
        label.appendChild(document.createTextNode(x))

        // Append the checkbox and label to the container
        container.appendChild(checkbox)
        container.appendChild(label)

        // Optional: Add a line break for better display
        container.appendChild(document.createElement("br"))
    })
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