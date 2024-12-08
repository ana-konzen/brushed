const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");

const sendButton = document.getElementById("send");

let songData;
let audioUrl;

let dataLoaded = false;

getSavedMusic();

sendButton.addEventListener("click", async () => {
  console.log(songTitle.value);
  console.log(artistName.value);
  const audioFile = audioInput.files[0];

  if (audioFile && audioFile.type === "audio/mpeg") {
    audioUrl = URL.createObjectURL(audioFile);
    audioPlayer.src = audioUrl;
  } else {
    alert("Please upload a valid audio file.");
    return;
  }
  audioPlayer.addEventListener("loadedmetadata", async () => {
    try {
      console.log(audioPlayer);
      const response = await fetch("/api/music", {
        method: "POST",
        body: JSON.stringify({
          title: songTitle.value,
          artist: artistName.value,
          duration: audioPlayer.duration,
        }),
      });

      songData = await response.json();
      console.log(songData);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      dataLoaded = true;

      loadingBuffer.style.display = "none";

      document.querySelector("#start").style.display = "block";
      document.querySelector("canvas").style.display = "block";
    } catch (error) {
      console.error(error);
    }
  });
});

loadButton.addEventListener("click", async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  dataLoaded = true;

  loadingBuffer.style.display = "none";

  document.querySelector("#start").style.display = "block";
  document.querySelector("canvas").style.display = "block";
});

async function getSavedMusic() {
  try {
    const response = await fetch("saved-music/file-paths.json");
    const musicFiles = await response.json();
    console.log(musicFiles);
    musicFiles.forEach(async (file) => {
      const response = await fetch(`saved-music/data/${file}`);
      const music = await response.json();
      const songOption = document.createElement("div");
      songOption.classList.add("song-option");
      songOption.innerHTML = `<div>${music.artists}</div><div>${music.title}</div><div>${secondsToMinutes(
        music.duration
      )}</div>`;
      document.querySelector("#song-list .content").appendChild(songOption);
      songOption.addEventListener("click", () => {
        selectMusic(songOption);
        songData = music;
        console.log(songData);
        loadButton.disabled = false;
        loadButton.classList.remove("disabled");
        audioUrl = `saved-music/mp3/${file.replace(".json", ".mp3")}`;
      });
    });
  } catch (error) {
    console.error(error);
  }
}

function secondsToMinutes(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

function selectMusic(option) {
  deselectAll(document.querySelectorAll(".song-option"));
  option.classList.add("selected");
}
