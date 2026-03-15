"use strict"

let sId = de('dvd'), lBtn = de('load'), LV = "Load Video ", loading = false, id = '', vObjs = {}
const vOp = de('vid'), selVideo = () => vOp.src = vObjs[sId.options[sId.selectedIndex].value]
const setStat = x => { loading = lBtn.disabled = x; de("cnt").textContent = 0; setLS(LV, getSec())
                       lBtn.style.background = x ? "lightgray" : "lightgoldenrodyellow" }

const loadV = async () => { try { setStat(true); let bb = await getBlob(loadPswd(), vdInfo[id])
    let nOp = dc('option'); delete vdInfo[nOp.value = nOp.text = id]; sId.add(nOp); sId.value = id
    vOp.src = vObjs[id] = URL.createObjectURL(bb); new Audio("./win.wav").play()
} catch(err) { console.log(err); new Audio("./error.wav").play() }            loadList() }

const loadList = () => vCat.forEach( x => de(x).innerHTML = '' ) || Object.keys(vdInfo).forEach(
    k => { const x = dc('li'), c = k.charAt(0); x.textContent = k; x.setAttribute('tabindex', 1)
           de(c).appendChild(x); loading = false; lBtn.innerText = LV });     loadList() // 1st time
vCat.forEach( x => de(x).onclick = 
    e => loading || setStat(false) || ( lBtn.innerText = LV + ( id = e.target.innerHTML ) ) )
setInterval( () => loading && ( de("cnt").textContent = ( getSec() - getLS(LV) ).toFixed(1) ), 100 )