import type {
  NoteName,
  CanonicalNote,
  ChordQuality,
  ChordFunction,
  Chord,
  Key,
  KeyId,
  KeyRelationships,
  RomanNumeral,
} from '../types/music';

// ============================================================================
// CONSTANTS
// ============================================================================

// All 12 canonical notes in chromatic order (using sharps)
export const CHROMATIC_NOTES: CanonicalNote[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

// Enharmonic equivalents mapping to canonical (sharp) form
export const ENHARMONIC_MAP: Record<NoteName, CanonicalNote> = {
  'C': 'C', 'C#': 'C#', 'Db': 'C#',
  'D': 'D', 'D#': 'D#', 'Eb': 'D#',
  'E': 'E',
  'F': 'F', 'F#': 'F#', 'Gb': 'F#',
  'G': 'G', 'G#': 'G#', 'Ab': 'G#',
  'A': 'A', 'A#': 'A#', 'Bb': 'A#',
  'B': 'B'
};

// Sharp to flat conversion for display
export const SHARP_TO_FLAT: Record<CanonicalNote, NoteName> = {
  'C': 'C', 'C#': 'Db', 'D': 'D', 'D#': 'Eb', 'E': 'E', 'F': 'F',
  'F#': 'Gb', 'G': 'G', 'G#': 'Ab', 'A': 'A', 'A#': 'Bb', 'B': 'B'
};

// Display preferences by key (sharp keys prefer sharps, flat keys prefer flats)
export const KEY_DISPLAY_PREFERENCE: Record<string, 'sharp' | 'flat'> = {
  // Major keys
  'C': 'sharp', 'G': 'sharp', 'D': 'sharp', 'A': 'sharp', 'E': 'sharp', 'B': 'sharp', 'F#': 'sharp',
  'F': 'flat', 'Bb': 'flat', 'Eb': 'flat', 'Ab': 'flat', 'Db': 'flat', 'Gb': 'flat',
  // Minor keys
  'Am': 'sharp', 'Em': 'sharp', 'Bm': 'sharp', 'F#m': 'sharp', 'C#m': 'sharp', 'G#m': 'sharp',
  'Dm': 'flat', 'Gm': 'flat', 'Cm': 'flat', 'Fm': 'flat', 'Bbm': 'flat', 'Ebm': 'flat'
};

// Scale intervals (semitones from root)
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

// Diatonic chord qualities for each scale degree
export const MAJOR_CHORD_QUALITIES: ChordQuality[] = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'
];

export const MINOR_CHORD_QUALITIES: ChordQuality[] = [
  'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'
];

// Roman numerals for scale degrees
export const MAJOR_ROMAN_NUMERALS: RomanNumeral[] = [
  'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
];

export const MINOR_ROMAN_NUMERALS: RomanNumeral[] = [
  'i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'
];

// Chord quality suffixes for display
export const QUALITY_SUFFIXES: Record<ChordQuality, string> = {
  'major': '',
  'minor': 'm',
  'diminished': 'dim',
  'augmented': 'aug',
  'dominant7': '7',
  'major7': 'maj7',
  'minor7': 'm7',
  'dim7': 'dim7',
  'half-dim7': 'm7b5',
  'sus2': 'sus2',
  'sus4': 'sus4',
  'add9': 'add9',
  'power': '5'
};

// Chord intervals (semitones from root)
export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  'dominant7': [0, 4, 7, 10],
  'major7': [0, 4, 7, 11],
  'minor7': [0, 3, 7, 10],
  'dim7': [0, 3, 6, 9],
  'half-dim7': [0, 3, 6, 10],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  'add9': [0, 4, 7, 14],
  'power': [0, 7]  // Root + 5th only (no 3rd)
};

// ============================================================================
// NOTE UTILITIES
// ============================================================================

/**
 * Normalize any note name to its canonical (sharp) form
 */
export function normalizeNoteName(note: NoteName): CanonicalNote {
  return ENHARMONIC_MAP[note];
}

/**
 * Get the display name for a note based on key context
 */
export function displayNoteName(note: CanonicalNote, keyContext?: string): NoteName {
  const preference = keyContext ? KEY_DISPLAY_PREFERENCE[keyContext] ?? 'sharp' : 'sharp';
  if (preference === 'flat') {
    return SHARP_TO_FLAT[note];
  }
  return note;
}

/**
 * Transpose a note by a given number of semitones
 */
export function transposeNote(note: NoteName, semitones: number): CanonicalNote {
  const canonical = normalizeNoteName(note);
  const currentIndex = CHROMATIC_NOTES.indexOf(canonical);
  const newIndex = (currentIndex + semitones + 12) % 12;
  return CHROMATIC_NOTES[newIndex];
}

/**
 * Get the interval (in semitones) between two notes
 */
export function getInterval(from: NoteName, to: NoteName): number {
  const fromIndex = CHROMATIC_NOTES.indexOf(normalizeNoteName(from));
  const toIndex = CHROMATIC_NOTES.indexOf(normalizeNoteName(to));
  return (toIndex - fromIndex + 12) % 12;
}

// ============================================================================
// CHORD UTILITIES
// ============================================================================

/**
 * Format a chord name for display
 */
export function formatChordName(root: NoteName, quality: ChordQuality, keyContext?: string): string {
  const displayRoot = displayNoteName(normalizeNoteName(root), keyContext);
  return displayRoot + QUALITY_SUFFIXES[quality];
}

/**
 * Build the notes of a chord from root and quality
 */
