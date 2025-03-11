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
  .catch(err => alert(err))
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

  gapi.load('client', () => {
    gapi.client.init({
      'apiKey': 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    })
    .then(() => set_image_url())    
  })
}
