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

  const musicFolder = await Deno.readDir("src/saved-music");
  const musicFiles = [];
  for await (const file of musicFolder) {
    musicFiles.push(file.name);
  }
  await Deno.writeTextFile("src/saved-music/file-paths.json", JSON.stringify(musicFiles, null, 2));
}
