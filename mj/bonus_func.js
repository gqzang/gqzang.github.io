"use strict";

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function set_image_url() {
  var bValues = Object.values(bonus)
  var bNum = bValues.length
  var id = bValues[getRandomIntInclusive(0, bNum-1)]
  // var id = bonus["0001"]

  gapi.client.drive.files.get({
    fileId: id,
    alt: "media"
  })
  .then(res => res.body)
  .then(blob => new JSZip().loadAsync(blob))
  .then(zip => zip.file('bonus.jpg').async("blob"))
  .then(blob => {
    const imageURL = URL.createObjectURL(blob);
    // document.getElementById("bonusImage").src = imageURL
    document.getElementById("play_table").style.backgroundImage = "url(" + imageURL + ")"
    console.log(imageURL)
  })
  .catch(err => alert(err))
}

function load_bonus() {
  document.getElementById('game').hidden = true
  document.getElementById("canvas").hidden = true
  document.getElementById("bonus").disabled = true
  document.getElementById("bonus").style.background = "black"
  document.getElementById("plot").disabled = true
  document.getElementById("plot").style.background = "black"

  gapi.load('client', () => {
    gapi.client.init({
      'apiKey': 'AIzaSyCvrQgpniZzqDM_VQGiUnLHYQCNAJlu3OY',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    })
    .then(() => set_image_url())    
  })
}
