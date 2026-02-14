const strToBytes = str => Array.from(str, char => char.charCodeAt(0))

function bytesToStr(byteArray) {
    let result = '';
    for (let i = 0; i < byteArray.length; i++)
        result += String.fromCharCode(byteArray[i]);
    return result;
}

function xor_crypt(src, mask) {
    const result = []
    const l = mask.length
    for (let i = 0; i < src.length; i++)
        result.push(src[i] ^ mask[i % l])
    return result
}

function xef_decrypt(buffer, mask, bType = 'image/jpg') {
    const buf = new Uint8Array(buffer);
    const linfo = buf[0] * 256 + buf[1]
    var cp = 2 + linfo                  // current position in bytes
    const bytes = buf.slice(2, cp)
    const info = bytesToStr(xor_crypt(bytes, mask)).split('|')
    const min_len = parseInt(info[0])

    const result = {}
    for(let i = 1; i < info.length; i += 2) {
        const fn = info[i], size = parseInt(info[i + 1])
        const xLen = Math.min(min_len, size)
        const aBuf = buf.slice(cp, cp + xLen)
        const xU8A = new Uint8Array(xor_crypt(aBuf, mask))
        const rU8A = buf.slice(cp + xLen, cp + size)
        result[fn] = new Blob([xU8A].concat(rU8A), { type: bType })
        cp += size
    }
    return result
}

pswd = "103993oveR/++102"

async function xshow() {
    mask = strToBytes(atob(pswd))

    // document.body.style.backgroundColor = "lightblue"
    url = 'https://storage.googleapis.com/xef-1/B-sel/x0001.xef'
    try {
        const response = await fetch(url)
        const buf = await response.arrayBuffer()
        const iObjs = xef_decrypt(buf, mask)
        for(const [fn, img] of Object.entries(iObjs)) {
            const url = URL.createObjectURL(img)
            document.body.style.backgroundImage = `url(${url})`
            break               // only first image to show
        }
          console.log("here")
    }
    catch (error) {
        console.error("Error fetching binary data:", error);
    }
}

xshow()