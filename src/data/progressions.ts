import { v4 as uuidv4 } from 'uuid';
import type { Chord, Key, Mood, Progression, RomanNumeral } from '../types/music';
import {
  getDiatonicChords,
  createChord,
  transposeNote,
  getKeyId,
} from '../utils/musicTheory';
import { getMoodMapping, suggestTempoForMood } from './moods';

// ============================================================================
// COMMON PROGRESSIONS
// ============================================================================

// Named common progressions with their roman numeral patterns
export const COMMON_PROGRESSIONS: { name: string; pattern: RomanNumeral[]; description: string }[] = [
  { name: 'Pop Progression', pattern: ['I', 'V', 'vi', 'IV'], description: 'The most common pop/rock progression' },
  { name: '50s Progression', pattern: ['I', 'vi', 'IV', 'V'], description: 'Classic doo-wop and ballad progression' },
  { name: 'Basic Cadence', pattern: ['I', 'IV', 'V', 'I'], description: 'Simple and resolved' },
  { name: 'Jazz ii-V-I', pattern: ['ii', 'V', 'I'], description: 'Fundamental jazz turnaround' },
  { name: 'Andalusian Cadence', pattern: ['i', 'VII', 'VI', 'V'], description: 'Flamenco-style descending' },
  { name: 'Minor Pop', pattern: ['i', 'VI', 'III', 'VII'], description: 'Minor key equivalent of pop progression' },
  { name: 'Pachelbel Canon', pattern: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], description: 'Classical sequence' },
  { name: 'Blues Turnaround', pattern: ['I', 'IV', 'I', 'V'], description: 'Basic blues foundation' },
  { name: 'Royal Road', pattern: ['IV', 'V', 'iii', 'vi'], description: 'Common in J-pop and anime' },
  { name: 'Axis Progression', pattern: ['vi', 'IV', 'I', 'V'], description: 'Minor start variant of pop progression' },
];

// ============================================================================
// ROMAN NUMERAL TO CHORD CONVERSION
// ============================================================================

// Roman numeral definitions with interval and quality
const ROMAN_NUMERAL_DATA: Record<RomanNumeral, { interval: number; quality: 'major' | 'minor' | 'diminished' }> = {
  'I': { interval: 0, quality: 'major' },
  'ii': { interval: 2, quality: 'minor' },
  'iii': { interval: 4, quality: 'minor' },
  'IV': { interval: 5, quality: 'major' },
  'V': { interval: 7, quality: 'major' },
  'vi': { interval: 9, quality: 'minor' },
  'vii°': { interval: 11, quality: 'diminished' },
  // Minor key numerals
  'i': { interval: 0, quality: 'minor' },
  'ii°': { interval: 2, quality: 'diminished' },
  'III': { interval: 3, quality: 'major' },
  'iv': { interval: 5, quality: 'minor' },
  'v': { interval: 7, quality: 'minor' },
  'VI': { interval: 8, quality: 'major' },
  'VII': { interval: 10, quality: 'major' },
  // Borrowed/chromatic numerals
  'bII': { interval: 1, quality: 'major' },  // Neapolitan
  'bIII': { interval: 3, quality: 'major' },
  'bVI': { interval: 8, quality: 'major' },
  'bVII': { interval: 10, quality: 'major' },
};

/**
 * Convert a roman numeral to a chord in a given key
 */
export function romanNumeralToChord(numeral: RomanNumeral, key: Key): Chord {
  const data = ROMAN_NUMERAL_DATA[numeral];
  if (!data) {
    // Fallback for unknown numerals
    return createChord(key.tonic, 'major', numeral, 'tonic', getKeyId(key));
  }

  const root = transposeNote(key.tonic, data.interval);
  const keyContext = getKeyId(key);

  // Determine chord function based on numeral
  let chordFunction: Chord['function'] = 'tonic';
  if (['IV', 'iv', 'II', 'ii'].some(n => numeral.includes(n))) {
    chordFunction = 'subdominant';
  } else if (['V', 'v', 'VII', 'vii'].some(n => numeral.includes(n))) {
    chordFunction = 'dominant';
  } else if (numeral.startsWith('b')) {
    chordFunction = 'borrowed';
  }

  return createChord(root, data.quality, numeral, chordFunction, keyContext);
}

/**
 * Convert a progression pattern to actual chords
 */
export function patternToChords(pattern: RomanNumeral[], key: Key): Chord[] {
  return pattern.map(numeral => romanNumeralToChord(numeral, key));
}

// ============================================================================
// PROGRESSION GENERATION
// ============================================================================

/**
 * Create a progression from a roman numeral pattern
 */
export function createProgression(
  pattern: RomanNumeral[],
  key: Key,
  name?: string,
  mood?: Mood,
  tempo?: number
): Progression {
  return {
    id: uuidv4(),
    name,
    key,
    chords: patternToChords(pattern, key),
    tempo: tempo ?? 100,
    mood
  };
}

/**
 * Get common progressions for a key
 */
export function getCommonProgressions(key: Key): Progression[] {
  // Filter progressions appropriate for the key's mode
  const appropriate = COMMON_PROGRESSIONS.filter(prog => {
    const firstNumeral = prog.pattern[0];
    const isMinorProg = firstNumeral === 'i' || firstNumeral === 'vi';
    return key.mode === 'minor' ? isMinorProg : !isMinorProg;
  });

  return appropriate.map(prog =>
    createProgression(prog.pattern, key, prog.name)
  );
}

/**
 * Get progressions for a mood in a given key
 */
