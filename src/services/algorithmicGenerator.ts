import { v4 as uuidv4 } from 'uuid';
import type {
  Song,
  SongSection,
  Chord,
  Key,
  CanonicalNote,
  ChordQuality,
  SectionType,
  AIGenerationRequest,
  MoodAnalysis,
  RomanNumeral,
} from '../types/music';
import {
  getDiatonicChords,
  createChord,
  getKeyId,
  getChordFunction,
} from '../utils/musicTheory';

// ============================================================================
// MOOD ANALYSIS - Comprehensive Natural Language Interpretation
// ============================================================================

// MoodAnalysis interface is now imported from types/music.ts

// ============================================================================
// COMPREHENSIVE KEYWORD DATABASE
// ============================================================================

// Musical trait presets for reuse
const TRAITS = {
  // Mode presets
  majorMode: { preferredMode: 'major' as const },
  minorMode: { preferredMode: 'minor' as const },

  // Energy presets
  lowEnergy: { energy: 'low' as const },
  mediumEnergy: { energy: 'medium' as const },
  highEnergy: { energy: 'high' as const },

  // Tension presets
  lowTension: { tension: 'low' as const },
  mediumTension: { tension: 'medium' as const },
  highTension: { tension: 'high' as const },

  // Brightness presets
  dark: { brightness: 'dark' as const },
  neutral: { brightness: 'neutral' as const },
  bright: { brightness: 'bright' as const },

  // Chord complexity presets
  jazzy: { useSevenths: true, useBorrowedChords: true },
  simple: { useSevenths: false, useBorrowedChords: false },
  colorful: { useBorrowedChords: true },
  suspended: { useSuspensions: true },
  extended: { useSevenths: true },
  inversions: { useInversions: true },
  pedalBass: { pedalBassChance: 0.4 },
  smoothBass: { useInversions: true, pedalBassChance: 0.2 },

  // Tempo presets
  verySlow: { tempoRange: { min: 40, max: 60 } },
  slow: { tempoRange: { min: 55, max: 80 } },
  moderate: { tempoRange: { min: 75, max: 105 } },
  medium: { tempoRange: { min: 95, max: 125 } },
  fast: { tempoRange: { min: 120, max: 150 } },
  veryFast: { tempoRange: { min: 145, max: 180 } },
};

