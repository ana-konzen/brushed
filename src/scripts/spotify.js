import Fuse from "https://esm.sh/fuse.js@6.4.1";

import * as log from "../shared/logger.ts";

export async function getSpotifyInfo(artistName, trackName) {
  console.log("getting spotify info for:", artistName, trackName);
  const musicData = await fetchMusicData();
  const fuseOptions = {
    keys: ["artists", "track_name"],
    threshold: 0.3,
    ignoreLocation: true,
    useExtendedSearch: true,
  };
  const fuse = new Fuse(musicData, fuseOptions);
  const query = {
    $and: [
      { artists: artistName.replaceAll(" & ", ", ") },
      { track_name: trackName },
    ],
  };
  const searchResults = fuse.search(query);
  const spotifyInfo = searchResults[0]?.item;

  console.log("spotify info found:", spotifyInfo);

  if (!spotifyInfo) {
    log.warn(`No track info found for ${trackName} by ${artistName}`);
    return {
      incomplete: true,
    };
  }

  return {
    key: spotifyInfo.key,
    mode: spotifyInfo.mode,
    valence: spotifyInfo.valence,
    danceability: spotifyInfo.danceability,
    energy: spotifyInfo.energy,
    tempo: spotifyInfo.tempo,
    genre: spotifyInfo.track_genre,
  };
}

async function fetchMusicData() {
  const musicDataUrl =
    "https://raw.githubusercontent.com/ana-konzen/music-data/refs/heads/main/dataset.json";
  const response = await fetch(musicDataUrl);

  const data = await response.json();
  return data;
}
