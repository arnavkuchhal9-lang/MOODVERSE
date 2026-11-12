// Moodverse Persistent Storage, Seed Data & Predictive Forecaster

export const VISUAL_METAPHORS = [
  {
    id: 'cosmic_nebula',
    title: 'Cosmic Nebula',
    archetype: 'Cosmic Resonance',
    category: 'Transcendence & Focus',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    tags: ['Infinite', 'Vast', 'Lucid', 'Deep Mind'],
    defaultMood: 'focus',
    palette: ['#1e1b4b', '#4338ca', '#8b5cf6', '#c084fc']
  },
  {
    id: 'rainy_window',
    title: 'Rain on Cold Glass',
    archetype: 'Melancholic Drift',
    category: 'Solitude & Introspection',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    tags: ['Reflective', 'Quiet Tears', 'Raindrops', 'Heavy Cloud'],
    defaultMood: 'melancholy',
    palette: ['#0f172a', '#1e293b', '#3b82f6', '#94a3b8']
  },
  {
    id: 'golden_sunburst',
    title: 'Golden Sunburst',
    archetype: 'Radiant Joy',
    category: 'Vitality & Exuberance',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tags: ['Warmth', 'Awakening', 'Glow', 'Triumph'],
    defaultMood: 'joy',
    palette: ['#78350f', '#d97706', '#f59e0b', '#fef08a']
  },
  {
    id: 'misty_pines',
    title: 'Misty Pine Forest',
    archetype: 'Deep Serenity',
    category: 'Grounding & Equilibrium',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    tags: ['Stillness', 'Evergreen', 'Oxygen', 'Centering'],
    defaultMood: 'serenity',
    palette: ['#064e3b', '#047857', '#10b981', '#6ee7b7']
  },
  {
    id: 'stormy_ocean',
    title: 'Tempestuous Ocean Swell',
    archetype: 'Restless Overwhelm',
    category: 'Emotional Surge & Turmoil',
    imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
    tags: ['Turbulence', 'High Waves', 'Shattered', 'Tempest'],
    defaultMood: 'overwhelm',
    palette: ['#020617', '#1e1b4b', '#e11d48', '#f43f5e']
  },
  {
    id: 'autumn_embers',
    title: 'Warm Hearth & Cooling Embers',
    archetype: 'Heavy Twilight',
    category: 'Rest & Unwinding',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    tags: ['Soft Fire', 'Slow Twilight', 'Fatigue', 'Cocoon'],
    defaultMood: 'fatigue',
    palette: ['#450a0a', '#991b1b', '#ea580c', '#fdba74']
  },
  {
    id: 'blooming_blossom',
    title: 'Spring Sakura Blossom',
    archetype: 'Radiant Joy',
    category: 'Gentle Hope & Rebirth',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
    tags: ['Renewal', 'Delicate', 'Soft Warmth', 'Heart Opening'],
    defaultMood: 'joy',
    palette: ['#831843', '#db2777', '#f472b6', '#fce7f3']
  },
  {
    id: 'desert_starlight',
    title: 'Silent Dune Horizon',
    archetype: 'Deep Serenity',
    category: 'Simplicity & Stillness',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    tags: ['Minimalism', 'Breeze', 'Clarity', 'Expansive'],
    defaultMood: 'serenity',
    palette: ['#1c1917', '#44403c', '#d97706', '#fde68a']
  }
];

export const INITIAL_LEXICON = [
  {
    id: 'rain',
    metaphor: 'Rain & Overcast Skies',
    primaryMeaning: 'Deep Introspection & Peaceful Solitude',
    learnedAffinity: { serenity: 60, melancholy: 30, overwhelm: 10 },
    confidence: 88,
    sampleCount: 14,
    notes: 'Unlike traditional trackers that equate rain with depression, your visual language links gentle rain to deep focused reading and grounding.'
  },
  {
    id: 'fire',
    metaphor: 'Flames & Glowing Embers',
    primaryMeaning: 'Urgent Creative Drive or Impending Fatigue',
    learnedAffinity: { focus: 45, fatigue: 35, overwhelm: 20 },
    confidence: 82,
    sampleCount: 11,
    notes: 'Bright flames signal high creative flow, while dying embers consistently predict evening burnout.'
  },
  {
    id: 'ocean',
    metaphor: 'Deep Ocean Waters',
    primaryMeaning: 'Emotional Scale & Processing Depth',
    learnedAffinity: { overwhelm: 50, serenity: 40, melancholy: 10 },
    confidence: 91,
    sampleCount: 18,
    notes: 'Choppy water signifies sensory overload; flat glass water marks peak inner calm.'
  },
  {
    id: 'cosmos',
    metaphor: 'Cosmic Starfields & Nebulae',
    primaryMeaning: 'Existential Perspective & Flow State',
    learnedAffinity: { focus: 70, serenity: 25, joy: 5 },
    confidence: 94,
    sampleCount: 22,
    notes: 'Chosen almost exclusively during late-night programming or meditative synthesis.'
  }
];

