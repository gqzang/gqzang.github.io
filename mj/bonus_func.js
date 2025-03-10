"use strict";

// async function get_url()

function set_image_url() {
  var id = bonus["0000"]

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
}

function load_bonus() {
  gapi.load('client', () => {
    gapi.client.init({
      'apiKey': 'AIzaSyC9yLlWoUMsbxKM2EpVA48p6Vuv3Q8b0XE',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    })
    .then(() => set_image_url())    
  })
}
