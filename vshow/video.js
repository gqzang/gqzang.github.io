"use strict"

const cId = de("count"), lId = de('load'), sId = de('dvd'), vId = de('video'), LST = "LoadStartTime"
const updateTimer = () => cId.textContent = getEpoch() - parseInt(localStorage.getItem(LST))
const clearTimer = () => cId.textContent = localStorage.setItem(LST, getEpoch()) | 0
const selVideo = () => vId.src = vObjs[sId.options[sId.selectedIndex].value]
const lstMap = Object.keys(videoBkt).reduce((a, k) => {a[k] = de('l_' + k); return a}, {})
const vdInfo = x => `${x}: ${(parseInt(videoLen[x])/(1024*1024)).toFixed(2)}`
const setLoadBtn = x => {const btn = de('load')
                btn.disabled = x; btn.style.background = x ? "lightgray" : "lightgoldenrodyellow"}
setInterval(() => { if(!localStorage.getItem(LST)) clearTimer()
                    if(lId.disabled && (lId.innerText != "Load Video")) updateTimer() }, 1000)
let pswd = loadPswd(), id = '', vObjs = {}
async function loadV() { if(! videoLen.hasOwnProperty(id)) return alert("No video is selected.")
    localStorage.setItem(LST, getEpoch()); setLoadBtn(true)
    const mask = b64StrToBytes(pswd), baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
    const url = baseUrl + videoBkt[id.substring(0,1)] + id + '.xef'
    try { let buf = await (await fetch(url)).arrayBuffer()
        vId.src = vObjs[id] = URL.createObjectURL(xefDecrypt(buf, mask))
        const newOpt = dc('option'); newOpt.value = id; newOpt.text = vdInfo(id)
        sId.add(newOpt); sId.value = id; lId.innerText = "Load Video"
        delete videoLen[id]; loadList(); new Audio("./win.wav").play()
    } catch(err) { console.log(err); new Audio("./error.wav").play(); setLoadBtn(false) }
}
const loadList = () => { Object.values(lstMap).forEach(le => le.innerHTML = '')  // clear list first
    Object.keys(videoLen).sort().forEach( k => { const x = dc('li'), k_ = k.charAt(0)
        x.textContent = vdInfo(k); x.setAttribute('tabindex', 1); lstMap[k_].appendChild(x) })
    Object.values(lstMap).forEach( le => le.onclick = e => { setLoadBtn(false); clearTimer()
        id = e.target.innerHTML.substring(0, 3); lId.innerText = "Load Video " + id })
}; loadList()   // loadList for the first time