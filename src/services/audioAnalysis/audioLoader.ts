/**
 * Audio Loader Service
 *
 * Handles loading, validating, and decoding audio files for analysis.
 * Uses Web Audio API for decoding to PCM samples.
 */

import type { AudioFile, AnalysisError, AnalysisProgressCallback } from '../../types/audioAnalysis';
import { AUDIO_CONSTRAINTS } from '../../types/audioAnalysis';

/**
 * Generate a unique ID for the audio file
 */
function generateId(): string {
  return `audio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate an audio file before processing
 */
export function validateAudioFile(file: File): AnalysisError | null {
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > AUDIO_CONSTRAINTS.maxFileSizeMB) {
    return {
      type: 'file_too_large',
      message: `File must be under ${AUDIO_CONSTRAINTS.maxFileSizeMB}MB`,
      details: `Your file is ${fileSizeMB.toFixed(1)}MB`,
    };
  }

  // Check file type
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const isValidExtension = (AUDIO_CONSTRAINTS.supportedExtensions as readonly string[]).includes(fileExtension);
  const isValidMimeType = (AUDIO_CONSTRAINTS.supportedFormats as readonly string[]).includes(file.type);

  if (!isValidExtension && !isValidMimeType) {
    return {
      type: 'unsupported_format',
      message: 'Please upload MP3, WAV, or M4A',
      details: `Received: ${file.type || fileExtension}`,
    };
  }

  return null;
}

/**
 * Get or create an AudioContext
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Convert stereo audio buffer to mono by averaging channels
 */
function convertToMono(audioBuffer: AudioBuffer): Float32Array {
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;

  if (numChannels === 1) {
    // Already mono
    return audioBuffer.getChannelData(0);
  }

  // Average all channels
  const mono = new Float32Array(length);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      mono[i] += channelData[i];
    }
  }

  // Divide by number of channels to get average
  for (let i = 0; i < length; i++) {
    mono[i] /= numChannels;
  }

  return mono;
}

/**
 * Load and decode an audio file
 */
export async function loadAudioFile(
  file: File,
  onProgress?: AnalysisProgressCallback
): Promise<AudioFile> {
  // Validate file first
  const validationError = validateAudioFile(file);
  if (validationError) {
    throw validationError;
  }

  onProgress?.('loading', 0, 'Reading file...');

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.('loading', 30, 'Decoding audio...');

    // Get audio context and decode
    const ctx = getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    onProgress?.('loading', 70, 'Processing audio...');

    // Validate duration
    if (audioBuffer.duration < AUDIO_CONSTRAINTS.minDurationSeconds) {
      throw {
        type: 'audio_too_short',
        message: `Need at least ${AUDIO_CONSTRAINTS.minDurationSeconds} seconds of audio`,
        details: `Your file is ${audioBuffer.duration.toFixed(1)} seconds`,
      } as AnalysisError;
    }

    if (audioBuffer.duration > AUDIO_CONSTRAINTS.maxDurationSeconds) {
      throw {
        type: 'file_too_large',
        message: `Audio must be under ${Math.floor(AUDIO_CONSTRAINTS.maxDurationSeconds / 60)} minutes`,
        details: `Your file is ${Math.floor(audioBuffer.duration / 60)} minutes`,
      } as AnalysisError;
    }

    // Convert to mono
    const monoSamples = convertToMono(audioBuffer);

    // Check if audio is too quiet
    const rms = calculateRMS(monoSamples);
    if (rms < 0.001) {
      throw {
        type: 'audio_too_quiet',
        message: 'Audio seems very quiet. Is this the right file?',
        details: `RMS level: ${rms.toFixed(6)}`,
      } as AnalysisError;
    }

    onProgress?.('loading', 100, 'Audio loaded');

    return {
      id: generateId(),
      name: file.name,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      samples: monoSamples,
    };
  } catch (error) {
    // Handle decoding errors
    if ((error as AnalysisError).type) {
      throw error;
    }

    throw {
      type: 'corrupt_file',
      message: "Couldn't read this file. Try a different one?",
      details: error instanceof Error ? error.message : 'Unknown decoding error',
    } as AnalysisError;
  }
}

/**
 * Calculate RMS (Root Mean Square) of audio samples
 * Used to detect if audio is too quiet
 */
function calculateRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

/**
 * Extract a segment of audio samples between two timestamps
 */
export function extractSegment(
  audioFile: AudioFile,
  startTime: number,
  endTime: number
): Float32Array {
  const startSample = Math.floor(startTime * audioFile.sampleRate);
  const endSample = Math.min(
    Math.floor(endTime * audioFile.sampleRate),
    audioFile.samples.length
  );

  return audioFile.samples.slice(startSample, endSample);
}

/**
 * Downsample audio to a lower sample rate (for faster processing)
 * Uses simple linear interpolation
 */
export function downsample(
  samples: Float32Array,
  originalRate: number,
  targetRate: number
): Float32Array {
  if (targetRate >= originalRate) {
    return samples;
  }

  const ratio = originalRate / targetRate;
  const newLength = Math.floor(samples.length / ratio);
  const downsampled = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, samples.length - 1);
    const fraction = srcIndex - srcIndexFloor;

    // Linear interpolation
    downsampled[i] = samples[srcIndexFloor] * (1 - fraction) +
                     samples[srcIndexCeil] * fraction;
  }

  return downsampled;
}

/**
 * Clean up audio context resources
 */
export function disposeAudioContext(): void {
  if (audioContext) {
    audioContext.close().catch(() => {
      // Ignore cleanup errors
    });
    audioContext = null;
  }
}

export default loadAudioFile;
