"use strict"

document.getElementById("play_table").style.backgroundImage = "url(../image/dance.gif)"

function getRandIntIn(min, max) {
  min = Math.ceil(min);    max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setProp(id, disabled, background) {
  const ele = document.getElementById(id)
  ele.disabled = disabled
  ele.style.background = background
}
    
const getEpoch = () => Math.round((new Date()).getTime() / 1000)
const PGDAT = "PreviousGoogleDriveAccessTime"
const clearWaitingTime = () => localStorage.setItem(PGDAT, getEpoch() - 15)
setInterval(() => {
    var lastGD = parseInt(localStorage.getItem(PGDAT)), sec = getEpoch()
    if( !lastGD ) {         // first time where storage not exists
      lastGD = sec
      localStorage.setItem(PGDAT, sec)
    }
    const count = Math.max(0, 30 - sec + lastGD)
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
/*
const get = id => parseInt(document.getElementById(id).value)

var end = 1
var autoSlideTimer = null

function slide_func() {
  if( get("timer") == 0 ) {               // ready to load a new image
    setProp("bonus", true, "grey")
    set_image_url(false)
    return
  }

  if(bonusLoaded) {
    addBonus()
    new Audio("./sound/bonus.wav").play();
    document.getElementById("bonusCount").innerText = Object.keys(bonusG).length
    bonusLoaded = false     // next bonus is not loaded yet
  }
}

function start_slide() {
  if(autoSlideTimer == null) 
    autoSlideTimer = setInterval(slide_func, 1000)
  else {
    document.getElementById("bonus").innerText = "Slide"
    clearInterval(autoSlideTimer)
    autoSlideTimer = null
  }
}

var bonus = bonus_a

function restart() {
  setProp("bonus", true, "black")
  document.getElementById("bonus").innerText = "Slide"
  document.getElementById("bonusSrc").textContent = 'A';  
  bonus = bonus_a
}
*/