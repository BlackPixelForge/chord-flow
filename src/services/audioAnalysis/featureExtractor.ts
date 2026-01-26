/**
 * Audio Feature Extractor
 *
 * Extracts musical features from audio using Essentia.js:
 * - Beat detection and tempo estimation
 * - Chromagram (HPCP) extraction for chord recognition
 */

import type { AudioFile, BeatGrid, ChromaFrame, AnalysisProgressCallback } from '../../types/audioAnalysis';
import { getEssentia, type EssentiaInstance } from './essentiaLoader';

// Processing constants
const FRAME_SIZE = 4096;       // FFT window size
const HPCP_SIZE = 12;          // 12 pitch classes

/**
 * Extract beat grid from audio
 * Returns tempo, beat timestamps, and downbeat estimates
 */
export async function extractBeatGrid(
  audioFile: AudioFile,
  onProgress?: AnalysisProgressCallback
): Promise<BeatGrid> {
  onProgress?.('detecting_beats', 0, 'Loading analysis engine...');

  const essentia = await getEssentia();

  onProgress?.('detecting_beats', 20, 'Detecting beats...');

  // Convert audio samples to Essentia vector
  const audioVector = essentia.arrayToVector(audioFile.samples);

  try {
    // Use RhythmExtractor2013 for beat detection
    const rhythm = essentia.RhythmExtractor2013(
      audioVector,
      208,  // maxTempo
      40    // minTempo
    );

    const bpm = rhythm.bpm;
    const ticksArray = essentia.vectorToArray(rhythm.ticks);

    onProgress?.('detecting_beats', 80, 'Processing beat grid...');

    // Estimate downbeats (every 4 beats for 4/4 time)
    // This is a simplification - proper downbeat detection is complex
    const downbeats: number[] = [];
    for (let i = 0; i < ticksArray.length; i += 4) {
      if (ticksArray[i] !== undefined) {
        downbeats.push(ticksArray[i]);
      }
    }

    // Clean up Essentia vectors
    rhythm.ticks.delete();
    rhythm.estimates.delete();
    audioVector.delete();

    onProgress?.('detecting_beats', 100, 'Beat detection complete');

    return {
      tempo: bpm,
      beats: ticksArray,
      downbeats,
      timeSignature: [4, 4], // Assume 4/4 for now
    };
  } catch (error) {
    // Clean up on error
    audioVector.delete();
    throw error;
  }
}

/**
 * Fallback beat grid for when beat detection fails
 * Uses fixed intervals based on assumed tempo
 */
export function createFallbackBeatGrid(
  duration: number,
  assumedTempo: number = 120
): BeatGrid {
  const beatInterval = 60 / assumedTempo;
  const beats: number[] = [];
  const downbeats: number[] = [];

  for (let time = 0; time < duration; time += beatInterval) {
    beats.push(time);
    if (beats.length % 4 === 1) {
      downbeats.push(time);
    }
  }

  return {
    tempo: assumedTempo,
    beats,
    downbeats,
    timeSignature: [4, 4],
  };
}

/**
 * Extract chromagram (HPCP) frames from audio
 * Returns array of 12-bin chroma vectors with timestamps
 */
