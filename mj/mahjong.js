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

var winnerMap;
function setWinProb() { 
  set("wp0", 100 - get("wp1") - get("wp2") - get("wp3")) 
  winnerMap = new Map()
  v = 0
  for(let i = 0; i < 4; i ++)
    for(let j = 0; j < get("wp" + i); j ++, v ++)
    winnerMap.set(v, i)
}
setWinProb()

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const scoreProb = {
  100: 1, 90: 2, 80: 3, 70: 4, 60: 5, 50: 6, 40: 7, 30: 8, 20: 9, 10: 10,
  9: 20, 8: 30, 7: 40, 6: 50, 5: 60, 4: 70, 3: 80, 2: 90, 1: 99 }
var scoreMap = new Map()
v = 0
for(const key in scoreProb) {
  for(let i = 0; i < scoreProb[key]; i ++, v++)
    scoreMap.set(v, key)
}

dealer = parseInt(getRandomIntInclusive(0, 3))

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
  extra = "    " + winner + (winner == dealer ? "Lz" : "")
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

async function playMJ() {
  var end
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
}
