"use strict"

const de = x => document.getElementById(x)

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
    
const loadPswd = () => localStorage.getItem(VUX) || ""
const setPswd = () => localStorage.setItem(VUX, de("pswd").value.trim())
const savePswd = () => setPswd() || alert(pswd = loadPswd())
let pswd = loadPswd()

const objLen = x => Object.keys(x).length
const getEpoch = () => Math.round((new Date()).getTime() / 1000)
const cid = document.getElementById("count")
const lid = document.getElementById("load")
const LST = "LoadingStartTime"
const updateTimer = () => cid.textContent = getEpoch() - parseInt(localStorage.getItem(LST))
const clearTimer = () => cid.textContent = localStorage.setItem(LST, getEpoch()) | 0

function setProp(id, disabled, background) {
  const ele = document.getElementById(id)
  ele.disabled = disabled
  ele.style.background = background
}

setInterval(() => {
  if(!localStorage.getItem(LST)) clearTimer()
  if(lid.disabled && (document.getElementById('load').innerText != "Load Video"))
    updateTimer()
}, 1000)

async function loadVideo() {
  if(! videoLen.hasOwnProperty(xl))
    return alert("No video is selected.")

  localStorage.setItem(LST, getEpoch())
  setProp("load", true, "lightgray")

  const id = xl, size = videoLen[xl]
  const mask = b64StrToBytes(pswd), baseUrl = bytesToStr(xor_crypt(b64StrToBytes(baseUrlX), mask))
  const url = baseUrl + videoBkt[id.substring(0,1)] + id + '.xef'
  
  cid.style.color = "green"            // data is loading
  try {
    const buf = await (await fetch(url)).arrayBuffer()
    const blob = xefDecrypt(buf, mask)
    const videoURL = URL.createObjectURL(blob)
    document.querySelector('video').src = videoURL

    new Audio("./win.wav").play()
    document.getElementById('load').innerText = "Load Video" 
    updateTimer()
    storeDownloadedVideo(xl, videoURL)
    delete videoLen[xl];  loadList()            // remove the loaded item from lists
  } catch(err) {
    console.log(err) 
    new Audio("./error.wav").play()
    setProp("load", false, "lightgoldenrodyellow")
  }
}

const selectId = document.getElementById('downloaded')
const videoObjs = {}
function storeDownloadedVideo(key, url) {
  const newOption = document.createElement('option')
  newOption.value = key
  const size = videoLen[xl]
  newOption.text = `${key}: ${(parseInt(size)/(1024*1024)).toFixed(2)}`
  selectId.add(newOption)
  selectId.value = key
  videoObjs[key] = url
}

function changeVideo() {
  const name = selectId.options[selectId.selectedIndex].value
  document.querySelector('video').src = videoObjs[name]
}

const listMap = {
  "a": document.getElementById("list_a"),
  "g": document.getElementById("list_g"),
  "f": document.getElementById("list_f")
}
var xl = ''
loadList()
function loadList() {
  Object.values(listMap).forEach(le => le.innerHTML = '')            // clear list first for reloading

  Object.keys(videoLen).sort().forEach(key => {
    const size = videoLen[key]
    const newItem = document.createElement('li')
    newItem.textContent = `${key}: ${(parseInt(size)/(1024*1024)).toFixed(2)}`
    newItem.setAttribute('tabindex', 1)
    listMap[key.charAt(0)].appendChild(newItem)    
  })  
  
  Object.values(listMap).forEach(le => le.onclick = e => {
    xl = e.target.innerHTML.substring(0, 3)
    document.getElementById('load').innerText = "Load Video " + xl
    setProp("load", false, "lightgoldenrodyellow")
    clearTimer()
  })
}
