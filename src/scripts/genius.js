import { getEnvVariable } from "../shared/util.ts";

export async function getGeniusInfo(artistName, songTitle) {
  const token = getEnvVariable("GENIUS_TOKEN");
  const songInfo = await getSongInfo(
    artistName.replaceAll(/\s/g, "%20"),
    songTitle.replaceAll(/\s/g, "%20"),
    token
  );
  if (!songInfo) {
    return null;
  }
  const annotations = await getAnnotations(songInfo.id, token);
  const description = await getDescription(songInfo.id, token);
  const geniusInfo = {
    annotations,
    description,
    title: songInfo.title,
    artists: songInfo.artist_names,
  };
  return geniusInfo;
}

async function getAnnotations(songId, token) {
  try {
    const response = await fetch(
      `https://api.genius.com/referents?text_format=plain&song_id=${songId}`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );
    if (!response.ok) {
      throw new Error("Error fetching annotations");
    }
    const songInfo = await response.json();
    const rawReferents = songInfo?.response?.referents;
    if (!rawReferents) {
      return null;
    }

    const referents = rawReferents.map((referent) => {
      return {
        lyrics: referent.fragment.trim(),
        annotation: referent.annotations.map((annotation) =>
          annotation.body.plain.trim()
        ),
      };
    });
    return referents;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getDescription(songId, token) {
  try {
    const response = await fetch(
      `https://api.genius.com/songs/${songId}?text_format=plain`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );
    const songInfo = await response.json();
    const description = songInfo?.response?.song?.description?.plain;
    if (!description) {
      return null;
    }

    return description.trim();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getSongInfo(artistName, songTitle, token) {
  try {
    const response = await fetch(
      `https://api.genius.com/search?q=${songTitle}_${artistName}`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );
    if (!response.ok) {
      throw new Error("Error fetching song info");
    }
    const songInfo = await response.json();
    if (!songInfo.response.hits.length) {
      return null;
    }
    return songInfo.response.hits[0].result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// async function getToken() {
//   const clientId = env.GENIUS_ID;
//   const clientSecret = env.GENIUS_SECRET;
//   const authUrl = "https://api.genius.com/oauth/token";
//   const authHeaders = {
//     "Content-Type": "application/x-www-form-urlencoded",
//     Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
//   };
//   const authData = {
//     grant_type: "client_credentials",
//   };
//   const response = await fetch(authUrl, {
//     method: "POST",
//     headers: authHeaders,
//     body: new URLSearchParams(authData),
//   });
//   const token = await response.json();
//   return token.access_token;
// }
