import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, RotateCcw, Volume2, Heart } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

const STRESS_WORDS = [
  'Overthinking', 'Tiredness', 'Burnout', 'Anxiety', 'Loneliness',
  'Deadlines', 'Heavy Heart', 'Self-Doubt', 'Sadness', 'Work Stress',
  'Regret', 'Exhaustion', 'Fear', 'Pressure', 'Comparison'
];

const AFFIRMATIONS = [
  '✨ You are stronger than this moment.',
  '🌸 Feelings are just visitors, let them pass.',
  '💖 You deserve gentleness today.',
  '☀️ Tomorrow brings a clean slate.',
  '🌿 Take a deep breath. You are safe.',
  '🌈 You have survived 100% of your hardest days.',
  '☕ Drink a glass of water, relax your shoulders.',
  '⭐ You are enough, just as you are right now.'
];

export default function BubblePopGame({ onCheerUp }) {
  const [bubbles, setBubbles] = useState([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [lastAffirmation, setLastAffirmation] = useState('Pop the stress bubbles to reveal gentle truths!');

  // Spawn bubbles periodically
  useEffect(() => {
    // Initial batch
    const initial = Array.from({ length: 8 }, (_, i) => createBubble(i));
    setBubbles(initial);

    const interval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length < 12) {
          return [...prev, createBubble(Date.now())];
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const createBubble = (id) => {
    const word = STRESS_WORDS[Math.floor(Math.random() * STRESS_WORDS.length)];
    const size = Math.floor(75 + Math.random() * 45); // 75px - 120px
    const x = Math.floor(10 + Math.random() * 80); // 10% - 90%
    const speed = 7 + Math.random() * 6; // 7s - 13s drift
    const hue = Math.floor(Math.random() * 360);

    return {
      id: `${id}-${Date.now()}`,
      word,
      size,
      x,
      speed,
      hue,
      createdAt: Date.now()
    };
  };

  const handlePop = (id) => {
    soundEngine.playPopSound();
    const aff = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setLastAffirmation(aff);
    setPoppedCount((c) => {
      const next = c + 1;
      if (next % 5 === 0) {
        soundEngine.playCheerSound();
      }
      return next;
    });

    setBubbles((prev) => prev.filter((b) => b.id !== id));

    // Spawn replacement
    setTimeout(() => {
      setBubbles((prev) => [...prev, createBubble(Date.now() + Math.random())]);
    }, 400);
  };

  return (
    <div className="relative w-full h-[460px] rounded-3xl overflow-hidden glass-panel border border-purple-500/30 bg-gradient-to-b from-space-950/90 via-space-900/80 to-space-950 p-6 flex flex-col justify-between select-none shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Playfair_Display',serif]">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Pop Away The Heavy Thoughts
          </h3>
          <p className="text-xs text-slate-400">Click or tap any bubble to pop the stress and release a warm affirmation.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 shadow-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Popped: {poppedCount}</span>
          </div>

          <button
            onClick={() => {
              setBubbles(Array.from({ length: 8 }, (_, i) => createBubble(i)));
              setPoppedCount(0);
            }}
            title="Reset Game"
            className="p-2 rounded-xl glass-panel hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Bubble Arena */}
      <div className="relative flex-1 overflow-hidden">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            onClick={() => handlePop(bubble.id)}
            style={{
              left: `${bubble.x}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `floatUp ${bubble.speed}s linear infinite`,
              background: `radial-gradient(circle at 35% 35%, hsla(${bubble.hue}, 90%, 75%, 0.5), hsla(${bubble.hue}, 80%, 45%, 0.25))`,
              boxShadow: `0 0 20px hsla(${bubble.hue}, 80%, 60%, 0.3), inset 0 0 15px rgba(255,255,255,0.4)`
            }}
            className="absolute -bottom-16 rounded-full cursor-pointer hover:scale-110 active:scale-90 transition-transform duration-150 flex items-center justify-center text-center p-2 border border-white/30 backdrop-blur-sm group"
          >
            <span className="text-[11px] font-bold text-white drop-shadow-md group-hover:scale-105 pointer-events-none">
              {bubble.word}
            </span>
            {/* Gloss reflection highlight */}
            <div className="absolute top-2 left-2 w-3 h-2 rounded-full bg-white/60 blur-[1px] transform -rotate-45" />
          </div>
        ))}
      </div>

      {/* Footer Banner: Unfolded Affirmation */}
      <div className="z-10 pt-3 border-t border-white/10">
        <div className="p-3 rounded-2xl bg-space-900/90 border border-purple-500/20 text-center text-sm font-semibold text-purple-200 animate-pulse">
          {lastAffirmation}
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.9);
            opacity: 0.1;
          }
          10% {
            opacity: 0.95;
          }
          90% {
            opacity: 0.95;
          }
          100% {
            transform: translateY(-520px) scale(1.05);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
