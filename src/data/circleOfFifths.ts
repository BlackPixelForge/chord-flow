import type { CanonicalNote, Key } from '../types/music';
import {
  getRelativeMinor,
  getRelativeMajor,
  getKeyId
} from '../utils/musicTheory';

// Circle of fifths order for major keys (clockwise from C)
export const CIRCLE_OF_FIFTHS_MAJOR: CanonicalNote[] = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'
];

// Circle of fifths order for minor keys (inner circle, relative minors)
export const CIRCLE_OF_FIFTHS_MINOR: CanonicalNote[] = [
  'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F', 'C', 'G', 'D'
];

// Key signatures (number of sharps/flats)
// Positive = sharps, negative = flats
export const KEY_SIGNATURES: Record<string, number> = {
  // Major keys
  'C': 0,
  'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6,
  'F': -1, 'A#': -2, 'D#': -3, 'G#': -4, 'C#': -5,
  // Minor keys (same signature as relative major)
  'Am': 0,
  'Em': 1, 'Bm': 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6,
  'Dm': -1, 'Gm': -2, 'Cm': -3, 'Fm': -4, 'A#m': -5
};

// Display names for flat keys (for UI)
export const FLAT_KEY_DISPLAY: Record<string, string> = {
  'A#': 'Bb',
  'D#': 'Eb',
  'G#': 'Ab',
  'C#': 'Db',
  'F#': 'Gb',
  'A#m': 'Bbm',
  'D#m': 'Ebm',
  'G#m': 'Abm',
  'C#m': 'Dbm',
  'F#m': 'Gbm'
};

/**
 * Get position on circle of fifths (0-11, 0 = C/Am)
 */
export function getCirclePosition(key: Key): number {
  const notes = key.mode === 'major' ? CIRCLE_OF_FIFTHS_MAJOR : CIRCLE_OF_FIFTHS_MINOR;
  return notes.indexOf(key.tonic);
}

/**
 * Get the key at a specific position on the circle
 */
export function getKeyAtPosition(position: number, mode: 'major' | 'minor'): Key {
  const normalizedPos = ((position % 12) + 12) % 12;
  const notes = mode === 'major' ? CIRCLE_OF_FIFTHS_MAJOR : CIRCLE_OF_FIFTHS_MINOR;
  return {
    tonic: notes[normalizedPos],
    mode
  };
}

/**
 * Move clockwise on the circle (up a fifth)
 */
export function moveClockwise(key: Key): Key {
  const pos = getCirclePosition(key);
  return getKeyAtPosition(pos + 1, key.mode);
}

/**
 * Move counter-clockwise on the circle (up a fourth)
 */
export function moveCounterClockwise(key: Key): Key {
  const pos = getCirclePosition(key);
  return getKeyAtPosition(pos - 1, key.mode);
}

/**
 * Get neighboring keys on the circle (useful for modulations)
 */
export function getNeighboringKeys(key: Key): {
  clockwise: Key;
  counterClockwise: Key;
  relative: Key;
  parallel: Key;
} {
  const relativeNote = key.mode === 'major'
    ? getRelativeMinor(key.tonic)
    : getRelativeMajor(key.tonic);

  return {
    clockwise: moveClockwise(key),
    counterClockwise: moveCounterClockwise(key),
    relative: {
      tonic: relativeNote,
      mode: key.mode === 'major' ? 'minor' : 'major'
    },
    parallel: {
      tonic: key.tonic,
      mode: key.mode === 'major' ? 'minor' : 'major'
    }
  };
}

/**
 * Get all keys for displaying the circle of fifths
 */
export function getAllCircleKeys(): { major: Key[]; minor: Key[] } {
  return {
    major: CIRCLE_OF_FIFTHS_MAJOR.map(tonic => ({ tonic, mode: 'major' as const })),
    minor: CIRCLE_OF_FIFTHS_MINOR.map(tonic => ({ tonic, mode: 'minor' as const }))
  };
}

/**
 * Calculate the distance between two keys on the circle
 * (useful for determining how "far" a modulation is)
 */
export function getCircleDistance(from: Key, to: Key): number {
  // Convert both to major for comparison (minor keys use relative major position)
  const fromMajor = from.mode === 'major' ? from.tonic : getRelativeMajor(from.tonic);
  const toMajor = to.mode === 'major' ? to.tonic : getRelativeMajor(to.tonic);

  const fromPos = CIRCLE_OF_FIFTHS_MAJOR.indexOf(fromMajor);
  const toPos = CIRCLE_OF_FIFTHS_MAJOR.indexOf(toMajor);

  // Return the shorter distance (clockwise or counter-clockwise)
  const clockwiseDist = (toPos - fromPos + 12) % 12;
  const counterClockwiseDist = (fromPos - toPos + 12) % 12;

  return Math.min(clockwiseDist, counterClockwiseDist);
}

/**
 * Get display name for a key (handles flat key display)
 */
export function getKeyDisplayName(key: Key): string {
  const keyId = getKeyId(key);
  return FLAT_KEY_DISPLAY[keyId] ?? keyId;
}

/**
 * Common modulation targets from a given key
 */
export function getCommonModulations(key: Key): Key[] {
  const neighbors = getNeighboringKeys(key);
  const results: Key[] = [
    neighbors.relative,           // Relative major/minor
    neighbors.parallel,           // Parallel major/minor
    neighbors.clockwise,          // Dominant key
    neighbors.counterClockwise,   // Subdominant key
  ];

  // Add the relative of the dominant (common in classical)
  const dominant = neighbors.clockwise;
  const dominantRelative = {
    tonic: dominant.mode === 'major'
      ? getRelativeMinor(dominant.tonic)
      : getRelativeMajor(dominant.tonic),
    mode: dominant.mode === 'major' ? 'minor' as const : 'major' as const
  };
  results.push(dominantRelative);

  return results;
}
