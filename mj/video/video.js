"use strict"

// refer to: https://www.softpost.org/web-development/why-we-use-blob-urls-in-video-source-in-html

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))
  
            
const pswd = ""

function decrypt(id) {
  const id_ = id.slice(1)
  const bytes1 = atob(id_).split('').map(char => char.charCodeAt(0))
  const bytes2 = atob(pswd).split('').map(char => char.charCodeAt(0))
  const length = Math.min(bytes1.length, bytes2.length)
  const result = []
  for (let i = 0; i < length; i++) 
    result.push(bytes1[i] ^ bytes2[i])

  const resultString = String.fromCharCode(...result)       // Convert a base64 string
  return id.charAt(0) + btoa(resultString).replace('+', '-').replace('/', '_')
}

function loadVideo() {
  const [id_, size] = videoInfo['a01'].split("~~")
  const id = decrypt(id_)

  gapi.client.drive.files.get({
    fileId: id,
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