// Comprehensive keywords mapped to mood characteristics
const MOOD_KEYWORDS: Record<string, Partial<MoodAnalysis>> = {
  // =========================================================================
  // EMOTIONS - SAD / MELANCHOLIC / DOWN
  // =========================================================================
  sad: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.slow },
  sadness: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.slow },
  melancholy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.extended },
  melancholic: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.extended },
  depressed: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  depressing: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  depression: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  lonely: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension },
  loneliness: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension },
  alone: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension },
  isolated: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  heartbreak: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.extended },
  heartbroken: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.extended },
  heartache: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.extended },
  grief: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  grieving: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  sorrow: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  sorrowful: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  mournful: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  mourning: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  tearful: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  tears: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  crying: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  weeping: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  somber: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  gloomy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  gloom: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  bleak: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  despair: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  despairing: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  hopeless: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  hopelessness: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  miserable: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  misery: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  unhappy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  dejected: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  downcast: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  downhearted: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  crestfallen: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  dismal: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  forlorn: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  desolate: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  woeful: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  woe: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  anguish: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  anguished: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  hurt: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  hurting: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  pain: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  painful: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  suffering: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  torment: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  tormented: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  broken: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  shattered: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  devastated: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  crushed: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  empty: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.suspended },
  emptiness: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.suspended },
  hollow: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  numb: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  lost: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension },
  abandoned: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  forsaken: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  rejected: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  betrayed: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },

  // =========================================================================
  // EMOTIONS - HAPPY / JOYFUL / UPLIFTING
  // =========================================================================
  happy: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  happiness: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  joyful: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  joy: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  joyous: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  cheerful: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  cheery: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  uplifting: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  upbeat: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  elated: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  elation: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  ecstatic: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  ecstasy: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  euphoric: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  euphoria: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  blissful: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  bliss: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  delighted: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  delight: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  delightful: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  gleeful: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  glee: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  merry: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  jolly: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  jovial: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  festive: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  celebratory: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  celebration: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  exuberant: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  vibrant: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  lively: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  bubbly: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  playful: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  fun: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  funny: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  carefree: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  lighthearted: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  optimistic: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  hopeful: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  hope: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  positive: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  radiant: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  beaming: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  smiling: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  laughing: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  sunshine: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  sunny: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  bright: { ...TRAITS.majorMode, ...TRAITS.bright },
  golden: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  warm: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  warmth: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  content: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright, ...TRAITS.lowTension },
  contentment: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright, ...TRAITS.lowTension },
  satisfied: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  pleased: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  grateful: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  gratitude: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  thankful: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  blessed: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  lucky: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  fortunate: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  wonderful: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  amazing: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  fantastic: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  great: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  good: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  nice: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  lovely: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  beautiful: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },

  // =========================================================================
  // EMOTIONS - ANGRY / AGGRESSIVE
  // =========================================================================
  angry: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.fast },
  anger: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.fast },
  furious: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.veryFast },
  fury: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.veryFast },
  enraged: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.veryFast },
  rage: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.veryFast },
  raging: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.veryFast },
  mad: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  livid: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  outraged: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  hostile: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  aggressive: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.fast },
  aggression: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.fast },
  violent: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.veryFast },
  fierce: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  ferocious: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  brutal: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  savage: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  rebellious: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  defiant: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  bitter: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  resentful: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  resentment: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  frustrated: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  frustration: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  annoyed: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  irritated: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  vengeful: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  revenge: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  hateful: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  hatred: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },

  // =========================================================================
  // EMOTIONS - FEAR / ANXIETY / TENSION
  // =========================================================================
  afraid: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  fear: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  fearful: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  scared: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  scary: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  terrified: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  terrifying: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  terror: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  horror: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  horrifying: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  creepy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  eerie: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  spooky: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  haunting: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.mediumTension, ...TRAITS.extended },
  haunted: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  ghostly: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.suspended },
  anxious: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension },
  anxiety: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension },
  nervous: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension },
  worried: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension },
  worry: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension },
  uneasy: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension },
  restless: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension },
  tense: { ...TRAITS.minorMode, ...TRAITS.highTension, ...TRAITS.colorful },
  tension: { ...TRAITS.minorMode, ...TRAITS.highTension, ...TRAITS.colorful },
  suspense: { ...TRAITS.minorMode, ...TRAITS.highTension, ...TRAITS.lowEnergy },
  suspenseful: { ...TRAITS.minorMode, ...TRAITS.highTension, ...TRAITS.lowEnergy },
  thriller: { ...TRAITS.minorMode, ...TRAITS.highTension, ...TRAITS.mediumEnergy },
  paranoid: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  paranoia: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  dread: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  dreading: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  foreboding: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  ominous: { ...TRAITS.minorMode, ...TRAITS.dark, ...TRAITS.highTension, ...TRAITS.lowEnergy },
  menacing: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  threatening: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  sinister: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.highTension },

  // =========================================================================
  // EMOTIONS - PEACEFUL / CALM / RELAXED
  // =========================================================================
  peaceful: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  peace: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  calm: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  calming: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  tranquil: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  tranquility: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  serene: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  serenity: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  relaxed: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  relaxing: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  chill: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.moderate },
  chilled: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  chillout: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  mellow: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.extended },
  soothing: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  gentle: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  soft: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  quiet: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  silent: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  stillness: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  still: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  meditative: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow, ...TRAITS.suspended },
  meditation: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow, ...TRAITS.suspended },
  zen: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  mindful: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  restful: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  sleepy: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  drowsy: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  lullaby: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  dreamy: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.neutral, ...TRAITS.extended, ...TRAITS.suspended, ...TRAITS.smoothBass },
  dreamlike: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.neutral, ...TRAITS.extended, ...TRAITS.suspended, ...TRAITS.smoothBass },
  hazy: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.neutral, ...TRAITS.suspended },
  lazy: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow },
  easy: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  easygoing: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  laidback: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },

  // =========================================================================
  // EMOTIONS - ROMANTIC / LOVE
  // =========================================================================
  romantic: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.slow },
  romance: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.slow },
  love: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  loving: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  inlove: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  passionate: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.mediumTension, ...TRAITS.extended },
  passion: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.mediumTension, ...TRAITS.extended },
  tender: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  tenderness: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  affectionate: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  affection: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  intimate: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.extended },
  intimacy: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.extended },
  sensual: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension, ...TRAITS.extended },
  sexy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension, ...TRAITS.extended },
  seductive: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension, ...TRAITS.extended },
  longing: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension, ...TRAITS.extended },
  yearning: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension, ...TRAITS.extended },
  desire: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.mediumTension },
  devotion: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  adoring: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  cherish: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  sweetheart: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  sweet: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  crush: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  flirty: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  heartfelt: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  soulmate: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright, ...TRAITS.extended },
  wedding: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },

  // =========================================================================
  // EMOTIONS - NOSTALGIC / REFLECTIVE / CONTEMPLATIVE
  // =========================================================================
  nostalgic: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.colorful },
  nostalgia: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.colorful },
  memories: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  memory: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  remembering: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  reminiscent: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  reminiscing: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  reflective: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  reflection: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  contemplative: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  contemplation: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  thoughtful: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  pensive: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  introspective: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  bittersweet: { ...TRAITS.colorful, ...TRAITS.extended },
  wistful: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  sentimental: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  lonesome: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  homesick: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  vintage: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  retro: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  oldschool: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  classic: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  timeless: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  throwback: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },

  // =========================================================================
  // EMOTIONS - EPIC / POWERFUL / TRIUMPHANT
  // =========================================================================
  epic: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.colorful },
  powerful: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  power: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  triumphant: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  triumph: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  victorious: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  victory: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  heroic: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.colorful },
  hero: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.colorful },
  majestic: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.colorful },
  grandiose: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.colorful },
  grand: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.colorful },
  glorious: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  glory: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  magnificent: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.colorful },
  mighty: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  anthemic: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  anthem: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  soaring: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  uplifted: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  inspiring: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  inspirational: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  motivation: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  motivational: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  empowering: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  determined: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  determination: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  confident: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  confidence: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  bold: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  brave: { ...TRAITS.majorMode, ...TRAITS.highEnergy },
  courageous: { ...TRAITS.majorMode, ...TRAITS.highEnergy },
  fearless: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  strong: { ...TRAITS.majorMode, ...TRAITS.highEnergy },
  strength: { ...TRAITS.majorMode, ...TRAITS.highEnergy },
  warrior: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  battle: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  fight: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  fighting: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  conquer: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },

  // =========================================================================
  // EMOTIONS - MYSTERIOUS / ETHEREAL / OTHERWORLDLY
  // =========================================================================
  mysterious: { ...TRAITS.minorMode, ...TRAITS.mediumTension, ...TRAITS.extended },
  mystery: { ...TRAITS.minorMode, ...TRAITS.mediumTension, ...TRAITS.extended },
  enigmatic: { ...TRAITS.minorMode, ...TRAITS.mediumTension, ...TRAITS.extended },
  enigma: { ...TRAITS.minorMode, ...TRAITS.mediumTension, ...TRAITS.extended },
  ethereal: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended, ...TRAITS.inversions },
  otherworldly: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended },
  celestial: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.bright },
  heavenly: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  angelic: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  divine: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  spiritual: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  sacred: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  mystical: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  magical: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  magic: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  enchanting: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  enchanted: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  fairytale: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  fantasy: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  whimsical: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  surreal: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended },
  psychedelic: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended, ...TRAITS.colorful },
  trippy: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended, ...TRAITS.colorful },
  hypnotic: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.mediumTension },
  cosmic: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended },
  space: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended },
  spacey: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended },
  galactic: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  alien: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  underwater: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.suspended },
  floating: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  weightless: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.suspended },
  ambient: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.extended, ...TRAITS.inversions },
  atmospheric: { ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.smoothBass },
  cinematic: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.colorful, ...TRAITS.extended, ...TRAITS.pedalBass },
  filmscore: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.colorful, ...TRAITS.extended, ...TRAITS.pedalBass },
  soundtrack: { ...TRAITS.mediumEnergy, ...TRAITS.colorful },

  // =========================================================================
  // EMOTIONS - DARK / MOODY / BROODING
  // =========================================================================
  dark: { ...TRAITS.minorMode, ...TRAITS.dark, ...TRAITS.colorful },
  darkness: { ...TRAITS.minorMode, ...TRAITS.dark, ...TRAITS.colorful },
  moody: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  brooding: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  shadowy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  shadows: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  noir: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.extended },
  gothic: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  macabre: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  morbid: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  grim: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  cold: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  frozen: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  icy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  nocturnal: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  stormy: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.dark, ...TRAITS.highTension },
  cloudy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  overcast: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  grey: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  gray: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },

  // =========================================================================
  // ENERGETIC / DRIVING / INTENSE
  // =========================================================================
  energetic: { ...TRAITS.highEnergy, ...TRAITS.fast },
  energy: { ...TRAITS.highEnergy, ...TRAITS.fast },
  intense: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  intensity: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  driving: { ...TRAITS.highEnergy, ...TRAITS.fast },
  pumping: { ...TRAITS.highEnergy, ...TRAITS.fast },
  pulsing: { ...TRAITS.highEnergy, ...TRAITS.mediumTension },
  pounding: { ...TRAITS.highEnergy, ...TRAITS.fast },
  explosive: { ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.veryFast },
  electric: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  electrifying: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  thrilling: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  exciting: { ...TRAITS.highEnergy, ...TRAITS.bright },
  excitement: { ...TRAITS.highEnergy, ...TRAITS.bright },
  adrenaline: { ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.fast },
  rush: { ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.fast },
  wild: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  crazy: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  frantic: { ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.veryFast },
  frenetic: { ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.veryFast },
  chaotic: { ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.colorful },
  unstoppable: { ...TRAITS.highEnergy, ...TRAITS.highTension },
  relentless: { ...TRAITS.highEnergy, ...TRAITS.highTension },

  // =========================================================================
  // GENRES - ROCK / METAL / PUNK
  // =========================================================================
  rock: { ...TRAITS.highEnergy, ...TRAITS.fast },
  rocknroll: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  hardrock: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  softrock: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  indierock: { ...TRAITS.mediumEnergy },
  altrock: { ...TRAITS.mediumEnergy },
  alternative: { ...TRAITS.mediumEnergy },
  grunge: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  metal: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.dark },
  heavymetal: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.dark },
  deathmetal: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.dark, ...TRAITS.veryFast },
  blackmetal: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.dark, ...TRAITS.veryFast },
  thrashmetal: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.veryFast },
  doom: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  doommetal: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.verySlow },
  sludge: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark, ...TRAITS.slow },
  stoner: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.slow },
  punk: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  punkrock: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  hardcore: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension, ...TRAITS.veryFast },
  postpunk: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  emo: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  screamo: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  metalcore: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },

  // =========================================================================
  // GENRES - POP / DANCE / ELECTRONIC
  // =========================================================================
  pop: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  poppy: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  synthpop: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  electropop: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  indiepop: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  dreampop: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended },
  dance: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  disco: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright, ...TRAITS.fast },
  funk: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.extended },
  funky: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.extended },
  groovy: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  groove: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  edm: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  electronic: { ...TRAITS.mediumEnergy },
  electronica: { ...TRAITS.mediumEnergy },
  techno: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  house: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  deephouse: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  trance: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.mediumTension },
  dubstep: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  dnb: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.veryFast },
  drumandbass: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.veryFast },
  breakbeat: { ...TRAITS.mediumEnergy, ...TRAITS.fast },
  idm: { ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.colorful },
  glitch: { ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.colorful },
  synthwave: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  retrowave: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  vaporwave: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  chillwave: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  lofi: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.slow },
  chillhop: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },

  // =========================================================================
  // GENRES - JAZZ / BLUES / SOUL
  // =========================================================================
  jazz: { ...TRAITS.extended, ...TRAITS.colorful },
  jazzy: { ...TRAITS.extended, ...TRAITS.colorful },
  smoothjazz: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  cooljazz: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  bebop: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.extended, ...TRAITS.fast },
  swing: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  bigband: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.extended },
  fusion: { ...TRAITS.extended, ...TRAITS.colorful },
  jazzfusion: { ...TRAITS.extended, ...TRAITS.colorful },
  blues: { ...TRAITS.majorMode, ...TRAITS.extended, ...TRAITS.slow },
  bluesy: { ...TRAITS.majorMode, ...TRAITS.extended },
  rhythm: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  rnb: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  soul: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  soulful: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  motown: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  gospel: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  neosoul: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },

  // =========================================================================
  // GENRES - FOLK / COUNTRY / ACOUSTIC
  // =========================================================================
  folk: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  folky: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  folkrock: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  indiefolk: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  americana: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  country: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  countryrock: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  bluegrass: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  acoustic: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  unplugged: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  singer: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  songwriter: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  campfire: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },

  // =========================================================================
  // GENRES - CLASSICAL / ORCHESTRAL
  // =========================================================================
  classical: { ...TRAITS.extended, ...TRAITS.colorful },
  orchestral: { ...TRAITS.extended, ...TRAITS.colorful },
  symphony: { ...TRAITS.extended, ...TRAITS.colorful },
  symphonic: { ...TRAITS.extended, ...TRAITS.colorful },
  chamber: { ...TRAITS.lowEnergy, ...TRAITS.extended },
  baroque: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.extended },
  romanticera: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  romanticism: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  impressionist: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.colorful },
  minimalist: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  neoclassical: { ...TRAITS.extended, ...TRAITS.colorful },
  contemporary: { ...TRAITS.extended },
  avantgarde: { ...TRAITS.extended, ...TRAITS.colorful },
  experimental: { ...TRAITS.extended, ...TRAITS.colorful },

  // =========================================================================
  // GENRES - WORLD / ETHNIC / REGIONAL
  // =========================================================================
  world: { ...TRAITS.extended },
  latin: { ...TRAITS.majorMode, ...TRAITS.highEnergy },
  salsa: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  bossa: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  bossanova: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended },
  samba: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  reggae: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  ska: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  dub: { ...TRAITS.minorMode, ...TRAITS.lowEnergy },
  caribbean: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  tropical: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  african: { ...TRAITS.majorMode, ...TRAITS.highEnergy },
  afrobeat: { ...TRAITS.majorMode, ...TRAITS.highEnergy },
  celtic: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  irish: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  scottish: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  flamenco: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  gypsy: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.colorful },
  eastern: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  middleeastern: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  arabic: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  indian: { ...TRAITS.mediumEnergy },
  asian: { ...TRAITS.mediumEnergy },
  japanese: { ...TRAITS.lowEnergy },
  chinese: { ...TRAITS.mediumEnergy },
  korean: { ...TRAITS.mediumEnergy },

  // =========================================================================
  // GENRES - HIP HOP / RAP
  // =========================================================================
  hiphop: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  rap: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  trap: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  boom: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  bap: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  boombap: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  oldschoolhiphop: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  gangsta: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.dark },
  underground: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },

  // =========================================================================
  // TIME OF DAY / SEASONS
  // =========================================================================
  morning: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  sunrise: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  dawn: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  afternoon: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  evening: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.neutral },
  sunset: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.neutral, ...TRAITS.extended },
  dusk: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  twilight: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark, ...TRAITS.extended },
  night: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  nighttime: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  midnight: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  latenight: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },
  spring: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  summer: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  autumn: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.neutral },
  fall: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.neutral },
  winter: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark },

  // =========================================================================
  // ACTIVITIES / CONTEXTS
  // =========================================================================
  workout: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  gym: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  running: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  jogging: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.fast },
  exercise: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  sports: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  roadtrip: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  travel: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  adventure: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  party: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  club: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  dancing: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast },
  studying: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  study: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  focus: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  concentration: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  working: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  work: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  reading: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  sleeping: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  sleep: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow },
  waking: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  wakeup: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  coffee: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  dinner: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  cooking: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  gaming: { ...TRAITS.mediumEnergy },
  game: { ...TRAITS.mediumEnergy },

  // =========================================================================
  // NATURE / ENVIRONMENT
  // =========================================================================
  nature: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  forest: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  woods: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  trees: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  mountain: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  mountains: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  ocean: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.suspended },
  sea: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.suspended },
  beach: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright },
  waves: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.suspended },
  river: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  lake: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension },
  rain: { ...TRAITS.minorMode, ...TRAITS.lowEnergy },
  rainy: { ...TRAITS.minorMode, ...TRAITS.lowEnergy },
  storm: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  thunder: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension },
  wind: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy },
  windy: { ...TRAITS.mediumEnergy },
  sky: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright },
  clouds: { ...TRAITS.majorMode, ...TRAITS.lowEnergy },
  stars: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.suspended },
  moon: { ...TRAITS.minorMode, ...TRAITS.lowEnergy },
  moonlight: { ...TRAITS.minorMode, ...TRAITS.lowEnergy },
  desert: { ...TRAITS.minorMode, ...TRAITS.lowEnergy },
  urban: { ...TRAITS.mediumEnergy },
  city: { ...TRAITS.mediumEnergy },
  street: { ...TRAITS.mediumEnergy },

  // =========================================================================
  // DECADES / ERAS
  // =========================================================================
  '50s': { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  '60s': { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  '70s': { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  '80s': { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  '90s': { ...TRAITS.mediumEnergy },
  '2000s': { ...TRAITS.mediumEnergy },
  '2010s': { ...TRAITS.mediumEnergy },
  fifties: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  sixties: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  seventies: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
  eighties: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright },
  nineties: { ...TRAITS.mediumEnergy },
  modern: { ...TRAITS.mediumEnergy },
  futuristic: { ...TRAITS.mediumEnergy, ...TRAITS.extended },
  oldies: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy },
};

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

// Positive sentiment words (increase positivity score)
const POSITIVE_WORDS = new Set([
  // Basic positive
  'good', 'great', 'nice', 'wonderful', 'amazing', 'awesome', 'fantastic', 'excellent',
  'beautiful', 'lovely', 'perfect', 'best', 'better', 'fine', 'pleasant', 'delightful',
  // Emotional positive
  'happy', 'joy', 'love', 'hope', 'peace', 'calm', 'bliss', 'delight', 'pleasure',
  'comfort', 'warm', 'bright', 'light', 'sweet', 'kind', 'gentle', 'soft',
  // Active positive
  'fun', 'exciting', 'thrilling', 'inspiring', 'uplifting', 'energizing', 'refreshing',
  'invigorating', 'motivating', 'empowering', 'liberating', 'freeing',
  // Success positive
  'success', 'win', 'victory', 'triumph', 'achieve', 'accomplish', 'overcome',
  'conquer', 'master', 'excel', 'thrive', 'flourish', 'prosper',
  // Social positive
  'friend', 'together', 'unity', 'harmony', 'connection', 'bond', 'community',
  'celebrate', 'party', 'festive', 'reunion', 'gathering',
]);

// Negative sentiment words (decrease positivity score)
const NEGATIVE_WORDS = new Set([
  // Basic negative
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'worse', 'poor', 'unpleasant',
  'ugly', 'nasty', 'wrong', 'broken', 'failed', 'failure',
  // Emotional negative
  'sad', 'sorrow', 'grief', 'pain', 'hurt', 'suffer', 'misery', 'despair',
  'depression', 'anxiety', 'fear', 'terror', 'horror', 'dread', 'worry',
  // Angry negative
  'angry', 'rage', 'fury', 'hate', 'hatred', 'disgust', 'bitter', 'resentment',
  'hostile', 'violent', 'aggressive', 'cruel', 'harsh', 'brutal',
  // Loss negative
  'loss', 'lost', 'gone', 'dead', 'death', 'dying', 'end', 'ending', 'over',
  'empty', 'hollow', 'void', 'nothing', 'nowhere', 'alone', 'lonely',
  // Dark negative
  'dark', 'darkness', 'shadow', 'black', 'bleak', 'grim', 'gloomy', 'dreary',
  'cold', 'frozen', 'icy', 'numb',
]);

// Intensity modifiers
const INTENSITY_AMPLIFIERS = new Set([
  'very', 'really', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely',
  'utterly', 'deeply', 'intensely', 'profoundly', 'overwhelmingly', 'exceptionally',
  'remarkably', 'extraordinarily', 'tremendously', 'immensely', 'hugely', 'massively',
  'super', 'ultra', 'mega', 'hyper', 'most', 'so', 'such',
]);

const INTENSITY_DIMINISHERS = new Set([
  'slightly', 'somewhat', 'a bit', 'a little', 'kind of', 'sort of', 'rather',
  'fairly', 'moderately', 'mildly', 'gently', 'softly', 'subtly', 'quietly',
  'barely', 'hardly', 'almost', 'nearly', 'partly', 'partially',
]);

// Negation words
const NEGATION_WORDS = new Set([
  'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere', 'none',
  'without', 'lacking', 'absent', 'missing', 'devoid', "don't", "doesn't",
  "didn't", "won't", "wouldn't", "couldn't", "shouldn't", "can't", "cannot",
  "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't",
]);

// ============================================================================
// PHRASE PATTERNS
// ============================================================================

interface PhrasePattern {
  pattern: RegExp;
  traits: Partial<MoodAnalysis>;
}

const PHRASE_PATTERNS: PhrasePattern[] = [
  // "feels like" patterns
  { pattern: /feels?\s+like\s+(?:a\s+)?summer/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright } },
  { pattern: /feels?\s+like\s+(?:a\s+)?winter/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /feels?\s+like\s+(?:a\s+)?spring/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /feels?\s+like\s+(?:a\s+)?fall|autumn/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /feels?\s+like\s+(?:a\s+)?dream/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.suspended } },
  { pattern: /feels?\s+like\s+flying/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /feels?\s+like\s+falling/i, traits: { ...TRAITS.minorMode, ...TRAITS.mediumEnergy, ...TRAITS.highTension } },
  { pattern: /feels?\s+like\s+home/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /feels?\s+like\s+(?:a\s+)?goodbye/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /feels?\s+like\s+(?:a\s+)?party/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast } },
  { pattern: /feels?\s+like\s+(?:the\s+)?end/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /feels?\s+like\s+(?:a\s+)?beginning/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /feels?\s+like\s+rain/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /feels?\s+like\s+sunshine/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },

  // "sounds of" patterns
  { pattern: /sounds?\s+of\s+(?:the\s+)?ocean|sea|waves/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.suspended } },
  { pattern: /sounds?\s+of\s+(?:the\s+)?city/i, traits: { ...TRAITS.mediumEnergy } },
  { pattern: /sounds?\s+of\s+(?:the\s+)?forest|nature/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /sounds?\s+of\s+(?:the\s+)?night/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /sounds?\s+of\s+silence/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow } },
  { pattern: /sounds?\s+of\s+(?:the\s+)?rain/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /sounds?\s+of\s+(?:the\s+)?storm/i, traits: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension } },

  // "vibes" patterns
  { pattern: /summer\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright } },
  { pattern: /chill\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /good\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /bad\s+vibes?/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /dark\s+vibes?/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /sad\s+vibes?/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /happy\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright } },
  { pattern: /party\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast } },
  { pattern: /beach\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright } },
  { pattern: /city\s+vibes?/i, traits: { ...TRAITS.mediumEnergy } },
  { pattern: /night\s+vibes?/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /retro\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy } },
  { pattern: /vintage\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy } },
  { pattern: /80s?\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.bright } },
  { pattern: /90s?\s+vibes?/i, traits: { ...TRAITS.mediumEnergy } },
  { pattern: /lofi\s+vibes?/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.extended, ...TRAITS.slow } },
  { pattern: /jazz\s*y?\s+vibes?/i, traits: { ...TRAITS.extended, ...TRAITS.colorful } },

  // "like a" patterns
  { pattern: /like\s+a\s+movie/i, traits: { ...TRAITS.mediumEnergy, ...TRAITS.colorful } },
  { pattern: /like\s+a\s+film/i, traits: { ...TRAITS.mediumEnergy, ...TRAITS.colorful } },
  { pattern: /like\s+a\s+soundtrack/i, traits: { ...TRAITS.mediumEnergy, ...TRAITS.colorful } },
  { pattern: /like\s+a\s+lullaby/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow } },
  { pattern: /like\s+a\s+prayer/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /like\s+a\s+storm/i, traits: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension } },
  { pattern: /like\s+a\s+river/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy } },
  { pattern: /like\s+a\s+fire/i, traits: { ...TRAITS.minorMode, ...TRAITS.highEnergy, ...TRAITS.highTension } },
  { pattern: /like\s+a\s+heartbeat/i, traits: { ...TRAITS.mediumEnergy } },
  { pattern: /like\s+a\s+whisper/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },

  // Time patterns
  { pattern: /late\s+night/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /early\s+morning/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright } },
  { pattern: /golden\s+hour/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.bright } },
  { pattern: /blue\s+hour/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /rainy\s+day/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /sunny\s+day/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /lazy\s+sunday/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.slow } },
  { pattern: /monday\s+morning/i, traits: { ...TRAITS.mediumEnergy } },
  { pattern: /friday\s+night/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy } },
  { pattern: /saturday\s+night/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast } },

  // Emotional state patterns
  { pattern: /in\s+love/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /falling\s+in\s+love/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /broken\s+heart/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /heart\s*break/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy, ...TRAITS.dark } },
  { pattern: /lost\s+in\s+thought/i, traits: { ...TRAITS.lowEnergy, ...TRAITS.extended } },
  { pattern: /lost\s+love/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /new\s+beginning/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /fresh\s+start/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },
  { pattern: /letting\s+go/i, traits: { ...TRAITS.minorMode, ...TRAITS.lowEnergy } },
  { pattern: /moving\s+on/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy } },
  { pattern: /looking\s+back/i, traits: { ...TRAITS.lowEnergy, ...TRAITS.extended } },
  { pattern: /looking\s+forward/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy, ...TRAITS.bright } },

  // Activity patterns
  { pattern: /road\s+trip/i, traits: { ...TRAITS.majorMode, ...TRAITS.mediumEnergy } },
  { pattern: /long\s+drive/i, traits: { ...TRAITS.mediumEnergy } },
  { pattern: /workout\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast } },
  { pattern: /study\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /sleep\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension, ...TRAITS.verySlow } },
  { pattern: /focus\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /background\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /dinner\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.lowEnergy } },
  { pattern: /party\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast } },
  { pattern: /dance\s+music/i, traits: { ...TRAITS.majorMode, ...TRAITS.highEnergy, ...TRAITS.fast } },

  // Comparative patterns
  { pattern: /more\s+upbeat/i, traits: { ...TRAITS.highEnergy, ...TRAITS.fast } },
  { pattern: /more\s+mellow/i, traits: { ...TRAITS.lowEnergy, ...TRAITS.slow } },
  { pattern: /more\s+intense/i, traits: { ...TRAITS.highEnergy, ...TRAITS.highTension } },
  { pattern: /more\s+relaxed/i, traits: { ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /more\s+energetic/i, traits: { ...TRAITS.highEnergy } },
  { pattern: /less\s+intense/i, traits: { ...TRAITS.lowEnergy, ...TRAITS.lowTension } },
  { pattern: /less\s+energetic/i, traits: { ...TRAITS.lowEnergy } },
];

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

