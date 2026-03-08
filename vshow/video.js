"use strict"

const getEpoch = () => Math.round((new Date()).getTime() / 1000)
const cId = de("count"), lId = de('load'), sId = de('dvd'), vId = de('video'), LST = "LoadStartTime"
const updateTimer = () => cId.textContent = getEpoch() - parseInt(localStorage.getItem(LST))
const clearTimer = () => cId.textContent = localStorage.setItem(LST, getEpoch()) | 0
const selVd = () => vId.src = vObjs[sId.options[sId.selectedIndex].value]
const listMap = Object.keys(videoBkt).reduce((a, k) => {a[k] = de("list_" + k); return a}, {})
const vdInfo = x => `${x}: ${(parseInt(videoLen[x])/(1024*1024)).toFixed(2)}`
const setLoadBtn = x => {const btn = de('load'); 
                btn.disabled = x; btn.style.background = x ? "lightgray" : "lightgoldenrodyellow"}

setInterval(() => { if(!localStorage.getItem(LST)) clearTimer()
                    if(lId.disabled && (lId.innerText != "Load Video")) updateTimer() }, 1000)

let pswd = loadPswd(), id = '', vObjs = {}
async function loadV() { if(! videoLen.hasOwnProperty(id)) return alert("No video is selected.")
    localStorage.setItem(LST, getEpoch()); setLoadBtn(true)
    const mask = b64StrToBytes(pswd), baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
    const url = baseUrl + videoBkt[id.substring(0,1)] + id + '.xef'  
    cId.style.color = "green"   // data is loading
    try { let buf = await (await fetch(url)).arrayBuffer()
        vId.src = vObjs[id] = URL.createObjectURL(xefDecrypt(buf, mask))
        const newOpt = dc('option'); newOpt.value = id; newOpt.text = vdInfo(id)
        sId.add(newOpt); sId.value = id; lId.innerText = "Load Video"
        delete videoLen[id]; loadList(); new Audio("./win.wav").play()
    } catch(err) { console.log(err); new Audio("./error.wav").play(); setLoadBtn(false) }
}

const loadList = () => { Object.values(listMap).forEach(le => le.innerHTML = '')  // clear list first
    Object.keys(videoLen).sort().forEach( key => { const newItem = dc('li')
        newItem.textContent = vdInfo(key); newItem.setAttribute('tabindex', 1)
        listMap[key.charAt(0)].appendChild(newItem) })
    Object.values(listMap).forEach( le => le.onclick = e => { setLoadBtn(false); clearTimer()
        id = e.target.innerHTML.substring(0, 3); lId.innerText = "Load Video " + id })
}; loadList()   // loadList for the first time