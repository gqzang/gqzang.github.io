"use strict"

const VUX = "VideoUrlXor", baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const loadPswd = () => (localStorage.getItem(VUX) || "")
var pswd = loadPswd()
const setPswd = () => localStorage.setItem(VUX, docEle("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())

const imageBuffer = [], maxLen = 16, imageRepo = []
var loading = false, stop = false, started = false
async function get_image() {
    if(loading || imageBuffer.length >= maxLen || stop) return
    loading = true

    const mask = b64StrToBytes(pswd), ref = get_rand_image_ref(src_lst)
    const baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
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
        const [p1, tmp] = docEle("info").innerHTML.split('(')
        const [_, p3] = tmp.split('R')
        if(p3) docEle("info").innerHTML = `${p1}(B${imageBuffer.length} R${p3}`
    }
    catch (error) {console.error("Error fetching binary data:", error)}
    setTimeout(() => loading = false, 100)          // give a little time to re-entry
}

var hist = [], hPtr
function showImage(forced = false) {
    if( ! forced && docEle("pause").checked ) return
    
    var url_ref = imageBuffer.shift(), i = -1
    if( ! url_ref ) {
        if( imageRepo.length == 0 ) return    // no image in Repo to be backup
        url_ref = imageRepo[i = Math.floor(Math.random() * imageRepo.length)] 
    } else imageRepo.push(url_ref);

    const tt = url_ref[1].split("/x")
    const name = Object.keys(src_info).indexOf(tt[0] + '/') + '~' + tt[1].split(".")[0]
    const pos = i < 0 ? 'B' + imageBuffer.length + ' R' + imageRepo.length: 
                        'R' + i + '/' + imageRepo.length;
    setImgInfo(url_ref[0], `${name} (${pos})`)
    hPtr = hist.unshift([url_ref[0], name]) && 0
}

function setImgInfo(url, info) {
    (docEle("zoom-container") || document.body).style.backgroundImage = `url(${url})`
    zoomTgt && (currentZoom = 1) && (zoomTgt.style.transform = `scale(1)`)
    docEle("info").innerHTML = info
}

function browseHist(deep = true) {
    const prev = hPtr
    if( deep && hPtr < hist.length - 1 ) hPtr ++
    if( !deep && hPtr > 0 ) hPtr --
    if( hPtr != prev ) setImgInfo(hist[hPtr][0], `${hist[hPtr][1]} (H${hPtr}/${hist.length-1})`)
}

function showTimedAlert(message, duration) {
    const alertBox = docEle('customAlert')
    alertBox.innerHTML = message
    alertBox.style.display = 'block'     // Show the alert box
    // Use setTimeout to hide the alert after the specified duration (in milliseconds)
    setTimeout(() => { alertBox.style.display = 'none' }, duration)
}

var timerId
function startX() {
    docEle('ctrl').style.display = 'none'
    docEle('back').style.display = docEle('pause').style.display = 'inline'
    timerId = setInterval(showImage, parseFloat(docEle("delay").value.trim()) * 1000)
    if( ! get_image_source_list() || started ) return

    setInterval(get_image, 1000)
    document.addEventListener('contextmenu', e => { 
        e.preventDefault()
        if( docEle("pause").checked ) return browseHist(false)
        showTimedAlert(((stop = ! stop) ? "stop": "resume") + " loading new images.", 1000)
    })
    document.addEventListener('click', e => {
        if (docEle('back').contains(e.target)) {
            clearInterval(timerId)
            docEle('ctrl').style.display = 'block'
            docEle('back').style.display = 'none'
            return
        } 
        if( docEle("pause").checked ) return browseHist()      
        if( docEle('ctrl').style.display == 'none' ) console.log("next") || showImage(true)
    })
    started = docEle("er").disabled = true       // can't change rotation anymore
}

const handle_er = () => docEle("hw").disabled = docEle("er").checked
const handle_hw = () => docEle("er").disabled = started || docEle("hw").checked
const handle_pause = () => showTimedAlert(
    ((stop = docEle("pause").checked) ? "stop": "resume") + " auto-slide and loading", 1000);

(() => Object.keys(src_info).forEach( x => {
    const chkbox = document.createElement("input")  // Create the checkbox input element
    chkbox.type = "checkbox"; chkbox.id = chkbox.value = x
    chkbox.checked = [0, 1, 4].map(i => Object.keys(src_info)[i]).includes(x)

    const label = document.createElement("label")       // Create the label element
    label.htmlFor = x                       // Associate the label with the checkbox ID
    label.appendChild(document.createTextNode(x))

    // Append the checkbox, label to the container with a line break for better display
    docEle("checkboxContainer").append(chkbox, label, document.createElement("br"))
}))()                // createCheckboxes

const zoomTgt = docEle('zoom-container'), zoomSpeed = 0.2, maxZoom = 8, minZoom = 1
var currentZoom = 1
// Add event listener for the mouse wheel
zoomTgt && zoomTgt.addEventListener('wheel', e => {
    e.preventDefault(); // Prevent default page scroll

    // Determine zoom direction (deltaY > 0 means scrolling down, zoom out)
    const delta = e.deltaY > 0 ? -1 : 1
    const newZoom = currentZoom + delta * zoomSpeed

    // Constrain zoom level
    if (newZoom >= minZoom && newZoom <= maxZoom) {
        currentZoom = newZoom

        // Get mouse position relative to the element
        const mouseX = e.offsetX, mouseY = e.offsetY

        // Set the transform origin to the mouse position (in percentages)
        const xPercent = (mouseX / zoomTgt.offsetWidth) * 100
        const yPercent = (mouseY / zoomTgt.offsetHeight) * 100
        zoomTgt.style.transformOrigin = `${xPercent}% ${yPercent}%`

        // Apply the new scale
        zoomTgt.style.transform = `scale(${currentZoom})`
    }
})
