const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const clear = document.querySelector('[name=clear]');
const slider = document.querySelectorAll('.rgb input');

const values = {red: 128, blue: 128, green: 128};
const photos = JSON.parse(localStorage.getItem('photos')) || [];

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.src = window.URL.createObjectURL(localMediaStream);
      video.play();
    })
    .catch(err => {
      console.error(`OH NO!!!`, err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // ctx.globalAlpha = 0.8;
    pixels = changeColor(pixels);
    // put them back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  // played the sound
  snap.currentTime = 0;
  snap.play();
  // take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  setLocalStorage(data);
  addPhotoToStrip(data);
}

function addPhotoToStrip(data) {
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'your-photo');
  link.innerHTML = `<img src="${data}" alt="your photo" />`;
  strip.insertBefore(link, strip.firstChild);
}

function changeColor(pixels) { 
  //Canvas pixel image data comes in 4-1 byte numbers representing r,g,b,a
   for(let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i + 0] = pixels.data[i+0] + values.red; // RED
    pixels.data[i + 1] = pixels.data[i+1] + values.green;// GREEN
    pixels.data[i + 2] = pixels.data[i + 2] + values.blue; // BLUE
    //We are skipping [i + 3] which is the alpha channel
  }
  return pixels;
}

function setLocalStorage(photo) {
  //Push our image data to our array
  photos.push(photo);
  //Put this array into localStorage
  localStorage.setItem('photos', JSON.stringify(photos));
}

function getLocalStorage() {
  //If there are not photos in our localStorage, we don't need to populate them.
  if (!photos.length) return;
  photos.forEach((photo) => {
    addPhotoToStrip(photo);
  })
}

function removeImages() {
  //Remove our photos item
  localStorage.removeItem('photos');
  //Empty out our strip
  strip.innerHTML = '';
}

getVideo();
getLocalStorage();

video.addEventListener('canplay', paintToCanvas);
slider.forEach((input) => {
  input.addEventListener('change', () => {
     values[input.name] = parseFloat(input.value);
  })
});
clear.addEventListener('click', removeImages);