function analyzeMood(moodText: string): MoodAnalysis {
  const text = moodText.toLowerCase();
  const words = text.split(/\s+/);

  // Track detected keywords for educational display
  const detectedKeywords = new Set<string>();

  // Default analysis
  const analysis: MoodAnalysis = {
    preferredMode: 'major',
    energy: 'medium',
    tension: 'medium',
    brightness: 'neutral',
    tempoRange: { min: 80, max: 120 },
    useSevenths: false,
    useBorrowedChords: false,
    useSuspensions: false,
    useInversions: false,
    pedalBassChance: 0,
    preferredFunctions: ['tonic', 'subdominant', 'dominant'],
    positivity: 0,
    intensity: 0.5,
    detectedKeywords: [],
  };

  // Track matches for weighting
  let matchCount = 0;

  // =========================================================================
  // 1. PHRASE PATTERN MATCHING (highest priority - most specific)
  // =========================================================================
  for (const { pattern, traits } of PHRASE_PATTERNS) {
    if (pattern.test(text)) {
      Object.assign(analysis, traits);
      matchCount += 2; // Phrases count as 2 matches
    }
  }

  // =========================================================================
  // 2. KEYWORD MATCHING
  // =========================================================================

  // Check for negation context
  let negationActive = false;
  let lastNegationIndex = -5; // Track where negation was found

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check for negation words
    if (NEGATION_WORDS.has(word)) {
      negationActive = true;
      lastNegationIndex = i;
    }

    // Negation typically affects the next 1-3 words
    if (negationActive && i - lastNegationIndex > 3) {
      negationActive = false;
    }

    // Check for keyword matches
    if (MOOD_KEYWORDS[word]) {
      const traits = { ...MOOD_KEYWORDS[word] };
      detectedKeywords.add(word); // Track detected keyword

      // If negation is active, try to invert some traits
      if (negationActive) {
        if (traits.preferredMode === 'major') traits.preferredMode = 'minor';
        else if (traits.preferredMode === 'minor') traits.preferredMode = 'major';

        if (traits.brightness === 'bright') traits.brightness = 'dark';
        else if (traits.brightness === 'dark') traits.brightness = 'bright';

        if (traits.energy === 'high') traits.energy = 'low';
        else if (traits.energy === 'low') traits.energy = 'high';
      }

      Object.assign(analysis, traits);
      matchCount++;
    }

    // Also check for compound words and partial matches
    for (const [keyword, traits] of Object.entries(MOOD_KEYWORDS)) {
      if (keyword.length > 4 && word.includes(keyword)) {
        detectedKeywords.add(keyword); // Track detected keyword
        Object.assign(analysis, traits);
        matchCount++;
      }
    }
  }

  // =========================================================================
  // 3. SENTIMENT ANALYSIS
  // =========================================================================
  let positiveScore = 0;
  let negativeScore = 0;
  let intensityMultiplier = 1;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';

    // Check for intensity modifiers
    if (INTENSITY_AMPLIFIERS.has(word)) {
      intensityMultiplier = 1.5;
    } else if (INTENSITY_DIMINISHERS.has(word)) {
      intensityMultiplier = 0.5;
    }

    // Check for negation affecting this word
    const isNegated = i > 0 && NEGATION_WORDS.has(prevWord);

    // Score positive words
    if (POSITIVE_WORDS.has(word)) {
      if (isNegated) {
        negativeScore += intensityMultiplier;
      } else {
        positiveScore += intensityMultiplier;
      }
      intensityMultiplier = 1; // Reset after use
    }

    // Score negative words
    if (NEGATIVE_WORDS.has(word)) {
      if (isNegated) {
        positiveScore += intensityMultiplier;
      } else {
        negativeScore += intensityMultiplier;
      }
      intensityMultiplier = 1;
    }
  }

  // Calculate final positivity (-1 to 1)
  const totalSentiment = positiveScore + negativeScore;
  if (totalSentiment > 0) {
    analysis.positivity = (positiveScore - negativeScore) / totalSentiment;
  }

  // Calculate intensity (0 to 1)
  const intensityWords = words.filter(w =>
    INTENSITY_AMPLIFIERS.has(w) ||
    ['very', 'really', 'extremely', 'super', 'ultra', 'most', 'incredibly'].includes(w)
  ).length;
  analysis.intensity = Math.min(1, 0.5 + (intensityWords * 0.15));

  // =========================================================================
  // 4. APPLY SENTIMENT TO MUSICAL TRAITS
  // =========================================================================

  // If no specific keywords matched, use sentiment to guide the mood
  if (matchCount === 0) {
    if (analysis.positivity > 0.3) {
      analysis.preferredMode = 'major';
      analysis.brightness = 'bright';
    } else if (analysis.positivity < -0.3) {
      analysis.preferredMode = 'minor';
      analysis.brightness = 'dark';
    }

    // High intensity words suggest more energy
    if (analysis.intensity > 0.7) {
      analysis.energy = 'high';
      analysis.tempoRange = { min: 110, max: 150 };
    } else if (analysis.intensity < 0.3) {
      analysis.energy = 'low';
      analysis.tempoRange = { min: 60, max: 90 };
    }
  }

  // =========================================================================
  // 5. ADJUST CHORD FUNCTIONS BASED ON TENSION
  // =========================================================================
  if (analysis.tension === 'high') {
    analysis.preferredFunctions = ['dominant', 'subdominant', 'tonic'];
  } else if (analysis.tension === 'low') {
    analysis.preferredFunctions = ['tonic', 'subdominant', 'tonic'];
  }

  // =========================================================================
  // 6. FINAL ADJUSTMENTS BASED ON INTENSITY
  // =========================================================================
  if (analysis.intensity > 0.7) {
    // High intensity: faster tempos, more tension
    if (analysis.tempoRange.min < 100) {
      analysis.tempoRange = {
        min: analysis.tempoRange.min + 20,
        max: analysis.tempoRange.max + 20,
      };
    }
  }

  // Add detected keywords to the analysis
  analysis.detectedKeywords = Array.from(detectedKeywords);

  return analysis;
}

