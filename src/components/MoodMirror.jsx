import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Sparkles, Heart, Activity, Sliders, RefreshCw, CheckCircle, ArrowRight, Upload, HelpCircle, ShieldAlert, Cpu, Zap } from 'lucide-react';
import { VisionBiometricsAnalyzer, MOOD_DEFINITIONS, checkDLBackendStatus, predictEmotionWithDLBackend } from '../utils/visionEngine';
import { VISUAL_METAPHORS } from '../utils/storage';

export default function MoodMirror({ onSaveMood, onTriggerRescue }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [biometrics, setBiometrics] = useState({
    dominantMood: MOOD_DEFINITIONS.serenity,
    confidence: 85,
    valence: 65,
    arousal: 30,
    calmnessIndex: 78,
    heartRateEst: 68,
    motionScore: 12,
    scores: { joy: 15, serenity: 60, melancholy: 10, overwhelm: 5, focus: 20, fatigue: 10 }
  });
  const [matchedVisual, setMatchedVisual] = useState(VISUAL_METAPHORS[3]); // Misty pines
  const [isCapturing, setIsCapturing] = useState(false);
  const [personalReflection, setPersonalReflection] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scanMode, setScanMode] = useState('live'); // 'live' | 'sample'
  const [dlBackendInfo, setDlBackendInfo] = useState(null);

  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const lastDlInferenceTimeRef = useRef(0);

  useEffect(() => {
    analyzerRef.current = new VisionBiometricsAnalyzer();

    // Check if Python Deep Learning backend is running
    const probeDL = async () => {
      const info = await checkDLBackendStatus();
      if (info && info.status === 'online') {
        setDlBackendInfo(info);
      } else {
        setDlBackendInfo(null);
      }
    };
    probeDL();
    const interval = setInterval(probeDL, 6000);

    return () => {
      clearInterval(interval);
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update matched visual metaphor when dominant mood changes
  useEffect(() => {
    if (biometrics && biometrics.dominantMood) {
      const moodId = biometrics.dominantMood.id;
      const matched = VISUAL_METAPHORS.find(m => m.defaultMood === moodId) || VISUAL_METAPHORS[0];
      setMatchedVisual(matched);

      // Auto-trigger rescue check if extreme distress is detected
      if (moodId === 'overwhelm' && biometrics.confidence > 75) {
        // Suggested rescue opportunity
      }
    }
  }, [biometrics?.dominantMood?.id]);

  // Start real webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          startAnalysisLoop();
        };
      }
    } catch (err) {
      console.warn("Camera access failed or unavailable, fallback active", err);
      setCameraError("Camera unavailable or permission denied. You can still test with simulated face expressions or uploaded photos below!");
      setScanMode('sample');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startAnalysisLoop = () => {
    const loop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && analyzerRef.current) {
        const result = analyzerRef.current.analyzeFrame(videoRef.current);
        if (result) {
          setBiometrics(prev => ({
            ...result,
            // smooth values
            valence: Math.round(prev.valence * 0.7 + result.valence * 0.3),
            arousal: Math.round(prev.arousal * 0.7 + result.arousal * 0.3),
            calmnessIndex: Math.round(prev.calmnessIndex * 0.7 + result.calmnessIndex * 0.3),
          }));
          drawFaceAuraOverlay(result);

          // Periodically query Python Deep Learning backend if active
          const now = Date.now();
          if (dlBackendInfo && now - lastDlInferenceTimeRef.current > 1600 && overlayCanvasRef.current) {
            lastDlInferenceTimeRef.current = now;
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 160;
              canvas.height = 120;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(videoRef.current, 0, 0, 160, 120);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
              const dlResult = await predictEmotionWithDLBackend(dataUrl);
              if (dlResult && dlResult.dominantMood) {
                setBiometrics(prev => ({
                  ...prev,
                  dominantMood: dlResult.dominantMood,
                  confidence: Math.round(dlResult.confidence),
                  valence: dlResult.valence,
                  arousal: dlResult.arousal,
                  calmnessIndex: dlResult.calmnessIndex,
                  heartRateEst: dlResult.heartRateEst,
                  engine: 'TensorFlow Deep FER CNN'
                }));
              }
            } catch (err) {
              // Ignore background async errors
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  // Draw cyber-ethereal facial aura & landmark contours on overlay canvas
  const drawFaceAuraOverlay = (result) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2 - 10;
    const radiusX = w * 0.28;
    const radiusY = h * 0.38;

    // Glowing emotional aura pulse
    const auraColor = result.dominantMood.auraGlow || 'rgba(139, 92, 246, 0.4)';
    const grad = ctx.createRadialGradient(centerX, centerY, radiusX * 0.5, centerX, centerY, radiusX * 1.4);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, auraColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX * 1.3, radiusY * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Geometric facial landmark reticle
    ctx.strokeStyle = result.dominantMood.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);

    // Outer face oval
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eye reticles
    ctx.setLineDash([]);
    const eyeOffsetX = radiusX * 0.42;
    const eyeOffsetY = -radiusY * 0.15;
    
    // Left eye
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Smile / mouth curvature guide
    const mouthY = centerY + radiusY * 0.45;
    ctx.beginPath();
    ctx.moveTo(centerX - 24, mouthY);
    const smileCurve = (result.valence / 100) * 12;
    ctx.quadraticCurveTo(centerX, mouthY + smileCurve, centerX + 24, mouthY);
    ctx.stroke();

    // Biometric HUD scanline
    const scanY = (Date.now() / 15) % h;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(w, scanY);
    ctx.stroke();
  };

  // Preset face simulation for instant testing
  const applyPresetMood = (presetKey) => {
    const mood = MOOD_DEFINITIONS[presetKey];
    setBiometrics({
      dominantMood: mood,
      confidence: Math.floor(82 + Math.random() * 12),
      valence: mood.valence,
      arousal: mood.arousal,
      calmnessIndex: Math.max(10, 100 - mood.arousal),
      heartRateEst: Math.round(65 + mood.arousal * 0.25),
      motionScore: Math.round(mood.arousal * 0.3),
      scores: {
        joy: presetKey === 'joy' ? 80 : 15,
        serenity: presetKey === 'serenity' ? 85 : 15,
        melancholy: presetKey === 'melancholy' ? 80 : 10,
        overwhelm: presetKey === 'overwhelm' ? 88 : 10,
        focus: presetKey === 'focus' ? 82 : 15,
        fatigue: presetKey === 'fatigue' ? 78 : 10
      }
    });
  };

  const handleCaptureAndSave = () => {
    setIsCapturing(true);

    const newEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      moodId: biometrics.dominantMood.id,
      archetypeTitle: matchedVisual.title,
      imageUrl: matchedVisual.imageUrl,
      valence: biometrics.valence,
      arousal: biometrics.arousal,
      note: personalReflection.trim() || `${biometrics.dominantMood.name} detected through personal face aura.`,
      tags: matchedVisual.tags,
      source: cameraActive ? 'Live Mood Mirror (AI Scan)' : 'Facial Resonance Matcher'
    };

    onSaveMood(newEntry);
    setSaveSuccess(true);
    setIsCapturing(false);
    setTimeout(() => setSaveSuccess(false), 4000);

    // If distress, notify rescue capsule
    if (biometrics.dominantMood.id === 'overwhelm' || biometrics.dominantMood.id === 'melancholy') {
      // Gentle invitation
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Real-time AI Facial Emotion & Visual Translation
          </div>
          {dlBackendInfo ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deep Learning Backend Active (TensorFlow Conv2D FER)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Browser Biometrics Active (Start Python Backend for Deep CNN)</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Playfair_Display',serif] bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
          Look Into the Mirror of Your Mind
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Moodverse gazes beyond superficial words. Open your camera to let our neural biometrics interpret your 
          facial aura, micro-expressions, and heart resonance — translating raw emotion into living visual art.
        </p>
      </div>

      {/* Main Grid: Live Camera Stream & Biometric Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Camera Viewport / Visual Mirror */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-purple-500/30 bg-space-900 shadow-2xl shadow-purple-950/60 aspect-[4/3] flex items-center justify-center">
            
            {/* Live HTML5 Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Canvas Overlay for Face Mesh & Aura */}
            <canvas
              ref={overlayCanvasRef}
              width={640}
              height={480}
              className={`absolute inset-0 w-full h-full pointer-events-none ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Fallback View when Camera is Inactive */}
            {!cameraActive && (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-5">
                {/* Background ambient glow */}
                <div 
                  className="absolute w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse-slow"
                  style={{ backgroundColor: biometrics.dominantMood.color }}
                />

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-space-800/90 border border-white/10 flex items-center justify-center shadow-xl">
                  <Camera className="w-9 h-9 text-purple-400 animate-bounce" />
                </div>

                <div className="relative z-10 space-y-2 max-w-md">
                  <h3 className="text-xl font-bold text-white">Mirror is Asleep</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Allow camera access to scan your facial micro-expressions in real-time, or choose a simulation archetype below to test the neural engine.
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activate Live Mirror</span>
                  </button>
                </div>

                {cameraError && (
                  <div className="relative z-10 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left max-w-sm">
                    {cameraError}
                  </div>
                )}
              </div>
            )}

            {/* Active Camera Live HUD Badge */}
            {cameraActive && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-space-950/80 backdrop-blur-md border border-white/10 text-xs text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold">AI Scan Live</span>
                <span className="text-slate-400">·</span>
                <span className="text-purple-300">{biometrics.confidence}% Match</span>
                {dlBackendInfo && (
                  <>
                    <span className="text-slate-500">|</span>
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-emerald-400" /> TensorFlow DL
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Stop Camera Button when active */}
            {cameraActive && (
              <button
                onClick={stopCamera}
                title="Pause camera"
                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-space-950/80 hover:bg-space-900 border border-white/10 text-slate-300 hover:text-white transition-all"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            )}

            {/* Bottom floating telemetry chip */}
            <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between p-3 rounded-2xl bg-space-950/85 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ backgroundColor: biometrics.dominantMood.color, boxShadow: `0 0 12px ${biometrics.dominantMood.color}` }}
                />
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{biometrics.dominantMood.name}</span>
                    <span className="text-[10px] text-slate-400">({biometrics.confidence}% conf)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[240px] sm:max-w-xs">
                    {biometrics.dominantMood.tagline}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="hidden sm:flex items-center gap-1 text-slate-300">
                  <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>{biometrics.heartRateEst} BPM</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{biometrics.calmnessIndex}% Calm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Simulation Bar (Allows instant testing with 6 core facial archetypes) */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Simulate or Fine-Tune Facial Expression Archetype:
              </span>
              <span>Click to test neural response</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(MOOD_DEFINITIONS).map(([key, item]) => {
                const isSelected = biometrics.dominantMood.id === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyPresetMood(key)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-center border ${
                      isSelected
                        ? 'bg-purple-600/30 text-white border-purple-400 shadow-md shadow-purple-900/40'
                        : 'bg-space-900/60 text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate text-[11px]">{item.name.split(' ')[1] || item.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Art Translation & Emotional Breakdown */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Matched Visual Language Card */}
          <div className="glass-panel-glow p-6 rounded-3xl border border-purple-500/30 relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Your Visual Translation
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                {matchedVisual.category}
              </span>
            </div>

            {/* Generated / Matched Artwork Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] group">
              <img
                src={matchedVisual.imageUrl}
                alt={matchedVisual.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent" />
              
              <div className="absolute bottom-3 inset-x-3 text-left">
                <h4 className="text-lg font-bold text-white font-['Playfair_Display',serif]">
                  {matchedVisual.title}
                </h4>
                <p className="text-xs text-slate-300 italic line-clamp-1">
                  "{biometrics.dominantMood.visualDescription}"
                </p>
              </div>
            </div>

            {/* Neural Telemetry Meters */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Valence (Emotional Warmth)</span>
                  <span className={`font-semibold ${biometrics.valence >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {biometrics.valence > 0 ? `+${biometrics.valence}` : biometrics.valence}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-space-900 overflow-hidden border border-white/5 relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600" />
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      biometrics.valence >= 0 ? 'bg-gradient-to-r from-teal-400 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.abs(biometrics.valence) / 2}%`,
                      marginLeft: biometrics.valence >= 0 ? '50%' : `${50 - Math.abs(biometrics.valence) / 2}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Arousal & Mental Kinetic Energy</span>
                  <span className="font-semibold text-cyan-300">{biometrics.arousal}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-space-900 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${biometrics.arousal}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Optional Personal Note / Thought */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Personal whisper or reflection (optional):</span>
                <span className="text-[10px] text-slate-500">Recorded with visual artifact</span>
              </label>
              <input
                type="text"
                value={personalReflection}
                onChange={(e) => setPersonalReflection(e.target.value)}
                placeholder="What is this visual memory telling you right now?..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
              />
            </div>

            {/* Action Button: Capture & Save */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCaptureAndSave}
                disabled={isCapturing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300 animate-bounce" />
                    <span>Visual Mood Saved to Universe!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Capture & Record this Visual Mood</span>
                  </>
                )}
              </button>

              {/* Emergency Rescue Note Suggestion if Low/Stressed */}
              {(biometrics.dominantMood.id === 'overwhelm' || biometrics.dominantMood.id === 'melancholy') && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div className="text-xs text-rose-300">
                    <p className="font-semibold">Heavy emotional weather detected.</p>
                    <p className="text-[11px] text-rose-400">Would you like to open a comforting note from your past self?</p>
                  </div>
                  <button
                    onClick={onTriggerRescue}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/40 whitespace-nowrap"
                  >
                    Open Rescue Note
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
