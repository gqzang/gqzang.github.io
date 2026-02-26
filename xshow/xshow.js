"use strict"

const handle_er = () => docEle("hw").disabled = docEle("er").checked
const handle_hw = () => docEle("er").disabled = started || docEle("hw").checked
const handle_pause = () => { docEle("pause").checked && browseHist(0);
    showTimedAlert((docEle("pause").checked ? "stop": "resume") + " auto-slide", 1000) }
const showTimedAlert = (message, duration) => { const alertBox = docEle('customAlert')
    alertBox.innerHTML = message; alertBox.style.display = 'block'     // Show the alert box
    setTimeout(() => { alertBox.style.display = 'none' }, duration) }
const get_name = ref => Object.keys(src_info).indexOf(ref.split("/x")[0] + '/') 
                            + '~' + ref.split("/x")[1].split(".")[0]

let pswd = loadPswd(), loading = false, stop = false, started = false, curZoom = 1, hPtr = 0
const iBuf = [], maxLen = 16, iRepo = []
async function loadImage() {
    if(loading || iBuf.length >= maxLen || stop) return
    loading = true
    const mask = b64StrToBytes(pswd), ref = get_rand_image_ref(src_lst)
    if( ref ) try { console.log("~~~" + ref)
        const baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
        const buf = await (await fetch(baseUrl + ref)).arrayBuffer()
        const rotation = get_rotation(ref) + (docEle("er").checked ? 90 : 0)
        iBuf.unshift([await get_image_url(xef_decrypt(buf, mask), rotation), ref])
    } catch (err) {console.error("Error fetching binary data:", err)}
    if(iBuf.length == 1 && iRepo.length == 0) showImage()   // show 1st image after loaded.
    const [p1, tmp] = docEle("info").innerHTML.split('('), p3 = tmp.split('R')[1]
    if(p3) docEle("info").innerHTML = `${p1}(B${iBuf.length} R${p3}`
    setTimeout(() => loading = false, 100)          // give a little time to re-entry
}

function showImage() {
    if( docEle("pause").checked ) return
    let url_ref = iBuf.pop(), i = -1
    if( url_ref ) hPtr = iRepo.unshift(url_ref) && 0
    else if( iRepo.length == 0 ) return                     // no image in Repo to be backup
    else url_ref = iRepo[i = Math.floor(Math.random() * iRepo.length)]  // random select 1
    const pos = i < 0 ? `B${iBuf.length} R${iRepo.length}` : `R${i}/${iRepo.length}`
    setImgInfo(url_ref[0], `${get_name(url_ref[1])} (${pos})`)
}

function setImgInfo(url, info) {
    (zoomTgt || document.body).style.backgroundImage = `url(${url})`
    zoomTgt && (curZoom = 1) && (zoomTgt.style.transform = `scale(1)`)
    docEle("info").innerHTML = info
}

function browseHist(delta) {
    hPtr = delta && ((hPtr + delta + iRepo.length) % iRepo.length)        // use circular history
    setImgInfo(iRepo[hPtr][0], `${get_name(iRepo[hPtr][1])} (H${hPtr}/${iRepo.length-1})`)
}

let timerId
function startX() {
    docEle('ctrl').style.display = 'none'
    docEle('back').style.display = docEle('pause').style.display = 'inline'
    timerId = setInterval(showImage, parseFloat(docEle("delay").value.trim()) * 1000)
    if( ! get_image_source_list() || started ) return
    started = docEle("er").disabled = true       // can't change rotation anymore
    setInterval(loadImage, 1000)
    document.addEventListener('contextmenu', e => { e.preventDefault();
        showTimedAlert(`${(stop = !stop) ? "stop" : "resume"} loading images`, 1000)})
    document.addEventListener('click', e => {
        if( docEle('back').contains(e.target) ) { 
            docEle('back').style.display = 'none';    docEle('ctrl').style.display = 'block';
            return clearInterval(timerId) } 
        const f = Math.min(Math.ceil(3 - 3*e.clientY / window.innerHeight), iRepo.length)
        if( docEle("pause").checked ) return browseHist(2*e.clientX > window.innerWidth ? f : -f)
        if( docEle('ctrl').style.display == 'none' ) showImage()    })
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
    const delta = e.deltaY > 0 ? -1 : 1, newZoom = curZoom + delta * zoomSpeed
    if (newZoom < minZoom || newZoom > maxZoom) return
    // Set the transform origin to the mouse position (in percentages)
    const xP = e.offsetX / zoomTgt.offsetWidth, yP = e.offsetY / zoomTgt.offsetHeight
    zoomTgt.style.transformOrigin = `${xP * 100}% ${yP * 100}%`       
    zoomTgt.style.transform = `scale(${curZoom = newZoom})`   // Apply the new scale
})