// ============================================================================
// CHORD GENERATION
// ============================================================================

// Seeded random for reproducible but varied results
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function pickRandom<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

// Get borrowed chords from parallel key
function getBorrowedChords(key: Key): Chord[] {
  const parallelKey: Key = {
    tonic: key.tonic,
    mode: key.mode === 'major' ? 'minor' : 'major',
  };
  const parallelChords = getDiatonicChords(parallelKey);

  // Return chords that aren't in the original key
  const originalChords = getDiatonicChords(key);
  const originalRoots = new Set(originalChords.map(c => `${c.root}-${c.quality}`));

  return parallelChords
    .filter(c => !originalRoots.has(`${c.root}-${c.quality}`))
    .map(c => ({ ...c, function: 'borrowed' as const }));
}

// Upgrade a chord to a 7th chord
function upgradeToSeventh(chord: Chord, keyContext: string): Chord {
  let newQuality: ChordQuality;

  switch (chord.quality) {
    case 'major':
      // V chords become dominant7, others become major7
      newQuality = chord.function === 'dominant' ? 'dominant7' : 'major7';
      break;
    case 'minor':
      newQuality = 'minor7';
      break;
    case 'diminished':
      newQuality = 'half-dim7';
      break;
    default:
      // Already a 7th chord or other quality
      return chord;
  }

  return createChord(chord.root, newQuality, chord.romanNumeral, chord.function, keyContext);
}

// Add a suspension variant
function addSuspension(chord: Chord, keyContext: string, random: () => number): Chord {
  if (chord.quality !== 'major' && chord.quality !== 'minor') return chord;

  const suspType = random() > 0.5 ? 'sus4' : 'sus2';
  return createChord(chord.root, suspType, chord.romanNumeral, chord.function, keyContext);
}