export const INITIAL_RESCUE_CAPSULES = [
  {
    id: 'capsule-1',
    title: 'A Letter from Your Sunniest Self',
    authorMood: 'Radiant Joy',
    createdDate: '2026-11-04',
    triggerCondition: 'melancholy', // triggers on melancholy / high sadness
    autoDeliverOnHighRisk: true,
    unlockedCount: 2,
    message: `Hey there, breathe in deeply for four counts... Hold it. Let it go.
Remember: You are feeling the weather right now, but you are not the weather. You are the vast sky that holds the storm.
Last Tuesday you thought the world was falling apart, yet by Friday you laughed until your ribs ached under the sun.
Drink a cold glass of water. Step away from the glowing screen. Put on that wool blanket. The world can wait for an hour.
I believe in you with every fiber of my being.`
  },
  {
    id: 'capsule-2',
    title: 'Grounding Wire for When Racing Thoughts Take Over',
    authorMood: 'Deep Serenity',
    createdDate: '2026-11-08',
    triggerCondition: 'overwhelm', // triggers on overwhelm / anxiety
    autoDeliverOnHighRisk: true,
    unlockedCount: 1,
    message: `Stop. Drop your shoulders down from your ears. Unclench your jaw.
The spiral in your mind is trying to solve tomorrow's problems with today's exhausted energy.
You do not have to conquer the whole mountain tonight; you only have to take off your shoes and rest.
Everything that feels like an emergency right now will look completely different in tomorrow's morning light.
Be gentle with yourself. You are doing so much better than you give yourself credit for.`
  },
  {
    id: 'capsule-3',
    title: 'Permission Slip to Rest Without Guilt',
    authorMood: 'Cosmic Resonance',
    createdDate: '2026-11-10',
    triggerCondition: 'fatigue', // triggers on fatigue
    autoDeliverOnHighRisk: false,
    unlockedCount: 0,
    message: `Your worth is not measured by your output today.
Rest is not a reward you have to earn after collapsing; rest is the foundation that keeps your soul alive.
Close your eyes, play the rain ambient sound, and let yourself float.`
  }
];

// Helper to generate seed history entries spanning the past 12 days
const generateSeedEntries = () => {
  const now = new Date();
  const entries = [];
  const presets = [
    { mood: 'serenity', meta: VISUAL_METAPHORS[3], val: 65, aro: 30, note: 'Walking through wet pine trees early morning. Utter tranquility.' },
    { mood: 'joy', meta: VISUAL_METAPHORS[2], val: 85, aro: 80, note: 'Finished major milestone. Sunlight streaming across the table.' },
    { mood: 'focus', meta: VISUAL_METAPHORS[0], val: 60, aro: 55, note: 'Deep coding flow with cosmic soundtrack.' },
    { mood: 'melancholy', meta: VISUAL_METAPHORS[1], val: -40, aro: 35, note: 'Quiet rain outside, feeling a subtle nostalgic weight.' },
    { mood: 'overwhelm', meta: VISUAL_METAPHORS[4], val: -70, aro: 88, note: 'Multiple cascading deadlines. Felt like standing in a storm.' },
    { mood: 'serenity', meta: VISUAL_METAPHORS[7], val: 75, aro: 25, note: 'Evening tea watching the sunset melt into twilight.' },
    { mood: 'fatigue', meta: VISUAL_METAPHORS[5], val: -25, aro: 20, note: 'Late night mental exhaustion, longing for restorative sleep.' },
    { mood: 'joy', meta: VISUAL_METAPHORS[6], val: 80, aro: 70, note: 'Fresh coffee and sweet conversations with old friends.' },
    { mood: 'focus', meta: VISUAL_METAPHORS[0], val: 70, aro: 65, note: 'Solitary evening breakthrough in architecture.' },
    { mood: 'melancholy', meta: VISUAL_METAPHORS[1], val: -50, aro: 30, note: 'Grey Sunday evening. Needed warmth.' }
  ];

  for (let i = presets.length - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 1.15 * 24 * 60 * 60 * 1000);
    const p = presets[presets.length - 1 - i];
    entries.push({
      id: `entry-${Date.now() - i * 86400000}`,
      timestamp: d.toISOString(),
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      moodId: p.mood,
      archetypeTitle: p.meta.title,
      imageUrl: p.meta.imageUrl,
      valence: p.val,
      arousal: p.aro,
      note: p.note,
      tags: p.meta.tags,
      source: i % 3 === 0 ? 'Mood Mirror (Face Scan)' : 'Visual Metaphor Log'
    });
  }

  return entries;
};

const STORAGE_KEYS = {
  ENTRIES: 'moodverse_entries_v1',
  CAPSULES: 'moodverse_capsules_v1',
  LEXICON: 'moodverse_lexicon_v1'
};

export const getStoredEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) {
      const initial = generateSeedEntries();
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return generateSeedEntries();
  }
};

export const saveEntry = (newEntry) => {
  const current = getStoredEntries();
  const updated = [newEntry, ...current];
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updated));
  return updated;
};

export const deleteEntry = (id) => {
  const current = getStoredEntries();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updated));
  return updated;
};