export function getMoodProgressions(mood: Mood, key: Key): Progression[] {
  const mapping = getMoodMapping(mood);
  if (!mapping) return getCommonProgressions(key);

  const tempo = suggestTempoForMood(mood);

  return mapping.suggestedProgressions.map((pattern, index) =>
    createProgression(
      pattern as RomanNumeral[],
      key,
      `${mood} #${index + 1}`,
      mood,
      tempo
    )
  );
}

/**
 * Suggest progressions based on various inputs
 */
export function suggestProgressions(input: {
  mood?: Mood;
  startingChord?: Chord;
  key?: Key;
  length?: number;
}): Progression[] {
  // 1. Determine key
  let key: Key;
  if (input.key) {
    key = input.key;
  } else if (input.startingChord) {
    key = inferKeyFromChord(input.startingChord);
  } else if (input.mood) {
    const mapping = getMoodMapping(input.mood);
    key = {
      tonic: 'C',
      mode: mapping?.preferredMode ?? 'major'
    };
  } else {
    key = { tonic: 'C', mode: 'major' };
  }

  // 2. Get base progressions
  let progressions: Progression[];
  if (input.mood) {
    progressions = getMoodProgressions(input.mood, key);
  } else {
    progressions = getCommonProgressions(key);
  }

  // 3. If starting chord specified, filter/modify
  if (input.startingChord) {
    progressions = progressions
      .map(p => ensureStartsWithChord(p, input.startingChord!))
      .filter((p): p is Progression => p !== null);
  }

  // 4. Limit results
  return progressions.slice(0, 5);
}

/**
 * Infer a likely key from a chord
 */
export function inferKeyFromChord(chord: Chord): Key {
  // Simple heuristic: major chord suggests major key, minor chord suggests minor key
  if (chord.quality === 'minor' || chord.quality === 'minor7') {
    return { tonic: chord.root, mode: 'minor' };
  }
  return { tonic: chord.root, mode: 'major' };
}

/**
 * Modify a progression to start with a specific chord
 */
function ensureStartsWithChord(progression: Progression, chord: Chord): Progression | null {
  const chords = [...progression.chords];

  // Check if the chord is already first
  if (chords[0]?.root === chord.root && chords[0]?.quality === chord.quality) {
    return progression;
  }

  // Check if the chord exists in the progression, rotate to start with it
  const index = chords.findIndex(c =>
    c.root === chord.root && c.quality === chord.quality
  );

  if (index > 0) {
    const rotated = [...chords.slice(index), ...chords.slice(0, index)];
    return { ...progression, chords: rotated, id: uuidv4() };
  }

  // Replace the first chord
  chords[0] = { ...chord };
  return { ...progression, chords, id: uuidv4() };
}

// ============================================================================
// PROGRESSION MODIFICATIONS
// ============================================================================

/**
 * Transpose a progression to a new key
 */
export function transposeProgression(progression: Progression, semitones: number): Progression {
  const newTonic = transposeNote(progression.key.tonic, semitones);
  const newKey: Key = { tonic: newTonic, mode: progression.key.mode };
  const keyContext = getKeyId(newKey);

  const newChords = progression.chords.map(chord => {
    const newRoot = transposeNote(chord.root, semitones);
    return createChord(newRoot, chord.quality, chord.romanNumeral, chord.function, keyContext);
  });

  return {
    ...progression,
    id: uuidv4(),
    key: newKey,
    chords: newChords
  };
}

/**
 * Add a chord to a progression
 */
export function addChordToProgression(progression: Progression, chord: Chord, index?: number): Progression {
  const chords = [...progression.chords];
  if (index !== undefined && index >= 0 && index <= chords.length) {
    chords.splice(index, 0, chord);
  } else {
    chords.push(chord);
  }
  return { ...progression, chords };
}

/**
 * Remove a chord from a progression
 */
export function removeChordFromProgression(progression: Progression, index: number): Progression {
  const chords = progression.chords.filter((_, i) => i !== index);
  return { ...progression, chords };
}

/**
 * Replace a chord in a progression
 */
export function replaceChordInProgression(progression: Progression, index: number, newChord: Chord): Progression {
  const chords = [...progression.chords];
  if (index >= 0 && index < chords.length) {
    chords[index] = newChord;
  }
  return { ...progression, chords };
}

/**
 * Get alternative chords for a position in a progression
 */
export function getAlternativeChords(progression: Progression, index: number): Chord[] {
  const currentChord = progression.chords[index];
  if (!currentChord) return [];

  const diatonicChords = getDiatonicChords(progression.key);
  const keyContext = getKeyId(progression.key);

  // Filter out the current chord and return alternatives
  const alternatives = diatonicChords.filter(c =>
    !(c.root === currentChord.root && c.quality === currentChord.quality)
  );

  // Add some borrowed chords as options
  const borrowedOptions: Array<{ interval: number; quality: 'major' | 'minor'; numeral: RomanNumeral }> = [];

  if (progression.key.mode === 'major') {
    // Borrow from parallel minor
    borrowedOptions.push(
      { interval: 10, quality: 'major', numeral: 'bVII' },  // bVII
      { interval: 5, quality: 'minor', numeral: 'iv' },     // iv
      { interval: 8, quality: 'major', numeral: 'bVI' },    // bVI
    );
  } else {
    // In minor, the VII is already natural, add major V
    borrowedOptions.push(
      { interval: 7, quality: 'major', numeral: 'V' },  // Major V (dominant)
    );
  }

  borrowedOptions.forEach(opt => {
    const root = transposeNote(progression.key.tonic, opt.interval);
    alternatives.push(createChord(root, opt.quality, opt.numeral, 'borrowed', keyContext));
  });

  return alternatives;
}
