const startMenu = document.querySelector("#start-menu");
const songMenu = document.querySelector("#song-menu");
const uploadMenu = document.querySelector("#upload-menu");
const loadingBuffer = document.querySelector("#loading-buffer");
const musicOptions = document.querySelectorAll(".song-option");
console.log(musicOptions);

songMenu.style.display = "none";
uploadMenu.style.display = "none";

document.querySelector("#start-menu button").addEventListener("click", () => {
  startMenu.classList.add("inactive-back");
  songMenu.style.display = "flex";
  setTimeout(() => {
    songMenu.classList.remove("inactive-next");
  }, 100);
  setTimeout(() => {
    startMenu.style.display = "none";
  }, 1000);
});

document.querySelector("#go-to-upload-button").addEventListener("click", () => {
  songMenu.classList.add("inactive-back");
  uploadMenu.style.display = "flex";
  setTimeout(() => {
    uploadMenu.classList.remove("inactive-next");
  }, 100);
  setTimeout(() => {
    songMenu.style.display = "none";
  }, 1000);
});

document.querySelector("#upload-menu button.back").addEventListener("click", () => {
  uploadMenu.classList.add("inactive-next");
  songMenu.style.display = "flex";
  setTimeout(() => {
    songMenu.classList.remove("inactive-back");
  }, 100);
  setTimeout(() => {
    uploadMenu.style.display = "none";
  }, 1000);
});

document.querySelector("#send").addEventListener("click", () => {
  loadingBuffer.style.display = "block";
  uploadMenu.classList.add("inactive-back");
  document.querySelector("video").style.opacity = 0;
  setTimeout(() => {
    loadingBuffer.classList.remove("inactive-next");
    alternateLoading();
  }, 100);
  setTimeout(() => {
    loadingBuffer.classList.add("loading-active");
    uploadMenu.style.display = "none";
    document.querySelector("video").style.display = "none";
    document.querySelector("video").pause();
    document.querySelector("video").src = "";
  }, 1000);
});

document.querySelector("#load").addEventListener("click", () => {
  loadingBuffer.style.display = "block";
  songMenu.classList.add("inactive-back");
  document.querySelector("video").style.opacity = 0;
  setTimeout(() => {
    loadingBuffer.classList.remove("inactive-next");
    alternateLoading();
  }, 100);
  setTimeout(() => {
    loadingBuffer.classList.add("loading-active");
    uploadMenu.style.display = "none";
    document.querySelector("video").style.display = "none";
    document.querySelector("video").pause();
    document.querySelector("video").src = "";
  }, 1000);
});

document.querySelector("#painting-menu button.back").addEventListener("click", () => {
  songMenu.style.display = "flex";
  document.querySelector("video").style.display = "block";
  document.querySelector("video").src = "fly.mp4";
  document.querySelector("video").play();
  document.querySelector("canvas").style.opacity = "0";
  document.querySelector("#painting-menu").style.opacity = "0";
  setTimeout(() => {
    songMenu.classList.remove("inactive-back");
    document.querySelector("video").style.opacity = 1;
  }, 100);
  setTimeout(() => {
    document.querySelector("canvas").style.display = "none";
  }, 1000);
});