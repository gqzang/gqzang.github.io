"use strict"

const handle_er = () => de("hw").disabled = de("er").checked
const handle_hw = () => de("er").disabled = started || de("hw").checked
const handle_pause = () => { de("pause").checked && browseHist(0);
    showTimedAlert((de("pause").checked ? "stop": "resume") + " auto-slide", 1000) }
const get_name = ref => Object.keys(src_info).indexOf(ref.split("/x")[0] + '/') 
                            + '~' + ref.split("/x")[1].split(".")[0]
const setImgInfo = (url, info) => { (zoomTgt || document.body).style.backgroundImage = `url(${url})`;
    (de("info").innerHTML = info) && zoomTgt && (zoomTgt.style.transform = `scale(${curZoom = 1})`) }
const browseHist = delta => { hPtr = delta && ((hPtr + delta + iRepo.length) % iRepo.length);
    setImgInfo(iRepo[hPtr][0], `${get_name(iRepo[hPtr][1])} (B${iBuf.length} H${hPtr}/${iRepo.length-1})`) }

let pswd = loadPswd(), loading = false, stop = false, curZoom = 1, hPtr = 0
const iBuf = [], maxLen = 16, iRepo = [], reLoadIn = t => setTimeout(() => loading = false, t)
async function loadImage() { if(loading || iBuf.length >= maxLen || stop) return
    const mask = b64StrToBytes(pswd), ref = get_rand_image_ref()
    try { loading = ! console.log("~~~" + ref)
        const baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
        const buf = await (await fetch(baseUrl + ref)).arrayBuffer()
        const rotation = get_rotation(ref) + (de("er").checked ? 90 : 0)
        iBuf.unshift([await get_image_url(xef_decrypt(buf, mask), rotation), ref])
    } catch (e) { return alert(`${e.message} -- ref: ${ref}`) || reLoadIn(5000) }
    if(iBuf.length == 1 && iRepo.length == 0) showImage()   // show 1st image after loaded.
    const [p1, tmp] = de("info").innerHTML.split('('), p3 = tmp.split(' ')[1]
    reLoadIn(100); if(p3) de("info").innerHTML = `${p1}(B${iBuf.length} ${p3}`
}

function showImage() { if( de("pause").checked ) return
    let url_ref = iBuf.pop(), i = -1
    if( url_ref ) hPtr = iRepo.unshift(url_ref) && 0
    else if( iRepo.length == 0 ) return                     // no image in Repo to be backup
    else url_ref = iRepo[i = Math.floor(Math.random() * iRepo.length)]  // random select 1
    const pos = i < 0 ? `B${iBuf.length} R${iRepo.length}` : `R${i}/${iRepo.length}`
    setImgInfo(url_ref[0], `${get_name(url_ref[1])} (${pos})`)
}

let timerId, started = false
function startX() {
    de('ctrl').style.display = 'none'
    de('back').style.display = de('pause').style.display = 'inline'
    timerId = setInterval(showImage, parseFloat(de("delay").value.trim()) * 1000)
    if( started ) return
    started = de("er").disabled = true       // can't change rotation anymore
    setInterval(loadImage, 1000)
    document.addEventListener('contextmenu', e => { e.preventDefault();
        showTimedAlert(`${(stop = !stop) ? "stop" : "resume"} loading images`, 1000)})
    document.addEventListener('click', e => {
        if( de('back').contains(e.target) ) { 
            de('back').style.display = 'none';    de('ctrl').style.display = 'block';
            return clearInterval(timerId) } 
        const f = Math.min(Math.ceil(3 - 3*e.clientY / window.innerHeight), iRepo.length)
        if( de("pause").checked ) return browseHist(2*e.clientX > window.innerWidth ? f : -f)
        if( de('ctrl').style.display == 'none' ) showImage()    })
}

Object.keys(src_info).forEach( x => {
    const chkbox = document.createElement("input")  // Create the checkbox input element
    chkbox.type = "checkbox"; chkbox.id = chkbox.value = x; chkbox.checked = src_info[x][2]
    const label = document.createElement("label")       // Create the label element
    label.htmlFor = x                       // Associate the label with the checkbox ID
    label.appendChild(document.createTextNode(x))
    de("checkboxContainer").append(chkbox, label, document.createElement("br"))
})                // create checkboxes

const zoomTgt = de('zoom-container'), zoomSpeed = 0.2, maxZoom = 8, minZoom = 1
zoomTgt && zoomTgt.addEventListener('wheel', e => { e.preventDefault()
    // Determine zoom direction (deltaY > 0 means scrolling down, zoom out)
    const delta = e.deltaY > 0 ? -1 : 1, newZoom = curZoom + delta * zoomSpeed
    if (newZoom < minZoom || newZoom > maxZoom) return
    // Set the transform origin to the mouse position (in percentages)
    const xP = e.offsetX / zoomTgt.offsetWidth, yP = e.offsetY / zoomTgt.offsetHeight
    zoomTgt.style.transformOrigin = `${xP * 100}% ${yP * 100}%`       
    zoomTgt.style.transform = `scale(${curZoom = newZoom})`   // Apply the new scale
})