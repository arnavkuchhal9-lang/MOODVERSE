import React, { useState } from 'react';
import { Smile, Sparkles, RefreshCw, Heart } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

const JOKES = [
  {
    setup: "Why don't eggs tell jokes?",
    punchline: "Because they might crack up! 🥚😂",
    tip: "You're allowed to laugh even on hard days."
  },
  {
    setup: "What do you call a fake noodle?",
    punchline: "An impasta! 🍝",
    tip: "Take life with a pinch of salt and a bowl of pasta."
  },
  {
    setup: "Why did the scarecrow win an award?",
    punchline: "Because he was outstanding in his field! 🌾🏆",
    tip: "You don't have to be outstanding today; just standing is enough."
  },
  {
    setup: "Why do bees have sticky hair?",
    punchline: "Because they use honeycombs! 🐝🍯",
    tip: "Sweet moments are waiting right around the corner."
  },
  {
    setup: "What does a cloud wear under its raincoat?",
    punchline: "Thunderwear! ⚡🌧️",
    tip: "Even the darkest storm runs out of rain eventually."
  },
  {
    setup: "Why can't your nose be 12 inches long?",
    punchline: "Because then it would be a foot! 👃🦶",
    tip: "You are doing great, take a deep breath."
  }
];

export default function CheerUpJokes() {
  const [index, setIndex] = useState(0);

  const nextJoke = () => {
    soundEngine.playPopSound();
    setIndex((prev) => (prev + 1) % JOKES.length);
  };

  const current = JOKES[index];

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 text-center space-y-5 bg-gradient-to-b from-amber-950/20 to-space-950">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
        <Smile className="w-3.5 h-3.5" />
        Instant Chuckle Dispenser
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-white font-['Playfair_Display',serif]">
          "{current.setup}"
        </h3>

        <div className="p-4 rounded-2xl bg-space-900/90 border border-amber-500/20 text-base font-extrabold text-amber-300">
          {current.punchline}
        </div>

        <p className="text-xs text-slate-400 italic">
          💡 {current.tip}
        </p>
      </div>

      <div>
        <button
          onClick={nextJoke}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-950/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tell Me Another Joke!</span>
        </button>
      </div>
    </div>
  );
}
