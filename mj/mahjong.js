document.getElementById("prob").style.backgroundColor = "purple"
document.getElementById("info").style.backgroundColor = "green"

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const get = id => parseInt(document.getElementById(id).value)
const set = (id, v) => {document.getElementById(id).value = v}
const changeBy = (id, v) => set(id, parseInt(get(id)) + v)

var states = {}
const st_keys = ["level", "pDist", "truphy"]
const load_states = () => st_keys.forEach(k => {states[k] = parseInt(localStorage.getItem(k)) | 0})
const save_states = () => st_keys.forEach(k => localStorage.setItem(k, states[k]))
const clear_states = () => st_keys.forEach(k => localStorage.removeItem(k))

winPropArr = [
  [50, 15, 20, 15],
  [40, 18, 24, 18],
  [36, 19, 26, 19],
  [60, 12, 16, 12]
]

function clearGame() {
  if( ! confirm("This will clear the game, are you sure?") )
    return
  clear_states()
  location.reload()
}

async function setLevel() {
  load_states()
  set("level", states["level"])
  set("truphy", states["truphy"])

  P0s = [1/2, 3/4, 7/6, 13/10, 23/16, 39/26, 65/42, 107/68, 175/110, 285/178]
  set("P0", Math.floor(P0s[states["level"]]*2000))
}
setLevel()

var winnerMap;
function setWinProb() { 
  set("wp0", 100 - get("wp1") - get("wp2") - get("wp3")) 
  winnerMap = new Map()
  v = 0
  for(let i = 0; i < 4; i ++)
    for(let j = 0; j < get("wp" + i); j ++, v ++)
    winnerMap.set(v, i)
}

function change_pDist(d=1) {
  pDist = states["pDist"]
  pDist = (pDist + d) % 4
  set("pDist", pDist)
  document.getElementById('pDist').innerText = "pDist " + pDist
  for(let i = 0; i < 4; i ++)
    set("wp"+i, winPropArr[pDist][i])
  setWinProb()
  states["pDist"] = pDist; save_states()
}
change_pDist(0)

const randSel = pMap => pMap.get(getRandomIntInclusive(0, pMap.size - 1))

function show(txt) {
  const gameLog = document.getElementById('game')
  gameLog.value += txt
  gameLog.scrollTop = gameLog.scrollHeight
}

