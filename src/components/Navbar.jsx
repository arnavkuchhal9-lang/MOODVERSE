import React, { useState } from 'react';
import { Sparkles, Eye, Image as ImageIcon, TrendingUp, HeartHandshake, Orbit, BookOpen, Volume2, VolumeX, ShieldAlert, Gamepad2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function Navbar({ activeTab, setActiveTab, highRiskWarning, onTriggerRescue }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioTrack, setAudioTrack] = useState('rain');

  const toggleSound = () => {
    if (isPlayingAudio) {
      soundEngine.stop();
      setIsPlayingAudio(false);
    } else {
      soundEngine.playTrack(audioTrack);
      setIsPlayingAudio(true);
    }
  };

  const switchTrack = (track) => {
    setAudioTrack(track);
    if (isPlayingAudio) {
      soundEngine.playTrack(track);
    }
  };

  const navItems = [
    { id: 'instant', label: 'Face Scan & Games', icon: Eye, badge: 'Direct' },
    { id: 'games', label: 'Cheer-Up Games', icon: Gamepad2, badge: 'Play' },
    { id: 'forecast', label: 'Difficult Days', icon: TrendingUp, badge: highRiskWarning ? 'Alert' : null },
    { id: 'capsules', label: 'Rescue Notes', icon: HeartHandshake, badge: null },
    { id: 'logger', label: 'Visual Art Log', icon: ImageIcon, badge: null },
    { id: 'galaxy', label: 'Galaxy', icon: Orbit, badge: null },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('instant')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <div className="w-full h-full bg-space-950 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse border-2 border-space-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent font-['Playfair_Display',serif]">
                Moodverse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Visual Soul
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Track emotions through images, not words</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-space-900/80 border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    item.badge === 'Live AI'
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 animate-pulse'
                      : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Ambient Audio & Emergency Rescue Trigger */}
        <div className="flex items-center gap-3">
          {/* Ambient Sound Player */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900/90 border border-white/10 text-xs text-slate-300">
            <button
              onClick={toggleSound}
              title={isPlayingAudio ? 'Pause ambient atmosphere' : 'Play calming ambient soundscape'}
              className={`p-1.5 rounded-lg transition-colors ${
                isPlayingAudio ? 'bg-purple-600 text-white animate-pulse' : 'hover:bg-white/10 text-slate-400'
              }`}
            >
              {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-1">
              <button 
                onClick={() => switchTrack('rain')} 
                className={`px-1.5 py-0.5 rounded text-[11px] ${audioTrack === 'rain' ? 'text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Rain
              </button>
              <span className="text-slate-600">·</span>
              <button 
                onClick={() => switchTrack('drone')} 
                className={`px-1.5 py-0.5 rounded text-[11px] ${audioTrack === 'drone' ? 'text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                432Hz
              </button>
              <span className="text-slate-600">·</span>
              <button 
                onClick={() => switchTrack('zen')} 
                className={`px-1.5 py-0.5 rounded text-[11px] ${audioTrack === 'zen' ? 'text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Theta
              </button>
            </div>
          </div>

          {/* Quick Rescue Button */}
          <button
            onClick={onTriggerRescue}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-950/40"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Open Rescue Note</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-white/5 bg-space-950/90 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] whitespace-nowrap rounded-lg ${
                isActive ? 'text-purple-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
