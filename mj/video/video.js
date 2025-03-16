"use strict"

// refer to: https://www.softpost.org/web-development/why-we-use-blob-urls-in-video-source-in-html

const API_KEY = 'AIzaSyAoZfGbF6tOm2jQfdLNIEhZHp80n9EZ8GY'         // zip_p from JK
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const gapiLoaded = () => gapi.load('client', () => 
            gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }))
            
function loadVideo() {
  const id = "1pbFQj6Kh1rEMpghppyQQwEgCzblKvgfU"

  gapi.client.drive.files.get({
    fileId: id,
    alt: "media"
  })
  .then(res => res.body)
  .then(blob => new JSZip().loadAsync(blob))
  .then(zip => zip.file('test.mp4').async("blob"))
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