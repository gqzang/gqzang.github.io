"use strict";

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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
    bonusLoaded = true
    console.log(imageURL)
  })
  .catch(err => alert("Error! See console log for detail.") || location.reload())
}

function setProp(id, disabled, background) {
  var ele = document.getElementById(id)
  ele.disabled = disabled
  ele.style.background = background
}

var bonusLoaded = false
function load_bonus() {
  if(bonusLoaded) {
    showOff()
    return
  }
  
  document.getElementById('game').hidden = true
  document.getElementById("canvas").hidden = true
  setProp("bonus", true, "grey")
  setProp("plot", true, "black")
  set_image_url()
}

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
              gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))

function showOff() {
  var win = window.open("", "_blank", 'popup=yes,fullscreen=yes,width=1600,height=960')
  win.document.open()
  var title = '<head><title>' + bonusKey + '</title></head>'
  var bUrl = bonusUrl || 'hu_pai.gif'
  var other_style = 'background-size: contain; background-position: center; background-repeat: no-repeat;'
  win.document.write(title + '<body style="background-image: url(' + bUrl + '); ' + other_style + '"></body>')
  win.document.close() 
  location.reload()
}