// ============================================================================
// FAMOUS NAMED PROGRESSION PATTERNS
// ============================================================================

interface NamedProgression {
  name: string;
  degrees: number[]; // 1-indexed scale degrees
  qualities: ('diatonic' | 'major' | 'minor' | 'dominant7' | 'major7' | 'minor7' | 'power' | 'diminished')[]; // 'diatonic' means use key's natural quality
  mood: ('happy' | 'sad' | 'epic' | 'nostalgic' | 'tense' | 'romantic' | 'chill' | 'energetic' | 'any')[];
  suitableFor: SectionType[];
  description: string;
}

// Classic progressions mapped to scale degrees
const NAMED_PROGRESSIONS: NamedProgression[] = [
  // Pop/Rock classics
  {
    name: 'Four Chord Song',
    degrees: [1, 5, 6, 4],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['happy', 'energetic', 'nostalgic', 'any'],
    suitableFor: ['chorus', 'verse'],
    description: 'The famous I-V-vi-IV used in countless pop hits (Axis of Awesome progression)',
  },
  {
    name: 'Sensitive Female Chord Progression',
    degrees: [6, 4, 1, 5],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['sad', 'nostalgic', 'romantic'],
    suitableFor: ['verse', 'chorus'],
    description: 'vi-IV-I-V - A slightly melancholic take on the four-chord progression',
  },
  {
    name: '50s Progression',
    degrees: [1, 6, 4, 5],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['nostalgic', 'romantic', 'happy'],
    suitableFor: ['verse', 'chorus'],
    description: 'I-vi-IV-V - Classic doo-wop and oldies progression',
  },
  {
    name: 'Pachelbel Canon',
    degrees: [1, 5, 6, 3, 4, 1, 4, 5],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['romantic', 'epic', 'nostalgic'],
    suitableFor: ['verse', 'chorus', 'bridge'],
    description: 'I-V-vi-iii-IV-I-IV-V - The timeless classical progression',
  },
  {
    name: 'Andalusian Cadence',
    degrees: [1, 7, 6, 5],
    qualities: ['minor', 'major', 'major', 'major'],
    mood: ['sad', 'tense', 'epic'],
    suitableFor: ['verse', 'bridge', 'intro'],
    description: 'i-bVII-bVI-V flamenco/rock descent with chromatic bass line',
  },
  {
    name: 'Pop-Punk',
    degrees: [1, 5, 6, 4],
    qualities: ['major', 'major', 'minor', 'major'],
    mood: ['energetic', 'happy'],
    suitableFor: ['chorus', 'verse'],
    description: 'I-V-vi-IV with driving energy',
  },

  // Jazz progressions
  {
    name: 'Jazz ii-V-I',
    degrees: [2, 5, 1],
    qualities: ['minor7', 'dominant7', 'major7'],
    mood: ['chill', 'romantic', 'any'],
    suitableFor: ['verse', 'bridge', 'outro'],
    description: 'The fundamental jazz cadence: ii7-V7-Imaj7',
  },
  {
    name: 'Jazz Turnaround',
    degrees: [1, 6, 2, 5],
    qualities: ['major7', 'minor7', 'minor7', 'dominant7'],
    mood: ['chill', 'romantic'],
    suitableFor: ['verse', 'outro', 'intro'],
    description: 'Imaj7-vi7-ii7-V7 - Classic jazz turnaround',
  },
  {
    name: 'Rhythm Changes Bridge',
    degrees: [3, 3, 6, 6, 2, 2, 5, 5],
    qualities: ['dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7'],
    mood: ['energetic', 'any'],
    suitableFor: ['bridge'],
    description: 'III7-VI7-II7-V7 - The "Rhythm Changes" B section',
  },

  // Sad/Emotional
  {
    name: 'Emotional Minor',
    degrees: [1, 6, 3, 7],
    qualities: ['minor', 'major', 'major', 'major'],
    mood: ['sad', 'epic', 'nostalgic'],
    suitableFor: ['verse', 'chorus'],
    description: 'i-bVI-bIII-bVII natural minor progression - Anthem-like emotional power',
  },
  {
    name: 'Deceptive Minor',
    degrees: [1, 4, 6, 5],
    qualities: ['minor', 'minor', 'major', 'major'],
    mood: ['sad', 'tense'],
    suitableFor: ['verse'],
    description: 'i-iv-VI-V - Minor with unexpected resolution',
  },

  // Rock/Alternative
  {
    name: 'Power Ballad',
    degrees: [1, 4, 5, 1],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['epic', 'romantic', 'energetic'],
    suitableFor: ['chorus'],
    description: 'I-IV-V-I - Simple but powerful rock progression',
  },
  {
    name: 'Grunge',
    degrees: [1, 4, 6, 5],
    qualities: ['major', 'major', 'minor', 'major'],
    mood: ['sad', 'tense', 'energetic'],
    suitableFor: ['verse', 'chorus'],
    description: 'I-IV-vi-V - 90s alternative rock staple',
  },
  {
    name: 'Modal Rock',
    degrees: [1, 7, 4, 1],
    qualities: ['major', 'major', 'major', 'major'],
    mood: ['epic', 'chill'],
    suitableFor: ['verse', 'chorus'],
    description: 'I-bVII-IV-I - Mixolydian rock sound (Fortunate Son, Born To Be Wild)',
  },

  // Chill/Ambient
  {
    name: 'Lo-fi Chill',
    degrees: [2, 5, 1, 6],
    qualities: ['minor7', 'dominant7', 'major7', 'minor7'],
    mood: ['chill', 'sad', 'nostalgic'],
    suitableFor: ['verse', 'chorus'],
    description: 'ii7-V7-Imaj7-vi7 - Smooth, jazzy lo-fi progression',
  },
  {
    name: 'Dreamy',
    degrees: [1, 3, 4, 4],
    qualities: ['major7', 'minor7', 'major7', 'major7'],
    mood: ['chill', 'romantic', 'nostalgic'],
    suitableFor: ['verse', 'intro', 'outro'],
    description: 'Imaj7-iii7-IVmaj7 - Ethereal, floating quality',
  },

  // Simple/Folk
  {
    name: 'Three Chord Trick',
    degrees: [1, 4, 5, 1],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['happy', 'energetic', 'any'],
    suitableFor: ['verse', 'chorus'],
    description: 'I-IV-V-I - The most basic but effective progression',
  },
  {
    name: 'Folk Waltz',
    degrees: [1, 5, 1, 4],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['happy', 'nostalgic', 'romantic'],
    suitableFor: ['verse'],
    description: 'I-V-I-IV - Simple folk/country progression',
  },
  {
    name: 'Gospel',
    degrees: [1, 1, 4, 4, 1, 5, 1, 1],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['happy', 'epic', 'energetic'],
    suitableFor: ['verse', 'chorus'],
    description: 'I-I-IV-IV-I-V-I - Classic gospel/blues form',
  },

  // Blues progressions
  {
    name: '12-Bar Blues',
    degrees: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5],
    qualities: ['dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7'],
    mood: ['sad', 'nostalgic', 'any'],
    suitableFor: ['verse', 'chorus'],
    description: 'I7-I7-I7-I7-IV7-IV7-I7-I7-V7-IV7-I7-V7 - The foundation of blues and rock',
  },
  {
    name: 'Quick Change Blues',
    degrees: [1, 4, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5],
    qualities: ['dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7'],
    mood: ['sad', 'energetic', 'any'],
    suitableFor: ['verse', 'chorus'],
    description: 'I7-IV7-I7-I7-IV7-IV7-I7-I7-V7-IV7-I7-V7 - Blues with quick change to IV in bar 2',
  },
  {
    name: 'Minor Blues',
    degrees: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5],
    qualities: ['minor7', 'minor7', 'minor7', 'minor7', 'minor7', 'minor7', 'minor7', 'minor7', 'dominant7', 'dominant7', 'minor7', 'dominant7'],
    mood: ['sad', 'tense', 'any'],
    suitableFor: ['verse', 'chorus'],
    description: 'i7-i7-i7-i7-iv7-iv7-i7-i7-V7-IV7-i7-V7 - Dark, soulful minor blues',
  },

  // Heavy Metal/Hard Rock progressions
  {
    name: 'Power Chord Descent',
    degrees: [1, 7, 6, 5],
    qualities: ['power', 'power', 'power', 'power'],
    mood: ['epic', 'tense', 'energetic'],
    suitableFor: ['verse', 'chorus', 'intro'],
    description: 'I5-bVII5-bVI5-V5 - Heavy chromatic descent (Black Sabbath style)',
  },
  {
    name: 'Metal Tritone',
    degrees: [1, 5, 1, 5],
    qualities: ['power', 'diminished', 'power', 'power'],
    mood: ['tense', 'epic'],
    suitableFor: ['verse', 'intro', 'breakdown'],
    description: 'I5-bV5-I5-V5 - Tritone tension for heavy, ominous sound',
  },
  {
    name: 'Djent Progression',
    degrees: [1, 2, 6, 4],
    qualities: ['power', 'power', 'power', 'power'],
    mood: ['tense', 'epic', 'energetic'],
    suitableFor: ['verse', 'breakdown'],
    description: 'i5-bII5-bVI5-iv5 - Modern metal/djent with Phrygian flavor',
  },

  // Latin progressions
  {
    name: 'Bossa Nova',
    degrees: [1, 2, 5, 1],
    qualities: ['major7', 'minor7', 'dominant7', 'major7'],
    mood: ['chill', 'romantic', 'nostalgic'],
    suitableFor: ['verse', 'chorus'],
    description: 'Imaj7-ii7-V7-Imaj7 - Smooth Brazilian bossa nova',
  },
  {
    name: 'Latin ii-V',
    degrees: [2, 5, 1, 1],
    qualities: ['minor7', 'dominant7', 'major7', 'major7'],
    mood: ['chill', 'romantic', 'happy'],
    suitableFor: ['verse', 'chorus'],
    description: 'ii7-V7-Imaj7-Imaj7 - Latin jazz foundation',
  },
  {
    name: 'Salsa Montuno',
    degrees: [1, 4, 5, 1],
    qualities: ['major', 'major', 'dominant7', 'major'],
    mood: ['happy', 'energetic'],
    suitableFor: ['verse', 'chorus'],
    description: 'I-IV-V7-I - Driving salsa piano montuno pattern',
  },
  {
    name: 'Spanish Phrygian',
    degrees: [1, 2, 1, 7],
    qualities: ['minor', 'major', 'minor', 'major'],
    mood: ['tense', 'epic', 'sad'],
    suitableFor: ['verse', 'bridge', 'intro'],
    description: 'i-bII-i-bVII - Flamenco/Spanish Phrygian tension',
  },

  // Funk progressions
  {
    name: 'Funk Groove',
    degrees: [1, 4, 1, 5],
    qualities: ['dominant7', 'dominant7', 'dominant7', 'dominant7'],
    mood: ['energetic', 'happy'],
    suitableFor: ['verse', 'chorus'],
    description: 'I7-IV7-I7-V7 - Classic funk with dominant 7th crunch',
  },
  {
    name: 'Minor Funk',
    degrees: [1, 1, 4, 1],
    qualities: ['minor7', 'minor7', 'dominant7', 'minor7'],
    mood: ['energetic', 'tense'],
    suitableFor: ['verse', 'chorus'],
    description: 'i7-i7-IV7-i7 - Dark, groovy minor funk (James Brown style)',
  },
  {
    name: 'Disco Funk',
    degrees: [1, 4, 5, 4],
    qualities: ['minor7', 'dominant7', 'minor7', 'dominant7'],
    mood: ['energetic', 'happy'],
    suitableFor: ['verse', 'chorus'],
    description: 'i7-IV7-v7-IV7 - Disco-era dance floor grooves',
  },

  // EDM/Electronic progressions
  {
    name: 'EDM Anthem',
    degrees: [6, 4, 1, 5],
    qualities: ['diatonic', 'diatonic', 'diatonic', 'diatonic'],
    mood: ['epic', 'energetic', 'happy'],
    suitableFor: ['chorus', 'breakdown'],
    description: 'vi-IV-I-V - Festival anthem progression (Avicii, Swedish House Mafia)',
  },
  {
    name: 'Trance Loop',
    degrees: [1, 5],
    qualities: ['minor', 'major'],
    mood: ['epic', 'energetic', 'tense'],
    suitableFor: ['verse', 'intro', 'breakdown'],
    description: 'i-V - Hypnotic two-chord trance loop',
  },
  {
    name: 'Future Bass',
    degrees: [6, 1, 5, 4],
    qualities: ['minor7', 'major7', 'major', 'major7'],
    mood: ['chill', 'epic', 'nostalgic'],
    suitableFor: ['verse', 'chorus'],
    description: 'vi7-Imaj7-V-IVmaj7 - Emotional future bass progression',
  },
  {
    name: 'Dark Techno',
    degrees: [1, 1, 7, 7],
    qualities: ['minor', 'minor', 'major', 'major'],
    mood: ['tense', 'epic'],
    suitableFor: ['verse', 'intro', 'breakdown'],
    description: 'i-i-bVII-bVII - Minimal, dark electronic loop',
  },
  {
    name: 'House Piano',
    degrees: [1, 6, 4, 5],
    qualities: ['major7', 'minor7', 'major7', 'dominant7'],
    mood: ['happy', 'energetic', 'chill'],
    suitableFor: ['verse', 'chorus'],
    description: 'Imaj7-vi7-IVmaj7-V7 - Classic house piano chords',
  },
];

