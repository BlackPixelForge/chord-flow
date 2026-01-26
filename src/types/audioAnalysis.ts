/**
 * Audio Analysis Types
 * Types for the audio chord detection and theory analysis feature
 */

import type { ChordQuality, ChordFunction, DetailLevel } from './music';

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO FILE & PROCESSING TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AudioFile {
  id: string;
  name: string;
  duration: number;          // seconds
  sampleRate: number;        // typically 44100
  samples: Float32Array;     // mono PCM data
}

export interface BeatGrid {
  tempo: number;             // BPM
  beats: number[];           // timestamps in seconds
  downbeats: number[];       // bar start timestamps
  timeSignature: [number, number];  // e.g., [4, 4]
}

export interface ChromaFrame {
  timestamp: number;
  vector: number[];          // 12-bin pitch class profile
  energy: number;            // overall loudness
}

// ═══════════════════════════════════════════════════════════════════════════
// DETECTED CHORD TYPES
// ═══════════════════════════════════════════════════════════════════════════

// Extended chord quality for detection (includes 'unknown' for uncertain detections)
export type DetectedChordQuality = ChordQuality | 'unknown';

export interface DetectedChord {
  chord: string;             // e.g., "Am", "F", "Cmaj7"
  root: string;              // e.g., "A", "F", "C"
  quality: DetectedChordQuality;
  start: number;             // timestamp (seconds)
  end: number;               // timestamp (seconds)
  confidence: number;        // 0.0 - 1.0
  beatCount: number;         // how many beats this chord spans
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AnalysisResult {
  // Metadata
  fileInfo: {
    name: string;
    duration: number;
    analyzedAt: Date;
  };

  // Raw detection
  beatGrid: BeatGrid;
  chords: DetectedChord[];

  // Theory analysis (from existing engine)
  theoryAnalysis: TheoryAnalysis;

  // Processing stats
  processingTime: number;    // milliseconds
  overallConfidence: number; // average chord confidence
}

export interface KeyAnalysis {
  tonic: string;             // e.g., "A"
  mode: 'major' | 'minor';   // e.g., "minor"
  confidence: number;
  alternateKeys: Array<{     // other possible keys
    tonic: string;
    mode: 'major' | 'minor';
    confidence: number;
  }>;
}

export interface TheoryAnalysis {
  // Key detection
  key: KeyAnalysis;

  // Progression analysis
  progression: {
    romanNumerals: string[]; // e.g., ["i", "VI", "III", "VII"]
    functions: ChordFunction[]; // e.g., ["tonic", "submediant", "mediant", "subtonic"]
    pattern: ProgressionPattern | null; // e.g., "Andalusian cadence" if recognized
    borrowedChords: BorrowedChord[];
  };

  // Sections (if detectable)
  sections: DetectedSection[];

  // Educational insights
  insights: TheoryInsight[];

  // Related progressions from generator
  relatedProgressions: RelatedProgression[];
}

export interface ProgressionPattern {
  name: string;              // e.g., "Andalusian cadence"
  description: string;       // explanation of the pattern
  romanNumerals: string[];   // the canonical form
}

export interface BorrowedChord {
  chord: string;
  position: number;          // index in progression
  borrowedFrom: string;      // e.g., "parallel major", "Dorian mode"
  explanation: string;
}

export interface DetectedSection {
  name: string;              // "Intro", "Verse", "Chorus", "Bridge"
  start: number;             // timestamp (seconds)
  end: number;               // timestamp (seconds)
  chordIndices: number[];    // which chords belong to this section
  isRepeat: boolean;         // is this a repeat of another section?
}

export type InsightType = 'interesting_harmony' | 'common_pattern' | 'technique' | 'suggestion';

export interface TheoryInsight {
  type: InsightType;
  title: string;
  description: string;
  relatedChords: number[];   // indices of relevant chords
  learnMoreUrl?: string;
}

export interface RelatedProgression {
  chords: string[];
  romanNumerals: string[];
  similarity: number;        // 0.0 - 1.0
  description: string;       // "Same progression in relative major"
  source?: string;           // "Similar to verse of 'Hotel California'"
}

// ═══════════════════════════════════════════════════════════════════════════
// UI STATE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AnalyzerStatus =
  | 'idle'
  | 'loading'           // decoding audio
  | 'detecting_beats'   // finding tempo/beats
  | 'extracting_chroma' // computing chromagrams
  | 'recognizing_chords'// matching to templates
  | 'analyzing_theory'  // running theory engine
  | 'complete'
  | 'error';

export interface AnalyzerPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  currentChordIndex: number;
}

export interface AnalyzerDisplayOptions {
  showConfidence: boolean;
  showRomanNumerals: boolean;
  showTimestamps: boolean;
  highlightBorrowedChords: boolean;
  detailLevel: DetailLevel;
}

export interface AnalyzerState {
  status: AnalyzerStatus;
  audioFile: AudioFile | null;
  result: AnalysisResult | null;
  error: string | null;
  progress: number;          // 0-100 for progress bar

  // Playback state
  playback: AnalyzerPlaybackState;

  // UI preferences
  display: AnalyzerDisplayOptions;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHORD TEMPLATE TYPES
// ═══════════════════════════════════════════════════════════════════════════

// Pitch class indices: C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ChromaVector = [number, number, number, number, number, number,
                            number, number, number, number, number, number];

export interface ChordTemplate {
  name: string;
  quality: ChordQuality;
  template: ChromaVector;    // 12-bin template
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESSING CALLBACK TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AnalysisProgressCallback {
  (status: AnalyzerStatus, progress: number, message?: string): void;
}

export interface AnalysisOptions {
  onProgress?: AnalysisProgressCallback;
  confidenceThreshold?: number;  // Default: 0.5
  detectExtendedChords?: boolean; // Default: true
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AnalysisErrorType =
  | 'file_too_large'
  | 'unsupported_format'
  | 'corrupt_file'
  | 'audio_too_quiet'
  | 'audio_too_short'
  | 'processing_failed'
  | 'essentia_load_failed';

export interface AnalysisError {
  type: AnalysisErrorType;
  message: string;
  details?: string;
}

// File validation constants
export const AUDIO_CONSTRAINTS = {
  maxFileSizeMB: 15,
  minDurationSeconds: 10,
  maxDurationSeconds: 600,  // 10 minutes
  supportedFormats: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'],
  supportedExtensions: ['.mp3', '.wav', '.m4a'],
} as const;
