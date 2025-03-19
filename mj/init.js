"use strict"

function setInitValues() {
  const vMap = {
    "P2": "800", "C2": "5", "D2": "0", "G2": "0",
    "P3": "600", "C3": "5", "D3": "0", "G3": "0",
    "P1": "600", "C1": "5", "D1": "0", "G1": "0",
    "P0": "1000", "C01": "0", "C02": "0", "C03": "0",
    "gcnt": "0", "gtime": "50", "batch": "1000", "scale": "3"
  }
  for(const k in vMap)set(k, vMap[k])
}

function setInitLook() {
  document.getElementById("start").innerText = "Start"
  document.getElementById("play_table").style.backgroundImage = "url(image/hu_pai.gif)"
  document.getElementById("canvas").hidden = true

  const game = document.getElementById("game")
  game.value = "";  game.rows = 23;  game.hidden = true
  
  const bonus = document.getElementById("bonus")
  bonus.disabled = true;  bonus.innerText = "Bonus";  bonus.style.backgroundColor = "black"
  
  const plot = document.getElementById("plot")
  plot.disabled = true;  plot.style.backgroundColor = "black"
}
  
var bonus = bonus_x

function restart() {
  setInitValues()
  setInitLook()

  setLevel()
  change_pDist(0)
    
  dealer = parseInt(getRandomIntInclusive(0, 3))
  xL = [0];     hist = [[0], ...[0,1,2,3].map(i=>[get("P"+i)])]
  
  cont = false;  end = 0;   sp = false
  
  bonusUrl = "";  bonusKey = "";  bonusLoaded = false; 
  // document.getElementById("bonusSrc").textContent = 'X';  
  // bonus = bonus_x
}
  