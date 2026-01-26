/**
 * Main Audio Analyzer
 *
 * Orchestrates the complete audio analysis pipeline:
 * 1. Load and decode audio file
 * 2. Extract beat grid
 * 3. Extract chromagram
 * 4. Recognize chords
 * 5. Detect key
 * 6. Analyze theory (placeholder for integration)
 */

import type {
  AnalysisResult,
  AnalysisOptions,
  AnalyzerStatus,
  AnalysisProgressCallback,
  TheoryAnalysis,
  TheoryInsight,
  DetectedChord,
  KeyAnalysis,
  BeatGrid,
} from '../../types/audioAnalysis';
import { loadAudioFile } from './audioLoader';
import { extractBeatGrid, extractChromagram, smoothChromagram, createFallbackBeatGrid } from './featureExtractor';
import { recognizeChords, calculateOverallConfidence } from './chordRecognizer';
import { detectKey, analyzeProgressionInKey, getRelativeKey } from './keyDetector';

/**
 * Analyze an audio file for chord detection
 */
export async function analyzeAudio(
  file: File,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  const {
    onProgress,
    confidenceThreshold = 0.5,
    detectExtendedChords = true,
  } = options;

  const startTime = performance.now();

  try {
    // Step 1: Load audio file
    reportProgress(onProgress, 'loading', 0, 'Loading audio file...');
    const audioFile = await loadAudioFile(file, onProgress);

    // Step 2: Extract beat grid
    reportProgress(onProgress, 'detecting_beats', 0, 'Detecting beats...');
    let beatGrid: BeatGrid;

    try {
      beatGrid = await extractBeatGrid(audioFile, onProgress);
    } catch (error) {
      // Fallback to fixed window analysis if beat detection fails
      console.warn('Beat detection failed, using fallback:', error);
      beatGrid = createFallbackBeatGrid(audioFile.duration, 120);
    }

    // Step 3: Extract chromagram
    reportProgress(onProgress, 'extracting_chroma', 0, 'Extracting pitch information...');
    let chromaFrames = await extractChromagram(audioFile, beatGrid, onProgress);

    // Smooth chromagram to reduce noise
    chromaFrames = smoothChromagram(chromaFrames, 3);

    // Step 4: Recognize chords
    reportProgress(onProgress, 'recognizing_chords', 0, 'Recognizing chords...');
    const chords = recognizeChords(chromaFrames, beatGrid, {
      confidenceThreshold,
      detectExtended: detectExtendedChords,
      onProgress,
    });

    // Step 5: Detect key
    reportProgress(onProgress, 'analyzing_theory', 0, 'Analyzing music theory...');
    const keyAnalysis = detectKey(chords);

    // Step 6: Get Roman numerals
    const romanNumerals = analyzeProgressionInKey(chords, keyAnalysis);

    // Step 7: Build theory analysis (basic for now)
    const theoryAnalysis = buildTheoryAnalysis(chords, keyAnalysis, romanNumerals);

    reportProgress(onProgress, 'complete', 100, 'Analysis complete!');

    const processingTime = performance.now() - startTime;

    return {
      fileInfo: {
        name: file.name,
        duration: audioFile.duration,
        analyzedAt: new Date(),
      },
      beatGrid,
      chords,
      theoryAnalysis,
      processingTime,
      overallConfidence: calculateOverallConfidence(chords),
    };
  } catch (error) {
    reportProgress(onProgress, 'error', 0, 'Analysis failed');
    throw error;
  }
}

/**
 * Helper to report progress
 */
function reportProgress(
  callback: AnalysisProgressCallback | undefined,
  status: AnalyzerStatus,
  progress: number,
  message?: string
): void {
  callback?.(status, progress, message);
}

/**
 * Build basic theory analysis from detected chords
 */