export async function extractChromagram(
  audioFile: AudioFile,
  beatGrid?: BeatGrid,
  onProgress?: AnalysisProgressCallback
): Promise<ChromaFrame[]> {
  onProgress?.('extracting_chroma', 0, 'Loading analysis engine...');

  const essentia = await getEssentia();

  onProgress?.('extracting_chroma', 10, 'Extracting pitch information...');

  const frames: ChromaFrame[] = [];
  const { samples, sampleRate } = audioFile;

  // If we have beats, extract one chroma per beat for better alignment
  if (beatGrid && beatGrid.beats.length > 1) {
    const totalBeats = beatGrid.beats.length;

    for (let i = 0; i < totalBeats - 1; i++) {
      const startTime = beatGrid.beats[i];
      const endTime = beatGrid.beats[i + 1];

      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.min(Math.floor(endTime * sampleRate), samples.length);

      if (endSample <= startSample) continue;

      // Extract segment
      const segment = samples.slice(startSample, endSample);
      const chroma = extractHPCPFromSegment(essentia, segment, sampleRate);

      if (chroma) {
        frames.push({
          timestamp: startTime,
          vector: chroma.hpcp,
          energy: chroma.energy,
        });
      }

      // Progress update
      if (i % 10 === 0) {
        const progress = 10 + Math.floor((i / totalBeats) * 80);
        onProgress?.('extracting_chroma', progress, `Processing beat ${i + 1}/${totalBeats}`);
      }
    }
  } else {
    // Fallback: fixed window analysis
    const windowDuration = 0.5; // 500ms windows
    const hopDuration = 0.25;   // 250ms hop
    const windowSamples = Math.floor(windowDuration * sampleRate);
    const hopSamples = Math.floor(hopDuration * sampleRate);
    const totalFrames = Math.floor((samples.length - windowSamples) / hopSamples);

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const startSample = frameIndex * hopSamples;
      const segment = samples.slice(startSample, startSample + windowSamples);
      const timestamp = startSample / sampleRate;

      const chroma = extractHPCPFromSegment(essentia, segment, sampleRate);

      if (chroma) {
        frames.push({
          timestamp,
          vector: chroma.hpcp,
          energy: chroma.energy,
        });
      }

      // Progress update
      if (frameIndex % 20 === 0) {
        const progress = 10 + Math.floor((frameIndex / totalFrames) * 80);
        onProgress?.('extracting_chroma', progress, `Processing frame ${frameIndex + 1}/${totalFrames}`);
      }
    }
  }

  onProgress?.('extracting_chroma', 100, 'Chromagram extraction complete');

  return frames;
}

/**
 * Extract HPCP from a single audio segment
 */
function extractHPCPFromSegment(
  essentia: EssentiaInstance,
  segment: Float32Array,
  sampleRate: number
): { hpcp: number[]; energy: number } | null {
  // Convert segment to Essentia vector
  const segmentVector = essentia.arrayToVector(segment);

  try {
    // Calculate RMS energy
    const rms = essentia.RMS(segmentVector);
    const energy = rms.rms;

    // Skip very quiet segments
    if (energy < 0.001) {
      segmentVector.delete();
      return null;
    }

    // Apply window
    const windowed = essentia.Windowing(segmentVector, true, FRAME_SIZE, 'hann', 0, true);

    // Compute spectrum
    const spectrum = essentia.Spectrum(windowed.frame, FRAME_SIZE);

    // Extract HPCP (Harmonic Pitch Class Profile)
    const hpcp = essentia.HPCP(
      spectrum.spectrum,
      0,           // harmonics (0 = all)
      true,        // bandPreset
      500,         // bandSplitFrequency
      5000,        // maxFrequency
      false,       // maxShifted
      40,          // minFrequency
      false,       // nonLinear
      'unitSum',   // normalized
      440,         // referenceFrequency
      sampleRate,  // sampleRate
      HPCP_SIZE,   // size
      'cosine',    // weightType
      1            // windowSize (in semitones)
    );

    const hpcpArray = essentia.vectorToArray(hpcp.hpcp);

    // Clean up
    segmentVector.delete();
    windowed.frame.delete();
    spectrum.spectrum.delete();
    hpcp.hpcp.delete();

    return { hpcp: hpcpArray, energy };
  } catch {
    segmentVector.delete();
    return null;
  }
}

/**
 * Smooth chromagram frames by averaging nearby frames
 * Helps reduce noise and transient detection errors
 */
export function smoothChromagram(
  frames: ChromaFrame[],
  windowSize: number = 3
): ChromaFrame[] {
  if (frames.length <= windowSize) {
    return frames;
  }

  const smoothed: ChromaFrame[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < frames.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(frames.length, i + halfWindow + 1);
    const windowFrames = frames.slice(start, end);

    // Average the chroma vectors
    const avgVector = new Array(12).fill(0);
    let totalEnergy = 0;

    for (const frame of windowFrames) {
      totalEnergy += frame.energy;
      for (let j = 0; j < 12; j++) {
        avgVector[j] += frame.vector[j] * frame.energy; // Weight by energy
      }
    }

    // Normalize
    if (totalEnergy > 0) {
      for (let j = 0; j < 12; j++) {
        avgVector[j] /= totalEnergy;
      }
    }

    smoothed.push({
      timestamp: frames[i].timestamp,
      vector: avgVector,
      energy: totalEnergy / windowFrames.length,
    });
  }

  return smoothed;
}