export const getStoredCapsules = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAPSULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(INITIAL_RESCUE_CAPSULES));
      return INITIAL_RESCUE_CAPSULES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_RESCUE_CAPSULES;
  }
};

export const saveCapsule = (capsule) => {
  const current = getStoredCapsules();
  const updated = [capsule, ...current];
  localStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(updated));
  return updated;
};

export const markCapsuleUnlocked = (id) => {
  const current = getStoredCapsules();
  const updated = current.map(c => c.id === id ? { ...c, unlockedCount: (c.unlockedCount || 0) + 1, lastUnlocked: new Date().toISOString() } : c);
  localStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(updated));
  return updated;
};

export const getStoredLexicon = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEXICON);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEXICON, JSON.stringify(INITIAL_LEXICON));
      return INITIAL_LEXICON;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_LEXICON;
  }
};

export const updateLexiconItem = (updatedItem) => {
  const current = getStoredLexicon();
  const next = current.map(item => item.id === updatedItem.id ? updatedItem : item);
  localStorage.setItem(STORAGE_KEYS.LEXICON, JSON.stringify(next));
  return next;
};

// Advanced Mood Forecaster & Difficult Day Prediction Model
export const predictDifficultDays = (entries = []) => {
  // If no entries, compute with standard baseline
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const forecast = [];

  // 1. Analyze historical day-of-week dips from entries
  const dayBuckets = {};
  for (let i = 0; i < 7; i++) {
    dayBuckets[i] = { valences: [], arousals: [] };
  }

  entries.forEach(e => {
    const d = new Date(e.timestamp);
    const day = d.getDay();
    if (!isNaN(day)) {
      dayBuckets[day].valences.push(e.valence);
      dayBuckets[day].arousals.push(e.arousal);
    }
  });

  // 2. Velocity: calculate recent 3-entry trend
  let velocity = 0;
  if (entries.length >= 3) {
    const recent = entries.slice(0, 3);
    const val0 = recent[0].valence;
    const val2 = recent[2].valence;
    velocity = (val0 - val2) / 2; // negative means deteriorating
  }

  // 3. Project for the next 7 days starting tomorrow
  for (let step = 1; step <= 7; step++) {
    const targetDate = new Date(today.getTime() + step * 24 * 60 * 60 * 1000);
    const targetDayIndex = targetDate.getDay();
    const dayName = daysOfWeek[targetDayIndex];
    const isWeekend = targetDayIndex === 0 || targetDayIndex === 6;

    // Baseline historical dip
    const bucket = dayBuckets[targetDayIndex];
    let avgValence = bucket.valences.length > 0
      ? bucket.valences.reduce((a, b) => a + b, 0) / bucket.valences.length
      : (isWeekend ? 45 : 15);

    // Apply midweek burnout curve (Wednesday / Thursday typically higher stress)
    if (targetDayIndex === 3 || targetDayIndex === 4) {
      avgValence -= 25;
    }

    // Blend with recent velocity decay
    const projectedValence = Math.round(avgValence + (velocity * Math.max(0, (4 - step) / 4)));

    // Risk calculation: low valence (< 0) & high arousal => risk of distress; low valence & low arousal => risk of apathy/burnout
    let riskScore = 0;
    let riskLevel = 'Low';
    let riskReason = 'Stable emotional equilibrium expected.';
    let protectiveShield = 'Ideal window for creative ventures and social connection.';

    if (projectedValence < -30) {
      riskScore = Math.min(94, Math.round(75 + Math.abs(projectedValence) * 0.2));
      riskLevel = 'Elevated Risk';
      riskReason = `Predicted mid-week cognitive overload & emotional exhaustion drop (${riskScore}% probability).`;
      protectiveShield = 'Pre-arm your Rescue Note capsule. Schedule a 20-minute digital blackout at twilight.';
    } else if (projectedValence < 5) {
      riskScore = Math.min(65, Math.round(45 + Math.abs(projectedValence) * 0.4));
      riskLevel = 'Moderate Caution';
      riskReason = 'Subtle energy dip and contemplative melancholy trend.';
      protectiveShield = 'Plan warm soothing meals and avoid scheduling high-friction meetings.';
    } else {
      riskScore = Math.max(12, Math.round(30 - projectedValence * 0.2));
      riskLevel = 'Resilient Flow';
      riskReason = 'High emotional clarity and restorative headspace.';
      protectiveShield = 'Write a new Rescue Capsule to capture your grounded wisdom.';
    }

    forecast.push({
      dateStr: targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      dayName,
      riskScore,
      riskLevel,
      projectedValence,
      riskReason,
      protectiveShield,
      isHighRisk: riskScore >= 68
    });
  }

  // Summary statistics
  const highestRiskDay = [...forecast].sort((a, b) => b.riskScore - a.riskScore)[0];

  return {
    forecast,
    highestRiskDay,
    overallTrajectory: velocity < -5 ? 'Downward dip approaching' : velocity > 5 ? 'Upward brightening' : 'Steady serene orbit',
    preemptiveShieldArmed: true
  };
};
