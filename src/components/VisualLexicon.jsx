import React, { useState } from 'react';
import { BookOpen, Sparkles, Brain, Sliders, CheckCircle, HelpCircle, Layers, RefreshCw } from 'lucide-react';
import { getStoredLexicon, updateLexiconItem } from '../utils/storage';

export default function VisualLexicon({ lexicon, onUpdateLexicon }) {
  const [selectedItem, setSelectedItem] = useState(lexicon[0] || null);
  const [editingAffinity, setEditingAffinity] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setEditingAffinity({ ...item.learnedAffinity });
  };

  const handleSliderChange = (moodKey, value) => {
    setEditingAffinity(prev => ({
      ...prev,
      [moodKey]: Number(value)
    }));
  };

  const handleSaveTuning = () => {
    if (!selectedItem || !editingAffinity) return;
    const updated = {
      ...selectedItem,
      learnedAffinity: editingAffinity,
      confidence: Math.min(99, selectedItem.confidence + 3),
      notes: `${selectedItem.notes} (Fine-tuned by you to reflect personal visual meaning).`
    };
    onUpdateLexicon(updated);
    setSelectedItem(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Brain className="w-3.5 h-3.5" />
          Adaptive Neural Ontology · Personal Visual Language
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Playfair_Display',serif] bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
          How Moodverse Learns Your Visual Soul
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Standard mood trackers assume "Rain" always means sadness and "Sun" always means joy. Moodverse builds a 
          personalized visual lexicon that learns your individual associations through your choices over time.
        </p>
      </div>

      {/* Main Grid: Lexicon Archetypes List & Neural Fine-Tuning Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Archetypes List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Your Active Visual Symbols:</span>
            <span>{lexicon.length} Visual Mappings Learned</span>
          </div>

          <div className="space-y-3">
            {lexicon.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'glass-panel-glow border-indigo-400 bg-space-900/90 shadow-xl shadow-indigo-950/40'
                      : 'glass-panel border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      {item.metaphor}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.confidence}% AI Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-semibold mb-2">
                    Primary Personal Meaning: <span className="text-indigo-300">{item.primaryMeaning}</span>
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-2">
                    "{item.notes}"
                  </p>

                  {/* Affinity Mini Bar */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Affinities:</span>
                    {Object.entries(item.learnedAffinity).map(([mKey, pct]) => (
                      <span key={mKey} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-medium capitalize">
                        {mKey}: {pct}%
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-slate-500">{item.sampleCount} logs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Fine-Tuning Calibration Studio */}
        <div className="lg:col-span-6">
          {selectedItem && (
            <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Visual Symbol Calibration
                  </span>
                  <h2 className="text-xl font-bold text-white font-['Playfair_Display',serif]">
                    {selectedItem.metaphor}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Trained on</div>
                  <div className="text-sm font-bold text-indigo-300">{selectedItem.sampleCount} Entries</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-space-950/70 border border-white/5 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Moodverse Neural Insight:
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {selectedItem.notes}
                </p>
              </div>

              {/* Sliders for each emotional resonance */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Teach AI: What does this imagery mean to your subconscious?
                </h4>

                {editingAffinity && Object.entries(editingAffinity).map(([moodKey, val]) => (
                  <div key={moodKey} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize font-semibold text-slate-300">{moodKey} Resonance</span>
                      <span className="font-bold text-indigo-300">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(moodKey, e.target.value)}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveTuning}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300 animate-bounce" />
                      <span>Learned Model Updated!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Update My Personal Visual Language</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
