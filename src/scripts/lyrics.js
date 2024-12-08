export async function getLyrics(artist, song) {
  artist = artist.replaceAll(/\s/g, "+").replaceAll("/", "").toLowerCase();
  song = song.replaceAll(/\s/g, "+").replaceAll("/", "").toLowerCase();
  const response = await fetch(`https://lrclib.net/api/get?artist_name=${artist}&track_name=${song})}`);

  if (!response.ok) {
    console.error("Error fetching lyrics");
    return null;
  }

  const songInfo = await response.json();
  if (songInfo.instrumental) return { instrumental: true };
  if (songInfo.error) return { lyrics: "I could not find the lyrics to the song" };
  if (!songInfo) return { lyrics: "I could not find the lyrics to the song" };
  const songLyrics = [];

  songInfo.syncedLyrics.split("\n").forEach((line) => {
    const timeStampMinutes = line.split("]")[0].slice(1).trim();
    const timeStamp = timeStampToSeconds(timeStampMinutes);
    const lyrics = line.split("]")[1].trim();
    songLyrics.push({ timeStamp, lyrics });
  });

  // console.log(songLyrics);

  return songLyrics;
}

function timeStampToSeconds(timestamp) {
  //example timestamp: 01:10.53
  const minutes = parseInt(timestamp.split(":")[0]);
  const seconds = parseInt(timestamp.split(":")[1].split(".")[0]);
  const milliseconds = parseInt(timestamp.split(":")[1].split(".")[1]);
  return minutes * 60 + seconds + milliseconds / 100;
}
