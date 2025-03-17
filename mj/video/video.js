"use strict"

// refer to: https://www.softpost.org/web-development/why-we-use-blob-urls-in-video-source-in-html

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))
  
const pswd = "103993oveR/++102103993oveR/++102"

function decrypt(id) {
  const id_ = id.slice(1)
  const bytes1 = atob(id_).split('').map(char => char.charCodeAt(0))
  const bytes2 = atob(pswd).split('').map(char => char.charCodeAt(0))
  const length = Math.min(bytes1.length, bytes2.length)
  const result = []
  for (let i = 0; i < length; i++) 
    result.push(bytes1[i] ^ bytes2[i])

  const resultString = String.fromCharCode(...result)       // Convert a base64 string
  return id.charAt(0) + btoa(resultString).replace(/\+/g, '-').replace(/\//g, '_')
}

function getRandIntIn(min, max) {
  min = Math.ceil(min);    max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setProp(id, disabled, background) {
  const ele = document.getElementById(id)
  ele.disabled = disabled
  ele.style.background = background
}

const objLen = x => Object.keys(x).length

function loadVideo() {
  setProp("load", true, "black")
  const keys = Object.keys(videoInfo)
  const key = keys[getRandIntIn(0, keys.length-1)]
  const [id_, size] = videoInfo[key].split("~~")
  const id = decrypt(id_), MB = parseInt(size) / (1024*1024)
  console.log(`loading ${key} -- ${id} -- ${MB.toFixed(2)} MB`)

  gapi.client.drive.files.get({
    fileId: id,
    alt: "media"
  })
  .then(res => res.body)
  .then(blob => new JSZip().loadAsync(blob))
  .then(zip => zip.file('video.mp4').async("blob"))
  .then(blob => document.querySelector('video').src = URL.createObjectURL(blob))
  .catch(err => console.log(err) || (new Audio("../sound/error.wav").play()))
  .finally(() => {
    (new Audio("../sound/win.wav")).play()
    setProp("load", false, "white")
  })
}