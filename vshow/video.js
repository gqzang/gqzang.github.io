"use strict"

const cId = de("count"), lId = de('load'), sId = de('dvd'), vId = de('video'), LST = "LoadStartTime"
const updateTimer = () => cId.textContent = getEpoch() - parseInt(localStorage.getItem(LST))
const clearTimer = () => cId.textContent = localStorage.setItem(LST, getEpoch()) | 0
setInterval(() => { if(!localStorage.getItem(LST)) clearTimer()
                    if(lId.disabled && (lId.innerText != "Load Video")) updateTimer() }, 1000)
const selVideo = () => vId.src = vObjs[sId.options[sId.selectedIndex].value]
const setLoadBtn = x => { const btn = de('load')
                btn.disabled = x; btn.style.background = x ? "lightgray" : "lightgoldenrodyellow"}

let id = '', vObjs = {}
async function loadV() { localStorage.setItem(LST, getEpoch()); setLoadBtn(true)
    try { const ref = videoBkt[id.substring(0,1)] + id + '.xef'
        vId.src = vObjs[id] = URL.createObjectURL( await getBlob(loadPswd(), ref) )
        const newOpt = dc('option'); newOpt.value = id; newOpt.text = vdInfo[id]
        sId.add(newOpt); sId.value = id; lId.innerText = "Load Video"
        delete vdInfo[id]; loadList(); new Audio("./win.wav").play()
    } catch(err) { console.log(err); new Audio("./error.wav").play(); setLoadBtn(false) }
}
const loadList = () => { Object.keys(videoBkt).forEach(x => de(x).innerHTML = '')    // clear list
    Object.entries(vdInfo).forEach( ([k, v]) => { const x = dc('li'), k_ = k.charAt(0)
        x.textContent = v; x.setAttribute('tabindex', 1); de(k_).appendChild(x) })
    Object.keys(videoBkt).forEach( x => de(x).onclick = e => { setLoadBtn(false); clearTimer()
        id = e.target.innerHTML.substring(0, 3); lId.innerText = "Load Video " + id })
}
loadList()   // loadList for the first time