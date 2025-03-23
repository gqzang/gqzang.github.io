"use strict"

const objLen = x => Object.keys(x).length
const setInfo = x => document.getElementById("info").textContent = x
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const getEpoch = () => Math.round((new Date()).getTime() / 1000)
const PGDAT = "PreviousGoogleDriveAccessTime"
const clearWaitingTime = () => localStorage.setItem(PGDAT, getEpoch() - 100)

setInterval(() => {
    var lastGD = parseInt(localStorage.getItem(PGDAT)), sec = getEpoch()
    if( !lastGD ) {         // first time where storage not exists
      lastGD = sec
      localStorage.setItem(PGDAT, sec)
    }
    const count = Math.max(0, 60 - sec + lastGD)
    document.getElementById("timer").value = count
    document.getElementById("timer").innerText = count
    document.getElementById("timer").style.color = count > 0 ? "red" : "green"
    if(count == 0 && document.getElementById("bonus").disabled == true){
      if(loadOnce) new Audio("../sound/bonus.wav").play()
      setProp("bonus", false, "lightgoldenrodyellow")
      setInfo("Click Get button to fetch a image set.")
    }
  }, 1000)
  
var bonus = bonus_ax, srcAdded = {}
function changeBonusSrc() {
  if(slideIsRunning()) return stopSlide() || setInfo("Slides is stopped.")

  var info = ''
  for(const [k, v] of Object.entries(srcAdded)) 
    info += `  ${k}=${v}`
  if(info) setInfo('Info:' + info)

  const BonusMap = {
    "AX": bonus_ax,
    "BX": bonus_bx,
    "AM": bonus_am,
    "BM": bonus_bm
  }
  const BKeys = Object.keys(BonusMap), n = BKeys.length

  const ele = document.getElementById("bonusSrc")
  for(let i = 0; i < n; i ++)
    if(BKeys[i] == ele.textContent) {
      ele.textContent = BKeys[(i+1)%n]
      bonus = BonusMap[ele.textContent]
      if(objLen(bonus) == 0) changeBonusSrc()    // if changed to an empty one, go to the next one
      return
    }
}

var bonusKey, slidesMap = {}, loadOnce = false
async function loadSlides() {
  loadOnce = true
  localStorage.setItem(PGDAT, getEpoch())
  setProp("bonus", true, "black")

  const keys = Object.keys(bonus)
  bonusKey = keys[getRandIntIn(0, keys.length-1)]
  const [id_, size] = bonus[bonusKey].split("~~")
  const id = decrypt(id_)

  const src = document.getElementById("bonusSrc").textContent
  slidesMap = {}

  try {
    const res = await gapi.client.drive.files.get({fileId: id, alt: "media"})
    const iObjs = xef_decrypt(res.body, strToBytes(atob(pswd)))       // res.body is already a string type
    for(const [fn, img] of Object.entries(iObjs))
      fn == "thumbnail.jpg" ? document.getElementById("galary").src = URL.createObjectURL(img) :
                              slidesMap[`${src}-${bonusKey}-${fn}`] = URL.createObjectURL(img)
    new Audio("../sound/win.wav").play();
    setInfo("Click thumbnail to add images to slides.")
  }
  catch(err) {
    localStorage.setItem(PGDAT, getEpoch() + 450)      // wait 8 min for API key to restore.
    new Audio("../sound/error.wav").play();
    restart()
  }
}

var slideTimer = null           // initial state
const slideIsRunning = () => slideTimer != null
const stopSlide = () => slideTimer = slideTimer && clearInterval(slideTimer) || null
const startSlide = () => slideTimer = slideTimer || setInterval(nextSlide, 6000)

var addingImages = false
async function addBatchToSlides() {
  if(objLen(slidesMap) == 0) {
    setInfo(! bonusKey ? "No image to add to slides." : "Images is already added to slides.")
    return
  }
  if(addingImages) return
  addingImages = true                // prevent re-entry

  stopSlide()     // stop slide before to load images

  var src = ''
  for(const [key, url] of Object.entries(slidesMap)) {
    if(!src) src = key.substring(0, 2)
    showOff2("ShowOff", key, url)
    await delay(100)
    bonusG[key] = url                   // add to bonus gained as single image
    document.getElementById("bonusCount").innerText = objLen(bonusG)
  }
  srcAdded[src] = srcAdded.hasOwnProperty(src) ? srcAdded[src]+1 : 1
  setInfo(`${objLen(slidesMap)} images (${src}-${bonusKey}-*) are added to slides`)

  slidesMap = {}
  addingImages = false

  delete bonus[bonusKey]                        // remove from availabe bonus not to repeat
  if(objLen(bonus) == 0) changeBonusSrc()       // if all are removed, have to change src.
}

var bonusG = {}
function showOff2(name, key, url) {
  var win = window.open("", name, 'width=500,height=1000,menubar=no,toolbar=no,location=no,status=no')
  if( win ) return createSlide(win, key.slice(0, -4), url, "nextSlide_")
  bonusG = {}
  return console.log("Bonus is cleared.")
}
  
function nextSlide_() {
  if(objLen(bonusG) == 0) return              // nothing to show yet.
  nextSlide() 
  if(slideIsRunning()) return
  setInfo('Slides is started')
  startSlide()    // if Slide already started, do nothing
}

function nextSlide() {
  const keys = Object.keys(bonusG)
  const n = keys.length
  if( n == 0 ) return
  
  const i = getRandIntIn(0, n-1)
  console.log(i, n)
  const bKey = keys[i], bUrl = bonusG[bKey]
  showOff2("ShowOff", bKey, bUrl)
}
  
function restart() {
  setProp("bonus", true, "black")
}
