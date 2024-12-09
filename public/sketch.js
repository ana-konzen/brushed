const margin = 80;
const bufferSize = 1024;
const dryInterval = 600;
const dryDuration = 150;
const threshold = 0.05;
const decayRate = 0.95;

const fields = {
  bass: { index: 0, positions: [], history: [] },
  treble: { index: 1, positions: [], history: [] },
  highMid: { index: 2, positions: [], history: [] },
  mid: { index: 3, positions: [], history: [] },
  lowMid: { index: 4, positions: [], history: [] },
};

let currentSection;
let overallEnergy;
let energy;
let chaosLevel;
let density;

let sound;
let fft;
let amplitude;

let vorPoints;
let voronoi;

let brush;
let pressure;

let brushCanvas;
let cnv;

let palette = [];

const palettes = [];

let triggerLevel = 0;
let ellapsedTime = 0;

let soundLoaded = false;

let songEnded = false;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(RGB);
  noFill();

  brushCanvas = createGraphics(1200, 900, WEBGL);
  brushCanvas.translate(-brushCanvas.width / 2, -brushCanvas.height / 2);
  brushCanvas.setAttributes({ alpha: true });
  brushCanvas.angleMode(DEGREES);
  brushCanvas.colorMode(RGB);
  brushCanvas.noFill();

  select("#save-button").mousePressed(() => {
    saveCanvas(cnv, "painting", "png");
  });

  select("#play-button").mousePressed(() => {
    if (soundLoaded) togglePlay(sound);
  });

  select("#painting-menu button.back").mousePressed(() => {
    sound.pause();
    sound.jump(0);
    sound.amp(0);
    clear();
    brushCanvas.clear();
    soundData = null;
    soundLoaded = false;
    dataLoaded = false;
  });
}

function draw() {
  brushCanvas.clear();

  if (soundLoaded) {
    if (songData.sections.indexOf(currentSection) >= 0) {
      currentSection = songData.sections[songData.sections.indexOf(currentSection)];
    }
    palette = palettes[0].colors;
    if (sound.isPlaying()) {
      if (frameCount % 200 === 0) {
        select("#painting-menu").style("opacity", "0");
      }

      select("#time").html(
        `${secondsToMinutes(sound.currentTime())} / ${secondsToMinutes(songData.duration)}`
      );
      ellapsedTime++;
      songData.sections.forEach((section) => {
        updateSection(section);
      });

      if (songData.sections.indexOf(currentSection) >= 0) {
        palette = palettes[songData.sections.indexOf(currentSection) + 1].blendPalettes;
      }

      analyzeSection();

      drawFields();

      if (ellapsedTime > dryInterval) {
        fill(230, 230, 230, 0.5);
        rect(0, 0, width, height);
        if (ellapsedTime > dryInterval + dryDuration) {
          ellapsedTime = 0;
        }
      }
    }
    drawBrushCanvas();
  }
}

function mousePressed() {
  if (dataLoaded && !soundLoaded) {
    setState();
  }
}

function mouseMoved() {
  if (soundLoaded) {
    select("#painting-menu").style("opacity", "1");
  }
}

function togglePlay(s) {
  if (s.isPlaying()) {
    s.pause();
    select("#play-button").html("▶");
  } else {
    s.play();
    select("#play-button").html("⬛");
  }
}

function setState() {
  palettes.length = 0;

  palettes[0] = { colors: songData.song_start.colors };

  songData.sections.forEach((section, i) => {
    const blendPalettes = [];
    const previousPalette = palettes[i].colors;
    const colorSteps = map((section.energy + section.chaos_level) / 2, 0, 1, 20, 5, true);
    const nextPalette =
      i === songData.sections.length - 1 ? songData.song_end.colors : songData.sections[i + 1].colors;
    nextPalette.forEach((color, j) => {
      blendPalettes[j] = spectral.palette(previousPalette[j], color, colorSteps, spectral.RGBA);
    });
    palettes[i + 1] = {
      blendPalettes,
      colors: nextPalette,
    };
  });

  document.querySelector("#start").style.display = "none";
  select("#painting-menu").style("display", "block");
  select("canvas").style("display", "block");
  select("canvas").style("opacity", "1");
  createVoronoi();
  const seed = floor(random(99999));
  randomSeed(seed);
  select("#seed").html("seed: " + seed);
  select("#artist").html(songData.artists.toLowerCase());
  select("#title").html(songData.title.toLowerCase());
  select("#time").html(`0:00 / ${secondsToMinutes(songData.duration)}`);
  resizeCanvas(windowWidth, windowHeight);

  sound = loadSound(audioUrl, () => {
    soundLoaded = true;
    sound.play();
    sound.amp(0.7);
    fft = new p5.FFT(0.01, bufferSize);
    fft.setInput(sound);
    amplitude = new p5.Amplitude();
    amplitude.setInput(sound);
  });
}

