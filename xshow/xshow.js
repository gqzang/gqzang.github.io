"use strict"

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

const docEle = x => document.getElementById(x)
const VUX = "VideoUrlXor", baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const loadPswd = () => (localStorage.getItem(VUX) || "")
var pswd = loadPswd()
const setPswd = () => localStorage.setItem(VUX, docEle("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())

const imageBuffer = [], maxLen = 32, imageRepo = [], src_lst =[]
var loading = false, stop = false, started = false
async function get_image() {
    if(loading || imageBuffer.length >= maxLen || stop) return
    loading = true

    const mask = b64StrToBytes(pswd)
    const baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
    const ref = get_rand_image_ref(src_lst)
    if( !ref ) return (loading = false) || console.log("fail to find a ref")
    try {
        const res = await fetch(baseUrl + ref)
        const buf = await res.arrayBuffer()
        const blob = xef_decrypt(buf, mask)
        const rotation = get_rotation(ref) + (docEle("er").checked ? 90 : 0)
        const url = await get_image_url(blob, rotation)
        imageBuffer.push([url, ref])
        if(imageBuffer.length == 1 && imageRepo.length == 0) showImage()
        console.log("get " + ref, imageBuffer.length)
    }
    catch (error) {console.error("Error fetching binary data:", error)}
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
    docEle("info").innerHTML = name + " (" + pos + ")"
}

function showTimedAlert(message, duration) {
    const alertBox = docEle('customAlert')
    alertBox.innerHTML = message
    alertBox.style.display = 'block'     // Show the alert box
    // Use setTimeout to hide the alert after the specified duration (in milliseconds)
    setTimeout(() => { alertBox.style.display = 'none' }, duration)
}

function startX() {
    docEle('ctrl').style.display = 'none'
    docEle('back').style.display = 'inline'
    if( ! get_image_source_list() || started ) return

    setInterval(() => get_image(), 1000)
    setInterval(() => showImage(), parseInt(docEle("delay").value.trim(), 10) * 1000)
    document.addEventListener('contextmenu', e => { 
        e.preventDefault()
        stop = ! stop
        showTimedAlert((stop ? "stop": "resume") + " loading new images.", 1000)
    })
    document.addEventListener('click', e => {
        if (docEle('back').contains(e.target)) {
            docEle('ctrl').style.display = 'block'
            docEle('back').style.display = 'none'
        } else console.log("next") || showImage()
    })
    started = true
    docEle("er").disabled = true       // can't change rotation anymore
}

async function get_image_url(blob, deg) {
    if(deg % 360 == 0) return URL.createObjectURL(blob)

    const imageBitmap = await createImageBitmap(blob)
    const iwh = [imageBitmap.width, imageBitmap.height]
    const cwh = (deg + 90) % 180 == 0 ? [iwh[1], iwh[0]] : iwh

    const canvas = document.createElement("canvas")
    canvas.width = cwh[0]; canvas.height = cwh[1]
    const ctx = canvas.getContext("2d")
    ctx.translate(cwh[0] / 2, cwh[1] / 2); ctx.rotate((deg * Math.PI) / 180)
    ctx.drawImage(imageBitmap, -iwh[0] / 2, -iwh[1] / 2)

    const blob2 = await new Promise(resolve => canvas.toBlob(b => resolve(b), blob.type))
    return URL.createObjectURL(blob2)
}

(() => Object.keys(src_info).forEach( x => {
        // Create the checkbox input element
        const chkbox = document.createElement("input")
        chkbox.type = "checkbox"; chkbox.id = chkbox.value = x
        chkbox.checked = [0, 1, 4].map(i => Object.keys(src_info)[i]).includes(x)

        // Create the label element
        const label = document.createElement("label")
        label.htmlFor = x            // Associate the label with the checkbox ID
        label.appendChild(document.createTextNode(x))

        // Append the checkbox, label to the container with a line break for better display
        docEle("checkboxContainer").append(chkbox, label, document.createElement("br"))
    }))()                // createCheckboxes

function get_image_source_list() {
    src_lst.length = 0
    Object.keys(src_info).forEach( x => { if(docEle(x).checked) src_lst.push(x) })
    return src_lst.length > 0 || showTimedAlert("No image source is selected!", 1000) 
}