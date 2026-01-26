import type { Mood, MoodMapping } from '../types/music';

// Mood mappings with progression suggestions
export const MOOD_MAPPINGS: MoodMapping[] = [
  {
    mood: 'happy',
    preferredMode: 'major',
    suggestedProgressions: [
      ['I', 'V', 'vi', 'IV'],      // Pop progression
      ['I', 'IV', 'V', 'I'],       // Basic cadence
      ['I', 'ii', 'IV', 'V'],      // Pre-dominant approach
      ['I', 'IV', 'I', 'V'],       // Simple and bright
    ],
    borrowedChords: [],
    tempo: { min: 100, max: 140 },
    description: 'Bright, uplifting, and cheerful'
  },
  {
    mood: 'sad',
    preferredMode: 'minor',
    suggestedProgressions: [
      ['i', 'VI', 'III', 'VII'],   // Andalusian-like
      ['i', 'iv', 'i', 'V'],       // Classic minor
      ['i', 'VII', 'VI', 'VII'],   // Descending feel
      ['i', 'iv', 'VII', 'III'],   // Emotional minor
    ],
    borrowedChords: ['iv', 'VI'],
    tempo: { min: 60, max: 90 },
    description: 'Melancholic, sorrowful, and reflective'
  },
  {
    mood: 'epic',
    preferredMode: 'minor',
    suggestedProgressions: [
      ['i', 'VII', 'VI', 'VII'],   // Cinematic
      ['i', 'III', 'VII', 'VI'],   // Building tension
      ['VI', 'VII', 'i', 'i'],     // Heroic arrival
      ['i', 'iv', 'VII', 'i'],     // Power progression
    ],
    borrowedChords: ['VII', 'III', 'VI'],
    tempo: { min: 70, max: 100 },
    description: 'Grand, cinematic, and powerful'
  },
  {
    mood: 'dreamy',
    preferredMode: 'major',
    suggestedProgressions: [
      ['I', 'iii', 'IV', 'I'],     // Ethereal
      ['I', 'vi', 'ii', 'IV'],     // Floating feel
      ['I', 'V', 'vi', 'iii'],     // Gentle descent
      ['IV', 'I', 'V', 'vi'],      // Suspended feeling
    ],
    borrowedChords: ['bVII', 'iv'],
    tempo: { min: 65, max: 85 },
    description: 'Ethereal, floating, and atmospheric'
  },
  {
    mood: 'tense',
    preferredMode: 'minor',
    suggestedProgressions: [
      ['i', 'bII', 'V', 'i'],      // Phrygian touch
      ['i', 'iv', 'bVI', 'V'],     // Unresolved
      ['i', 'i', 'iv', 'V'],       // Building
      ['i', 'bVII', 'bVI', 'V'],   // Descending chromatic feel
    ],
    borrowedChords: ['bII', 'bVI', 'V'],
    tempo: { min: 80, max: 120 },
    description: 'Suspenseful, anxious, and uneasy'
  },
  {
    mood: 'hopeful',
    preferredMode: 'major',
    suggestedProgressions: [
      ['I', 'V', 'vi', 'iii', 'IV'], // Extended emotional
      ['vi', 'IV', 'I', 'V'],        // Minor start, major resolve
      ['I', 'IV', 'vi', 'V'],        // Uplifting
      ['ii', 'V', 'I', 'IV'],        // Jazz-influenced bright
    ],
    borrowedChords: [],
    tempo: { min: 85, max: 115 },
    description: 'Optimistic, inspiring, and uplifting'
  },
  {
    mood: 'melancholic',
    preferredMode: 'minor',
    suggestedProgressions: [
      ['i', 'iv', 'VII', 'III'],   // Wistful
      ['i', 'VI', 'iv', 'V'],      // Bittersweet
      ['i', 'III', 'iv', 'iv'],    // Lingering sadness
      ['vi', 'IV', 'I', 'V'],      // Major with minor tinge
    ],
    borrowedChords: ['iv'],
    tempo: { min: 55, max: 80 },
    description: 'Wistful, bittersweet, and nostalgic'
  },
  {
    mood: 'energetic',
    preferredMode: 'major',
    suggestedProgressions: [
      ['I', 'IV', 'V', 'V'],       // Driving
      ['I', 'I', 'IV', 'V'],       // Rock foundation
      ['I', 'bVII', 'IV', 'I'],    // Rock with borrowed chord
      ['I', 'V', 'IV', 'V'],       // Punchy
    ],
    borrowedChords: ['bVII'],
    tempo: { min: 120, max: 160 },
    description: 'High-energy, driving, and exciting'
  },
  {
    mood: 'peaceful',
    preferredMode: 'major',
    suggestedProgressions: [
      ['I', 'IV', 'I', 'IV'],      // Simple, calming
      ['I', 'vi', 'IV', 'I'],      // Gentle cycle
      ['I', 'iii', 'vi', 'IV'],    // Soft descent
      ['IV', 'I', 'IV', 'V'],      // Plagal feel
    ],
    borrowedChords: [],
    tempo: { min: 60, max: 80 },
    description: 'Calm, serene, and tranquil'
  },
  {
    mood: 'dark',
    preferredMode: 'minor',
    suggestedProgressions: [
      ['i', 'bII', 'i', 'bII'],    // Phrygian darkness
      ['i', 'bVI', 'bVII', 'i'],   // Heavy
      ['i', 'iv', 'i', 'bVI'],     // Ominous
      ['i', 'bVII', 'bVI', 'bVII'], // Doom-like
    ],
    borrowedChords: ['bII', 'bVI', 'bVII'],
    tempo: { min: 50, max: 85 },
    description: 'Ominous, heavy, and foreboding'
  },
  {
    mood: 'triumphant',
    preferredMode: 'major',
    suggestedProgressions: [
      ['I', 'V', 'vi', 'IV'],      // Victory anthem
      ['IV', 'V', 'I', 'I'],       // Strong resolution
      ['I', 'IV', 'V', 'I'],       // Classic triumph
      ['vi', 'IV', 'V', 'I'],      // Build to triumph
    ],
    borrowedChords: [],
    tempo: { min: 90, max: 130 },
    description: 'Victorious, celebratory, and majestic'
  },
];

