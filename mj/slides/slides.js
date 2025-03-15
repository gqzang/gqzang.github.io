"use strict"

function getRandIntIn(min, max) {
  min = Math.ceil(min);    max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setProp(id, disabled, background) {
  const ele = document.getElementById(id)
  ele.disabled = disabled
  ele.style.background = background
}

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
      new Audio("../sound/bonus.wav").play(); 
      setProp("bonus", false, "lightgoldenrodyellow")
      setInfo("Click Get button to fetch a image set.")
    }
  }, 1000)
  
const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))

var bonus = bonus_ax, srcAdded = {}
function changeBonusSrc() {
  if(slideTimer != null) {
    clearInterval(slideTimer)    // stop slide when change source.
    slideTimer = null
  }

  var info = ''
  for(const [k, v] of Object.entries(srcAdded)) 
    info += `  ${k}=${v}`
  if(info) setInfo('Set info:' + info)

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

var bonusKey, slidesMap = {}, lidesLoaded = false
function loadSlides() {
  localStorage.setItem(PGDAT, getEpoch())
  setProp("bonus", true, "black")

  const keys = Object.keys(bonus)
  bonusKey = keys[getRandIntIn(0, keys.length-1)]
  const id = bonus[bonusKey]

  const src = document.getElementById("bonusSrc").textContent
  slidesMap = {}

  gapi.client.drive.files.get({
    fileId: id,
    alt: "media"
  })
  .then(res => res.body)
  .then(blob => new JSZip().loadAsync(blob))
  .then(zip => {
    Object.keys(zip.files).forEach(fn => {
      zip.file(fn).async("blob").then(blob => {
        const imageURL = URL.createObjectURL(blob)
        if(fn == "thumbnail.jpg") 
          document.getElementById("galary").src = imageURL
        else {
          document.getElementById("image").src = imageURL
          document.getElementById("image").hidden = false
          slidesMap[`${src}-${bonusKey}-${fn}`] = imageURL
        }
      })
    })
  })
  .catch(err => {
    localStorage.setItem("LastGDaccess", getEpoch() + 450)      // wait 8 min for API key to restore.
    new Audio("../sound/error.wav").play();
    restart()
  })
  .finally(() => {
    new Audio("../sound/win.wav").play();
    setTimeout(()=> document.getElementById("image").hidden = true, 5000)
    setInfo("Click thumbnail to put image set into slide show.")
  })
}

var slideTimer = null

var addingImages = false
async function addBatchToSlides() {
  if(objLen(slidesMap) == 0) {
    if(! bonusKey )
      setInfo("No image to add to slide show.")
    else
      setInfo("Images have been added to slide show already.")
    return
  }
  if(addingImages) return
  addingImages = true                // prevent re-entry

  if(slideTimer != null) clearInterval(slideTimer)

  var src = ''
  for(const [key, url] of Object.entries(slidesMap)) {
    if(!src) src = key.substring(0, 2)
    showOff2("ShowOff", key, url)
    await delay(100)
    bonusG[key] = url                   // add to bonus gained as single image
    document.getElementById("bonusCount").innerText = objLen(bonusG)
  }
  srcAdded[src] = srcAdded.hasOwnProperty(src) ? srcAdded[src]+1 : 1
  setInfo(`${objLen(slidesMap)} images from set ${src}-${bonusKey} are added to slides`)

  slidesMap = {}
  slideTimer = setInterval(nextSlide, 6000) 
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
  const script = `<script>
  window.addEventListener('beforeunload', function(e) {
    e.preventDefault()
    e.returnValue = ''
  })</script>`
  var title = '<html style="overscroll-behavior: none;"><head><title>' + key + '</title>' + script + '</head>'
  var other_style = 'background-size: contain; background-position: center; background-repeat: no-repeat; overscroll-behavior: none;'
  win.document.write(title + '<body style="background-image: url(' + url + '); ' + other_style + '"></body></html>')
  win.document.close() 
}
  
function nextSlide() {
  const keys = Object.keys(bonusG)
  const n = keys.length
  if( n == 0 ) return
  
  const i = getRandIntIn(0, n-1)
  console.log(i, n)
  const bKey = keys[i], bUrl = bonusG[bKey]
  showOff2("ShowOff", bKey, bUrl)

  if(slideTimer == null) slideTimer = setInterval(nextSlide, 6000)      // start timer if it stops
}
  
function restart() {
  setProp("bonus", true, "black")
}

// warning before left (close, refresh-button, back-button, F5 and Ctrl+R)
window.addEventListener('beforeunload', function(e) {
  e.preventDefault()
  e.returnValue = ''
})