// Map mood analysis traits to progression moods
function matchProgressionToMood(analysis: MoodAnalysis): ('happy' | 'sad' | 'epic' | 'nostalgic' | 'tense' | 'romantic' | 'chill' | 'energetic' | 'any')[] {
  const moods: ('happy' | 'sad' | 'epic' | 'nostalgic' | 'tense' | 'romantic' | 'chill' | 'energetic' | 'any')[] = [];

  if (analysis.brightness === 'bright' && analysis.energy === 'high') moods.push('happy', 'energetic');
  if (analysis.brightness === 'bright' && analysis.energy === 'low') moods.push('romantic', 'chill');
  if (analysis.brightness === 'dark' && analysis.energy === 'low') moods.push('sad', 'nostalgic');
  if (analysis.brightness === 'dark' && analysis.energy === 'high') moods.push('epic', 'tense');
  if (analysis.tension === 'high') moods.push('tense', 'epic');
  if (analysis.tension === 'low') moods.push('chill', 'romantic');
  if (analysis.preferredMode === 'minor') moods.push('sad');
  if (analysis.preferredMode === 'major' && analysis.positivity > 0.3) moods.push('happy');

  // Always include 'any' to allow versatile progressions
  moods.push('any');

  return [...new Set(moods)]; // Remove duplicates
}

// Select a named progression based on mood and section type
function selectNamedProgression(
  analysis: MoodAnalysis,
  sectionType: SectionType,
  length: number,
  random: () => number
): NamedProgression | null {
  const targetMoods = matchProgressionToMood(analysis);

  // Filter progressions that match mood and section type
  const candidates = NAMED_PROGRESSIONS.filter(prog => {
    const moodMatch = prog.mood.some(m => targetMoods.includes(m));
    const sectionMatch = prog.suitableFor.includes(sectionType);
    const lengthMatch = prog.degrees.length <= length + 2 && prog.degrees.length >= Math.max(3, length - 2);
    return moodMatch && sectionMatch && lengthMatch;
  });

  if (candidates.length === 0) {
    // Fallback to any progression that fits the section
    const fallback = NAMED_PROGRESSIONS.filter(prog =>
      prog.suitableFor.includes(sectionType) &&
      prog.degrees.length <= length + 2
    );
    if (fallback.length > 0) {
      return pickRandom(fallback, random);
    }
    return null;
  }

  return pickRandom(candidates, random);
}

// Get roman numeral based on scale degree and chord quality
function getRomanNumeral(degree: number, quality: ChordQuality, mode: 'major' | 'minor'): RomanNumeral {
  // Map of scale degrees (1-7) to roman numerals
  const majorNumerals: Record<number, RomanNumeral> = {
    1: 'I', 2: 'ii', 3: 'iii', 4: 'IV', 5: 'V', 6: 'vi', 7: 'vii°'
  };
  const minorNumerals: Record<number, RomanNumeral> = {
    1: 'i', 2: 'ii°', 3: 'III', 4: 'iv', 5: 'v', 6: 'VI', 7: 'VII'
  };

  // Handle borrowed/chromatic chords (bVII, bVI, bIII, etc.)
  const isMajorQuality = quality === 'major' || quality === 'major7' || quality === 'dominant7';
  const isDiminished = quality === 'diminished' || quality === 'dim7' || quality === 'half-dim7';

  // Get base numeral
  let numeral = mode === 'major' ? majorNumerals[degree] : minorNumerals[degree];

  // Override based on explicit quality if it differs from diatonic
  if (mode === 'major') {
    // In major: adjust for borrowed chords
    if (degree === 7 && isMajorQuality) numeral = 'bVII';
    if (degree === 6 && isMajorQuality) numeral = 'bVI';
    if (degree === 3 && isMajorQuality) numeral = 'bIII';
  } else {
    // In minor: degrees 6 and 7 are naturally flat, adjust for raised versions
    if (degree === 5 && isMajorQuality) numeral = 'V'; // Raised 7th for dominant V
  }

  // Handle diminished explicitly
  if (isDiminished && !numeral.includes('°')) {
    numeral = (numeral.toLowerCase() + '°') as RomanNumeral;
  }

  return numeral || 'I';
}

// Build chords from a named progression
function buildChordsFromPattern(
  pattern: NamedProgression,
  key: Key,
  length: number,
  analysis: MoodAnalysis,
  complexity: 'simple' | 'moderate' | 'complex',
  random: () => number
): Chord[] {
  const keyContext = getKeyId(key);
  const diatonic = getDiatonicChords(key);
  const chords: Chord[] = [];

  // Get scale notes for the key
  const scaleNotes: CanonicalNote[] = key.mode === 'major'
    ? getMajorScaleNotes(key.tonic)
    : getMinorScaleNotes(key.tonic);

  for (let i = 0; i < Math.min(pattern.degrees.length, length); i++) {
    const degree = pattern.degrees[i];
    const qualityHint = pattern.qualities[i];
    const root = scaleNotes[(degree - 1) % 7]; // Wrap around for degrees > 7

    let quality: ChordQuality;
    if (qualityHint === 'diatonic') {
      // Use the natural quality from the key
      const diatonicChord = diatonic.find(c => c.root === root);
      quality = diatonicChord?.quality || 'major';
    } else {
      quality = qualityHint;
    }

    // Apply complexity upgrades
    if (complexity !== 'simple' && qualityHint === 'diatonic') {
      if (analysis.useSevenths && random() > 0.3) {
        // Get the chord function to determine if it's dominant
        const chordFunc = getChordFunction((degree - 1) % 7, key.mode);

        if (quality === 'major') {
          // V chords become dominant7, others become major7
          quality = chordFunc === 'dominant' ? 'dominant7' : 'major7';
        } else if (quality === 'minor') {
          quality = 'minor7';
        }
      }
    }

    // Get the chord function based on scale degree (0-indexed for getChordFunction)
    const chordFunction = getChordFunction((degree - 1) % 7, key.mode);

    // Get the roman numeral
    const romanNumeral = getRomanNumeral(degree, quality, key.mode);

    const chord = createChord(root, quality, romanNumeral, chordFunction, keyContext);
    chords.push(chord);
  }

  // If we need more chords, repeat the pattern
  while (chords.length < length) {
    const idx = chords.length % pattern.degrees.length;
    chords.push({ ...chords[idx] });
  }

  return chords.slice(0, length);
}

