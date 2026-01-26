/**
 * Audio Analysis Services
 *
 * This module provides client-side audio analysis capabilities for detecting
 * chord progressions from uploaded audio files.
 *
 * Main exports:
 * - analyzeAudio: Main entry point for full analysis pipeline
 * - essentiaLoader: Lazy-loads Essentia.js WASM module
 * - audioLoader: Handles audio file loading and decoding
 * - chordRecognizer: Detects chords from chromagram data
 * - keyDetector: Determines musical key from chord progression
 */

// Main analyzer (orchestrates full pipeline)
export { analyzeAudio } from './analyzer';

// Essentia.js loader (lazy-loaded WASM module)
export {
  getEssentia,
  isEssentiaLoaded,
  isEssentiaLoading,
  preloadEssentia,
  disposeEssentia,
} from './essentiaLoader';
export type { EssentiaInstance, EssentiaVector } from './essentiaLoader';

// Audio file loading and processing
export {
  loadAudioFile,
  validateAudioFile,
  extractSegment,
  downsample,
  disposeAudioContext,
} from './audioLoader';

// Feature extraction (beat detection, chromagram)
export {
  extractBeatGrid,
  extractChromagram,
  smoothChromagram,
  createFallbackBeatGrid,
} from './featureExtractor';

// Chord recognition
export {
  matchChordTemplate,
  recognizeChords,
  getUniqueChords,
  calculateOverallConfidence,
} from './chordRecognizer';

// Key detection
export {
  detectKey,
  analyzeProgressionInKey,
  getRelativeKey,
  getParallelKey,
} from './keyDetector';

// Chord templates
export {
  getAllChordTemplates,
  getChordTemplate,
  getTemplatesByQuality,
  PITCH_CLASS_NAMES,
  NOTE_TO_PITCH_CLASS,
  BASE_CHORD_TEMPLATES,
  QUALITY_TO_SUFFIX,
} from './chordTemplates';
