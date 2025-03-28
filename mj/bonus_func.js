"use strict"

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
  if(count == 0 && end > 0 && !settingImageUrl) {
    if(document.getElementById("bonus").disabled == true) 
      // for sound file, see: https://mixkit.co/free-sound-effects/notification/
      new Audio("./sound/bonus.wav").play();  
    setProp("bonus", false, "lightgoldenrodyellow")
  }
}, 1000)

var bonusUrl = "", bonusKey = "", bonusG = {};

var settingImageUrl = false;
async function set_image_url(forMJ=true) {
  if(settingImageUrl) return                  // don't allow to re-entry until done
  settingImageUrl = true
  localStorage.setItem("LastGDaccess", getEpoch() + getRandIntIn(0, 10))

  var keys = Object.keys(bonus)
  bonusKey = keys[getRandIntIn(0, keys.length-1)]
  const [id_, size] = bonus[bonusKey].split("~~")
  const id = decrypt(id_)

  try {
    const res = await gapi.client.drive.files.get({fileId: id, alt: "media"})
    const iObjs = xef_decrypt(res.body, strToBytes(atob(pswd)))    // res.body is already a string type
    const imageURL = URL.createObjectURL(iObjs['bonus.jpg'])
    bonusUrl = imageURL
    document.getElementById("play_table").style.backgroundImage = "url(" + imageURL + ")"
    document.getElementById("bonus").innerText = bonusKey
    setProp("bonus", false, "gold"); bonusLoaded = true;
    console.log(imageURL)
    settingImageUrl = false
  }
  catch(err) {
    localStorage.setItem("LastGDaccess", getEpoch() + 450)      // wait 8 min for API key to restore.
    new Audio("./sound/error.wav").play();
    if(forMJ) alert("Error! See console log for detail.")
    settingImageUrl = false
    restart()
  }
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

function addBonus() {
  const newBonusKey = Object.keys(bonusG).length.toString().padStart(4, '0') + '-' + 
                      document.getElementById("bonusSrc").textContent + '-' + bonusKey
  bonusG[newBonusKey] = bonusUrl           // add to bonus gained
  delete bonus[bonusKey]                // remove from availabe bonus not to repeat
  return newBonusKey
}

function showOff() {
  const newBonusKey = addBonus()
  showOff2("ShowOff", newBonusKey, bonusUrl)
  stopSlide()
  restart()
}

function showOff2(name, bonusKey_, bonusUrl_) {
  var win = window.open("", name, 'width=1200,height=720,menubar=no,toolbar=no,location=no,status=no')
  if( ! win ) {
    bonusG = {}
    return console.log("Bonus is cleared.")
  }
  createSlide(win, bonusKey_, bonusUrl_, "nextSlide")
}

function nextSlide() {
  const keys = Object.keys(bonusG)
  const n = keys.length
  if( n == 0 ) return

  const i = getRandIntIn(0, n-1)
  console.log(i, n)
  const bKey = keys[i], bUrl = bonusG[bKey]
  showOff2("ShowOff", bKey, bUrl)
  startSlide()
}

function changeBonusSrc() {
  const BonusMap = {
    "X": bonus_x,
    "Y": bonus_y,
    "Z": bonus_z,
    "A": bonus_a
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
