"use strict"

const { min, random, floor, ceil, PI } = Math
const sty = x => de(x).style, dsp = (x, y) => sty(x).display = y
const getRotation = ref => srcInfo[ref.split("/x")[0] + '/'][1]
const showTimedAlert = (msg, time) => { const aBox = de('customAlert'), aBs = aBox.style;
    aBox.innerHTML = msg; aBs.display = 'block'; setTimeout(() => aBs.display = 'none', time) }
const implTemp = async (file, kvP) => { let txt = await (await fetch(file)).text()
    for(let [k, v] of Object.entries(kvP)) txt = txt.replaceAll('${' +k+ '}', v)
    document.open(); document.write(txt); document.close() }

const r_s = [], srcInfo = {         '1/B-sel/': [6811, 0, true],
    '1/B-sel-x/': [2026, 0, true],  '2/MA-p1/': [4198, 270, false],
    '3/MA-p2/': [4158, 270, false], '4/MA-x/':  [7561, 270, true]
}, sia = Object.entries(srcInfo), sik = Object.keys(srcInfo)
const getName = r => sik.indexOf(r.split("/x")[0] + '/') + '~' + r.split("/x")[1].split(".")[0]

function getRandImgRef() { for(let m = 0; m < 10; m ++) {
    let n = sia.reduce((a, [k, v]) => de(k).checked ? a + v[0] : a, 0), i = floor(random() * n)
    for(var [k, v] of sia) if( de(k).checked ) if(i >= v[0]) i -= v[0]; else break
    const ref = `${k}x${String(i).padStart(4, '0')}.xef`
    if( ! r_s.includes(ref) ) return n && r_s.push(ref) && ref
}}
async function getImgUrl(blob, deg) { if(deg % 360 == 0) return URL.createObjectURL(blob)
    const ibm = await createImageBitmap(blob), cvs = dc("canvas"), ctx = cvs.getContext("2d")
    const r = (deg + 90) % 180 == 0, iw = ibm.width, ih = ibm.height
    const ch = cvs.height = r ? iw : ih, cw = cvs.width = de("hw").checked ? ch/2 : (r ? ih : iw)
    ctx.translate(cw/2, ch/2);   ctx.rotate(deg * PI / 180);  ctx.drawImage(ibm, -iw/2, -ih/2)
    return URL.createObjectURL(await new Promise(res => cvs.toBlob(b => res(b), blob.type)))
}