/**
 * Get mood mapping by mood type
 */
export function getMoodMapping(mood: Mood): MoodMapping | undefined {
  return MOOD_MAPPINGS.find(m => m.mood === mood);
}

/**
 * Get all available moods
 */
export function getAllMoods(): Mood[] {
  return MOOD_MAPPINGS.map(m => m.mood);
}

/**
 * Get moods filtered by mode preference
 */
export function getMoodsByMode(mode: 'major' | 'minor'): MoodMapping[] {
  return MOOD_MAPPINGS.filter(m => m.preferredMode === mode);
}

/**
 * Suggest a default tempo for a mood
 */
export function suggestTempoForMood(mood: Mood): number {
  const mapping = getMoodMapping(mood);
  if (!mapping) return 100;
  return Math.round((mapping.tempo.min + mapping.tempo.max) / 2);
}

/**
 * Get mood description
 */
export function getMoodDescription(mood: Mood): string {
  const mapping = getMoodMapping(mood);
  return mapping?.description ?? '';
}

/**
 * Map mood to display properties (for UI)
 */
export const MOOD_DISPLAY: Record<Mood, { label: string; icon: string; color: string }> = {
  happy: { label: 'Happy', icon: '☀️', color: 'bg-yellow-500' },
  sad: { label: 'Sad', icon: '🌧️', color: 'bg-blue-500' },
  epic: { label: 'Epic', icon: '⚔️', color: 'bg-purple-600' },
  dreamy: { label: 'Dreamy', icon: '☁️', color: 'bg-indigo-400' },
  tense: { label: 'Tense', icon: '⚡', color: 'bg-red-600' },
  hopeful: { label: 'Hopeful', icon: '🌅', color: 'bg-orange-400' },
  melancholic: { label: 'Melancholic', icon: '🍂', color: 'bg-amber-700' },
  energetic: { label: 'Energetic', icon: '🔥', color: 'bg-red-500' },
  peaceful: { label: 'Peaceful', icon: '🌿', color: 'bg-green-500' },
  dark: { label: 'Dark', icon: '🌑', color: 'bg-slate-800' },
  triumphant: { label: 'Triumphant', icon: '🏆', color: 'bg-amber-500' },
};