// Helper to get major scale notes
function getMajorScaleNotes(tonic: CanonicalNote): CanonicalNote[] {
  const allNotes: CanonicalNote[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11]; // W-W-H-W-W-W-H
  const tonicIndex = allNotes.indexOf(tonic);
  return majorIntervals.map(interval => allNotes[(tonicIndex + interval) % 12]);
}

// Helper to get natural minor scale notes
function getMinorScaleNotes(tonic: CanonicalNote): CanonicalNote[] {
  const allNotes: CanonicalNote[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10]; // W-H-W-W-H-W-W
  const tonicIndex = allNotes.indexOf(tonic);
  return minorIntervals.map(interval => allNotes[(tonicIndex + interval) % 12]);
}

// ============================================================================
// INVERSIONS AND BASS LINE PROCESSING
// ============================================================================

/**
 * Create an inversion of a chord by setting the bass note to the 3rd or 5th
 * Returns a new chord with the bassNote property set
 */
function createInversion(
  chord: Chord,
  inversionType: '1st' | '2nd'
): Chord {
  const notes = chord.notes;
  if (notes.length < 3) {
    return chord; // Can't invert power chords or dyads meaningfully
  }

  // 1st inversion: 3rd in bass, 2nd inversion: 5th in bass
  const bassNoteIndex = inversionType === '1st' ? 1 : 2;
  const bassNote = notes[bassNoteIndex];

  if (!bassNote) {
    return chord;
  }

  // Create new chord with bass note - use the createChord function for proper naming
  return {
    ...chord,
    bassNote,
    name: chord.name + '/' + bassNote,
  };
}

/**
 * Apply random inversions to a progression based on mood settings
 * Adds smooth bass line movement through strategic inversions
 */
function applyInversions(
  progression: Chord[],
  analysis: MoodAnalysis,
  random: () => number
): Chord[] {
  if (!analysis.useInversions || progression.length < 2) {
    return progression;
  }

  const inversionChance = 0.18; // ~18% chance per eligible chord

  return progression.map((chord, index) => {
    // Don't invert first or last chord (keep strong root position)
    if (index === 0 || index === progression.length - 1) {
      return chord;
    }

    // Random chance to invert
    if (random() > inversionChance) {
      return chord;
    }

    // Prefer 1st inversions (3rd in bass) for smoother sound
    const inversionType = random() > 0.3 ? '1st' : '2nd';
    return createInversion(chord, inversionType);
  });
}

/**
 * Apply pedal bass to a progression - keeps the same bass note across multiple chords
 * Common in cinematic music for creating tension and continuity
 */
function applyPedalBass(
  progression: Chord[],
  analysis: MoodAnalysis,
  key: Key,
  random: () => number
): Chord[] {
  if (analysis.pedalBassChance <= 0 || progression.length < 3) {
    return progression;
  }

  // Decide if we should apply pedal bass to this progression
  if (random() > analysis.pedalBassChance) {
    return progression;
  }

  const result = [...progression];

  // Pedal note is usually the tonic or dominant
  const pedalNote = random() > 0.7
    ? progression[0].notes[2] // 5th of first chord (dominant pedal)
    : key.tonic; // Tonic pedal (most common)

  // Apply pedal to a contiguous section (2-4 chords)
  const pedalLength = 2 + Math.floor(random() * 3); // 2, 3, or 4 chords
  const startIndex = Math.floor(random() * Math.max(1, progression.length - pedalLength));

  for (let i = startIndex; i < Math.min(startIndex + pedalLength, progression.length); i++) {
    const chord = result[i];
    // Only apply pedal if the note exists in the chord (sounds consonant)
    // or if it's the root of the first chord (tonic pedal always works)
    const noteExistsInChord = chord.notes.includes(pedalNote as CanonicalNote);
    const isTonic = pedalNote === key.tonic;

    if (noteExistsInChord || isTonic) {
      result[i] = {
        ...chord,
        bassNote: pedalNote as CanonicalNote,
        name: chord.root === pedalNote ? chord.name : chord.name + '/' + pedalNote,
      };
    }
  }

  return result;
}

// Generate a chord progression for a section
function generateProgression(
  key: Key,
  length: number,
  analysis: MoodAnalysis,
  complexity: 'simple' | 'moderate' | 'complex',
  sectionType: SectionType,
  random: () => number
): Chord[] {
  // Try to use a named progression pattern first (70% chance)
  if (random() < 0.7) {
    const namedProg = selectNamedProgression(analysis, sectionType, length, random);
    if (namedProg) {
      return buildChordsFromPattern(namedProg, key, length, analysis, complexity, random);
    }
  }

  // Fall back to algorithmic generation
  const keyContext = getKeyId(key);
  const diatonic = getDiatonicChords(key);
  const borrowed = analysis.useBorrowedChords ? getBorrowedChords(key) : [];

  // Categorize chords by function
  const tonicChords = diatonic.filter(c => c.function === 'tonic');
  const subdominantChords = diatonic.filter(c => c.function === 'subdominant' || c.function === 'predominant');
  const dominantChords = diatonic.filter(c => c.function === 'dominant');

  const progression: Chord[] = [];

  // Determine starting chord based on section type
  let startChord: Chord;
  if (sectionType === 'verse' || sectionType === 'intro') {
    startChord = pickRandom(tonicChords, random);
  } else if (sectionType === 'chorus') {
    // Choruses often start on IV or I
    startChord = random() > 0.4 ? pickRandom(subdominantChords, random) : pickRandom(tonicChords, random);
  } else if (sectionType === 'bridge') {
    // Bridges often start somewhere unexpected
    startChord = pickRandom([...subdominantChords, ...borrowed.slice(0, 2)], random);
  } else {
    startChord = pickRandom(tonicChords, random);
  }

  // Apply 7th upgrade to start chord if needed
  if (complexity !== 'simple' && analysis.useSevenths && random() > 0.3) {
    startChord = upgradeToSeventh(startChord, keyContext);
  }

  progression.push(startChord);

  // Build the rest of the progression
  for (let i = 1; i < length; i++) {
    const isLast = i === length - 1;
    const isSecondToLast = i === length - 2;

    let nextChord: Chord;

    if (isLast && sectionType !== 'bridge') {
      // End on tonic for resolution (except bridges which can leave tension)
      nextChord = diatonic[0]; // I or i
    } else if (isSecondToLast && sectionType !== 'bridge') {
      // Penultimate chord is often dominant
      nextChord = pickRandom(dominantChords, random);
    } else {
      // Pick based on harmonic movement preferences
      const pool: Chord[] = [];

      // Weight by preferred functions
      for (const func of analysis.preferredFunctions) {
        if (func === 'tonic') pool.push(...tonicChords);
        if (func === 'subdominant') pool.push(...subdominantChords);
        if (func === 'dominant') pool.push(...dominantChords);
      }

      // Add borrowed chords occasionally for complex progressions
      if (complexity === 'complex' && random() > 0.7) {
        pool.push(...borrowed);
      }

      // Avoid repeating the same chord
      const lastChord = progression[progression.length - 1];
      const filtered = pool.filter(c => c.root !== lastChord.root || c.quality !== lastChord.quality);

      nextChord = pickRandom(filtered.length > 0 ? filtered : pool, random);
    }

    // Apply modifications based on complexity and analysis
    if (complexity !== 'simple') {
      // Upgrade to 7ths (higher probability for consistent jazzy/bluesy feel)
      if (analysis.useSevenths && random() > 0.3) {
        nextChord = upgradeToSeventh(nextChord, keyContext);
      }

      // Add suspensions occasionally
      if (analysis.useSuspensions && random() > 0.8) {
        nextChord = addSuspension(nextChord, keyContext, random);
      }
    }

    progression.push(nextChord);
  }

  return progression;
}

// ============================================================================
// SONG STRUCTURE GENERATION
// ============================================================================

interface SectionTemplate {
  type: SectionType;
  name: string;
  minChords: number;
  maxChords: number;
}

const STRUCTURE_TEMPLATES: Record<string, SectionTemplate[]> = {
  simple: [
    { type: 'verse', name: 'Verse', minChords: 4, maxChords: 4 },
    { type: 'chorus', name: 'Chorus', minChords: 4, maxChords: 4 },
  ],
  standard: [
    { type: 'verse', name: 'Verse 1', minChords: 4, maxChords: 8 },
    { type: 'chorus', name: 'Chorus', minChords: 4, maxChords: 8 },
    { type: 'verse', name: 'Verse 2', minChords: 4, maxChords: 8 },
    { type: 'chorus', name: 'Chorus', minChords: 4, maxChords: 8 },
  ],
  withBridge: [
    { type: 'verse', name: 'Verse 1', minChords: 4, maxChords: 8 },
    { type: 'chorus', name: 'Chorus', minChords: 4, maxChords: 8 },
    { type: 'verse', name: 'Verse 2', minChords: 4, maxChords: 6 },
    { type: 'chorus', name: 'Chorus', minChords: 4, maxChords: 8 },
    { type: 'bridge', name: 'Bridge', minChords: 4, maxChords: 8 },
    { type: 'chorus', name: 'Final Chorus', minChords: 4, maxChords: 8 },
  ],
  extended: [
    { type: 'intro', name: 'Intro', minChords: 2, maxChords: 4 },
    { type: 'verse', name: 'Verse 1', minChords: 4, maxChords: 8 },
    { type: 'pre-chorus', name: 'Pre-Chorus', minChords: 2, maxChords: 4 },
    { type: 'chorus', name: 'Chorus', minChords: 4, maxChords: 8 },
    { type: 'verse', name: 'Verse 2', minChords: 4, maxChords: 8 },
    { type: 'pre-chorus', name: 'Pre-Chorus', minChords: 2, maxChords: 4 },
    { type: 'chorus', name: 'Chorus', minChords: 4, maxChords: 8 },
    { type: 'bridge', name: 'Bridge', minChords: 4, maxChords: 8 },
    { type: 'chorus', name: 'Final Chorus', minChords: 6, maxChords: 12 },
    { type: 'outro', name: 'Outro', minChords: 2, maxChords: 4 },
  ],
};