function buildTheoryAnalysis(
  chords: DetectedChord[],
  key: KeyAnalysis,
  romanNumerals: string[]
): TheoryAnalysis {
  // Get chord functions (simplified)
  const functions = chords.map((_chord, i) => {
    const rn = romanNumerals[i];
    if (rn === 'N/C') return 'tonic';

    const baseRn = rn.replace(/[°+7ø]|maj7|sus[24]/g, '').toLowerCase();

    // Determine function based on Roman numeral
    if (['i', 'I'].includes(baseRn)) return 'tonic';
    if (['iii', 'III', 'vi', 'VI'].includes(baseRn)) return 'tonic-substitute';
    if (['ii', 'II', 'iv', 'IV'].includes(baseRn)) return 'subdominant';
    if (['v', 'V', 'vii', 'VII'].includes(baseRn)) return 'dominant';
    return 'borrowed';
  });

  // Identify common patterns (simplified)
  const pattern = identifyPattern(romanNumerals);

  // Detect borrowed chords (simplified)
  const borrowedChords = detectBorrowedChords(chords, key, romanNumerals);

  // Generate basic insights
  const insights = generateInsights(chords, key, romanNumerals, borrowedChords);

  // Generate related progressions (simplified)
  const relatedProgressions = generateRelatedProgressions(romanNumerals, key);

  return {
    key,
    progression: {
      romanNumerals,
      functions: functions as any[],
      pattern,
      borrowedChords,
    },
    sections: [], // Section detection is complex - future enhancement
    insights,
    relatedProgressions,
  };
}

/**
 * Identify common progression patterns
 */
function identifyPattern(romanNumerals: string[]): { name: string; description: string; romanNumerals: string[] } | null {
  // Normalize Roman numerals for comparison
  const normalized = romanNumerals
    .filter(rn => rn !== 'N/C')
    .map(rn => rn.replace(/7|maj7|°7|ø7|sus[24]/g, '').toLowerCase());

  // Get unique sequence (remove consecutive duplicates)
  const unique: string[] = [];
  for (const rn of normalized) {
    if (unique[unique.length - 1] !== rn) {
      unique.push(rn);
    }
  }

  const sequence = unique.join('-');

  // Known patterns
  const patterns: Record<string, { name: string; description: string }> = {
    'i-vi-iii-vii': {
      name: 'Andalusian Cadence',
      description: 'One of the most iconic progressions in Western music, descending through the natural minor scale.',
    },
    'i-vii-vi-v': {
      name: 'Andalusian Cadence',
      description: 'One of the most iconic progressions in Western music, descending through the natural minor scale.',
    },
    'i-iv-vii-iii-vi-ii-v': {
      name: 'Circle Progression',
      description: 'A progression that follows the circle of fifths, creating a sense of harmonic movement.',
    },
    'i-iv-v': {
      name: '1-4-5 Progression',
      description: 'The fundamental blues progression, used in countless songs across genres.',
    },
    'i-v-vi-iv': {
      name: 'Pop Progression',
      description: 'Also known as the "Axis of Awesome" progression, used in hundreds of popular songs.',
    },
    'vi-iv-i-v': {
      name: 'Pop Progression (variant)',
      description: 'A minor-key variant of the famous four-chord progression.',
    },
    'ii-v-i': {
      name: 'ii-V-I Turnaround',
      description: 'The most common progression in jazz, creating strong harmonic resolution.',
    },
    'i-vi-iv-v': {
      name: '50s Progression',
      description: 'A classic doo-wop progression from the 1950s, still widely used today.',
    },
  };

  // Check for matches
  for (const [pattern, info] of Object.entries(patterns)) {
    if (sequence.includes(pattern) || sequence === pattern) {
      return {
        name: info.name,
        description: info.description,
        romanNumerals: pattern.split('-'),
      };
    }
  }

  return null;
}

/**
 * Detect chords borrowed from parallel modes
 */
