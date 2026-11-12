import React, { useState } from 'react';
import { HeartHandshake, Plus, Sparkles, Heart, Shield, Lock, Unlock, X, Play, Clock, Check, Volume2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function RescueCapsules({
  capsules,
  onSaveCapsule,
  onUnlockCapsule,
  activeRescueModal,
  setActiveRescueModal
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  // New capsule form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorMood, setNewAuthorMood] = useState('Radiant Joy');
  const [newTrigger, setNewTrigger] = useState('overwhelm');
  const [newMessage, setNewMessage] = useState('');
  const [autoDeliverOnForecast, setAutoDeliverOnForecast] = useState(true);

  // Breathing pacer state inside sanctuary modal
  const [breathPhase, setBreathPhase] = useState('Inhale'); // 'Inhale' (4s) | 'Hold' (7s) | 'Exhale' (8s)

  const handleOpenSanctuary = (capsule) => {
    setSelectedCapsule(capsule);
    onUnlockCapsule(capsule.id);
    soundEngine.playRescueChime();
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const newCapsule = {
      id: `capsule-${Date.now()}`,
      title: newTitle.trim(),
      authorMood: newAuthorMood,
      createdDate: new Date().toISOString().split('T')[0],
      triggerCondition: newTrigger,
      autoDeliverOnHighRisk: autoDeliverOnForecast,
      unlockedCount: 0,
      message: newMessage.trim()
    };

    onSaveCapsule(newCapsule);
    setShowCreateModal(false);
    setNewTitle('');
    setNewMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5" />
          Time-Capsule Self-Compassion Notes
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Playfair_Display',serif] bg-gradient-to-r from-white via-slate-100 to-rose-300 bg-clip-text text-transparent">
          Letters to Your Future Self on Difficult Days
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          When we are in deep sorrow or overwhelm, we forget how capable and loved we are. Write letters when you feel 
          resilient and grounded. Moodverse delivers them right into your hands the instant difficult days arrive.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Write a New Rescue Capsule</span>
          </button>
        </div>
      </div>

      {/* Grid of Rescue Capsules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capsules.map((capsule) => {
          return (
            <div
              key={capsule.id}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-rose-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/15 transition-all" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-rose-400" />
                    Penned during {capsule.authorMood}
                  </span>
                  <span className="text-xs text-slate-500">
                    Opened {capsule.unlockedCount || 0} times
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-['Playfair_Display',serif] group-hover:text-rose-200 transition-colors">
                  {capsule.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed italic">
                  "{capsule.message}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs relative z-10">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  Auto-arm on: <strong className="text-slate-200 capitalize">{capsule.triggerCondition}</strong>
                </span>

                <button
                  onClick={() => handleOpenSanctuary(capsule)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Open Note</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sanctuary Modal: Fullscreen Mindful Reveal */}
      {(selectedCapsule || activeRescueModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-space-950/90 backdrop-blur-2xl animate-fade-in">
          <div className="relative max-w-2xl w-full glass-panel-glow border border-rose-500/40 p-6 sm:p-10 rounded-3xl space-y-6 shadow-2xl shadow-rose-950/80 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedCapsule(null);
                if (setActiveRescueModal) setActiveRescueModal(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-space-900 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Breathing Guide for down-regulating tension */}
            <div className="text-center space-y-3 pb-2 border-b border-white/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                Rescue Chime Played · Take a Gentle Breath
              </div>

              {/* Animated Breathing Orb */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 blur-xl opacity-50 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-space-900 border-2 border-rose-400 flex flex-col items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-[11px] font-bold text-rose-300">Breathe</span>
                  <span className="text-[9px] text-slate-400">4-7-8 Pace</span>
                </div>
              </div>
            </div>

            {/* The Letter Body */}
            {(() => {
              const cap = selectedCapsule || capsules[0];
              return (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-xs text-rose-400 uppercase tracking-widest font-bold">
                      A Gift From Your Past Resilient Self
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Playfair_Display',serif]">
                      {cap.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Penned when you were feeling <span className="text-rose-300 font-semibold">{cap.authorMood}</span> on {cap.createdDate}
                    </p>
                  </div>

                  {/* Letter Parchment Box */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-space-900/90 border border-rose-500/20 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-['Plus_Jakarta_Sans',sans-serif] shadow-inner">
                    {cap.message}
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        setSelectedCapsule(null);
                        if (setActiveRescueModal) setActiveRescueModal(false);
                      }}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-105"
                    >
                      I Feel Grounded Now · Return to Moodverse
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* Create New Capsule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-space-950/85 backdrop-blur-xl animate-fade-in">
          <div className="relative max-w-xl w-full glass-panel-glow border border-purple-500/40 p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-space-900 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white font-['Playfair_Display',serif]">
                Write a Rescue Capsule for Your Hardest Day
              </h2>
              <p className="text-xs text-slate-400">
                Speak to yourself with radical gentleness. What truth does your future overwhelmed self need to remember?
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Letter Title:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Read this when you feel the fog rolling in..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Your Current Mindset:
                  </label>
                  <select
                    value={newAuthorMood}
                    onChange={(e) => setNewAuthorMood(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input"
                  >
                    <option value="Radiant Joy">Radiant Joy</option>
                    <option value="Deep Serenity">Deep Serenity</option>
                    <option value="Cosmic Resonance">Cosmic Resonance</option>
                    <option value="Grounded Peace">Grounded Peace</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Auto-Deliver Condition:
                  </label>
                  <select
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input"
                  >
                    <option value="overwhelm">When Overwhelmed or Anxious</option>
                    <option value="melancholy">When Feeling Melancholy / Down</option>
                    <option value="fatigue">When Experiencing Severe Fatigue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Your Compassionate Words:
                </label>
                <textarea
                  required
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tell yourself what is true beyond the temporary storm. Remind yourself to breathe, rest, drink water..."
                  className="w-full p-3.5 rounded-xl glass-input text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="autoDeliver"
                  checked={autoDeliverOnForecast}
                  onChange={(e) => setAutoDeliverOnForecast(e.target.checked)}
                  className="rounded accent-purple-500"
                />
                <label htmlFor="autoDeliver">
                  Auto-arm this note when Moodverse predicts a difficult day ahead
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Seal and Store Rescue Capsule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
