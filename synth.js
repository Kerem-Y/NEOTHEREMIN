class Synth {
  constructor() {
    // lead
    this.osc1 = new p5.Oscillator("sawtooth");
    this.osc2 = new p5.Oscillator("sawtooth");

    this.filter = new p5.LowPass();
    this.reverb = new p5.Reverb();

    this.osc1.disconnect();
    this.osc2.disconnect();

    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);

    this.reverb.process(this.filter, 3, 2);

    this.osc1.start();
    this.osc2.start();

    //Volume
    this.osc1.amp(0);
    this.osc2.amp(0);

    // bass
    this.bass = new p5.Oscillator("sine");
    this.bass.start();
    this.bass.amp(0);

    // ambient
    this.noise = new p5.Noise("pink");
    this.noise.start();
    this.noise.amp(0);

    // rhythm
    this.kick = new p5.Oscillator("sine");
    this.kick.start();
    this.kick.amp(0);

    // this.tempo = 500;
    // this.startBeat();

    // scale
    this.scale = [
      { freq: 261, note: "C" },
      { freq: 293, note: "D" },
      { freq: 329, note: "E" },
      { freq: 349, note: "F" },
      { freq: 392, note: "G" },
      { freq: 440, note: "A" },
      { freq: 493, note: "B" },
    ];

    // Volume
    this.masterVolume = 1;
  }

  // scale snap
  getNote(y) {
    let i = floor(map(y, 0, height, 0, this.scale.length));
    i = constrain(i, 0, this.scale.length - 1);
    return this.scale[i];
  }

  // pinch
  isPinching(hand) {
    let t = hand.keypoints[4];
    let i = hand.keypoints[8];
    return dist(t.x, t.y, i.x, i.y) < 100;
  }

  // beat
  // startBeat() {
  //   setInterval(() => {
  //     this.kick.freq(50);
  //     this.kick.amp(0.5, 0.01);
  //     this.kick.amp(0, 0.7);
  //   }, this.tempo);
  // }

  update(rightHand, leftHand) {
    // right hand
    let index = rightHand.keypoints[8];

    let note = this.getNote(index.y);

    this.osc1.freq(note.freq);
    this.osc2.freq(note.freq + 5);

    let cutoff = map(index.x, 0, width, 200, 3000);
    this.filter.freq(cutoff);

    if (this.isPinching(rightHand)) {
      this.osc1.amp(0.7 * this.masterVolume, 0.05);
      this.osc2.amp(0.3 * this.masterVolume, 0.05);
    } else {
      this.osc1.amp(0, 0.1);
      this.osc2.amp(0, 0.1);
    }

    // left ahnd
    if (leftHand) {
      let i = leftHand.keypoints[8];

      // volume
      if (this.isPinching(leftHand)) {
        this.masterVolume = map(i.y, height, 0, 0, 1);
        this.masterVolume = constrain(this.masterVolume, 0, 1);
      }

      // reverb
      let wet = map(i.x, 0, width, 0, 1);
      this.reverb.drywet(wet);

      // bass
      let bassFreq = map(i.y, 0, height, 120, 40);
      this.bass.freq(bassFreq);
      this.bass.amp(0.2, 0.1);

      let thumb = leftHand.keypoints[4];
      let pinky = leftHand.keypoints[20];
      let open = dist(thumb.x, thumb.y, pinky.x, pinky.y) > 120;

      this.tempo = map(i.x, 0, width, 200, 800);
    }
  }

  stop() {
    this.osc1.amp(0, 0);
    this.osc2.amp(0, 0);
    this.bass.amp(0, 0);
  }
}
