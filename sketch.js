let video;
let handPose;
let hands = [];
let synth;
let trail = [];
let font;

let startImage;
let isStarted = false;

function preload() {
  startImage = loadImage("startscreen.jpg");
  font = loadFont("Michroma-Regular.ttf")
}

function setup() {
  createCanvas(1920, 1440);

  video = createCapture(VIDEO);
  video.size(1920, 1440);
  video.hide();

  handPose = ml5.handPose(video, modelLoaded);

  synth = new Synth();
}

function modelLoaded() {
  detectHands();
}

function detectHands() {
  handPose.detect(video, gotHands);
}

function gotHands(results) {
  hands = results;
  detectHands();
}

function draw() {
  if (!isStarted) {
    background(0);
    image(startImage, 30, 50, 1300, 1010);
    return;
  }

  translate(width, 0);
  scale(-1, 1);

  image(video, 0, 0);

  let rightHand = null;
  let leftHand = null;

  for (let hand of hands) {
    if (hand.handedness === "Right") rightHand = hand;
    if (hand.handedness === "Left") leftHand = hand;

    //noktalar
    let thumb = hand.keypoints[4];
    let index = hand.keypoints[8];

    let pinch = synth.isPinching(hand);
    if (pinch) {
      // active state
      fill(0, 255, 255);

      stroke(0, 255, 255);
      strokeWeight(6);

      line(thumb.x, thumb.y, index.x, index.y);

      noStroke();

      // glow
      fill(0, 255, 255, 50);
      circle(thumb.x, thumb.y, 150);
      circle(index.x, index.y, 150);

      // ana noktalar
      fill(0, 255, 255);
      circle(thumb.x, thumb.y, 75);
      circle(index.x, index.y, 75);

      trail.push({
        x: index.x,
        y: index.y,
      });

      if (trail.length > 40) {
        trail.shift();
      }
      
      

      for (let i = 0; i < trail.length; i++) {
        let p = trail[i];

        fill(0, 255, 255, 25, i * 6);
        noStroke();

        circle(p.x, p.y, map(i, 0, trail.length, 1, 50));
      }

      if (hand.handedness === "Right") {
        push();
        translate(thumb.x, thumb.y);
        scale(-1, 1);
        fill(0, 0, 0);
        fill(255);
        textFont(font);
        textSize(48);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text(synth.getNote(index.y).note, 0, -20);
        pop();
      }

      if (hand.handedness === "Left") {
        push();
        translate(thumb.x, thumb.y);
        scale(-1, 1);
        fill(255);
        textFont(font);
        textSize(36);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        let volumeText = floor(synth.masterVolume * 100);
        text(volumeText + "%", 0, -20);
        pop();
      }
    } else {
      // normal state
      fill(255, 0, 255);

      stroke(255, 0, 255);
      strokeWeight(9);

      line(thumb.x, thumb.y, index.x, index.y);

      noStroke();

      circle(thumb.x, thumb.y, 75);
      circle(index.x, index.y, 75);
    }
  }

  if (rightHand) {
    synth.update(rightHand, leftHand);
  } else {
    synth.stop();
  }
}

function mousePressed() {
  if (!isStarted) {
    isStarted = true;
  }
}
