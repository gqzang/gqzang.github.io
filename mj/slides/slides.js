"use strict"

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))

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
function loadSlides() {
  loadOnce = true
  localStorage.setItem(PGDAT, getEpoch())
  setProp("bonus", true, "black")

  const keys = Object.keys(bonus)
  bonusKey = keys[getRandIntIn(0, keys.length-1)]
  const [id_, size] = bonus[bonusKey].split("~~")
  const id = decrypt(id_)

  const src = document.getElementById("bonusSrc").textContent
  slidesMap = {}

  gapi.client.drive.files.get({fileId: id, alt: "media"})
  .then(res => res.body)                            // res.body is already a string type
  .then(iStr => xef_decrypt(iStr, strToBytes(atob(pswd))))
  .then(iObjs => Object.keys(iObjs).forEach(fn => {
    const imageURL = URL.createObjectURL(iObjs[fn])
    if(fn == "thumbnail.jpg") 
      document.getElementById("galary").src = imageURL
    else {
      document.getElementById("image").src = imageURL
      document.getElementById("image").hidden = false
      slidesMap[`${src}-${bonusKey}-${fn}`] = imageURL
    }
  }))
  .catch(err => {
    localStorage.setItem(PGDAT, getEpoch() + 450)      // wait 8 min for API key to restore.
    new Audio("../sound/error.wav").play();
    restart()
  })
  .finally(() => {
    new Audio("../sound/win.wav").play();
    setTimeout(()=> document.getElementById("image").hidden = true, 5000)
    setInfo("Click thumbnail to add images to slides.")
  })
}

var slideTimer = null           // initial state
const slideIsRunning = () => slideTimer != null
const stopSlide = () => slideTimer = slideTimer && clearInterval(slideTimer) || null
const startSlide = () => slideTimer = slideTimer || setInterval(nextSlide, 6000)

var addingImages = false
async function addBatchToSlides() {
  if(objLen(slidesMap) == 0) {
    if(! bonusKey )
      setInfo("No image to add to slides.")
    else
      setInfo("Images is already added to slides.")
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

  // startSlide()
  slidesMap = {}
  addingImages = false

  delete bonus[bonusKey]                        // remove from availabe bonus not to repeat
  if(objLen(bonus) == 0) changeBonusSrc()       // if all are removed, have to change src.
}

var bonusG = {}
function showOff2(name, key, url) {
  var win = window.open("", name, 'width=500,height=1000,menubar=no,toolbar=no,location=no,status=no')
  if( ! win ) {
    bonusG = {}
    return console.log("Bonus is cleared.")
  }
  
  win.document.open()
  const meta = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
  const script = `<script>
  window.addEventListener('beforeunload', function(e) {
    e.preventDefault()
    e.returnValue = ''
  })</script>`
  const key_ = key.slice(0, -4)
  const title = '<html style="overscroll-behavior: none;"><head><title>' + key_ + '</title>' + meta + script + '</head>'
  let style = 'background-size: contain; background-position: center; background-repeat: no-repeat; overscroll-behavior: none; '
  style += `background-image: url(${url}); color: gold; background-color:black;`
  const body = `<div style="font-size:large;" onclick="window.opener.nextSlide_()">${key_}${("<br>" + "&nbsp;".repeat(50)).repeat(15)}</div>`
  win.document.write(`${title}<body style="${style}">${body}</body></html>`)
  win.document.close() 
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

// warning before left (close, refresh-button, back-button, F5 and Ctrl+R)
window.addEventListener('beforeunload', function(e) {
  e.preventDefault()
  e.returnValue = ''
})