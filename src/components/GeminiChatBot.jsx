import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Key, KeyRound, X, RefreshCw, Heart, MessageCircle, AlertCircle, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';

const SYSTEM_PROMPT = `You are Moodverse AI, a deeply caring, empathetic best friend and emotional wellness companion.
The user is talking to you because their mood is low, sad, stressed, anxious, or exhausted.
Guidelines:
1. Always respond with warmth, compassion, validation, and zero judgment.
2. Understand and naturally respond in the language the user speaks: Hinglish (Hindi written in English letters), Hindi, or English. E.g., if user writes "mera mood acha nhi me kya karu", respond warmly in Hinglish like: "Mujhe sunke bura laga ki aapka mood theek nahi hai dost ❤️ Sabse pehle ek gehri saans lo...".
3. Provide practical, soothing micro-actions (e.g. drink a glass of water, step away from screens, listen to soft rain, play our stress bubble games, or simply rest).
4. Keep answers concise (2-4 short paragraphs), gentle, and heartfelt. Never sound robotic or clinical.`;

const DEFAULT_OFFLINE_REPLIES = [
  {
    trigger: ['mood', 'acha', 'theek', 'kya karu', 'sad', 'down', 'low'],
    reply: `Dost, sabse pehle ek gehri saans lo ❤️ Main samajh sakta hoon ki aaj ka din bhaari lag raha hai.

Jab mood theek na ho, toh yeh 3 choti cheezein try karo:
1. **Paani piyo aur thoda stretch karo** - Apne shoulders ko relax karo.
2. **Koi guilt mat lo** - Har din productive hona zaroori nahi hota. Aaj bas rest karo.
3. **Left side pe 'Pop Stress Bubbles' game khelo** - Chote-chote bubbles pop karke mind thoda distract hoga!

Mujhe batao, kis baat ki tension ho rahi hai? Main yahin hoon sunne ke liye.`
  },
  {
    trigger: ['stress', 'tension', 'kaam', 'study', 'overthinking'],
    reply: `Itna stress mat lo dost, breathe in... breathe out 🌿
Aap ek insaan ho, robot nahi. Kal ki problems kal solve ho sakti hain, abhi ke liye apne aap ko thoda aaram do. 

Left side pe 'Smash The Gloom' game chalao, ya ambient rain sound play karo. You've got this!`
  }
];

export default function GeminiChatBot({ currentMood, onPlayGame }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hey dost ❤️ Main Moodverse AI hoon. Mujhe lag raha hai aapka mood thoda heavy hai. Kya baat hai, kya chal raha hai mind mein?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('moodverse_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keySavedStatus, setKeySavedStatus] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const trimmed = tempKey.trim();
    setApiKey(trimmed);
    localStorage.setItem('moodverse_gemini_key', trimmed);
    setKeySavedStatus(true);
    setTimeout(() => {
      setKeySavedStatus(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    soundEngine.playPopSound();
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // If Gemini API Key is provided, call real Google Gemini API
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SYSTEM_PROMPT}\n\n[User's Detected Facial Mood: ${currentMood?.name || 'Unknown'}]\nUser says: ${text}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 500
              }
            })
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const botReply = data.candidates[0].content.parts[0].text;
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: botReply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isGemini: true
            }
          ]);
          soundEngine.playRescueChime();
          setIsLoading(false);
          return;
        } else if (data.error) {
          throw new Error(data.error.message || 'Gemini API Error');
        }
      } catch (err) {
        console.warn('Gemini call error:', err);
      }
    }

    // Intelligent Caring Offline Fallback
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matched = DEFAULT_OFFLINE_REPLIES.find((item) =>
        item.trigger.some((t) => lower.includes(t))
      );

      const botText = matched
        ? matched.reply
        : `Main samajh sakta hoon dost ❤️ Kabhi kabhi hum sab bina kisi wajah ke bhi down feel karte hain.
Aap akele nahi ho. Thoda sa paani piyo, lambi saans lo, aur right side ke arcade games khelo to lighten the load!`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGemini: false
        }
      ]);
      soundEngine.playRescueChime();
      setIsLoading(false);
    }, 700);
  };

  const quickPrompts = [
    'Mera mood acha nhi me kya karu?',
    'Bahut stress ho raha hai 😞',
    'Tell me something comforting',
    'Ek pyara sa joke sunao!'
  ];

  return (
    <div className="flex flex-col h-[640px] w-full rounded-3xl glass-panel-glow border-2 border-purple-500/30 overflow-hidden shadow-2xl bg-space-950/95 relative text-left">
      
      {/* Chat Header */}
      <div className="p-4 bg-space-900/90 border-b border-white/10 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg">
              <div className="w-full h-full bg-space-950 rounded-2xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-space-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white font-['Playfair_Display',serif]">
                Moodverse Companion
              </h3>
              {apiKey ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✨ Gemini Live
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Offline Buddy
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Yahan baat karo, dil halka karo</p>
          </div>
        </div>

        {/* Gemini API Key Button */}
        <button
          onClick={() => {
            setTempKey(apiKey);
            setShowKeyModal(true);
          }}
          title={apiKey ? 'Gemini API Key Configured' : 'Add Google Gemini API Key'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            apiKey
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              : 'bg-purple-500/20 border-purple-400/40 text-purple-200 hover:bg-purple-500/30 animate-pulse'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{apiKey ? 'Gemini Active' : 'Add Gemini Key'}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-purple-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-space-900 border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="text-[12px]">{msg.text}</div>
                <div className="flex items-center justify-between gap-3 mt-1.5 text-[9px] text-slate-400">
                  <span>{msg.time}</span>
                  {msg.isGemini && (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Gemini AI
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-9 animate-pulse">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Moodverse soch raha hai aapke liye pyara message...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 pt-2 pb-1 border-t border-white/5 bg-space-950/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-xl bg-space-900/90 border border-white/10 text-slate-300 hover:text-white hover:border-purple-400/50 transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-space-900/90 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Mera mood acha nhi hai, main kya karu?..."
          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all shadow-md shadow-purple-900/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-30 bg-space-950/90 backdrop-blur-md p-6 flex flex-col justify-center animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Add Google Gemini API Key</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enter your Google Gemini API key to power real-time AI emotional conversations. Your key stays 100% private in your browser.
              </p>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <input
                type="password"
                required
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Free key available at aistudio.google.com</span>
                {keySavedStatus && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
                >
                  Save API Key
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKey('');
                      setTempKey('');
                      localStorage.removeItem('moodverse_gemini_key');
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
