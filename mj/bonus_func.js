"use strict"

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const getEpoch = () => Math.round((new Date()).getTime() / 1000)
setInterval(() => {
  var lastGD = parseInt(localStorage.getItem("LastGDaccess")), sec = getEpoch()
  if( !lastGD ) {         // first time where storage not exists
    lastGD = sec
    localStorage.setItem("LastGDaccess", sec)
  }
  const count = Math.max(0, 30 - sec + lastGD)
  document.getElementById("timer").value = count
  document.getElementById("timer").innerText = count
  document.getElementById("timer").style.color = count > 0 ? "red" : "green"
  if(count == 0 && end > 0 && !settingImageUrl) setProp("bonus", false, "lightgoldenrodyellow")
}, 1000)

var bonusUrl = "", bonusKey = ""
function set_image_url() {
  var keys = Object.keys(bonus)
  bonusKey = keys[getRandomIntInclusive(0, keys.length-1)]
  var id = bonus[bonusKey]

  gapi.client.drive.files.get({
    fileId: id,
    alt: "media"
  })
  .then(res => res.body)
  .then(blob => new JSZip().loadAsync(blob))
  .then(zip => zip.file('bonus.jpg').async("blob"))
  .then(blob => {
    const imageURL = URL.createObjectURL(blob)
    bonusUrl = imageURL
    // document.getElementById("bonusImage").src = imageURL
    document.getElementById("play_table").style.backgroundImage = "url(" + imageURL + ")"
    document.getElementById("bonus").innerText = bonusKey
    setProp("bonus", false, "gold")
    bonusLoaded = true; settingImageUrl = false;
    localStorage.setItem("LastGDaccess", getEpoch())
    console.log(imageURL)
  })
  .catch(err => alert("Error! See console log for detail.") || restart())
}

function setProp(id, disabled, background) {
  var ele = document.getElementById(id)
  ele.disabled = disabled
  ele.style.background = background
}

var bonusLoaded = false, settingImageUrl = false
function load_bonus() {
  if(bonusLoaded) {
    showOff()
    return
  }
  
  document.getElementById('game').hidden = true
  document.getElementById("canvas").hidden = true
  setProp("bonus", true, "grey")
  setProp("plot", true, "black")

  settingImageUrl = true; set_image_url()
}

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
              gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))

function showOff() {
  var imgInfo = (localStorage.getItem("imgInfo") || "" ) + "|" + bonusKey + "|" + bonusUrl
  localStorage.setItem("imgInfo", imgInfo)
  showOff2("ShowOff", bonusKey, bonusUrl)
  clearInterval(slideTimer);  slideTimer = setInterval(nextSlide, 6000)     // restart timer
  restart()
}

function showOff2(name, bonusKey_, bonusUrl_) {
  var win = window.open("", name, 'width=1200,height=720')
  if( ! win )
    return console.log("Bonus is cleared.") || localStorage.removeItem("imgInfo")

  win.document.open()
  var title = '<head><title>' + bonusKey_ + '</title></head>'
  var bUrl = bonusUrl_ || 'hu_pai.gif'
  var other_style = 'background-size: contain; background-position: center; background-repeat: no-repeat;'
  win.document.write(title + '<body style="background-image: url(' + bUrl + '); ' + other_style + '"></body>')
  win.document.close() 
}

function nextSlide() {
  const imgInfo = localStorage.getItem("imgInfo")
  if( !imgInfo ) return
  
  const imgs = imgInfo.split("|").slice(1)
  const n = imgs.length / 2
  if( n == 0 ) return

  const imgMap = {}
  for(let i = 0; i < n; i ++) imgMap[imgs[2*i]] = imgs[2*i+1]
  const keys = Object.keys(imgMap)
  const m = keys.length

  const i = getRandomIntInclusive(0, m-1)
  console.log(i, m, n)
  const bKey = keys[i], bUrl = imgMap[bKey]
  showOff2("ShowOff", bKey, bUrl)
}

var slideTimer = setInterval(nextSlide, 6000)
