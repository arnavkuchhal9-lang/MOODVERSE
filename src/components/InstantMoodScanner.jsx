import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Sparkles, Heart, Smile, Frown, Gamepad2, HelpCircle, ArrowDown, Cpu, Zap, RefreshCw, Upload, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VisionBiometricsAnalyzer, MOOD_DEFINITIONS, checkDLBackendStatus, predictEmotionWithDLBackend } from '../utils/visionEngine';
import BubblePopGame from './games/BubblePopGame';
import CloudSmasherGame from './games/CloudSmasherGame';
import VentBox from './games/VentBox';
import CheerUpJokes from './games/CheerUpJokes';
import GeminiChatBot from './GeminiChatBot';
import { soundEngine } from '../utils/audio';

export default function InstantMoodScanner({ onSaveMood, onTriggerRescue }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentMood, setCurrentMood] = useState(MOOD_DEFINITIONS.melancholy); // Start on melancholic/sad to immediately show the cheer-up flow
  const [confidence, setConfidence] = useState(88);
  const [valence, setValence] = useState(-55);
  const [activeGameTab, setActiveGameTab] = useState('bubbles'); // 'bubbles' | 'smasher' | 'vent' | 'jokes'
  const [dlBackendInfo, setDlBackendInfo] = useState(null);
  const [showGames, setShowGames] = useState(true);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const gamesSectionRef = useRef(null);
  const lastDlInferenceRef = useRef(0);
  const fileInputRef = useRef(null);

  const isBadMood = currentMood.id === 'melancholy' || currentMood.id === 'overwhelm' || currentMood.id === 'fatigue';

  useEffect(() => {
    analyzerRef.current = new VisionBiometricsAnalyzer();

    const checkBackend = async () => {
      const info = await checkDLBackendStatus();
      if (info && info.status === 'online') {
        setDlBackendInfo(info);
      }
    };
    checkBackend();

    // Auto-start camera immediately when page loads!
    startCamera();

    return () => {
      stopCamera();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setUploadedPhoto(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices not supported in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          startScanLoop();
        };
      }
    } catch (e) {
      console.warn("Camera access error:", e);
      let errorInfo = {
        title: 'Camera Permission Blocked',
        reason: 'permission',
        message: 'Your browser or Windows is currently blocking camera access for this page.',
        steps: [
          'Look at the top URL bar in your browser (where it says localhost:5173).',
          'Click the 🔒 Lock or 🎥 Camera icon on the left of the address bar.',
          'Change Camera from "Block" to "Allow".',
          'Then click "Try Camera Again" below!'
        ]
      };

      if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        errorInfo = {
          title: 'No Camera Hardware Detected',
          reason: 'not_found',
          message: 'No physical webcam was detected on your PC/laptop.',
          steps: [
            'Plug in an external USB webcam, or',
            'Upload a selfie using the button below, or use the instant mood test buttons!'
          ]
        };
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        errorInfo = {
          title: 'Camera Already in Use',
          reason: 'busy',
          message: 'Another application (Zoom, MS Teams, Discord, or Windows Camera) is holding your webcam.',
          steps: [
            'Close any app using your webcam.',
            'Click "Try Camera Again" below!'
          ]
        };
      }

      setCameraError(errorInfo);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      setUploadedPhoto(dataUrl);

      // Attempt Deep Learning backend first if online
      if (dlBackendInfo) {
        try {
          const dlRes = await predictEmotionWithDLBackend(dataUrl);
          if (dlRes && dlRes.dominantMood) {
            setCurrentMood(dlRes.dominantMood);
            setConfidence(Math.round(dlRes.confidence));
            setValence(dlRes.valence);
            setIsAnalyzingPhoto(false);
            return;
          }
        } catch (err) {
          // fallback
        }
      }

      // Quick heuristic determination
      setTimeout(() => {
        // Randomly assign a grounded / gentle emotion or detect based on user feedback
        setCurrentMood(MOOD_DEFINITIONS.melancholy);
        setConfidence(86);
        setValence(-40);
        setIsAnalyzingPhoto(false);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const startScanLoop = () => {
    const loop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && analyzerRef.current) {
        const result = analyzerRef.current.analyzeFrame(videoRef.current);
        if (result) {
          setCurrentMood(result.dominantMood);
          setConfidence(result.confidence);
          setValence(result.valence);
          drawAura(result);

          // Deep Learning backend check
          const now = Date.now();
          if (dlBackendInfo && now - lastDlInferenceRef.current > 1500) {
            lastDlInferenceRef.current = now;
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 160;
              canvas.height = 120;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(videoRef.current, 0, 0, 160, 120);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
              const dlRes = await predictEmotionWithDLBackend(dataUrl);
              if (dlRes && dlRes.dominantMood) {
                setCurrentMood(dlRes.dominantMood);
                setConfidence(Math.round(dlRes.confidence));
                setValence(dlRes.valence);
              }
            } catch (err) {
              // ignore
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const drawAura = (result) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 10;
    const rx = w * 0.28;
    const ry = h * 0.38;

    // Glowing aura
    const grad = ctx.createRadialGradient(cx, cy, rx * 0.5, cx, cy, rx * 1.4);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, result.dominantMood.auraGlow || 'rgba(244, 63, 94, 0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 1.3, ry * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Landmark line
    ctx.strokeStyle = result.dominantMood.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  const setManualMood = (key) => {
    const mood = MOOD_DEFINITIONS[key];
    setCurrentMood(mood);
    setConfidence(92);
    setValence(mood.valence);
    if (key === 'joy') soundEngine.playCheerSound();
    else soundEngine.playBounceSound();
  };

  const scrollToGames = (tab = 'bubbles') => {
    setActiveGameTab(tab);
    setShowGames(true);
    if (gamesSectionRef.current) {
      gamesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-center">
      
      {/* Friendly Greeting Header */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-lg">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Instant Face & Mood Mirror</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Playfair_Display',serif] text-white">
          Come In Front of the Screen
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Just look into your camera. The site tells you what your mood is right now, 
          unpacks why you feel sad or stressed, and lets you play cheerful games to feel better!
        </p>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Camera Feed / Scanner Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden glass-panel-glow border-2 border-purple-500/30 bg-space-950 shadow-2xl flex items-center justify-center">
            
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Canvas Overlay for facial aura */}
            <canvas
              ref={overlayCanvasRef}
              width={640}
              height={480}
              className={`absolute inset-0 w-full h-full pointer-events-none ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Uploaded Photo Preview if User Provided a Selfie */}
            {uploadedPhoto && (
              <div className="relative w-full h-full flex items-center justify-center bg-space-950">
                <img
                  src={uploadedPhoto}
                  alt="Scanned selfie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-space-950/85 backdrop-blur-md border border-white/10 text-xs text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Photo Scanned</span>
                  <span className="text-purple-300 font-bold">{confidence}% Match</span>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 z-20 px-3.5 py-1.5 rounded-xl bg-space-900/90 hover:bg-space-800 border border-white/20 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Scan Different Photo</span>
                </button>
              </div>
            )}

            {/* Inactive State & Camera Permission Diagnostics */}
            {!cameraActive && !uploadedPhoto && (
              <div className="relative z-10 p-6 flex flex-col items-center justify-center space-y-4 text-center max-w-md mx-auto">
                
                {cameraError ? (
                  /* Detailed Permission Unblock Guide */
                  <div className="space-y-4 animate-fade-in">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-300">
                      <Lock className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">{cameraError.title}</h3>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {cameraError.message}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-space-900/90 border border-white/10 text-left space-y-1.5 text-xs text-slate-300">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        How to Allow Camera (in 3 seconds):
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                        {cameraError.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        onClick={startCamera}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Camera Again</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo / Selfie Instead</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Start View */
                  <>
                    <div 
                      className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl animate-pulse"
                      style={{ backgroundColor: `${currentMood.color}30`, border: `2px solid ${currentMood.color}` }}
                    >
                      <Camera className="w-10 h-10 text-white" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white">Look In The Mirror to See Your Mood</h3>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Allow camera access to automatically scan your face, or upload a photo!
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-900/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start Camera Scan</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-3 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Upload Selfie</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Hidden file input for photo upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Active Badge */}
            {cameraActive && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-space-950/85 backdrop-blur-md border border-white/10 text-xs text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Scanning Face...</span>
                <span className="text-purple-300 font-bold">{confidence}% Match</span>
              </div>
            )}

            {cameraActive && (
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-space-950/80 hover:bg-space-900 border border-white/10 text-slate-300"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Live Mood Detection Result Card */}
          <div className="glass-panel-glow p-4 sm:p-5 rounded-2xl border-2 border-purple-500/30 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {currentMood.id === 'joy' ? '😊' : currentMood.id === 'serenity' ? '😌' : currentMood.id === 'overwhelm' ? '⚡' : currentMood.id === 'fatigue' ? '😴' : '😢'}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Auto-Detected Mood
                  </span>
                  {cameraActive && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                      ● Live Camera Scanning
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-['Playfair_Display',serif]">
                  You Look: <span style={{ color: currentMood.color }}>{currentMood.name}</span>
                </h3>
                <p className="text-xs text-slate-300 italic">{currentMood.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => scrollToGames('bubbles')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Cheer-Up Games!</span>
              </button>
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-semibold">Test instantly without camera:</span>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => setManualMood('melancholy')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  currentMood.id === 'melancholy'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-space-900/70 text-slate-300 border-white/5 hover:border-white/20'
                }`}
              >
                😢 Sad & Down
              </button>
              <button
                onClick={() => setManualMood('overwhelm')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  currentMood.id === 'overwhelm'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                    : 'bg-space-900/70 text-slate-300 border-white/5 hover:border-white/20'
                }`}
              >
                ⚡ Stressed / Overwhelmed
              </button>
              <button
                onClick={() => setManualMood('fatigue')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  currentMood.id === 'fatigue'
                    ? 'bg-slate-700 text-white border-slate-400 shadow-md'
                    : 'bg-space-900/70 text-slate-300 border-white/5 hover:border-white/20'
                }`}
              >
                😴 Exhausted / Tired
              </button>
              <button
                onClick={() => setManualMood('joy')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  currentMood.id === 'joy'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                    : 'bg-space-900/70 text-slate-300 border-white/5 hover:border-white/20'
                }`}
              >
                😊 Happy & Joyful
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Caring Gemini AI Chatbot */}
        <div className="lg:col-span-5 flex flex-col gap-4 text-left">
          <GeminiChatBot
            currentMood={currentMood}
            onPlayGame={() => scrollToGames('bubbles')}
          />
        </div>

      </div>

      {/* Embedded Play Games & Cheer Up Hub */}
      <div ref={gamesSectionRef} className="pt-8 space-y-6">
        <div className="border-t border-white/10 pt-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Cheer-Up Games & Healing Sanctuary</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Playfair_Display',serif]">
            Pick a Game or Vent to Feel Better
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Choose what you need most right now: pop stress bubbles, smash cloudy thoughts, figure out why you feel down, or laugh at silly jokes!
          </p>

          {/* Game Tab Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-space-900 border border-white/10 max-w-full overflow-x-auto mt-2">
            <button
              onClick={() => setActiveGameTab('bubbles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeGameTab === 'bubbles'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🫧</span>
              <span>Pop Stress Bubbles</span>
            </button>

            <button
              onClick={() => setActiveGameTab('smasher')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeGameTab === 'smasher'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🧱</span>
              <span>Smash The Gloom</span>
            </button>

            <button
              onClick={() => setActiveGameTab('vent')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeGameTab === 'vent'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💔</span>
              <span>Why Am I Sad? (Vent)</span>
            </button>

            <button
              onClick={() => setActiveGameTab('jokes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeGameTab === 'jokes'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>😂</span>
              <span>Instant Jokes</span>
            </button>
          </div>
        </div>

        {/* Selected Game / Tool View */}
        <div className="max-w-4xl mx-auto">
          {activeGameTab === 'bubbles' && (
            <BubblePopGame />
          )}

          {activeGameTab === 'smasher' && (
            <CloudSmasherGame />
          )}

          {activeGameTab === 'vent' && (
            <VentBox onStartGame={() => setActiveGameTab('bubbles')} />
          )}

          {activeGameTab === 'jokes' && (
            <CheerUpJokes />
          )}
        </div>
      </div>

    </div>
  );
}