function detectBorrowedChords(
  chords: DetectedChord[],
  key: KeyAnalysis,
  romanNumerals: string[]
): Array<{ chord: string; position: number; borrowedFrom: string; explanation: string }> {
  const borrowed: Array<{
    chord: string;
    position: number;
    borrowedFrom: string;
    explanation: string;
  }> = [];

  // Expected diatonic chords (for reference in future enhanced detection)
  // const diatonicMajor = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
  // const diatonicMinor = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

  romanNumerals.forEach((rn, index) => {
    if (rn === 'N/C') return;

    const baseRn = rn.replace(/[°+7ø]|maj7|sus[24]/g, '').toLowerCase();
    const chord = chords[index];

    // Check for common borrowed chords
    if (key.mode === 'major') {
      if (baseRn === 'iv' && chord.quality === 'minor') {
        borrowed.push({
          chord: chord.chord,
          position: index,
          borrowedFrom: 'parallel minor',
          explanation: 'The minor iv chord is borrowed from the parallel minor, adding a darker emotional color.',
        });
      } else if (baseRn.includes('bvii') || baseRn.includes('bvi')) {
        borrowed.push({
          chord: chord.chord,
          position: index,
          borrowedFrom: 'Mixolydian/Aeolian mode',
          explanation: 'This flat-scale chord adds a modal flavor borrowed from related modes.',
        });
      }
    } else if (key.mode === 'minor') {
      if (baseRn === 'iv' && chord.quality === 'major') {
        borrowed.push({
          chord: chord.chord,
          position: index,
          borrowedFrom: 'parallel major (Dorian)',
          explanation: 'The major IV chord is borrowed from the Dorian mode or parallel major, brightening the sound.',
        });
      } else if (baseRn === 'v' && chord.quality === 'major') {
        borrowed.push({
          chord: chord.chord,
          position: index,
          borrowedFrom: 'harmonic minor',
          explanation: 'The major V chord is from the harmonic minor, creating a stronger resolution to the tonic.',
        });
      }
    }
  });

  return borrowed;
}

/**
 * Generate educational insights about the progression
 */
function generateInsights(
  _chords: DetectedChord[],
  key: KeyAnalysis,
  romanNumerals: string[],
  borrowedChords: Array<{ chord: string; position: number; borrowedFrom: string; explanation: string }>
): TheoryInsight[] {
  const insights: Array<{
    type: 'interesting_harmony' | 'common_pattern' | 'technique' | 'suggestion';
    title: string;
    description: string;
    relatedChords: number[];
  }> = [];

  // Note the key and mode
  insights.push({
    type: 'common_pattern',
    title: `Key: ${key.tonic} ${key.mode}`,
    description: key.mode === 'major'
      ? 'Major keys typically sound bright, happy, or triumphant.'
      : 'Minor keys often convey sadness, tension, or introspection.',
    relatedChords: [],
  });

  // Note borrowed chords
  if (borrowedChords.length > 0) {
    insights.push({
      type: 'interesting_harmony',
      title: 'Modal Borrowing',
      description: `This progression uses ${borrowedChords.length} borrowed chord${borrowedChords.length > 1 ? 's' : ''}, mixing modes for emotional complexity.`,
      relatedChords: borrowedChords.map(b => b.position),
    });
  }

  // Check for strong cadences
  for (let i = 0; i < romanNumerals.length - 1; i++) {
    const current = romanNumerals[i].toLowerCase().replace(/[°+7ø]|maj7|sus[24]/g, '');
    const next = romanNumerals[i + 1].toLowerCase().replace(/[°+7ø]|maj7|sus[24]/g, '');

    // V-I or V-i (authentic cadence)
    if (current === 'v' && (next === 'i')) {
      insights.push({
        type: 'technique',
        title: 'Authentic Cadence',
        description: 'The V → I (or i) motion creates a strong sense of resolution, the most powerful cadence in Western music.',
        relatedChords: [i, i + 1],
      });
      break; // Only note once
    }

    // V-vi (deceptive cadence)
    if (current === 'v' && next === 'vi') {
      insights.push({
        type: 'technique',
        title: 'Deceptive Cadence',
        description: 'The V → vi motion surprises the ear by resolving to the relative minor instead of the expected tonic.',
        relatedChords: [i, i + 1],
      });
    }
  }

  return insights;
}

/**
 * Generate related progressions (simplified)
 */
function generateRelatedProgressions(
  romanNumerals: string[],
  key: KeyAnalysis
): Array<{
  chords: string[];
  romanNumerals: string[];
  similarity: number;
  description: string;
}> {
  const relativeKey = getRelativeKey(key);

  return [
    {
      chords: [], // Would need to convert Roman numerals to chords
      romanNumerals,
      similarity: 0.9,
      description: `Same progression in relative ${relativeKey.mode} (${relativeKey.tonic} ${relativeKey.mode})`,
    },
  ];
}

export default analyzeAudio;
