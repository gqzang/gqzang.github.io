"use strict"

const VUX = "VideoUrlXor", baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const loadPswd = () => (localStorage.getItem(VUX) || "")
var pswd = loadPswd()
const setPswd = () => localStorage.setItem(VUX, docEle("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())

const handle_er = () => docEle("hw").disabled = docEle("er").checked
const handle_hw = () => docEle("er").disabled = started || docEle("hw").checked
const handle_pause = () => { docEle("pause").checked && browseHist(0);
    showTimedAlert((docEle("pause").checked ? "stop": "resume") + " auto-slide", 1000) }

var loading = false, stop = false, started = false, currentZoom = 1     // global ctrl vars
const iBuf = [], maxLen = 16, iRepo = []
async function loadImage() {
    if(loading || iBuf.length >= maxLen || stop) return
    loading = true

    const mask = b64StrToBytes(pswd), ref = get_rand_image_ref(src_lst)
    if( ref ) try {
        const baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
        const res = await fetch(baseUrl + ref)
        const buf = await res.arrayBuffer()
        const blob = xef_decrypt(buf, mask)
        const rotation = get_rotation(ref) + (docEle("er").checked ? 90 : 0)
        const url = await get_image_url(blob, rotation)
        iBuf.push([url, ref])
        if(iBuf.length == 1 && iRepo.length == 0) showImage()
        console.log("get " + ref, iBuf.length)
        const [p1, tmp] = docEle("info").innerHTML.split('(')
        const [_, p3] = tmp.split('R')
        if(p3) docEle("info").innerHTML = `${p1}(B${iBuf.length} R${p3}`
    }
    catch (error) {console.error("Error fetching binary data:", error)}
    setTimeout(() => loading = false, 100)          // give a little time to re-entry
}

var hist = [], hPtr = 0
function showImage() {
    if( docEle("pause").checked ) return
    
    var url_ref = iBuf.shift(), i = -1
    if( ! url_ref ) {
        if( iRepo.length == 0 ) return    // no image in Repo to be backup
        url_ref = iRepo[i = Math.floor(Math.random() * iRepo.length)] 
    } else iRepo.push(url_ref);

    const tt = url_ref[1].split("/x")
    const name = Object.keys(src_info).indexOf(tt[0] + '/') + '~' + tt[1].split(".")[0]
    const pos = i < 0 ? `B${iBuf.length} R${iRepo.length}` : `R${i}/${iRepo.length}`
    setImgInfo(url_ref[0], `${name} (${pos})`)
    hPtr = hist.unshift([url_ref[0], name]) && 0
}

function setImgInfo(url, info) {
    (zoomTgt || document.body).style.backgroundImage = `url(${url})`
    zoomTgt && (currentZoom = 1) && (zoomTgt.style.transform = `scale(1)`)
    docEle("info").innerHTML = info
}

function browseHist(delta = 1) {
    hPtr = delta && ((hPtr + delta + hist.length) % hist.length)        // use circular history
    setImgInfo(hist[hPtr][0], `${hist[hPtr][1]} (H${hPtr}/${hist.length-1})`)
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

    setInterval(loadImage, 1000)
    document.addEventListener('contextmenu', e => { e.preventDefault()
        if( docEle("pause").checked ) return browseHist(-1)
        showTimedAlert(((stop = ! stop) ? "stop": "resume") + " loading new images.", 1000)
    })
    document.addEventListener('click', e => {
        if (docEle('back').contains(e.target)) {
            docEle('ctrl').style.display = 'block'
            docEle('back').style.display = 'none'
            return clearInterval(timerId)
        } 
        if( docEle("pause").checked ) return browseHist()      
        if( docEle('ctrl').style.display == 'none' ) console.log("next") || showImage()
    })
    started = docEle("er").disabled = true       // can't change rotation anymore
}

Object.keys(src_info).forEach( x => {
    const chkbox = document.createElement("input")  // Create the checkbox input element
    chkbox.type = "checkbox"; chkbox.id = chkbox.value = x
    chkbox.checked = [0, 1, 4].map(i => Object.keys(src_info)[i]).includes(x)

    const label = document.createElement("label")       // Create the label element
    label.htmlFor = x                       // Associate the label with the checkbox ID
    label.appendChild(document.createTextNode(x))

    // Append the checkbox, label to the container with a line break for better display
    docEle("checkboxContainer").append(chkbox, label, document.createElement("br"))
})                // create checkboxes

const zoomTgt = docEle('zoom-container'), zoomSpeed = 0.2, maxZoom = 8, minZoom = 1
zoomTgt && zoomTgt.addEventListener('wheel', e => { e.preventDefault()
    // Determine zoom direction (deltaY > 0 means scrolling down, zoom out)
    const delta = e.deltaY > 0 ? -1 : 1, newZoom = currentZoom + delta * zoomSpeed

    // Constrain zoom level
    if (newZoom >= minZoom && newZoom <= maxZoom) {
        // Set the transform origin to the mouse position (in percentages)
        const xP = e.offsetX / zoomTgt.offsetWidth, yP = e.offsetY / zoomTgt.offsetHeight
        zoomTgt.style.transformOrigin = `${xP * 100}% ${yP * 100}%`
        
        zoomTgt.style.transform = `scale(${currentZoom = newZoom})`   // Apply the new scale
    }
})