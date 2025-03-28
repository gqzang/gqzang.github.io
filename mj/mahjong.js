"use strict"

document.getElementById("prob").style.backgroundColor = "purple"
document.getElementById("info").style.backgroundColor = "green"

const get = id => parseInt(document.getElementById(id).value)
const set = (id, v) => {document.getElementById(id).value = v}
const changeBy = (id, v) => set(id, parseInt(get(id)) + v)

var states = {}
const st_keys = ["level", "pDist", "truphy"]
const load_states = () => st_keys.forEach(k => {states[k] = parseInt(localStorage.getItem(k)) | 0})
const save_states = () => st_keys.forEach(k => localStorage.setItem(k, states[k]))
const clear_states = () => st_keys.forEach(k => localStorage.removeItem(k))

const winPropArr = [
  [50, 15, 20, 15],
  [40, 18, 24, 18],
  [36, 19, 26, 19],
  [60, 12, 16, 12]
]

function clearGame() {
  if( ! confirm("This will clear the game, are you sure?") )
    return
  clear_states()
  restart()
}

async function setLevel() {
  load_states()
  set("level", states["level"])
  set("truphy", states["truphy"])

  const P0s = [1/2, 3/4, 7/6, 13/10, 23/16, 39/26, 65/42, 107/68, 175/110, 285/178]
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
  let pDist = states["pDist"]
  pDist = (pDist + d) % 4
  set("pDist", pDist)
  document.getElementById('pDist').innerText = "pDist " + pDist
  for(let i = 0; i < 4; i ++)
    set("wp"+i, winPropArr[pDist][i])
  setWinProb()
  states["pDist"] = pDist; save_states()
}
change_pDist(0)

const randSel = pMap => pMap.get(getRandIntIn(0, pMap.size - 1))

function show(txt) {
  const gameLog = document.getElementById('game')
  gameLog.value += txt
  gameLog.scrollTop = gameLog.scrollHeight
}

function logGame(txt) {
  let gcnt = parseInt(get("gcnt")) + 1
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

var dealer = parseInt(getRandIntIn(0, 3))

var xL = [0], hist = [[0], ...[0,1,2,3].map(i=>[get("P"+i)])]

function playOneGame() {
  for(let d = 0; d < 4; d ++)
    document.getElementById("X" + d).style.backgroundColor = d == dealer ? "red" : "dodgerblue"

  let score = randSel(scoreMap)
  let winner = randSel(winnerMap)
  let gunner = getRandIntIn(0, 3)
  let info = "d:" + dealer + "  w:" + winner + "  g:" + gunner + "  s:" + score.padStart(2, '0') + '  ~~~'

  let update = [0, 0, 0, 0]
  score *= get("scale")
  let ss = winner == dealer ? score * 2 : score               // zhuang jia ying
  let extra = "    " + winner + (winner == dealer ? "Zj" : "")
  ss = winner == gunner ? ss * 2 : ss                     // zi mo
  extra += winner == gunner ? "Zm" : (" " + gunner + (gunner == dealer ? "Zj" : "") + "Dp")
  let sum = 0
  for(let i = 0; i < update.length; i ++) {
    if(i == winner) continue
    let rs = parseInt(ss)
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

  xL.push(xL.length);    hist[0].push(update[0])
  for(let i = 0; i < 4; i ++) hist[i+1].push(get("P"+i))
  return info + extra
}

function ClothAndDebt(i) {
  let info = ""
  let leading = "\n          "
  if(get("P"+i) < 0 && get("C"+i) > 0) {
    let n = Math.min(Math.ceil(-get("P"+i) / 100), get("C"+i))
    changeBy("C"+i, -n)
    changeBy("P"+i, n*100)
    changeBy("C0"+i, n)
    changeBy("P0", -n*100)
    info += leading + i + " sell " + n + " clothes for " + n*100 + " points."
  }
  if(get("P"+i) < 0 && get("C"+i) <= 0) {
    let debt = -parseInt(get("P"+i))
    let nwp = Math.ceil(debt/100)           // number of winning prob to be reduced 
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

  let level = states["level"], truphy = states["truphy"]
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
  let chgs = hist[0].map((x, i) => [i, x])
  chgs.sort((a, b) => b[1] - a[1])
  if(chgs.length > 6)
    chgs = chgs.slice(0, 3).concat(chgs.slice(-3))
  show("Big Games:" + chgs.map(x => " " + x[0] + ":" + x[1]) + "\n") 
}

var end = 0
async function playMJ() {
  stopSlide()
  if(end != 0){
    restart()
    return
  }
  document.getElementById('game').hidden = false
  setProp("start", true, "black")
  
  while(true) {
    const batch = 1000 // fixed now 
    for (let i = 0; i < batch; i++) {
      let res = playOneGame()
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
  new Audio(end > 0 ? "./sound/win.wav": "./sound/lose.wav").play();  

  setProp("plot", end == 0, end == 0 ? "black" : "lightgoldenrodyellow")
  setProp("start", false, "lightgoldenrodyellow")
  document.getElementById('start').innerText = "Reset"

  // bonus only available when wining and timer is 0
  setProp("bonus", !(end > 0 && get("timer") == 0), end > 0 ? "grey" : "black")
}

const backgroundColorPlugin = {
  id: 'custom_canvas_background_color',
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#fff'; // Default white if no color is provided
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
}

var sp = false
function plot() {
  // refer to https://www.w3schools.com/ai/ai_chartjs.asp

  sp = ! sp              // switch
  const gameLog = document.getElementById('game')
  gameLog.rows = sp ? 7 : 23
  gameLog.scrollTop = gameLog.scrollHeight

  document.getElementById("plot").style.background = sp ? "white" : "lightgoldenrodyellow"
  const canvas = document.getElementById('canvas')
  canvas.hidden = sp ? false : true

  const clrs = ["black", "purple", "red", "green", "blue"]
  new Chart("chart", {
    type: "line",
    data: {
      labels: xL,
      datasets: 
        hist.map((e, i) => ({ data: e, borderColor: clrs[i], fill: false }))
    },
    options: {
      legend: {display: false},
      maintainAspectRatio: false,
      plugins: {
        custom_canvas_background_color: {
          color: 'lightgray'
        }
      }
    },
    plugins: [backgroundColorPlugin]
  })
}
