import React, { useState, useRef, useEffect } from 'react';
import { Orbit, Sparkles, Filter, Trash2, Calendar, Eye, Heart, Compass, X } from 'lucide-react';
import { MOOD_DEFINITIONS } from '../utils/visionEngine';

export default function MoodGalaxy({ entries, onDeleteEntry }) {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterMood, setFilterMood] = useState('all');
  const [hoveredStar, setHoveredStar] = useState(null);
  const canvasRef = useRef(null);

  const filteredEntries = filterMood === 'all'
    ? entries
    : entries.filter(e => e.moodId === filterMood);

  // Render Interactive Mood Galaxy Constellation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Draw dark celestial void
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, w, h);

    // Subtle background stars
    for (let i = 0; i < 90; i++) {
      const bx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
      const by = (Math.cos(i * 33) * 0.5 + 0.5) * h;
      const alpha = (Math.sin(Date.now() / 1000 + i) * 0.3 + 0.5) * 0.4;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(bx, by, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (filteredEntries.length === 0) return;

    // Calculate node star coordinates along an organic spiral or wave
    const starCoords = filteredEntries.map((entry, index) => {
      const progress = index / Math.max(1, filteredEntries.length - 1);
      const angle = progress * Math.PI * 3.5;
      const radius = 60 + progress * (Math.min(w, h) * 0.38);
      const x = w / 2 + Math.cos(angle) * radius;
      const y = h / 2 + Math.sin(angle) * radius;
      return { x, y, entry, index };
    });

    // Draw constellation lines connecting adjacent temporal stars
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    starCoords.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw each emotional star
    starCoords.forEach((pt) => {
      const mood = MOOD_DEFINITIONS[pt.entry.moodId] || MOOD_DEFINITIONS.serenity;
      const isHovered = hoveredStar?.entry.id === pt.entry.id;

      // Outer glowing halo
      const grad = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, isHovered ? 26 : 14);
      grad.addColorStop(0, mood.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isHovered ? 26 : 14, 0, Math.PI * 2);
      ctx.fill();

      // Core star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isHovered ? 5.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [filteredEntries, hoveredStar]);

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const w = canvas.width;
    const h = canvas.height;

    // Check hit test
    let found = null;
    filteredEntries.forEach((entry, index) => {
      const progress = index / Math.max(1, filteredEntries.length - 1);
      const angle = progress * Math.PI * 3.5;
      const radius = 60 + progress * (Math.min(w, h) * 0.38);
      const x = w / 2 + Math.cos(angle) * radius;
      const y = h / 2 + Math.sin(angle) * radius;

      const dist = Math.hypot(mouseX - x, mouseY - y);
      if (dist < 20) {
        found = { entry, x, y };
      }
    });

    setHoveredStar(found);
  };

  const handleCanvasClick = () => {
    if (hoveredStar) {
      setSelectedEntry(hoveredStar.entry);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Orbit className="w-3.5 h-3.5" />
          Interactive Celestial Timeline
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Playfair_Display',serif] bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
          The Constellation of Your Visual Memories
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Every moment you record is a star in your personal emotional cosmos. Hover and click any star in the galaxy 
          below to relive the visual imagery and feeling of that day.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setFilterMood('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMood === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            All Memories ({entries.length})
          </button>
          {Object.entries(MOOD_DEFINITIONS).map(([key, def]) => {
            const count = entries.filter(e => e.moodId === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilterMood(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterMood === key
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'glass-panel text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: def.color }} />
                <span>{def.name.split(' ')[1] || def.name} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Galaxy Canvas */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-purple-500/30 shadow-2xl bg-space-950">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer block"
        />

        {/* Floating Tooltip when Hovering a Star */}
        {hoveredStar && (
          <div 
            className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-space-900/95 border border-purple-400/50 shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in"
            style={{
              left: `${Math.min(80, Math.max(15, (hoveredStar.x / 900) * 100))}%`,
              top: `${Math.min(75, Math.max(15, (hoveredStar.y / 480) * 100))}%`
            }}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
              <img src={hoveredStar.entry.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-white">{hoveredStar.entry.archetypeTitle}</div>
              <div className="text-[11px] text-purple-300 font-semibold">{MOOD_DEFINITIONS[hoveredStar.entry.moodId]?.name}</div>
              <div className="text-[10px] text-slate-400">{hoveredStar.entry.displayDate}</div>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-10 text-[11px] text-slate-400 bg-space-950/80 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          ✨ Click any star to view complete visual memory & private reflection
        </div>
      </div>

      {/* Chronological Visual Cards Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Chronological Memory Flow
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => {
            const mood = MOOD_DEFINITIONS[entry.moodId] || MOOD_DEFINITIONS.serenity;
            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all duration-300 group hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={entry.imageUrl}
                      alt={entry.archetypeTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-space-950/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mood.color }} />
                      <span>{mood.name}</span>
                    </div>

                    <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-space-950/70 text-slate-300">
                      {entry.displayDate}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-base font-bold text-white font-['Playfair_Display',serif]">
                        {entry.archetypeTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      "{entry.note}"
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-space-900/30">
                  <span className="text-[11px]">{entry.source}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${entry.valence >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.valence > 0 ? `+${entry.valence}` : entry.valence} val
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry.id);
                      }}
                      title="Delete entry"
                      className="p-1 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Memory Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-space-950/85 backdrop-blur-xl animate-fade-in">
          <div className="relative max-w-2xl w-full glass-panel-glow border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-space-900/80 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/9] w-full">
              <img src={selectedEntry.imageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-xs uppercase font-bold tracking-widest text-purple-300">
                  {selectedEntry.displayDate} · {selectedEntry.source}
                </span>
                <h2 className="text-2xl font-bold text-white font-['Playfair_Display',serif]">
                  {selectedEntry.archetypeTitle}
                </h2>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/30 font-semibold">
                  Dominant: {MOOD_DEFINITIONS[selectedEntry.moodId]?.name}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300">
                  Valence: {selectedEntry.valence}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300">
                  Arousal: {selectedEntry.arousal}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-space-900 border border-white/5 text-sm text-slate-200 leading-relaxed italic">
                "{selectedEntry.note}"
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                >
                  Close Memory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
