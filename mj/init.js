function setInitValues() {
  const vMap = {
    "P2": "800", "C2": "5", "D2": "0", "G2": "0",
    "P3": "600", "C3": "5", "D3": "0", "G3": "0",
    "P1": "600", "C1": "5", "D1": "0", "G1": "0",
    "P0": "1000", "C01": "0", "C02": "0", "C03": "0",
    "gcnt": "0", "gtime": "50", "batch": "1000", "scale": "3"
  }
  for(const k in vMap)
    set(k, vMap[k])
}

const setTxt = (id, v) => {document.getElementById(id).innerText = v}

function setInitLook() {
  setTxt("start", "Start")
  
  document.getElementById("play_table").style.backgroundImage = "url(hu_pai.gif)"
  const game = document.getElementById("game")
  game.value = ""
  game.rows = 23
  game.hidden = true
  document.getElementById("canvas").hidden = true
  
  const bonus = document.getElementById("bonus")
  bonus.disabled = true;
  bonus.style.backgroundColor = "black"
  bonus.innerText = "Bonus"
  
  const plot = document.getElementById("plot")
  plot.disabled = true;
  plot.style.backgroundColor = "black"
}
  
function restart() {
  setInitValues()
  setInitLook()

  setLevel()
  change_pDist(0)
    
  dealer = parseInt(getRandomIntInclusive(0, 3))
  xL = [0]
  hist = [[0], ...[0,1,2,3].map(i=>[get("P"+i)])]
  
  cont = false
  end = 0
  sp = false
  
  bonusUrl = ""
  bonusKey = ""
  bonusLoaded = false
}
  