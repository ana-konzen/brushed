const featuresCont = document.getElementById("features-cont");
const featuresList = document.getElementById("features");
const sectionsList = document.getElementById("sections");

function resetInfoPanel() {
  featuresList.innerHTML = "";
  sectionsList.innerHTML = "";
}

function loadInfoPanel(songData) {
  resetInfoPanel();
  console.log("song data loaded:", songData);
  if (songData.spotifyInfo.incomplete) {
    featuresCont.style.display = "none";
  }

  if (!songData.spotifyInfo.incomplete) {
    featuresCont.style.display = "block";
    for (const [feature, value] of Object.entries(songData.spotifyInfo)) {
      if (feature === "key") continue;
      const featureItem = document.createElement("div");
      featureItem.classList.add("feature-item");
      featureItem.innerHTML = `<span class="feature-name">${feature}:</span> <span class="feature-value">${
        feature === "mode" ? (value === 1 ? "major" : "minor") : value
      }</span>`;
      featuresList.appendChild(featureItem);
    }
  }
  const indexOffset = songData.song_start.duration > 0 ? 1 : 0;
  if (songData.song_start.duration > 0)
    createSectionItem(songData.song_start, 0);
  songData.sections.forEach((section, index) => {
    createSectionItem(section, index + 1, indexOffset);
  });

  if (songData.song_end.duration > 0)
    createSectionItem(songData.song_end, songData.sections.length);

  document
    .querySelector(".section-item-0")
    .classList.add("active-info-section");
}

function createSectionItem(section, index, indexOffset = 1) {
  const sectionItem = document.createElement("div");
  sectionItem.classList.add("section-item");
  sectionItem.classList.add(`section-item-${index}`);
  const header = document.createElement("div");
  header.classList.add("section-header");
  header.innerHTML = `<div>section ${
    index + indexOffset
  }</div><div class="section-time">${secondsToMinutes(
    section.start
  )} — ${secondsToMinutes(section.start + section.duration)}</div>`;
  sectionItem.appendChild(header);

  for (const [key, value] of Object.entries(section).reverse()) {
    if (key === "start" || key === "duration" || key === "explanation")
      continue;
    const itemInfo = document.createElement("div");
    itemInfo.classList.add("feature-item");
    itemInfo.innerHTML = `<span class="feature-name">${key.replace(
      /_/g,
      " "
    )}:</span>`;
    if (key === "colors") {
      itemInfo.appendChild(renderColorInfo(value));
    } else {
      itemInfo.innerHTML += `<span class="feature-value">${value}</span>`;
    }
    sectionItem.appendChild(itemInfo);
  }

  sectionsList.appendChild(sectionItem);
}

function renderColorInfo(colors) {
  const container = document.createElement("div");
  container.classList.add("color-info");

  colors.forEach((color) => {
    const colorSwatch = document.createElement("span");
    colorSwatch.classList.add("color-swatch");
    colorSwatch.style.backgroundColor = color;
    container.appendChild(colorSwatch);
  });
  return container;
}
