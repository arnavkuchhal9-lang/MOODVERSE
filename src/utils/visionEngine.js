// Moodverse Computer Vision & Emotional Facial Biometrics Engine

export const MOOD_DEFINITIONS = {
  joy: {
    id: 'joy',
    name: 'Radiant Joy',
    archetype: 'Golden Dawn & Sunburst',
    color: '#f59e0b',
    auraGlow: 'rgba(245, 158, 11, 0.45)',
    valence: 88,
    arousal: 75,
    tagline: 'Warmth, expansiveness, vibrant gratitude',
    visualDescription: 'Sunlight filtering through golden leaves and boundless horizons'
  },
  serenity: {
    id: 'serenity',
    name: 'Deep Serenity',
    archetype: 'Misty Pine Forest & Still Lake',
    color: '#10b981',
    auraGlow: 'rgba(16, 185, 129, 0.45)',
    valence: 70,
    arousal: 28,
    tagline: 'Grounded stillness, slow deep breath, peace',
    visualDescription: 'Unmoving emerald waters surrounded by mountain morning mist'
  },
  melancholy: {
    id: 'melancholy',
    name: 'Melancholic Drift',
    archetype: 'Rain on Window & Midnight Blues',
    color: '#6366f1',
    auraGlow: 'rgba(99, 102, 241, 0.45)',
    valence: -45,
    arousal: 35,
    tagline: 'Quiet longing, introspection, gentle sorrow',
    visualDescription: 'Silvery raindrops tracing cold windowpanes beneath heavy clouds'
  },
  overwhelm: {
    id: 'overwhelm',
    name: 'Restless Overwhelm',
    archetype: 'Stormy Sea & Fragmented Glass',
    color: '#f43f5e',
    auraGlow: 'rgba(244, 63, 94, 0.5)',
    valence: -65,
    arousal: 85,
    tagline: 'Sensory overload, high tension, racing thoughts',
    visualDescription: 'Choppy tempestuous ocean swells colliding with jagged rocks'
  },
  focus: {
    id: 'focus',
    name: 'Cosmic Resonance',
    archetype: 'Deep Space Nebula & Starlight',
    color: '#8b5cf6',
    auraGlow: 'rgba(139, 92, 246, 0.45)',
    valence: 50,
    arousal: 60,
    tagline: 'Lucid clarity, deliberate focus, creative flow',
    visualDescription: 'Swirling indigo star clusters suspended in infinite quiet spacetime'
  },
  fatigue: {
    id: 'fatigue',
    name: 'Heavy Twilight',
    archetype: 'Fading Embers & Velvet Dusk',
    color: '#94a3b8',
    auraGlow: 'rgba(148, 163, 184, 0.4)',
    valence: -20,
    arousal: 18,
    tagline: 'Depleted energy, longing for deep rest',
    visualDescription: 'Soft glowing embers slowly cooling into grey ash at twilight'
  }
};

