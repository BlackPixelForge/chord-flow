/**
 * Chord Recognizer
 *
 * Matches chromagram vectors to chord templates using cosine similarity.
 * Handles chord detection, smoothing, and post-processing.
 */

import type {
  ChromaFrame,
  DetectedChord,
  DetectedChordQuality,
  BeatGrid,
  AnalysisProgressCallback,
} from '../../types/audioAnalysis';
import { getAllChordTemplates } from './chordTemplates';

// Recognition parameters
const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;

interface ChordMatch {
  chord: string;
  root: string;
  quality: DetectedChordQuality;
  confidence: number;
}

/**
 * Normalize a vector to unit length
 */
function normalize(arr: number[]): number[] {
  const sum = arr.reduce((s, v) => s + v * v, 0);
  if (sum === 0) return arr;
  const norm = Math.sqrt(sum);
  return arr.map(v => v / norm);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Extract root note from chord name
 */
function extractRoot(chordName: string): string {
  const match = chordName.match(/^([A-G][#b]?)/);
  return match ? match[1] : '';
}

/**
 * Match a single chromagram vector to the best chord template
 */
export function matchChordTemplate(
  chroma: number[],
  confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD,
  detectExtended: boolean = true
): ChordMatch {
  const templates = getAllChordTemplates();
  const normalizedChroma = normalize(chroma);

  let bestMatch: ChordMatch = {
    chord: 'N/C',
    root: '',
    quality: 'unknown',
    confidence: 0,
  };

  for (const [chordName, template] of templates) {
    // Skip extended chords if not detecting them
    if (!detectExtended) {
      const quality = template.quality;
      if (
        quality === 'dominant7' ||
        quality === 'major7' ||
        quality === 'minor7' ||
        quality === 'dim7' ||
        quality === 'half-dim7' ||
        quality === 'add9'
      ) {
        continue;
      }
    }

    const similarity = cosineSimilarity(normalizedChroma, template.template);

    if (similarity > bestMatch.confidence) {
      bestMatch = {
        chord: chordName,
        root: extractRoot(chordName),
        quality: template.quality,
        confidence: similarity,
      };
    }
  }

  // Return N/C (No Chord) if confidence is too low
  if (bestMatch.confidence < confidenceThreshold) {
    return {
      chord: 'N/C',
      root: '',
      quality: 'unknown',
      confidence: bestMatch.confidence,
    };
  }

  return bestMatch;
}

/**
 * Process a sequence of chromagram frames into detected chords
 */
export function recognizeChords(
  frames: ChromaFrame[],
  beatGrid: BeatGrid,
  options: {
    confidenceThreshold?: number;
    detectExtended?: boolean;
    onProgress?: AnalysisProgressCallback;
  } = {}
): DetectedChord[] {
  const {
    confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
    detectExtended = true,
    onProgress,
  } = options;

  onProgress?.('recognizing_chords', 0, 'Matching chord templates...');

  // 1. Recognize chord for each frame
  const rawChords: Array<{
    chord: string;
    root: string;
    quality: DetectedChordQuality;
    confidence: number;
    timestamp: number;
    energy: number;
  }> = [];

  frames.forEach((frame, i) => {
    const match = matchChordTemplate(frame.vector, confidenceThreshold * 0.5, detectExtended);
    rawChords.push({
      ...match,
      timestamp: frame.timestamp,
      energy: frame.energy,
    });

    if (i % 10 === 0) {
      const progress = Math.floor((i / frames.length) * 40);
      onProgress?.('recognizing_chords', progress, `Analyzing frame ${i + 1}/${frames.length}`);
    }
  });

  onProgress?.('recognizing_chords', 40, 'Aggregating by beat...');

  // 2. Aggregate by beat (most common chord per beat wins)
  const beatChords = aggregateByBeat(rawChords, beatGrid);

  onProgress?.('recognizing_chords', 60, 'Smoothing chord sequence...');

  // 3. Merge consecutive identical chords
  const merged = mergeConsecutive(beatChords);

  onProgress?.('recognizing_chords', 80, 'Filtering outliers...');

  // 4. Filter low-confidence outliers
  const filtered = filterOutliers(merged, confidenceThreshold);

  onProgress?.('recognizing_chords', 100, 'Chord recognition complete');

  return filtered;
}

/**
 * Aggregate raw chord detections by beat
 * Uses weighted voting based on confidence
 */
function aggregateByBeat(
  rawChords: Array<{
    chord: string;
    root: string;
    quality: DetectedChordQuality;
    confidence: number;
    timestamp: number;
    energy: number;
  }>,
  beatGrid: BeatGrid
): DetectedChord[] {
  const beatChords: DetectedChord[] = [];
  const defaultBeatLength = 60 / beatGrid.tempo;

  for (let i = 0; i < beatGrid.beats.length; i++) {
    const beatStart = beatGrid.beats[i];
    const beatEnd = beatGrid.beats[i + 1] ?? beatStart + defaultBeatLength;

    // Get all chord detections within this beat
    const chordsInBeat = rawChords.filter(
      c => c.timestamp >= beatStart && c.timestamp < beatEnd
    );

    if (chordsInBeat.length === 0) continue;

    // Vote: weighted by confidence and energy
    const votes = new Map<string, { score: number; root: string; quality: DetectedChordQuality }>();

    for (const c of chordsInBeat) {
      const existing = votes.get(c.chord) ?? { score: 0, root: c.root, quality: c.quality };
      votes.set(c.chord, {
        score: existing.score + c.confidence * c.energy,
        root: c.root,
        quality: c.quality,
      });
    }

    // Find winner
    let winner = { chord: 'N/C', score: 0, root: '', quality: 'unknown' as DetectedChordQuality };
    for (const [chord, data] of votes) {
      if (data.score > winner.score) {
        winner = { chord, score: data.score, root: data.root, quality: data.quality };
      }
    }

    // Calculate average confidence
    const chordVotes = chordsInBeat.filter(c => c.chord === winner.chord);
    const avgConfidence = chordVotes.length > 0
      ? chordVotes.reduce((sum, c) => sum + c.confidence, 0) / chordVotes.length
      : 0;

    beatChords.push({
      chord: winner.chord,
      root: winner.root,
      quality: winner.quality,
      start: beatStart,
      end: beatEnd,
      confidence: avgConfidence,
      beatCount: 1,
    });
  }

  return beatChords;
}

/**
 * Merge consecutive identical chords
 */
function mergeConsecutive(chords: DetectedChord[]): DetectedChord[] {
  if (chords.length === 0) return [];

  const merged: DetectedChord[] = [];
  let current = { ...chords[0] };

  for (let i = 1; i < chords.length; i++) {
    if (chords[i].chord === current.chord) {
      // Extend current chord
      current.end = chords[i].end;
      current.beatCount += 1;
      // Running average confidence
      current.confidence =
        (current.confidence * (current.beatCount - 1) + chords[i].confidence) / current.beatCount;
    } else {
      // Push current and start new
      merged.push(current);
      current = { ...chords[i] };
    }
  }
  merged.push(current);

  return merged;
}

/**
 * Filter out brief, low-confidence outliers
 */
function filterOutliers(
  chords: DetectedChord[],
  confidenceThreshold: number
): DetectedChord[] {
  // If a chord is only 1 beat AND low confidence AND surrounded by same chord, remove it
  return chords.filter((chord, i, arr) => {
    // Keep N/C chords (represent actual silence/unclear sections)
    if (chord.chord === 'N/C') {
      return chord.beatCount >= 2; // Only keep if it spans multiple beats
    }

    // Keep longer chords
    if (chord.beatCount > 1) return true;

    // Keep high-confidence chords
    if (chord.confidence >= confidenceThreshold) return true;

    // Check if surrounded by same chord (likely an error)
    const prev = arr[i - 1]?.chord;
    const next = arr[i + 1]?.chord;

    if (prev === next && chord.chord !== prev && prev !== 'N/C') {
      return false; // Filter out this outlier
    }

    return true;
  });
}

/**
 * Get unique chords from a sequence (for key detection)
 */
export function getUniqueChords(chords: DetectedChord[]): string[] {
  const seen = new Set<string>();
  return chords
    .filter(c => c.chord !== 'N/C')
    .map(c => c.chord)
    .filter(chord => {
      if (seen.has(chord)) return false;
      seen.add(chord);
      return true;
    });
}

/**
 * Calculate overall confidence for a chord sequence
 */
export function calculateOverallConfidence(chords: DetectedChord[]): number {
  const validChords = chords.filter(c => c.chord !== 'N/C');
  if (validChords.length === 0) return 0;

  // Weight by beat count
  let totalWeight = 0;
  let weightedSum = 0;

  for (const chord of validChords) {
    totalWeight += chord.beatCount;
    weightedSum += chord.confidence * chord.beatCount;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
