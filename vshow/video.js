"use strict"

const cId = de("count"), lId = de('load'), sId = de('dvd'), vId = de('video'), LST = "LoadStartTime"
const updateTime = () => cId.textContent = ( (getMS() - localStorage.getItem(LST)) / 1000 ).toFixed(1)
const clearTimer = () => cId.textContent = localStorage.setItem(LST, getMS()) | 0
setInterval( () => { if( lId.disabled && (lId.innerText != "Load Video") ) updateTime() }, 100 )
const selVideo = () => { vId.src = vObjs[sId.options[sId.selectedIndex].value]; clearTimer() }
const setLoadStat = x => { loading = x; clearTimer(); const btn = de('load'); btn.disabled = x
                            btn.style.background = x ? "lightgray" : "lightgoldenrodyellow" }
let id = '', vObjs = {}, loading = false, af
const loadV = async () => { setLoadStat(true); const ref = vdBkt[id.charAt(0)] + id + '.xef'
    try { vId.src = vObjs[id] = URL.createObjectURL( await getBlob(loadPswd(), ref) )
        const nOpt = dc('option'); nOpt.value = id; nOpt.text = vdInfo[id]
        sId.add(nOpt); sId.value = id; delete vdInfo[id]; af = "./win.wav"
    } catch(err) { console.log(err); af = "./error.wav" }
    lId.innerText = "Load Video"; loadList(); loading = false; new Audio(af).play()
}
const loadList = () => vCat.forEach( x => de(x).innerHTML = '' ) || Object.entries(vdInfo).forEach(
    z => { const x = dc('li'), c = z[0].charAt(0); x.textContent = z[1]; x.setAttribute('tabindex', 1)
           de(c).appendChild(x) } )

loadList() // loadList for the first time
vCat.forEach( x => de(x).onclick = e => { if(loading) return; setLoadStat(false)
    id = e.target.innerHTML.substring(0, 3); lId.innerText = "Load Video " + id } )