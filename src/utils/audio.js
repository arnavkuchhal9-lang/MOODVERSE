// Web Audio API Synthesizer for Moodverse Ambient Soundscapes & Chimes

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentTrack = 'rain'; // 'rain' | 'drone' | 'zen'
    this.masterGain = null;
    this.activeNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime + 0.1);
    }
  }

  stop() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
  }

  playTrack(trackName = 'rain') {
    this.init();
    this.stop();
    this.currentTrack = trackName;
    this.isPlaying = true;

    if (trackName === 'rain') {
      this.createRainSound();
    } else if (trackName === 'drone') {
      this.createCosmicDrone();
    } else if (trackName === 'zen') {
      this.createZenBinaural();
    }
  }

  createRainSound() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops on leaves & glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'peaking';
    filter2.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter2.gain.setValueAtTime(4, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, filter2, gain);
  }

  createCosmicDrone() {
    if (!this.ctx) return;
    // 432 Hz Solfeggio fundamental + warm harmonizing octaves
    const freqs = [108, 162, 216, 432];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Slow drift LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.2 / (idx + 1), this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start();

      this.activeNodes.push(osc, oscGain, lfo, lfoGain);
    });
  }

  createZenBinaural() {
    if (!this.ctx) return;
    // Binaural beat: 136.1 Hz (Om frequency) with 4 Hz theta wave difference
    const leftOsc = this.ctx.createOscillator();
    const rightOsc = this.ctx.createOscillator();
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(136.1, this.ctx.currentTime);
    rightOsc.frequency.setValueAtTime(140.1, this.ctx.currentTime); // 4Hz Theta

    const merger = this.ctx.createChannelMerger(2);
    leftOsc.connect(merger, 0, 0);
    rightOsc.connect(merger, 0, 1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    merger.connect(gain);
    gain.connect(this.masterGain);

    leftOsc.start();
    rightOsc.start();
    this.activeNodes.push(leftOsc, rightOsc, merger, gain);
  }

  playRescueChime() {
    this.init();
    if (!this.ctx) return;

    // Harmonic pentatonic chime sequence (C5, E5, G5, B5, C6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0.001, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.35, now + idx * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 2.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 3.0);
    });
  }

  playPopSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playBounceSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playCheerSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Happy triad chime
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  }
}

export const soundEngine = new SoundEngine();
