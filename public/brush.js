// simple brush texture library

class Line {
  constructor(brushCanvas, yMean, x, nPoints, sHeight, c) {
    this.yMean = yMean;
    this.x = x;
    this.nPoints = nPoints;
    this.arr = [];
    this.y = 0;
    this.angle = random(-1, 1);
    this.height = sHeight;
    this.canvas = brushCanvas;
    // this.sColor = color(c);
    const colorJitter = 5;
    this.red = c.levels[0] + random(-colorJitter, colorJitter);
    this.green = c.levels[1] + random(-colorJitter, colorJitter);
    this.blue = c.levels[2] + random(-colorJitter, colorJitter);
    this.color = color(this.red, this.green, this.blue, c.levels[3]);
  }
  set() {
    let sigma = this.height / 4;

    for (let i = 0; i < this.nPoints; i++) {
      this.y = this.yMean - 10 * this.height;
      while (abs(this.y - this.yMean - sigma) > 2 * sigma) {
        this.y = randomGaussian(this.yMean, sigma);
      }

      this.arr.push(this.y);
    }
  }
  draw(round, vertical) {
    this.canvas.stroke(this.color);
    // this.canvas.strokeWeight(1);
    let ang = 0;
    this.canvas.rotate(this.angle);
    this.canvas.beginShape(POINTS);
    for (let y of this.arr) {
      if (vertical) {
        if (round) {
          this.canvas.vertex(this.x * cos(radians(ang)), y * sin(radians(ang)));
        } else {
          this.canvas.vertex(this.x, y);
        }
      } else {
        if (round) {
          this.canvas.vertex(y * cos(radians(ang)), this.x * sin(radians(ang)));
        } else {
          this.canvas.vertex(y, this.x);
        }
      }
      ang += 5;
    }
    this.canvas.endShape();
  }
}

class Brush {
  constructor(brushCanvas, nLines = 10, pressure = 15, texture = 5) {
    this.pressure = pressure;
    this.nLines = nLines;
    this.texture = texture;
    this.ang = 0;
    this.arr = [];

    this.width = 0;
    this.height = 0;
    this.canvas = brushCanvas;
  }

  setUp() {
    this.arr = [];

    let nPoints = this.pressure * this.height;
    let factor = (this.texture * this.width) / this.nLines;
    this.alpha = this.pressure % 15;

    for (let i = 0; i < this.nLines; i++) {
      const margin = min(random(factor), random(factor));
      const l = new Line(
        this.canvas,
        random(-1, 1),
        -this.width / 2 + (this.width / this.nLines) * i + margin,
        nPoints,
        this.height,
        this.color
      );
      l.set();
      this.arr.push(l);
    }
  }

  rotate(ang) {
    this.ang = ang;
  }

  position(x, y) {
    this.x = x;
    this.y = y;
  }

  setPressure(pressure) {
    this.pressure = pressure;
  }

  size(w, h) {
    this.width = w;
    this.height = h;
  }

  fill(color) {
    this.color = color;
  }

  drawShape(round, vertical) {
    this.canvas.push();
    this.canvas.translate(this.x + this.width / 2, this.y + this.height / 4);
    this.canvas.rotate(this.ang);
    for (let line of this.arr) {
      line.draw(round, vertical);
    }
    this.canvas.pop();
  }

  draw(round = false, vertical = true) {
    // this.setUp();
    // beginShape(POINTS);
    this.canvas.noStroke();
    this.canvas.strokeWeight(map(this.pressure, 1, 15, 0.5, 4, true));

    this.drawShape(round, vertical);
    // endShape();
  }
}