function selectStructure(complexity: 'simple' | 'moderate' | 'complex', random: () => number): SectionTemplate[] {
  if (complexity === 'simple') {
    return STRUCTURE_TEMPLATES.simple;
  } else if (complexity === 'moderate') {
    return random() > 0.5 ? STRUCTURE_TEMPLATES.standard : STRUCTURE_TEMPLATES.withBridge;
  } else {
    return random() > 0.3 ? STRUCTURE_TEMPLATES.extended : STRUCTURE_TEMPLATES.withBridge;
  }
}

// ============================================================================
// KEY RECOMMENDATION
// ============================================================================

export interface KeyRecommendation {
  key: Key;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
  alternativeKeys: Key[];
}

/**
 * Recommends a key based on mood analysis.
 * This function analyzes the mood text and suggests an appropriate key
 * along with a rationale explaining the choice.
 */
export function recommendKeyForMood(moodText: string): KeyRecommendation {
  const analysis = analyzeMood(moodText);
  const random = seededRandom(moodText);

  // Key selection based on brightness and mood characteristics
  // Brighter moods -> keys with more sharps (G, D, A, E)
  // Darker moods -> keys with more flats (F, Bb, Eb) or flat keys
  // Neutral -> C, G, or Am, Em

  let recommendedRoot: CanonicalNote;
  let rationale: string;
  let confidence: 'high' | 'medium' | 'low';
  const alternativeKeys: Key[] = [];

  if (analysis.brightness === 'bright') {
    // Bright keys: G, D, A, E (sharp keys)
    const brightRoots: CanonicalNote[] = ['G', 'D', 'A', 'E'];
    if (analysis.energy === 'high') {
      // High energy + bright = D or A (energetic, open guitar keys)
      recommendedRoot = random() > 0.5 ? 'D' : 'A';
      rationale = `${recommendedRoot} ${analysis.preferredMode} is a bright, energetic key - perfect for uplifting moods.`;
      confidence = 'high';
    } else {
      // Lower energy + bright = G (warm, accessible)
      recommendedRoot = 'G';
      rationale = `G ${analysis.preferredMode} is warm and bright without being overly intense.`;
      confidence = 'high';
    }
    // Add alternatives
    alternativeKeys.push(
      { tonic: brightRoots[(brightRoots.indexOf(recommendedRoot) + 1) % 4], mode: analysis.preferredMode },
      { tonic: 'C', mode: analysis.preferredMode }
    );
  } else if (analysis.brightness === 'dark') {
    // Dark moods: minor keys, or flat major keys
    if (analysis.preferredMode === 'minor') {
      // Dark + minor: Am, Em, Dm, Bm
      const darkMinorRoots: CanonicalNote[] = ['A', 'E', 'D', 'B'];
      if (analysis.tension === 'high') {
        // High tension = more dramatic keys
        recommendedRoot = random() > 0.5 ? 'B' : 'E';
        rationale = `${recommendedRoot} minor creates the dramatic tension your mood suggests.`;
        confidence = 'high';
      } else {
        // Low tension = Am or Dm (softer, melancholic)
        recommendedRoot = random() > 0.5 ? 'A' : 'D';
        rationale = `${recommendedRoot} minor has a natural melancholic quality that matches your mood.`;
        confidence = 'high';
      }
      alternativeKeys.push(
        { tonic: darkMinorRoots[(darkMinorRoots.indexOf(recommendedRoot) + 1) % 4], mode: 'minor' },
        { tonic: 'C', mode: 'minor' }
      );
    } else {
      // Dark + major = unusual, use F or flat keys for somber major
      recommendedRoot = 'F';
      rationale = `F major has a warmer, more introspective quality than brighter major keys.`;
      confidence = 'medium';
      alternativeKeys.push(
        { tonic: 'C', mode: 'major' },
        { tonic: 'A', mode: 'minor' }
      );
    }
  } else {
    // Neutral brightness - versatile keys
    if (analysis.preferredMode === 'minor') {
      recommendedRoot = random() > 0.5 ? 'A' : 'E';
      rationale = `${recommendedRoot} minor is versatile and widely used - a solid choice for your mood.`;
      confidence = 'medium';
      alternativeKeys.push(
        { tonic: 'D', mode: 'minor' },
        { tonic: 'C', mode: 'major' }
      );
    } else {
      // Neutral major: C or G
      recommendedRoot = random() > 0.5 ? 'C' : 'G';
      rationale = `${recommendedRoot} major is accessible and works well across many styles.`;
      confidence = 'medium';
      alternativeKeys.push(
        { tonic: recommendedRoot === 'C' ? 'G' : 'C', mode: 'major' },
        { tonic: 'A', mode: 'minor' }
      );
    }
  }

  // Adjust confidence based on how many keywords were detected
  if (analysis.detectedKeywords && analysis.detectedKeywords.length === 0) {
    confidence = 'low';
    rationale = `${recommendedRoot} ${analysis.preferredMode} is a good starting point. Add more mood descriptors for better recommendations.`;
  }

  return {
    key: { tonic: recommendedRoot, mode: analysis.preferredMode },
    rationale,
    confidence,
    alternativeKeys: alternativeKeys.slice(0, 2),
  };
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateAlgorithmicSong(request: AIGenerationRequest): Song {
  const mood = request.mood;
  const complexity = request.complexity || 'moderate';

  // Analyze the mood
  const analysis = analyzeMood(mood);

  // Determine key
  let key: Key;
  if (request.key) {
    key = request.key;
  } else {
    // Pick a random key in the preferred mode
    const roots = ['C', 'G', 'D', 'A', 'E', 'F'] as const;
    const random = seededRandom(mood);
    const root = pickRandom([...roots], random);
    key = { tonic: root, mode: analysis.preferredMode };
  }

  // Apply style hints
  if (request.style) {
    const styleLower = request.style.toLowerCase();
    for (const [keyword, traits] of Object.entries(MOOD_KEYWORDS)) {
      if (styleLower.includes(keyword)) {
        Object.assign(analysis, traits);
      }
    }
  }

  // Create seeded random for this specific request
  const random = seededRandom(`${mood}-${key.tonic}-${key.mode}-${complexity}`);

  // Select song structure
  const structure = selectStructure(complexity, random);

  // Generate tempo
  const tempo = Math.round(
    analysis.tempoRange.min + random() * (analysis.tempoRange.max - analysis.tempoRange.min)
  );

  // Generate sections (using reduce to allow looking back at already-generated sections)
  const sections: SongSection[] = structure.reduce<SongSection[]>((acc, template) => {
    const chordCount = template.minChords +
      Math.floor(random() * (template.maxChords - template.minChords + 1));

    // For repeated sections (like chorus), reuse the progression
    const existingSection = acc.find(s =>
      s.type === template.type && s.name.replace(/\d+$/, '').trim() === template.name.replace(/\d+$/, '').trim()
    );

    let chords: Chord[];
    if (existingSection && template.type === 'chorus') {
      // Reuse chorus progression
      chords = [...existingSection.chords];
    } else {
      chords = generateProgression(key, chordCount, analysis, complexity, template.type, random);

      // Apply inversions for smoother bass movement (dreamy, ethereal, ambient moods)
      if (analysis.useInversions && complexity !== 'simple') {
        chords = applyInversions(chords, analysis, random);
      }

      // Apply pedal bass for cinematic effect
      if (analysis.pedalBassChance > 0 && complexity !== 'simple') {
        chords = applyPedalBass(chords, analysis, key, random);
      }
    }

    acc.push({
      id: uuidv4(),
      type: template.type,
      name: template.name,
      chords,
      bars: chords.length,
    });

    return acc;
  }, []);

  // Generate title
  const titleWords = mood.split(/\s+/).slice(0, 3);
  const title = titleWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Build description
  const description = buildDescription(analysis, complexity, key);

  return {
    id: uuidv4(),
    title,
    description,
    key,
    tempo,
    sections,
    customMood: mood,
    generatedBy: 'preset',
    moodAnalysis: analysis,
  };
}

function buildDescription(analysis: MoodAnalysis, complexity: string, key: Key): string {
  const parts: string[] = [];

  // Key and mode
  parts.push(`Generated in ${key.tonic} ${key.mode}.`);

  // Detected characteristics
  const characteristics: string[] = [];

  // Energy level
  if (analysis.energy === 'high') {
    characteristics.push('high energy');
  } else if (analysis.energy === 'low') {
    characteristics.push('low energy');
  }

  // Brightness
  if (analysis.brightness === 'bright') {
    characteristics.push('bright tone');
  } else if (analysis.brightness === 'dark') {
    characteristics.push('dark atmosphere');
  }

  // Tension
  if (analysis.tension === 'high') {
    characteristics.push('high tension');
  } else if (analysis.tension === 'low') {
    characteristics.push('relaxed feel');
  }

  if (characteristics.length > 0) {
    parts.push(`Detected: ${characteristics.join(', ')}.`);
  }

  // Chord features
  const chordFeatures: string[] = [];
  if (analysis.useSevenths) {
    chordFeatures.push('seventh chords');
  }
  if (analysis.useBorrowedChords) {
    chordFeatures.push('borrowed chords');
  }
  if (analysis.useSuspensions) {
    chordFeatures.push('suspended chords');
  }
  if (analysis.useInversions) {
    chordFeatures.push('slash chords/inversions');
  }
  if (analysis.pedalBassChance > 0) {
    chordFeatures.push('pedal bass');
  }

  if (chordFeatures.length > 0) {
    parts.push(`Features: ${chordFeatures.join(', ')}.`);
  }

  // Complexity
  parts.push(`Complexity: ${complexity}.`);

  return parts.join(' ');
}
