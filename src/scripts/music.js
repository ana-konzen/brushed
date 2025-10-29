import { getSpotifyInfo } from "./spotify.js";
import { getLyrics } from "./lyrics.js";
import { getGeniusInfo } from "./genius.js";

export async function getMusicData(
  artistName = "Elliott Smith",
  songTitle = "Between the Bars",
  duration = 0
) {
  const geniusInfo = await getGeniusInfo(artistName, songTitle);

  const spotifyInfo = await getSpotifyInfo(
    geniusInfo?.artists ?? artistName,
    geniusInfo?.title ?? songTitle
  );
  console.log("spotify info", spotifyInfo);

  const lyrics = await getLyrics(
    geniusInfo?.artists ?? artistName,
    geniusInfo?.title ?? songTitle
  );

  const trackInfo = {
    spotifyInfo: spotifyInfo || null,
    artists: geniusInfo?.artists ?? artistName,
    title: geniusInfo?.title ?? songTitle,
    duration: duration,
    lyrics: lyrics,
    lyricsAnnotations: geniusInfo?.annotations,
  };
  // console.log(trackInfo);

  return trackInfo;
}
