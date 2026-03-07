"use strict"

const VUX = "VideoUrlXor", baseUrlX = 'vzmJhwkVVjCNjzJEtiqY2R1AFniSnjxGvj7TlBVCVmebnXA='
const b64StrToBytes = str => Array.from(atob(str), char => char.charCodeAt(0))
const bytesToStr = bArr => { let res = '', i = 0
    for(; i < bArr.length; i++) res += String.fromCharCode(bArr[i]); return res }
const xor_crypt = (src, mask) => { let res = [], i = 0
    for(; i < src.length; i++) res.push(src[i] ^ mask[i % (mask.length)]); return res }
function xefDecrypt(buffer, mask, bType = 'image/jpg') {
    const buf  = new Uint8Array(buffer), cp = 2 + buf[0] * 256 + buf[1]
    const info = bytesToStr(xor_crypt(buf.slice(2, cp), mask)).split('|')
    const size = parseInt(info[2]), xLen = Math.min(parseInt(info[0]), size)
    const xU8A = new Uint8Array(xor_crypt(buf.slice(cp, cp + xLen), mask))
    return new Blob([xU8A].concat(buf.slice(cp + xLen, cp + size)), { type: bType })
}
const de = x => document.getElementById(x), dc = x => document.createElement(x)
const setProp = (id, disabled, background) => {
    const ele = de(id); ele.disabled = disabled; ele.style.background = background }
const loadPswd = () => localStorage.getItem(VUX) || ""
const setPswd = () => localStorage.setItem(VUX, de("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())

const getEpoch = () => Math.round((new Date()).getTime() / 1000)
const cid = de("count"), lid = de("load"), LST = "LoadingStartTime"
const updateTimer = () => cid.textContent = getEpoch() - parseInt(localStorage.getItem(LST))
const clearTimer = () => cid.textContent = localStorage.setItem(LST, getEpoch()) | 0
setInterval(() => { if(!localStorage.getItem(LST)) clearTimer()
    if(lid.disabled && (de('load').innerText != "Load Video")) updateTimer() }, 1000)

const selVd = () => de('video').src = vObjs[sId.options[sId.selectedIndex].value]
const listMap = Object.keys(videoBkt).reduce((a, k) => {a[k] = de("list_" + k); return a}, {})
const vdInfo = x => `${x}: ${(parseInt(videoLen[x])/(1024*1024)).toFixed(2)}`

let pswd = loadPswd(), id = '', sId = de('downloaded'), vObjs = {}
async function loadVideo() {
    if(! videoLen.hasOwnProperty(id)) return alert("No video is selected.")
    localStorage.setItem(LST, getEpoch()); setProp("load", true, "lightgray")

    const mask = b64StrToBytes(pswd), baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
    const url = baseUrl + videoBkt[id.substring(0,1)] + id + '.xef'  
    cid.style.color = "green"            // data is loading
    try {
        const buf = await (await fetch(url)).arrayBuffer()
        const videoURL = URL.createObjectURL(xefDecrypt(buf, mask)), newOption = dc('option')
        de('video').src = vObjs[id] = videoURL; newOption.value = sId.value = id
        newOption.text = vdInfo(id); sId.add(newOption); de('load').innerText = "Load Video"
        new Audio("./win.wav").play(); updateTimer(); delete videoLen[id]; loadList()
    } catch(err) { console.log(err); new Audio("./error.wav").play()
        setProp("load", false, "lightgoldenrodyellow") }
}

const loadList = () => { Object.values(listMap).forEach(le => le.innerHTML = '')  // clear list first
    Object.keys(videoLen).sort().forEach( key => { const newItem = dc('li')
        newItem.textContent = vdInfo(key); newItem.setAttribute('tabindex', 1)
        listMap[key.charAt(0)].appendChild(newItem) })
    Object.values(listMap).forEach( le => le.onclick = e => {
        id = e.target.innerHTML.substring(0, 3); de('load').innerText = "Load Video " + id
        setProp("load", false, "lightgoldenrodyellow"); clearTimer() })
}
loadList()   // loadList for the first time