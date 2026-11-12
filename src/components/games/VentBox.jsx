import React, { useState } from 'react';
import { Heart, Send, Sparkles, Coffee, Moon, Frown, Users, HelpCircle, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

const REASONS = [
  {
    id: 'work',
    icon: '💼',
    label: 'Work or College Stress',
    diagnostic: 'Your cognitive load is overflowing. You are trying to carry an entire week\'s deadlines in a single evening.',
    advice: [
      'Write down only ONE task for the next hour, and shut down all other tabs.',
      'Drop your shoulders from your ears right now. Take a deep 5-second breath.',
      'Remember: You are human, not a machine. Done is better than perfect.'
    ]
  },
  {
    id: 'heartbreak',
    icon: '💔',
    label: 'Heartbreak / Hurt Feelings',
    diagnostic: 'Your emotional heart is sore from conflict, disappointment, or feeling neglected by someone you care about.',
    advice: [
      'Give yourself permission to cry or feel upset without judging yourself.',
      'Do not send angry or desperate texts tonight; sleep on it first.',
      'Wrap yourself in a warm blanket with hot tea. Comfort comes first.'
    ]
  },
  {
    id: 'burnout',
    icon: '🌙',
    label: 'Total Exhaustion & Burnout',
    diagnostic: 'Your nervous system is drained. You have been running on empty fumes for too many consecutive days.',
    advice: [
      'Cancel or postpone non-essential plans tonight without guilt.',
      'Turn on the rain ambient soundscape and close your eyes for 15 minutes.',
      'Rest is not something you have to earn; it is basic biological fuel.'
    ]
  },
  {
    id: 'lonely',
    icon: '🥀',
    label: 'Feeling Lonely & Invisible',
    diagnostic: 'You are craving genuine human warmth and presence. Feeling disconnected is one of the heaviest pains.',
    advice: [
      'Send a quick casual text to an old friend: "Hey, was just thinking of you!"',
      'Step outside for a 10-minute walk or listen to a warm comfort podcast.',
      'You belong here on this earth. Even in solitude, you are valued.'
    ]
  },
  {
    id: 'random',
    icon: '🌧️',
    label: 'Just an Off Day (Unsure Why)',
    diagnostic: 'Sometimes our neurochemistry or hormonal cycles dip like passing rain clouds without any logical explanation.',
    advice: [
      'You do not have to "fix" this feeling immediately; simply allow it to exist.',
      'Drink a glass of cool water and stretch your neck and back.',
      'Watch a lighthearted comedy or play the bubble popping game below!'
    ]
  }
];

export default function VentBox({ onStartGame }) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customVent, setCustomVent] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectReason = (reason) => {
    setSelectedReason(reason);
    setAiResponse(null);
  };

  const handleDiagnose = () => {
    setIsSubmitting(true);
    soundEngine.playRescueChime();

    setTimeout(() => {
      let customNote = '';
      if (customVent.trim()) {
        customNote = `I heard you share: "${customVent.trim()}". That is genuinely heavy, and it makes complete sense why your spirit feels tired right now.`;
      } else {
        customNote = `Looking closely at your mood, here is what your mind is going through:`;
      }

      setAiResponse({
        customNote,
        diagnostic: selectedReason.diagnostic,
        advice: selectedReason.advice
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 space-y-6 shadow-2xl bg-gradient-to-b from-rose-950/20 to-space-950">
      
      {/* Title */}
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5" />
          Moodverse Caring Diagnostic
        </span>
        <h2 className="text-2xl font-bold text-white font-['Playfair_Display',serif]">
          Why Are You Feeling Down Today?
        </h2>
        <p className="text-xs text-slate-400">
          Pick what matches what you are carrying right now, or vent in your own words.
        </p>
      </div>

      {/* Quick Reason Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {REASONS.map((reason) => {
          const isSelected = selectedReason.id === reason.id;
          return (
            <button
              key={reason.id}
              onClick={() => handleSelectReason(reason)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 ${
                isSelected
                  ? 'bg-rose-500/25 border-rose-400 text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'bg-space-900/60 border-white/5 hover:border-white/20 text-slate-300'
              }`}
            >
              <span className="text-xl">{reason.icon}</span>
              <span className="text-xs font-semibold truncate">{reason.label}</span>
            </button>
          );
        })}
      </div>

      {/* Venting Input Box */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">
          Want to vent? Tell me what happened (completely private):
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={customVent}
            onChange={(e) => setCustomVent(e.target.value)}
            placeholder="e.g. My boss yelled at me, or I just feel so drained and nothing is going right..."
            className="w-full p-3.5 rounded-2xl glass-input text-xs sm:text-sm placeholder:text-slate-500 resize-none pr-12"
          />
        </div>
      </div>

      {/* Button to get diagnosis & advice */}
      <div>
        <button
          onClick={handleDiagnose}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-rose-200" />
          <span>{isSubmitting ? 'Listening with care...' : 'Tell Me Why I Feel This Way & Comfort Me'}</span>
        </button>
      </div>

      {/* Compassionate Diagnosis Result */}
      {aiResponse && (
        <div className="p-6 rounded-2xl bg-space-900/90 border border-rose-500/30 space-y-4 animate-fade-in text-left">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Here is what your heart is experiencing:
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              {aiResponse.customNote}
            </p>
            <p className="text-xs text-rose-200 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 leading-relaxed">
              💡 <strong>Root Cause:</strong> {aiResponse.diagnostic}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              3 Gentle Steps for Right Now:
            </span>
            <ul className="space-y-2">
              {aiResponse.advice.map((item, i) => (
                <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Ready to play a game to shift your energy?</span>
            <button
              onClick={onStartGame}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              🎮 Play Cheer-Up Games Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
