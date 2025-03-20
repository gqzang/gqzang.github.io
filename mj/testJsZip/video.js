"use strict"

// refer to: https://www.softpost.org/web-development/why-we-use-blob-urls-in-video-source-in-html

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))

const cid = document.getElementById("count")
const lid = document.getElementById("load")
var count = 0
setInterval(() => {
  count = lid.disabled ? count + 1 : 0
  cid.textContent = count
}, 1000)

function loadVideo() {
  const vInfo = {
    "1": "1BlzJJVERpCjSr8EsuT_Zpd1KmtlNdC8O",
    "2": "19baiKu2LoydBH-H7HnwzV6YrW7_WVdxG",
    "3": "1FvoGu54npFuSdhy9qfaOQkiBaDLSyxi8"
  }

  lid.disabled = true
  gapi.client.drive.files.get({
    fileId: vInfo["3"],
    alt: "media"
  })
  .then(res => res.body)
  .then(blob => new JSZip().loadAsync(blob))
  .then(zip => zip.file('video.mp4').async("blob"))
  .then(blob => {
    const videoUrl = URL.createObjectURL(blob)
    const videoElement = document.querySelector('video')
    videoElement.src = videoUrl
    console.log("here")
  })
  .catch(err => {
    new Audio("../sound/error.wav").play();
    console.log(err)
  })
  .finally(() => {
    new Audio("../sound/win.wav").play();
  })

}