export class VisionBiometricsAnalyzer {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 120;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.lastFrameData = null;
    this.motionHistory = [];
    this.blinkCounter = 0;
    this.lastBlinkTime = Date.now();
    this.smoothedMood = MOOD_DEFINITIONS.serenity;
  }

  analyzeFrame(videoElement) {
    if (!videoElement || videoElement.readyState < 2) {
      return null;
    }

    const { width, height } = this.canvas;
    this.ctx.drawImage(videoElement, 0, 0, width, height);

    let frame;
    try {
      frame = this.ctx.getImageData(0, 0, width, height);
    } catch (e) {
      return null;
    }

    const data = frame.data;
    const totalPixels = width * height;

    // 1. Calculate Overall Brightness and Skin Tone Warmth
    let totalR = 0, totalG = 0, totalB = 0;
    let motionDelta = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalR += r;
      totalG += g;
      totalB += b;

      if (this.lastFrameData) {
        const lr = this.lastFrameData[i];
        const lg = this.lastFrameData[i + 1];
        const lb = this.lastFrameData[i + 2];
        const diff = Math.abs(r - lr) + Math.abs(g - lg) + Math.abs(b - lb);
        if (diff > 45) {
          motionDelta++;
        }
      }
    }

    this.lastFrameData = new Uint8ClampedArray(data);

    const avgR = totalR / totalPixels;
    const avgG = totalG / totalPixels;
    const avgB = totalB / totalPixels;
    const warmthRatio = (avgR + 0.1) / (avgB + 0.1); // Warmth indicator
    const motionScore = Math.min(100, Math.round((motionDelta / totalPixels) * 450));

    // 2. Sample Regional Facial Zones (Forehead, Eyes, Cheeks, Mouth)
    // Center face bounding assumptions in 160x120
    const eyeZoneY = Math.floor(height * 0.38);
    const browZoneY = Math.floor(height * 0.25);
    const mouthZoneY = Math.floor(height * 0.70);
    const centerX = Math.floor(width * 0.5);

    // Measure brightness across zones
    let mouthBrightness = 0;
    let cheekBrightness = 0;
    let browBrightness = 0;
    let eyeBrightness = 0;
    let skinPixelCount = 0;
    const sampleBox = 14;

    for (let dy = -sampleBox; dy <= sampleBox; dy++) {
      for (let dx = -sampleBox; dx <= sampleBox; dx++) {
        const mouthIdx = ((mouthZoneY + dy) * width + (centerX + dx)) * 4;
        const cheekIdx = ((eyeZoneY + 14 + dy) * width + (centerX + 26 + dx)) * 4;
        const browIdx = ((browZoneY + dy) * width + (centerX + dx)) * 4;
        const eyeIdx = ((eyeZoneY + dy) * width + (centerX - 22 + dx)) * 4;

        if (mouthIdx >= 0 && mouthIdx < data.length) {
          mouthBrightness += (data[mouthIdx] + data[mouthIdx + 1] + data[mouthIdx + 2]) / 3;
          // check basic skin tone
          if (data[mouthIdx] > 45 && data[mouthIdx] > data[mouthIdx + 2]) skinPixelCount++;
        }
        if (cheekIdx >= 0 && cheekIdx < data.length) {
          cheekBrightness += (data[cheekIdx] + data[cheekIdx + 1] + data[cheekIdx + 2]) / 3;
        }
        if (browIdx >= 0 && browIdx < data.length) {
          browBrightness += (data[browIdx] + data[browIdx + 1] + data[browIdx + 2]) / 3;
        }
        if (eyeIdx >= 0 && eyeIdx < data.length) {
          eyeBrightness += (data[eyeIdx] + data[eyeIdx + 1] + data[eyeIdx + 2]) / 3;
        }
      }
    }

    const faceDetected = skinPixelCount > 80;
    const mouthRatio = (cheekBrightness + 1) / (mouthBrightness + 1);
    const eyeDroopRatio = (eyeBrightness + 1) / (browBrightness + 1);

    // 3. Synthesize Responsive Emotion Vector
    let scores = {
      joy: 10,
      serenity: 20,
      melancholy: 15,
      overwhelm: 10,
      focus: 15,
      fatigue: 10
    };

    // Smile / Joy detection
    if (mouthRatio > 1.08) {
      scores.joy += 70;
      scores.serenity += 15;
    } else if (mouthRatio < 0.95) {
      scores.melancholy += 55;
      scores.fatigue += 30;
    }

    // Lowered gaze / sad eyes
    if (eyeDroopRatio < 0.85) {
      scores.melancholy += 45;
      scores.fatigue += 35;
    }

    // Restlessness vs Calm Stillness
    if (motionScore > 26) {
      scores.overwhelm += 60;
      scores.joy += 15;
    } else if (motionScore < 7) {
      scores.serenity += 45;
      scores.focus += 25;
    } else {
      scores.focus += 30;
      scores.serenity += 15;
    }

    if (warmthRatio > 1.30) {
      scores.joy += 20;
      scores.overwhelm += 20;
    } else if (warmthRatio < 1.08) {
      scores.melancholy += 30;
      scores.fatigue += 30;
    }

    // Find dominant
    let bestKey = 'serenity';
    let maxScore = -1;
    let totalScoreSum = 0;

    Object.entries(scores).forEach(([k, val]) => {
      totalScoreSum += val;
      if (val > maxScore) {
        maxScore = val;
        bestKey = k;
      }
    });

    const confidence = Math.min(96, Math.max(70, Math.round((maxScore / totalScoreSum) * 165)));
    const dominantMood = MOOD_DEFINITIONS[bestKey];

    // Compute dynamic Valence (-100 to +100) & Arousal (0 to 100%)
    const valence = Math.round(
      (scores.joy * 1.0 + scores.serenity * 0.7 + scores.focus * 0.4 - scores.melancholy * 0.7 - scores.overwhelm * 0.9 - scores.fatigue * 0.5) /
      (totalScoreSum / 60)
    );

    const arousal = Math.min(100, Math.max(10, Math.round(
      motionScore * 0.6 + (warmthRatio - 1.0) * 40 + (scores.overwhelm + scores.joy) * 0.3
    )));

    const heartRateEst = Math.round(62 + (arousal * 0.32) + (motionScore * 0.15));

    return {
      faceDetected,
      dominantMood,
      confidence,
      valence: Math.max(-100, Math.min(100, valence)),
      arousal,
      calmnessIndex: Math.max(5, 100 - arousal),
      heartRateEst,
      motionScore,
      scores,
      timestamp: Date.now(),
      engine: 'Browser Canvas Vision Heuristics'
    };
  }
}

// Deep Learning Python Backend Integration (TensorFlow / Flask)
export const DL_BACKEND_URL = 'http://localhost:5000/api';

export async function checkDLBackendStatus() {
  try {
    const res = await fetch(`${DL_BACKEND_URL}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Backend offline / not started
  }
  return null;
}

export async function predictEmotionWithDLBackend(b64Image) {
  try {
    const res = await fetch(`${DL_BACKEND_URL}/predict-emotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64Image }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback to client-side
  }
  return null;
}

