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
    if(count == 0 ){
      if(document.getElementById("bonus").disabled == true) 
        new Audio("../sound/bonus.wav").play(); 
      setProp("bonus", false, "lightgoldenrodyellow")
    }
  }, 1000)
  
const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))

var bonus = bonus_am
function changeBonusSrc() {
  const BonusMap = {
    "AM": bonus_am,
    "BM": bonus_bm
  }
  const BKeys = Object.keys(BonusMap), n = BKeys.length

  const ele = document.getElementById("bonusSrc")
  for(let i = 0; i < n; i ++)
    if(BKeys[i] == ele.textContent) {
      ele.textContent = BKeys[(i+1)%n]
      bonus = BonusMap[ele.textContent]
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
          slidesMap[`${src}/${bonusKey}/${fn}`] = imageURL
        }
      })
    })
  })
  .catch(err => {
    localStorage.setItem("LastGDaccess", getEpoch() + 450)      // wait 8 min for API key to restore.
    new Audio("./sound/error.wav").play();
    restart()
  })
  .finally(() => setTimeout(()=> document.getElementById("image").hidden = true, 3000))
}

function listBonus() {
}

var slideTimer = null

function addBatchToSlides() {
  if(Object.keys(slidesMap).length == 0) return
   if(slideTimer == null) clearInterval(slideTimer)

  for (const [key, url] of Object.entries(slidesMap)) {
    showOff2("show off", key, url)
    // await delay(300)
    bonusG[key] = url                   // add to bonus gained as single image
    document.getElementById("bonusCount").innerText = Object.keys(bonusG).length
  }
  delete bonus[bonusKey]                // remove from availabe bonus not to repeat
  slidesMap = {}

  slideTimer = setInterval(nextSlide, 6000) 
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
}
  
function restart() {
  setProp("bonus", true, "black")
}

// warning before left (close, refresh-button, back-button, F5 and Ctrl+R)
window.addEventListener('beforeunload', function(e) {
  e.preventDefault()
  e.returnValue = ''
})