function drawBrush(pitch, field, brushWidth, prop, round = false) {
  const positions = getPositions(field, chaosLevel);

  let level = amplitude.getLevel();
  if (level > triggerLevel && level > threshold) {
    triggerLevel = level;

    const brush = new Brush(brushCanvas);
    brush.fill(setColor(field));

    brush.setPressure(pressure);
    const size = map(pitch, 0, 255, 0, brushWidth);

    brush.size(size, size * prop);

    brush.position(
      positions.x + random(-chaosLevel / 2, chaosLevel / 2),
      positions.y + random(-chaosLevel / 2, chaosLevel / 2)
    );
    const ang = map(energy, 0, 1, 0, 180);
    brush.rotate(random(-ang, ang));

    field.history.push(brush);
  } else {
    triggerLevel *= decayRate;
  }

  if (field.history.length > 1) {
    field.history.shift();
  }
  for (const brush of field.history) {
    brush.setUp();

    brush.draw(round);
  }
}

function setColor(field) {
  const blendPaletteIndex = floor(
    map(
      sound.currentTime(),
      currentSection.start,
      currentSection.start + currentSection.duration,
      0,
      palette.length
    )
  );

  if (palette[field.index]?.[blendPaletteIndex] === undefined) {
    console.warn("No color found");
  }

  const c =
    songData.sections.indexOf(currentSection) >= 0
      ? color(palette[field.index][blendPaletteIndex])
      : color(palette[field.index]);
  const colorJitter = 5;
  const r = constrain(c.levels[0] + random(-colorJitter, colorJitter), 0, 255);
  const g = constrain(c.levels[1] + random(-colorJitter, colorJitter), 0, 255);
  const b = constrain(c.levels[2] + random(-colorJitter, colorJitter), 0, 255);
  // const a = map(energy, 0, 1, 3, 8);
  const c2 = color(r, g, b, 8);
  return c2;
}

function getPosIndex(arr, chaosLevel) {
  const index = floor(
    map(
      sound.currentTime(),
      currentSection.start,
      currentSection.start + currentSection.duration,
      0,
      arr.length - 1
    )
  );
  return floor(
    abs(index + arr.length / 2 + random(-(chaosLevel * energy) * 2, chaosLevel * energy * 2)) % arr.length
  );
}

function resetPositions() {
  fields.bass.positions.length = 0;
  fields.treble.positions.length = 0;
  fields.highMid.positions.length = 0;
  fields.mid.positions.length = 0;
  fields.lowMid.positions.length = 0;
}

function setPositions() {
  for (let x = margin; x < brushCanvas.width - margin; x += density) {
    for (let y = margin; y < brushCanvas.height - margin; y += density) {
      for (let i = 0; i < vorPoints.length; i++) {
        if (voronoi.contains(fields[Object.keys(fields)[i]].index, x, y)) {
          fields[Object.keys(fields)[i]].positions.push({ x: x, y: y });
        }
      }
    }
  }
}

function getPositions(field, chaosLevel) {
  const index = getPosIndex(field.positions, chaosLevel);
  return field.positions[index];
}

function createVoronoi() {
  vorPoints = d3
    .range(Object.keys(fields).length)
    .map(() => [random(margin, brushCanvas.width - margin), random(margin, brushCanvas.height - margin)]);
  const delaunay = d3.Delaunay.from(vorPoints);
  voronoi = delaunay.voronoi([margin, margin, brushCanvas.width - margin, brushCanvas.height - margin]);
}

function analyzeSection() {
  overallEnergy = songData.incomplete ? Number(currentSection.energy) : Number(songData.energy);

  energy = (Number(currentSection.energy) + overallEnergy) / 2;

  pressure = map(energy, 0, 1, 1, 15, true);

  density = map(Number(currentSection.texture), 0, 1, 20, 1, true);
  const harmony = map(Number(currentSection.harmony), 0, 1, 1, 0, true);
  chaosLevel = ((Number(currentSection.chaos_level) + harmony) / 2) * 150;
}

function drawBrushCanvas() {
  const imageRatio = min((width - margin) / brushCanvas.width, (height - margin) / brushCanvas.height);
  noStroke();
  tint(255, 100);
  image(
    brushCanvas,
    width / 2 - (brushCanvas.width * imageRatio) / 2,
    height / 2 - (brushCanvas.height * imageRatio) / 2,
    brushCanvas.width * imageRatio,
    brushCanvas.height * imageRatio
  );
}

function updateSection(section) {
  if (sound.currentTime() < Number(songData.sections[0].start)) {
    currentSection = songData.song_start;
    resetPositions();
  } else if (
    sound.currentTime() >= Number(section.start) &&
    sound.currentTime() <= Number(section.start) + Number(section.duration)
  ) {
    currentSection = section;
    resetPositions();
  } else if (
    sound.currentTime() >
    Number(songData.sections[songData.sections.length - 1].start) +
      Number(songData.sections[songData.sections.length - 1].duration)
  ) {
    currentSection = songData.song_end;
    resetPositions();
  }
}

function drawFields() {
  fft.analyze();

  const bass = fft.getEnergy("bass");
  const mid = fft.getEnergy("mid");
  const treble = fft.getEnergy("treble");
  const highMid = fft.getEnergy("highMid");
  const lowMid = fft.getEnergy("lowMid");

  setPositions();

  drawBrush(bass, fields.bass, 35, 2.8, true);
  drawBrush(treble, fields.treble, 60, 1.5);
  drawBrush(highMid, fields.highMid, 60, 1.5);
  drawBrush(mid, fields.mid, 40, 2.8);
  drawBrush(lowMid, fields.lowMid, 35, 2.8, true);
}
