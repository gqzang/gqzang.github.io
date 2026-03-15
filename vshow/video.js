"use strict"

let sId = de('dvd'), vOp = de('vid'), btn = de('load'), LV = "Load Video ", ldg = 0, id = ''
const vObjs = {}, selVideo = () => vOp.src = vObjs[sId.options[sId.selectedIndex].value],
setStat = x => {btn.style.background = bg[ldg = btn.disabled = x]; sit("cnt", 0); setLS(LV, getSec())}

const loadV = async () => { try { setStat(1); let bb = await getBlob(loadPswd(), vdInfo[id])
    let nOp = dc('option'); delete vdInfo[nOp.value = nOp.text = id]; sId.add(nOp); sId.value = id
    vOp.src = vObjs[id] = URL.createObjectURL(bb); new Audio("./win.wav").play()
} catch(err) { console.log(err); new Audio("./error.wav").play() }                  loadList() }

const loadList = () => vC.forEach( x => sit(x, '') ) || Object.keys(vdInfo).forEach(
    k => { const x = dc('li'), c = k.charAt(0); x.innerText = k; x.setAttribute('tabindex', 1)
           de(c).appendChild(x); ldg = 0; sit('load', LV) })

loadList()              // 1st time loading
vC.forEach(x => de(x).onclick = e => ldg || setStat(0) || sit('load', LV + (id = e.target.innerText)))
setInterval( () => ldg && sit("cnt", (getSec() - getLS(LV)).toFixed(1)), 100 )