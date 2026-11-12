import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Sliders, Sparkles, Wand2, Upload, CheckCircle, Palette, Flame, Wind, Droplets } from 'lucide-react';
import { VISUAL_METAPHORS, getStoredLexicon } from '../utils/storage';

export default function VisualLogger({ onSaveMood }) {
  const [selectedMetaphor, setSelectedMetaphor] = useState(VISUAL_METAPHORS[0]);
  const [activeMode, setActiveMode] = useState('gallery'); // 'gallery' | 'generative' | 'upload'
  const [valence, setValence] = useState(40);
  const [arousal, setArousal] = useState(50);
  const [customNote, setCustomNote] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Generative Canvas Parameters
  const [genHue, setGenHue] = useState(260); // 0-360
  const [genTurbulence, setGenTurbulence] = useState(45); // 0-100
  const [genParticleCount, setGenParticleCount] = useState(60);
  const [genLuminance, setGenLuminance] = useState(55);
  const genCanvasRef = useRef(null);

  // Draw Generative Abstract Mood Canvas
  useEffect(() => {
    if (activeMode === 'generative') {
      const canvas = genCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, w, h);

      // Radial base
      const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, `hsla(${genHue}, 85%, ${genLuminance}%, 0.8)`);
      grad.addColorStop(0.5, `hsla(${(genHue + 40) % 360}, 75%, ${Math.max(20, genLuminance - 20)}%, 0.4)`);
      grad.addColorStop(1, '#060814');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Swirling generative fluid filaments
      ctx.lineWidth = 2;
      for (let i = 0; i < genParticleCount; i++) {
        const seed = i * 137.5;
        const angle = (seed % 360) * (Math.PI / 180);
        const radius = (i / genParticleCount) * (w * 0.45);
        const cx = w / 2 + Math.cos(angle) * radius;
        const cy = h / 2 + Math.sin(angle) * radius;

        ctx.strokeStyle = `hsla(${(genHue + (i * 2)) % 360}, 80%, ${Math.min(90, genLuminance + 20)}%, ${0.2 + (genTurbulence / 150)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 5 + (genTurbulence * 0.3 * Math.sin(i)), 0, Math.PI * 2);
        ctx.stroke();

        // Connecting threads
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.bezierCurveTo(cx, cy - 20, cx + 20, cy, cx, cy);
          ctx.stroke();
        }
      }
    }
  }, [activeMode, genHue, genTurbulence, genParticleCount, genLuminance]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    let finalImageUrl = selectedMetaphor.imageUrl;
    let finalTitle = selectedMetaphor.title;
    let finalMood = selectedMetaphor.defaultMood;

    if (activeMode === 'generative') {
      const canvas = genCanvasRef.current;
      if (canvas) {
        finalImageUrl = canvas.toDataURL('image/png');
        finalTitle = 'Synthesized Emotional Nebula';
      }
    } else if (activeMode === 'upload' && uploadedImage) {
      finalImageUrl = uploadedImage;
      finalTitle = 'Personal Visual Memory';
    }

    // Infer mood from valence & arousal
    if (valence > 40 && arousal > 50) finalMood = 'joy';
    else if (valence > 20 && arousal <= 50) finalMood = 'serenity';
    else if (valence < -20 && arousal > 60) finalMood = 'overwhelm';
    else if (valence < -10 && arousal <= 40) finalMood = 'melancholy';
    else if (valence >= 0 && arousal >= 40) finalMood = 'focus';
    else finalMood = 'fatigue';

    const newEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      moodId: finalMood,
      archetypeTitle: finalTitle,
      imageUrl: finalImageUrl,
      valence,
      arousal,
      note: customNote.trim() || `Visual resonance recorded via ${activeMode} mode.`,
      tags: selectedMetaphor.tags,
      source: activeMode === 'generative' ? 'Generative Mood Canvas' : activeMode === 'upload' ? 'Personal Photo Log' : 'Visual Gallery Archetype'
    };

    onSaveMood(newEntry);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
          <ImageIcon className="w-3.5 h-3.5" />
          Wordless Journaling · Personal Visual Language
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Playfair_Display',serif] bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
          Record How You Feel Through Imagery
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Words often flatten the complexity of how we feel. In Moodverse, you record your emotional state 
          through evocative imagery, generative abstract art, or your own visual captures.
        </p>

        {/* Tab Switcher: Gallery vs Generative Canvas vs Upload */}
        <div className="inline-flex p-1.5 rounded-2xl bg-space-900 border border-white/10 mt-2">
          <button
            onClick={() => setActiveMode('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'gallery' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Atmospheric Gallery
          </button>
          <button
            onClick={() => setActiveMode('generative')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'generative' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Generative Art Studio
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'upload' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload Personal Image
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Mode Selection (Visual Selection or Generator) */}
        <div className="lg:col-span-8">
          
          {/* Mode 1: Curated Atmospheric Cards Gallery */}
          {activeMode === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Select the visual landscape that matches your internal weather:</span>
                <span className="text-cyan-300">{VISUAL_METAPHORS.length} archetypes available</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {VISUAL_METAPHORS.map((meta) => {
                  const isSelected = selectedMetaphor.id === meta.id;
                  return (
                    <div
                      key={meta.id}
                      onClick={() => setSelectedMetaphor(meta)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-xl shadow-cyan-950/60 scale-[1.02]'
                          : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={meta.imageUrl}
                          alt={meta.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/30 to-transparent" />
                      <div className="absolute bottom-2 inset-x-2 text-left">
                        <h4 className="text-xs font-bold text-white truncate">{meta.title}</h4>
                        <p className="text-[10px] text-cyan-300 truncate">{meta.category}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 text-space-950 flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Generative Abstract Art Canvas */}
          {activeMode === 'generative' && (
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-400" />
                    Synthesize Your Emotion Through Fluid Form
                  </h3>
                  <p className="text-xs text-slate-400">Tweak color frequency, chaos turbulence, and luminosity to paint your mood.</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-space-950">
                <canvas
                  ref={genCanvasRef}
                  width={640}
                  height={380}
                  className="w-full h-auto max-h-[380px] object-cover"
                />
              </div>

              {/* Generative Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-purple-400" /> Color Hue</span>
                    <span className="font-semibold text-purple-300">{genHue}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={genHue}
                    onChange={(e) => setGenHue(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Turbulence / Chaos</span>
                    <span className="font-semibold text-cyan-300">{genTurbulence}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={genTurbulence}
                    onChange={(e) => setGenTurbulence(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-indigo-400" /> Filament Density</span>
                    <span className="font-semibold text-indigo-300">{genParticleCount}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={genParticleCount}
                    onChange={(e) => setGenParticleCount(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Inner Radiance</span>
                    <span className="font-semibold text-amber-300">{genLuminance}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="85"
                    value={genLuminance}
                    onChange={(e) => setGenLuminance(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Upload Personal Photo */}
          {activeMode === 'upload' && (
            <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 text-center space-y-6">
              <div className="max-w-md mx-auto space-y-2">
                <Upload className="w-10 h-10 text-indigo-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white">Upload a Photo Representing How You Feel</h3>
                <p className="text-xs text-slate-400">
                  A photo of a rainy coffee cup, an open sky, a messy desk, or your favorite resting nook.
                </p>
              </div>

              {uploadedImage ? (
                <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-xl aspect-video">
                  <img src={uploadedImage} alt="Uploaded visual memory" className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-600/30 transition-all hover:scale-105">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image from Device</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

        </div>

        {/* Right: Emotional Dimension Sliders & Finalization */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel-glow p-6 rounded-3xl border border-cyan-500/30 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Emotional Dimension Tuning
            </h3>

            {/* Valence Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Valence (Internal Sky)</span>
                <span className={`font-semibold ${valence >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {valence > 0 ? `+${valence} (Luminous)` : `${valence} (Stormy)`}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={valence}
                onChange={(e) => setValence(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Heavy / Sorrow</span>
                <span>Still / Neutral</span>
                <span>Radiant Joy</span>
              </div>
            </div>

            {/* Arousal Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Arousal (Kinetic Charge)</span>
                <span className="font-semibold text-purple-300">{arousal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={arousal}
                onChange={(e) => setArousal(Number(e.target.value))}
                className="w-full accent-purple-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Quiet Stillness</span>
                <span>Flow</span>
                <span>Intense Storm</span>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Private whisper or context (optional):
              </label>
              <textarea
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="What feels true in this moment?..."
                className="w-full p-3 rounded-xl glass-input text-xs placeholder:text-slate-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSave}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300 animate-bounce" />
                  <span>Recorded to Mood Universe!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Record This Visual Mood</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