export function buildChordNotes(root: NoteName, quality: ChordQuality): CanonicalNote[] {
  const intervals = CHORD_INTERVALS[quality];
  return intervals.map(interval => transposeNote(root, interval));
}

/**
 * Create a Chord object
 */
export function createChord(
  root: NoteName,
  quality: ChordQuality,
  romanNumeral?: RomanNumeral,
  chordFunction?: ChordFunction,
  keyContext?: string
): Chord {
  const canonicalRoot = normalizeNoteName(root);
  return {
    root: canonicalRoot,
    quality,
    name: formatChordName(root, quality, keyContext),
    notes: buildChordNotes(root, quality),
    romanNumeral,
    function: chordFunction
  };
}

/**
 * Get the chord function based on scale degree
 */
export function getChordFunction(scaleDegree: number, mode: 'major' | 'minor'): ChordFunction {
  if (mode === 'major') {
    switch (scaleDegree) {
      case 0: return 'tonic';       // I
      case 1: return 'predominant'; // ii
      case 2: return 'tonic';       // iii (tonic substitute)
      case 3: return 'subdominant'; // IV
      case 4: return 'dominant';    // V
      case 5: return 'tonic';       // vi (tonic substitute)
      case 6: return 'dominant';    // vii° (dominant function)
      default: return 'tonic';
    }
  } else {
    switch (scaleDegree) {
      case 0: return 'tonic';       // i
      case 1: return 'predominant'; // ii°
      case 2: return 'tonic';       // III (relative major)
      case 3: return 'subdominant'; // iv
      case 4: return 'dominant';    // v
      case 5: return 'subdominant'; // VI
      case 6: return 'subdominant'; // VII
      default: return 'tonic';
    }
  }
}

// ============================================================================
// KEY UTILITIES
// ============================================================================

/**
 * Get the key identifier string
 */
export function getKeyId(key: Key): KeyId {
  return key.mode === 'minor' ? `${key.tonic}m` : key.tonic;
}

/**
 * Parse a key identifier string into a Key object
 */
export function parseKeyId(keyId: KeyId): Key {
  const isMinor = keyId.endsWith('m') && keyId.length > 1;
  const tonic = isMinor ? keyId.slice(0, -1) : keyId;
  return {
    tonic: normalizeNoteName(tonic as NoteName),
    mode: isMinor ? 'minor' : 'major'
  };
}

/**
 * Get all diatonic chords for a key
 */
export function getDiatonicChords(key: Key): Chord[] {
  const intervals = key.mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  const qualities = key.mode === 'major' ? MAJOR_CHORD_QUALITIES : MINOR_CHORD_QUALITIES;
  const romanNumerals = key.mode === 'major' ? MAJOR_ROMAN_NUMERALS : MINOR_ROMAN_NUMERALS;
  const keyContext = getKeyId(key);

  return intervals.map((interval, index) => {
    const root = transposeNote(key.tonic, interval);
    return createChord(
      root,
      qualities[index],
      romanNumerals[index],
      getChordFunction(index, key.mode),
      keyContext
    );
  });
}

/**
 * Get the relative minor of a major key
 */
export function getRelativeMinor(majorTonic: NoteName): CanonicalNote {
  // Relative minor is 9 semitones up (or 3 down)
  return transposeNote(majorTonic, 9);
}

/**
 * Get the relative major of a minor key
 */
export function getRelativeMajor(minorTonic: NoteName): CanonicalNote {
  // Relative major is 3 semitones up
  return transposeNote(minorTonic, 3);
}

/**
 * Get the dominant (V) of a key
 */
export function getDominant(tonic: NoteName): CanonicalNote {
  // Dominant is 7 semitones up
  return transposeNote(tonic, 7);
}

/**
 * Get the subdominant (IV) of a key
 */
export function getSubdominant(tonic: NoteName): CanonicalNote {
  // Subdominant is 5 semitones up
  return transposeNote(tonic, 5);
}

/**
 * Get all key relationships
 */
export function getKeyRelationships(key: Key): KeyRelationships {
  if (key.mode === 'major') {
    return {
      relativeKey: `${getRelativeMinor(key.tonic)}m`,
      parallelKey: `${key.tonic}m`,
      dominantKey: getDominant(key.tonic),
      subdominantKey: getSubdominant(key.tonic)
    };
  } else {
    return {
      relativeKey: getRelativeMajor(key.tonic),
      parallelKey: key.tonic,
      dominantKey: `${getDominant(key.tonic)}m`,
      subdominantKey: `${getSubdominant(key.tonic)}m`
    };
  }
}

/**
 * Transpose an entire key
 */
export function transposeKey(key: Key, semitones: number): Key {
  return {
    tonic: transposeNote(key.tonic, semitones),
    mode: key.mode
  };
}

// ============================================================================
// SCALE UTILITIES
// ============================================================================

/**
 * Get all notes in a scale
 */
export function getScaleNotes(key: Key): CanonicalNote[] {
  const intervals = key.mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  return intervals.map(interval => transposeNote(key.tonic, interval));
}

/**
 * Check if a note is in a given key
 */
export function isNoteInKey(note: NoteName, key: Key): boolean {
  const scaleNotes = getScaleNotes(key);
  return scaleNotes.includes(normalizeNoteName(note));
}

/**
 * Get the scale degree of a note in a key (0-indexed, or -1 if not in key)
 */
export function getScaleDegree(note: NoteName, key: Key): number {
  const scaleNotes = getScaleNotes(key);
  return scaleNotes.indexOf(normalizeNoteName(note));
}
