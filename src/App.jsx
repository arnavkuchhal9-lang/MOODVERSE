import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InstantMoodScanner from './components/InstantMoodScanner';
import MoodMirror from './components/MoodMirror';
import VisualLogger from './components/VisualLogger';
import MoodForecast from './components/MoodForecast';
import RescueCapsules from './components/RescueCapsules';
import MoodGalaxy from './components/MoodGalaxy';
import VisualLexicon from './components/VisualLexicon';
import BubblePopGame from './components/games/BubblePopGame';
import CloudSmasherGame from './components/games/CloudSmasherGame';
import VentBox from './components/games/VentBox';
import CheerUpJokes from './components/games/CheerUpJokes';
import {
  getStoredEntries,
  saveEntry,
  deleteEntry,
  getStoredCapsules,
  saveCapsule,
  markCapsuleUnlocked,
  getStoredLexicon,
  updateLexiconItem,
  predictDifficultDays
} from './utils/storage';
import { Sparkles, Heart, RefreshCw, ShieldAlert, Download, Gamepad2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('instant'); // 'instant' | 'games' | 'forecast' | 'capsules' | 'logger' | 'galaxy'
  const [entries, setEntries] = useState([]);
  const [capsules, setCapsules] = useState([]);
  const [lexicon, setLexicon] = useState([]);
  const [activeRescueModal, setActiveRescueModal] = useState(false);
  const [activeGamesSubTab, setActiveGamesSubTab] = useState('bubbles');

  // Initialize data from localStorage
  useEffect(() => {
    setEntries(getStoredEntries());
    setCapsules(getStoredCapsules());
    setLexicon(getStoredLexicon());
  }, []);

  const handleSaveMood = (newEntry) => {
    const updated = saveEntry(newEntry);
    setEntries(updated);

    // If distress, show rescue hint or trigger
    if (newEntry.moodId === 'overwhelm') {
      // Prompt rescue
    }
  };

  const handleDeleteEntry = (id) => {
    const updated = deleteEntry(id);
    setEntries(updated);
  };

  const handleSaveCapsule = (newCapsule) => {
    const updated = saveCapsule(newCapsule);
    setCapsules(updated);
  };

  const handleUnlockCapsule = (id) => {
    const updated = markCapsuleUnlocked(id);
    setCapsules(updated);
  };

  const handleUpdateLexicon = (updatedItem) => {
    const updated = updateLexiconItem(updatedItem);
    setLexicon(updated);
  };

  // Forecast data for high-risk flags
  const forecastData = predictDifficultDays(entries);
  const highRiskWarning = forecastData?.highestRiskDay?.isHighRisk;

  // Reset to initial demo data
  const handleResetDemoData = () => {
    if (window.confirm("Reset Moodverse with realistic 14-day sample history and preloaded rescue notes?")) {
      localStorage.clear();
      setEntries(getStoredEntries());
      setCapsules(getStoredCapsules());
      setLexicon(getStoredLexicon());
    }
  };

  // Export data as JSON
  const handleExportJSON = () => {
    const data = {
      entries,
      capsules,
      lexicon,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodverse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      
      {/* Background Ambient Cosmic Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none animate-float-slow" style={{ animationDelay: '-5s' }} />
      <div className="fixed bottom-10 left-1/3 w-80 h-80 rounded-full bg-rose-500/10 blur-[130px] pointer-events-none animate-float-slow" style={{ animationDelay: '-9s' }} />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highRiskWarning={highRiskWarning}
        onTriggerRescue={() => {
          setActiveTab('capsules');
          setActiveRescueModal(true);
        }}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 pb-16 relative z-10">
        {activeTab === 'instant' && (
          <InstantMoodScanner
            onSaveMood={handleSaveMood}
            onTriggerRescue={() => {
              setActiveTab('capsules');
              setActiveRescueModal(true);
            }}
          />
        )}

        {activeTab === 'games' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>Instant Stress-Relief Arcade</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Playfair_Display',serif]">
                Play Games To Turn Your Mood Around
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Science shows that playful tactile engagement quickly interrupts negative emotional spirals. Pop bubbles, smash gloom, or laugh!
              </p>
            </div>

            {/* Game Sub-Tabs */}
            <div className="inline-flex p-1.5 rounded-2xl bg-space-900 border border-white/10 max-w-full overflow-x-auto">
              <button
                onClick={() => setActiveGamesSubTab('bubbles')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeGamesSubTab === 'bubbles' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🫧</span>
                <span>Pop Stress Bubbles</span>
              </button>
              <button
                onClick={() => setActiveGamesSubTab('smasher')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeGamesSubTab === 'smasher' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🧱</span>
                <span>Smash The Gloom</span>
              </button>
              <button
                onClick={() => setActiveGamesSubTab('vent')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeGamesSubTab === 'vent' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>💔</span>
                <span>Why Am I Sad? (Vent)</span>
              </button>
              <button
                onClick={() => setActiveGamesSubTab('jokes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeGamesSubTab === 'jokes' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>😂</span>
                <span>Instant Jokes</span>
              </button>
            </div>

            <div className="pt-4 max-w-4xl mx-auto">
              {activeGamesSubTab === 'bubbles' && <BubblePopGame />}
              {activeGamesSubTab === 'smasher' && <CloudSmasherGame />}
              {activeGamesSubTab === 'vent' && <VentBox onStartGame={() => setActiveGamesSubTab('bubbles')} />}
              {activeGamesSubTab === 'jokes' && <CheerUpJokes />}
            </div>
          </div>
        )}

        {activeTab === 'mirror' && (
          <MoodMirror
            onSaveMood={handleSaveMood}
            onTriggerRescue={() => {
              setActiveTab('capsules');
              setActiveRescueModal(true);
            }}
          />
        )}

        {activeTab === 'logger' && (
          <VisualLogger
            onSaveMood={handleSaveMood}
          />
        )}

        {activeTab === 'forecast' && (
          <MoodForecast
            entries={entries}
            onTriggerRescue={() => {
              setActiveTab('capsules');
              setActiveRescueModal(true);
            }}
          />
        )}

        {activeTab === 'capsules' && (
          <RescueCapsules
            capsules={capsules}
            onSaveCapsule={handleSaveCapsule}
            onUnlockCapsule={handleUnlockCapsule}
            activeRescueModal={activeRescueModal}
            setActiveRescueModal={setActiveRescueModal}
          />
        )}

        {activeTab === 'galaxy' && (
          <MoodGalaxy
            entries={entries}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {activeTab === 'lexicon' && (
          <VisualLexicon
            lexicon={lexicon}
            onUpdateLexicon={handleUpdateLexicon}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/5 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-['Playfair_Display',serif]">Moodverse</span>
            <span>— Visual Emotion Sanctuary & Difficult Day Forecaster</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportJSON}
              className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Memories</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={handleResetDemoData}
              className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
