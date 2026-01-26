/**
 * Essentia.js Lazy Loader
 *
 * Handles lazy loading of the Essentia.js WASM module to minimize
 * initial bundle size. The module is only loaded when first needed.
 */

import type { AnalysisError } from '../../types/audioAnalysis';

// Type definitions for Essentia.js (the package doesn't have great types)
export interface EssentiaInstance {
  // Vector conversion utilities
  arrayToVector(arr: Float32Array): EssentiaVector;
  vectorToArray(vec: EssentiaVector): number[];

  // Audio algorithms
  HPCP(
    signal: EssentiaVector,
    harmonics?: number,
    bandPreset?: boolean,
    bandSplitFrequency?: number,
    maxFrequency?: number,
    maxShifted?: boolean,
    minFrequency?: number,
    nonLinear?: boolean,
    normalized?: string,
    referenceFrequency?: number,
    sampleRate?: number,
    size?: number,
    weightType?: string,
    windowSize?: number
  ): { hpcp: EssentiaVector };

  OnsetDetection(
    spectrum: EssentiaVector,
    phase: EssentiaVector,
    method?: string,
    sampleRate?: number
  ): { onsetDetection: number };

  BeatTrackerMultiFeature(
    signal: EssentiaVector,
    maxTempo?: number,
    minTempo?: number
  ): { ticks: EssentiaVector; confidence: number };

  RhythmExtractor2013(
    signal: EssentiaVector,
    maxTempo?: number,
    minTempo?: number
  ): { bpm: number; ticks: EssentiaVector; confidence: number; estimates: EssentiaVector };

  Spectrum(signal: EssentiaVector, size?: number): { spectrum: EssentiaVector };

  Windowing(
    signal: EssentiaVector,
    normalized?: boolean,
    size?: number,
    type?: string,
    zeroPadding?: number,
    zeroPhase?: boolean
  ): { frame: EssentiaVector };

  FrameCutter(
    signal: EssentiaVector,
    frameSize?: number,
    hopSize?: number,
    lastFrameToEndOfFile?: boolean,
    startFromZero?: boolean,
    validFrameThresholdRatio?: number
  ): { frame: EssentiaVector };

  RMS(signal: EssentiaVector): { rms: number };

  // Delete/cleanup
  delete(): void;
}

export interface EssentiaVector {
  size(): number;
  get(index: number): number;
  delete(): void;
}

// Module state
let essentiaInstance: EssentiaInstance | null = null;
let loadingPromise: Promise<EssentiaInstance> | null = null;
let isLoading = false;

/**
 * Lazily loads and returns the Essentia.js instance.
 * The WASM module is only downloaded on first call.
 * Subsequent calls return the cached instance.
 */
export async function getEssentia(): Promise<EssentiaInstance> {
  // Return cached instance if available
  if (essentiaInstance) {
    return essentiaInstance;
  }

  // Return existing loading promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  isLoading = true;
  loadingPromise = loadEssentiaModule();

  try {
    essentiaInstance = await loadingPromise;
    return essentiaInstance;
  } finally {
    isLoading = false;
    loadingPromise = null;
  }
}

/**
 * Internal function to load the Essentia WASM module
 */
async function loadEssentiaModule(): Promise<EssentiaInstance> {
  try {
    // Dynamic import for code splitting
    const { Essentia, EssentiaWASM } = await import('essentia.js');

    // Load the WASM module
    const wasmModule = await EssentiaWASM();

    // Create Essentia instance
    const instance = new Essentia(wasmModule) as EssentiaInstance;

    return instance;
  } catch (error) {
    const analysisError: AnalysisError = {
      type: 'essentia_load_failed',
      message: 'Failed to load audio analysis engine',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    throw analysisError;
  }
}

/**
 * Check if Essentia is currently loaded
 */
export function isEssentiaLoaded(): boolean {
  return essentiaInstance !== null;
}

/**
 * Check if Essentia is currently loading
 */
export function isEssentiaLoading(): boolean {
  return isLoading;
}

/**
 * Preload Essentia without waiting (for warming up)
 * Call this when user navigates to the Analyze tab
 */
export function preloadEssentia(): void {
  if (!essentiaInstance && !loadingPromise) {
    getEssentia().catch(() => {
      // Silently fail on preload - will retry when needed
    });
  }
}

/**
 * Clean up Essentia instance (call on unmount if needed)
 */
export function disposeEssentia(): void {
  if (essentiaInstance) {
    try {
      essentiaInstance.delete();
    } catch {
      // Ignore cleanup errors
    }
    essentiaInstance = null;
  }
}

export default getEssentia;
