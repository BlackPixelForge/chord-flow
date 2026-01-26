/**
 * Type declarations for essentia.js
 *
 * Essentia.js is a WebAssembly port of the Essentia C++ audio analysis library.
 * This provides basic type coverage for the APIs we use.
 */

// Core Essentia class
declare module 'essentia.js/dist/essentia.js-core.es.js' {
  export interface EssentiaVector {
    size(): number;
    get(index: number): number;
    delete(): void;
  }

  export interface EssentiaWASMModule {
    // WASM module interface
  }

  export default class Essentia {
    constructor(wasmModule: EssentiaWASMModule);

    arrayToVector(arr: Float32Array): EssentiaVector;
    vectorToArray(vec: EssentiaVector): number[];

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

    RhythmExtractor2013(
      signal: EssentiaVector,
      maxTempo?: number,
      minTempo?: number
    ): {
      bpm: number;
      ticks: EssentiaVector;
      confidence: number;
      estimates: EssentiaVector;
    };

    Spectrum(signal: EssentiaVector, size?: number): { spectrum: EssentiaVector };

    Windowing(
      signal: EssentiaVector,
      normalized?: boolean,
      size?: number,
      type?: string,
      zeroPadding?: number,
      zeroPhase?: boolean
    ): { frame: EssentiaVector };

    RMS(signal: EssentiaVector): { rms: number };

    delete(): void;
  }
}

// WASM loader
declare module 'essentia.js/dist/essentia-wasm.es.js' {
  export interface EssentiaWASMModule {
    // WASM module interface
  }

  export default function EssentiaWASM(): Promise<EssentiaWASMModule>;
}
