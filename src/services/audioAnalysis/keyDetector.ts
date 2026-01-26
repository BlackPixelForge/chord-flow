/**
 * Key Detector
 *
 * Detects the musical key from a chord progression using the
 * Krumhansl-Schmuckler key-finding algorithm.
 */

import type { DetectedChord, KeyAnalysis } from '../../types/audioAnalysis';
import { NOTE_TO_PITCH_CLASS, PITCH_CLASS_NAMES, BASE_CHORD_TEMPLATES } from './chordTemplates';

// Krumhansl-Schmuckler key profiles
// These represent the typical importance of each pitch class in major and minor keys
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

/**
 * Rotate an array by given positions
 */
function rotate(arr: number[], positions: number): number[] {
  const n = arr.length;
  const p = ((positions % n) + n) % n;
  return [...arr.slice(p), ...arr.slice(0, p)];
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function correlate(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let denA = 0;
  let denB = 0;

  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }

  if (denA === 0 || denB === 0) return 0;
  return num / Math.sqrt(denA * denB);
}

/**
 * Build pitch class histogram from chord progression
 * Weighted by chord duration
 */
function buildPitchHistogram(chords: DetectedChord[]): number[] {
  const histogram = new Array(12).fill(0);

  for (const chord of chords) {
    if (chord.chord === 'N/C') continue;

    const duration = chord.end - chord.start;
    const rootIdx = NOTE_TO_PITCH_CLASS[chord.root];

    if (rootIdx === undefined) continue;

    // Get chord template for this quality
    const template = BASE_CHORD_TEMPLATES[chord.quality as keyof typeof BASE_CHORD_TEMPLATES];
    if (!template) {
      // If no template, just add the root
      histogram[rootIdx] += duration;
      continue;
    }

    // Add chord tones weighted by duration
    for (let i = 0; i < 12; i++) {
      if (template[i] > 0) {
        histogram[(rootIdx + i) % 12] += template[i] * duration;
      }
    }
  }

  return histogram;
}

/**
 * Detect key from chord progression using Krumhansl-Schmuckler algorithm
 */
export function detectKey(chords: DetectedChord[]): KeyAnalysis {
  // Filter out N/C chords
  const validChords = chords.filter(c => c.chord !== 'N/C');

  if (validChords.length === 0) {
    return {
      tonic: 'C',
      mode: 'major',
      confidence: 0,
      alternateKeys: [],
    };
  }

  // Build pitch class histogram from chords
  const pitchHistogram = buildPitchHistogram(validChords);

  // Try all major and minor keys
  const keys: Array<{ tonic: string; mode: 'major' | 'minor'; score: number }> = [];

  for (let i = 0; i < 12; i++) {
    // Rotate histogram to match key (as if tonic were at position 0)
    const rotatedHistogram = rotate(pitchHistogram, -i);

    const majorScore = correlate(rotatedHistogram, MAJOR_PROFILE);
    keys.push({ tonic: PITCH_CLASS_NAMES[i], mode: 'major', score: majorScore });

    const minorScore = correlate(rotatedHistogram, MINOR_PROFILE);
    keys.push({ tonic: PITCH_CLASS_NAMES[i], mode: 'minor', score: minorScore });
  }

  // Sort by score (highest first)
  keys.sort((a, b) => b.score - a.score);

  // Normalize scores to 0-1 range
  const maxScore = keys[0].score;
  const minScore = keys[keys.length - 1].score;
  const range = maxScore - minScore;

  const normalizeScore = (score: number): number => {
    if (range === 0) return 1;
    return (score - minScore) / range;
  };

  // Get top result and alternates
  const bestKey = keys[0];
  const alternateKeys = keys
    .slice(1, 4) // Top 3 alternatives
    .filter(k => normalizeScore(k.score) > 0.3) // Only reasonably confident ones
    .map(k => ({
      tonic: k.tonic,
      mode: k.mode,
      confidence: normalizeScore(k.score),
    }));

  return {
    tonic: bestKey.tonic,
    mode: bestKey.mode,
    confidence: normalizeScore(bestKey.score),
    alternateKeys,
  };
}

/**
 * Analyze chord progression to determine Roman numerals relative to a key
 */
export function analyzeProgressionInKey(
  chords: DetectedChord[],
  key: { tonic: string; mode: 'major' | 'minor' }
): string[] {
  const tonicIndex = NOTE_TO_PITCH_CLASS[key.tonic];
  if (tonicIndex === undefined) return chords.map(() => '?');

  // Scale degrees for major and minor keys
  const majorDegrees = ['I', 'bII', 'II', 'bIII', 'III', 'IV', '#IV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
  const minorDegrees = ['i', 'bII', 'II', 'bIII', 'III', 'iv', '#iv', 'v', 'VI', 'vi', 'VII', 'vii'];

  const degrees = key.mode === 'major' ? majorDegrees : minorDegrees;

  return chords.map(chord => {
    if (chord.chord === 'N/C') return 'N/C';

    const rootIndex = NOTE_TO_PITCH_CLASS[chord.root];
    if (rootIndex === undefined) return '?';

    // Calculate interval from tonic
    const interval = (rootIndex - tonicIndex + 12) % 12;
    let romanNumeral = degrees[interval] || '?';

    // Adjust case based on chord quality
    const quality = chord.quality;

    if (quality === 'major' || quality === 'dominant7' || quality === 'major7' || quality === 'augmented') {
      romanNumeral = romanNumeral.toUpperCase();
    } else if (quality === 'minor' || quality === 'minor7' || quality === 'diminished' || quality === 'dim7' || quality === 'half-dim7') {
      romanNumeral = romanNumeral.toLowerCase();
    }

    // Add quality suffix
    if (quality === 'diminished') romanNumeral += '°';
    else if (quality === 'augmented') romanNumeral += '+';
    else if (quality === 'dominant7') romanNumeral += '7';
    else if (quality === 'major7') romanNumeral += 'maj7';
    else if (quality === 'minor7') romanNumeral += '7';
    else if (quality === 'dim7') romanNumeral += '°7';
    else if (quality === 'half-dim7') romanNumeral += 'ø7';
    else if (quality === 'sus2') romanNumeral += 'sus2';
    else if (quality === 'sus4') romanNumeral += 'sus4';

    return romanNumeral;
  });
}

/**
 * Get the relative major/minor key
 */
export function getRelativeKey(key: { tonic: string; mode: 'major' | 'minor' }): {
  tonic: string;
  mode: 'major' | 'minor';
} {
  const tonicIndex = NOTE_TO_PITCH_CLASS[key.tonic] ?? 0;

  if (key.mode === 'major') {
    // Relative minor is 3 semitones down (or 9 semitones up)
    const relativeIndex = (tonicIndex + 9) % 12;
    return { tonic: PITCH_CLASS_NAMES[relativeIndex], mode: 'minor' };
  } else {
    // Relative major is 3 semitones up
    const relativeIndex = (tonicIndex + 3) % 12;
    return { tonic: PITCH_CLASS_NAMES[relativeIndex], mode: 'major' };
  }
}

/**
 * Get the parallel major/minor key
 */
export function getParallelKey(key: { tonic: string; mode: 'major' | 'minor' }): {
  tonic: string;
  mode: 'major' | 'minor';
} {
  return {
    tonic: key.tonic,
    mode: key.mode === 'major' ? 'minor' : 'major',
  };
}
