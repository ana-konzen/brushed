export async function saveMusic(musicData) {
  musicData.title = musicData.title.replaceAll("/", "");
  musicData.artists = musicData.artists.replaceAll("/", "");
  musicData.mp3_file = `${musicData.title.replaceAll(/\s/g, "-").toLowerCase()}-${musicData.artists
    .replaceAll(/\s/g, "-")
    .toLowerCase()}.mp3`;
  await Deno.writeTextFile(
    `src/saved-music/${musicData.title.replaceAll(/\s/g, "-").toLowerCase()}-${musicData.artists
      .replaceAll(/\s/g, "-")
      .toLowerCase()}.json`,
    JSON.stringify(musicData, null, 2)
  );
}