function logGame(txt) {
  gcnt = parseInt(get("gcnt")) + 1
  set("gcnt", gcnt)
  show(gcnt.toString().padStart(3, '0') + '> ' + txt + '\n')
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const scoreProb = {
  100: 1, 90: 2, 80: 3, 70: 4, 60: 5, 50: 6, 40: 7, 30: 8, 20: 9, 10: 10,
  9: 20, 8: 30, 7: 40, 6: 50, 5: 60, 4: 70, 3: 80, 2: 90, 1: 99 }

var scoreMap = new Map(), v = 0
for(const key in scoreProb)
  for(let i = 0; i < scoreProb[key]; i ++, v++)
    scoreMap.set(v, key)

dealer = parseInt(getRandomIntInclusive(0, 3))

const getPoints = () => [0,1,2,3].map(i=>get("P"+i))
hist = [[0].concat(getPoints())]

function playOneGame() {
  for(let d = 0; d < 4; d ++)
    document.getElementById("X" + d).style.backgroundColor = d == dealer ? "red" : "dodgerblue"

  score = randSel(scoreMap)
  winner = randSel(winnerMap)
  gunner = getRandomIntInclusive(0, 3)
  info = "d:" + dealer + "  w:" + winner + "  g:" + gunner + "  s:" + score.padStart(2, '0') + '  ~~~'

  update = [0, 0, 0, 0]
  score *= get("scale")
  ss = winner == dealer ? score * 2 : score               // zhuang jia ying
  extra = "    " + winner + (winner == dealer ? "Zj" : "")
  ss = winner == gunner ? ss * 2 : ss                     // zi mo
  extra += winner == gunner ? "Zm" : (" " + gunner + (gunner == dealer ? "Zj" : "") + "Dp")
  sum = 0
  for(let i = 0; i < update.length; i ++) {
    if(i == winner) continue
    rs = parseInt(ss)
    if(i == dealer) rs *= 2
    if(i == gunner) rs *= 2
    update[i] = -rs
    sum += rs
  }
  update[winner] = sum

  for(let i = 0; i < update.length; i ++) {
    info += "  " + i + ":" + update[i]
    changeBy("P"+i, update[i])
  }

  // for Gains
  if(winner != 0) {
    update[winner] += update[0]
    changeBy("G" + winner, -update[0])
  }

  if( winner != dealer ) dealer = (dealer + 1) % 4
  hist.push([update[0]].concat(getPoints()))
  return info + extra
}

function ClothAndDebt(i) {
  let info = ""
  let leading = "\n          "
  if(get("P"+i) < 0 && get("C"+i) > 0) {
    n = Math.min(Math.ceil(-get("P"+i) / 100), get("C"+i))
    changeBy("C"+i, -n)
    changeBy("P"+i, n*100)
    changeBy("C0"+i, n)
    changeBy("P0", -n*100)
    info += leading + i + " sell " + n + " clothes for " + n*100 + " points."
  }
  if(get("P"+i) < 0 && get("C"+i) <= 0) {
    debt = -parseInt(get("P"+i))
    nwp = Math.ceil(debt/100)           // number of winning prob to be reduced 
    debt = nwp * 100
    changeBy("D"+i, debt)
    changeBy("P"+i, debt)
    changeBy("P0", -debt)

    nwp = Math.min(nwp, get("wp"+i))    // can't reduce wp below 0
    changeBy("wp"+i, -nwp)              // reduce winning prob of i
    setWinProb()                        // re-calc the winnerMap
    info += leading + i + " borrow " + debt + " points => losing " + nwp + "% of winning prob."
  }
  return info
}

function checkEnd() {
  if(get("P0") < 0) return -1

  var lost = 0
  for(let i = 1; i < 4; i ++) 
    if((get("C"+i) == 0) && (get("P"+i) < 100)) lost += 1
  return lost == 3 ? 1 : 0 
}

var cont = false
async function changeLevel(end) {
  if(cont) return
  cont = true

  level = states["level"]; truphy = states["truphy"]
  level = (end > 0 ? get("level") + 1 : 0)
  if(level >= 10) {
    level -= 10
    truphy += 1
    set("truphy", truphy)
    show("You got a Truphy!!!")
  }
  set("level", level)
  states["level"] = level; states["truphy"] = truphy; save_states()
}

function showBigGame() {
  chgs = hist.map((x, i) => [i, x[0]])
  chgs.sort((a, b) => b[1] - a[1])
  if(chgs.length > 8) {
    chgs = chgs.slice(0, 3).concat(chgs.slice(-3))
  }
  show("Big Games:" + chgs.map(x => " " + x[0] + ":" + x[1]) + "\n") 
}

var end = 0
document.getElementById("plot").style.background = "black"
async function playMJ() {
  if(end != 0){
    location.reload()
    return
  }

  while(true) {
    for (let i = 0; i < get("batch"); i++) {
      res = playOneGame()
      for(let j = 1; j < 4; j ++) res += ClothAndDebt(j)
      logGame(res)
      end = checkEnd()
      if(end != 0) break
      await delay(get("gtime"))
    }
    if(end != 0) break      
    if( ! confirm("Do you want to continue?") ) {
      break
    }
  }
  show(end > 0 ? "\nYou win!\n" : "\nYou lose!\n")
  showBigGame()
  changeLevel(end)
  document.getElementById("plot").disabled = end == 0
  document.getElementById("plot").style.background = end == 0 ? "black" : "white"
  document.getElementById("start").innerText = end == 0 ? "Start" : "Next"
}

function plot() {
  const gameLog = document.getElementById('game')
  gameLog.rows = 6
  gameLog.scrollTop = gameLog.scrollHeight

  const chart = document.getElementById('chart')
  // chart.canvas.parentNode.style.height = '200px'
  
  const xyValues = [
    {x:50, y:7},
    {x:60, y:8},
    {x:70, y:8},
    {x:80, y:9},
    {x:90, y:9},
    {x:100, y:9},
    {x:110, y:10},
    {x:120, y:11},
    {x:130, y:14},
    {x:140, y:14},
    {x:150, y:15}
  ]
  
  new Chart("chart", {
    type: "scatter",
    data: {
      datasets: [{
        pointRadius: 4,
        pointBackgroundColor: "rgba(0,0,255,1)",
        data: xyValues
      }]
    },
    options:{    
      legend: {display: false},
      maintainAspectRatio: false
    }
  })
}
