"use strict"

let sId = de('dvd'), lBtn = de('load'), LV = "Load Video ", loading = false, id = '', vObjs = {}
const clearTimer = () => de("cnt").textContent = setLS(LV, getMS()) || 0
const selVideo = () => clearTimer() || (de('vid').src = vObjs[sId.options[sId.selectedIndex].value])
const setLoadStat = x => { loading = lBtn.disabled = x; clearTimer()
                            lBtn.style.background = x ? "lightgray" : "lightgoldenrodyellow" }
                           
const loadV = async () => { setLoadStat(true); let ref = vdBkt[id.charAt(0)] + id + '.xef', af
    try { de('vid').src = vObjs[id] = URL.createObjectURL( await getBlob(loadPswd(), ref) )
        const nOpt = dc('option'); nOpt.value = id; nOpt.text = vdInfo[id]; delete vdInfo[id]
        sId.add(nOpt); sId.value = id; af = "./win.wav"
    } catch(err) { console.log(err); af = "./error.wav" }
    lBtn.innerText = LV; loadList(); loading = false; new Audio(af).play()
}
const loadList = () => vCat.forEach( x => de(x).innerHTML = '' ) || Object.entries(vdInfo).forEach(
    z => { const x = dc('li'), c = z[0].charAt(0); x.textContent = z[1]; x.setAttribute('tabindex', 1)
            de(c).appendChild(x) } );                loadList() // loadList for the first time
vCat.forEach( x => de(x).onclick = e => { if(loading) return; setLoadStat(false)
            id = e.target.innerHTML.substring(0, 3); lBtn.innerText = LV + id } )
setInterval( () => loading && (de("cnt").textContent = ((getMS() - getLS(LV))/1000).toFixed(1)), 100 )