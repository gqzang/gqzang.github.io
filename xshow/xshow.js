"use strict"

let started = 0, loading = 0, stop = 0, curZoom = 1, hP = 0, tId, zt
const iBuf = [], maxLB = 16, iRep = [], reLoadIn = t => setTimeout(() => loading = 0, t)
async function loadImage() { if( loading || iBuf.length >= maxLB || stop ) return
    try { loading = true; const ref = getRandImgRef(), blob = await getBlob(loadPswd(), ref)
        iBuf.unshift([ await getImgUrl(blob, getRotation(ref) + (de("er").checked ? 90 : 0)), ref ])
    } catch (e) { return alert(`${e.message} -- ref: ${ref}`) || reLoadIn(3000) }
    if( iBuf.length == 1 && iRep.length == 0 ) showImage()          // show 1st image after loaded.
    const [p1, tmp] = de("info").innerHTML.split('('), p3 = tmp.split(' ')[1]
    reLoadIn(60); if(p3) de("info").innerHTML = `${p1}(B${iBuf.length} ${p3}`
}
function showImage() { if( de("pause").checked ) return;  let url_ref = iBuf.pop(), i = -1
    if( url_ref ) hP = iRep.unshift(url_ref) && 0; else if( iRep.length == 0 ) return 
    else url_ref = iRep[i = floor(random() * iRep.length)]                      // random select 1
    const pos = i < 0 ? `B${iBuf.length} R${iRep.length}` : `R${i}/${iRep.length}`
    setImgInfo(url_ref[0], `${getName(url_ref[1])} (${pos})`)
}
function start() { de("start").innerText = "Back"; dsp('ctrl', 'none'); dsp('pause', 'inline')
    tId = setInterval(showImage, parseFloat(de("delay").value.trim()) * 1000)
    if( started ) return;   started = de("er").disabled = true; setInterval(loadImage, 600)
    document.addEventListener('contextmenu', e => { e.preventDefault()
        showTimedAlert(`${(stop = !stop) ? "stop" : "resume"} loading images`, 1000) })
    document.addEventListener('click', e => {
        if( de('back').contains(e.target) ) return dsp('ctrl', 'block') && clearInterval(tId)
        const f = min(ceil(3 - 3 * e.clientY / window.innerHeight), iRep.length)
        if( de("pause").checked ) return browseHist(e.clientX > window.innerWidth/2 ? f : -f)
        if( sty('ctrl').display == 'none' ) showImage()     })
    zt = de('zoom-cntr'); zt && zt.addEventListener('wheel', e => { e.preventDefault()
        const zSpeed = 0.2, d = e.deltaY > 0 ? -1 : 1, zm = curZoom + d * zSpeed, zts = zt.style
        if( zm >= 1 && zm < 9 ) { let xP = e.offsetX/zt.offsetWidth, yP = e.offsetY/zt.offsetHeight
        zts.transformOrigin = `${xP*100}% ${yP*100}%`; zts.transform = `scale(${curZoom = zm})` }})
}
sia.forEach( ([x, v]) => { const cb = dc("input"), lb = dc("label")
    cb.type = "checkbox";  cb.id = cb.value = lb.htmlFor = x;  cb.checked = v[2]
    lb.appendChild( document.createTextNode(x) ); de("chkboxCntr").append( cb, lb, dc("br") ) })