import React, { useState } from 'react';
import { TrendingUp, ShieldAlert, AlertTriangle, Calendar, Sparkles, CheckCircle2, HeartHandshake, Compass, Clock, Zap } from 'lucide-react';
import { predictDifficultDays } from '../utils/storage';

export default function MoodForecast({ entries, onTriggerRescue }) {
  const forecastData = predictDifficultDays(entries);
  const { forecast, highestRiskDay, overallTrajectory } = forecastData;
  const [armedDays, setArmedDays] = useState({ [highestRiskDay?.dayName]: true });

  const toggleArmDay = (dayName) => {
    setArmedDays(prev => ({
      ...prev,
      [dayName]: !prev[dayName]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          Predictive Burnout & Difficult Day Forecaster
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Playfair_Display',serif] bg-gradient-to-r from-white via-slate-100 to-rose-300 bg-clip-text text-transparent">
          Foresee Emotional Storms Before They Arrive
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Moodverse models your emotional momentum, circadian fatigue dips, and day-of-week burnout cycles to forecast 
          vulnerable days up to a week in advance — giving you the power to cushion your schedule and pre-arm rescue notes.
        </p>
      </div>

      {/* Hero Alert: Highest Risk Day Banner */}
      {highestRiskDay && (
        <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-space-900 to-purple-950/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400">
                    Highest Vulnerability Window
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30 font-bold">
                    {highestRiskDay.riskScore}% Friction Probability
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white font-['Playfair_Display',serif]">
                  Difficult Weather Forecasted for {highestRiskDay.dayName} ({highestRiskDay.dateStr})
                </h2>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {highestRiskDay.riskReason}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => toggleArmDay(highestRiskDay.dayName)}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  armedDays[highestRiskDay.dayName]
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-400/50 shadow-emerald-950/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                }`}
              >
                {armedDays[highestRiskDay.dayName] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Rescue Shield Active</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Pre-Arm Rescue Shield</span>
                  </>
                )}
              </button>

              <button
                onClick={onTriggerRescue}
                className="px-4 py-3 rounded-2xl glass-panel hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                <span>Preview Rescue Note</span>
              </button>
            </div>
          </div>

          {/* Preemptive Shield Suggestions */}
          <div className="p-4 rounded-2xl bg-space-950/80 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Schedule protection: Avoid high-friction confrontations.</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Evening buffer: Commit to a 9:30 PM digital sunset.</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sensory care: Keep binaural rain soundscape on standby.</span>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Day-by-Day Forecast Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            7-Day Emotional Trajectory & Volatility Index
          </h3>
          <span className="text-xs text-slate-400">
            Trajectory Trend: <span className="text-purple-300 font-semibold">{overallTrajectory}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {forecast.map((day, idx) => {
            const isHigh = day.isHighRisk;
            const isArmed = armedDays[day.dayName];
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                  isHigh
                    ? 'glass-panel-glow border-rose-500/40 bg-gradient-to-b from-rose-950/30 to-space-950 shadow-lg shadow-rose-950/30'
                    : 'glass-panel border-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{day.dayName.slice(0, 3)}</span>
                    <span className="text-[10px] text-slate-400">{day.dateStr.split(',')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      day.riskScore >= 65
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : day.riskScore >= 40
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {day.riskScore}% Risk
                    </span>
                  </div>
                </div>

                {/* Valence Gauge */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Valence:</span>
                    <span className={`font-semibold ${day.projectedValence >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {day.projectedValence > 0 ? `+${day.projectedValence}` : day.projectedValence}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-space-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${day.projectedValence >= 0 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(15, (day.projectedValence + 100) / 2))}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                  {day.riskReason}
                </div>

                {/* Pre-Arm Shield Toggle */}
                {isHigh && (
                  <button
                    onClick={() => toggleArmDay(day.dayName)}
                    className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all border ${
                      isArmed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-400/30'
                    }`}
                  >
                    {isArmed ? '✓ Shield Armed' : 'Arm Shield'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* How the Predictive Engine Works */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          The Science of Moodverse Emotional Forecasting
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-space-900/60 border border-white/5 space-y-2">
            <h4 className="font-bold text-white">1. Circadian & Weekly Rhythms</h4>
            <p className="text-slate-400 leading-relaxed">
              Human cognitive resilience naturally oscillates. Midweek exhaustion typically peaks between Wednesday evening and Thursday afternoon.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-space-900/60 border border-white/5 space-y-2">
            <h4 className="font-bold text-white">2. Multi-Day Valence Momentum</h4>
            <p className="text-slate-400 leading-relaxed">
              A downward valence streak of 2+ entries compounds neural fatigue. The model detects negative acceleration before emotional burnout sets in.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-space-900/60 border border-white/5 space-y-2">
            <h4 className="font-bold text-white">3. Self-Written Rescue Delivery</h4>
            <p className="text-slate-400 leading-relaxed">
              When difficult days arrive, Moodverse automatically triggers your time-capsuled self-written wisdom right when your brain needs it most.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
