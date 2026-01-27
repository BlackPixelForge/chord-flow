import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import type { Chord, Progression, Song, AudioState, GuitarFingering } from '../types/music';
import { getChordVoicings } from '../data/chords';

// ============================================================================
// VOICE LEADING - Minimum Travel Algorithm
// ============================================================================

// Standard guitar tuning: base MIDI note for each open string
// String index 0 = 6th string (low E), index 5 = 1st string (high E)
const STRING_BASE_MIDI = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

// Note name to semitone offset within octave
const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11,
};

/**
 * Convert a fingering to MIDI note values for each string
 * Muted strings ('x') are represented as null
 */
function fingeringToMidi(fingering: GuitarFingering): (number | null)[] {
  return fingering.strings.map((fret, stringIndex) => {
    if (fret === 'x') return null;
    return STRING_BASE_MIDI[stringIndex] + (fret as number);
  });
}

/**
 * Convert MIDI note values back to note names with octaves for playback
 */
function midiToNoteNames(midiNotes: (number | null)[]): string[] {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const result: string[] = [];

  for (const midi of midiNotes) {
    if (midi !== null) {
      const octave = Math.floor(midi / 12) - 1;
      const noteIndex = midi % 12;
      result.push(noteNames[noteIndex] + octave);
    }
  }

  return result;
}

/**
 * Calculate the movement cost between two voicings
 * Lower cost = smoother voice leading
 * Only compares strings that are played in both voicings
 */
function calculateVoicingCost(
  lastMidi: (number | null)[],
  candidateMidi: (number | null)[]
): number {
  let cost = 0;
  let comparedStrings = 0;

  for (let i = 0; i < 6; i++) {
    const lastNote = lastMidi[i];
    const candidateNote = candidateMidi[i];

    // Only compare if both strings are played
    if (lastNote !== null && candidateNote !== null) {
      cost += Math.abs(candidateNote - lastNote);
      comparedStrings++;
    }
  }

  // If no strings could be compared, return a high cost
  // This shouldn't happen in practice with real chord voicings
  return comparedStrings > 0 ? cost : 1000;
}

/**
 * Select the best voicing from candidates using minimum travel algorithm
 * Returns the MIDI notes for the selected voicing
 */
function selectBestVoicing(
  chord: Chord,
  lastMidi: (number | null)[] | null
): (number | null)[] {
  // Get all available voicings for this chord
  const voicings = getChordVoicings(chord.root, chord.quality);

  // If no voicings found, return a fallback
  if (voicings.length === 0) {
    // Fallback: create simple voicing from chord notes
    return createFallbackVoicing(chord);
  }

  // If this is the first chord (no previous voicing), use the first/open voicing
  if (!lastMidi) {
    return fingeringToMidi(voicings[0]);
  }

  // Find the voicing with minimum movement cost
  let bestVoicing = voicings[0];
  let bestCost = Infinity;

  for (const voicing of voicings) {
    const candidateMidi = fingeringToMidi(voicing);
    const cost = calculateVoicingCost(lastMidi, candidateMidi);

    if (cost < bestCost) {
      bestCost = cost;
      bestVoicing = voicing;
    }
  }

  return fingeringToMidi(bestVoicing);
}

/**
 * Fallback voicing when no predefined fingerings exist
 * Creates a basic voicing from chord notes
 */
function createFallbackVoicing(chord: Chord): (number | null)[] {
  const notes = chord.notes;
  if (notes.length === 0) return [null, null, null, null, null, null];

  const root = notes[0];
  const third = notes[1] || root;
  const fifth = notes[2] || root;
  const seventh = notes[3];

  // Simple voicing pattern: root-fifth-root/7th-third-fifth-root
  const voicingNotes = [root, fifth, seventh || root, third, fifth, root];
  const octaves = [2, 2, 3, 3, 3, 4];

  return voicingNotes.map((note, i) => {
    const semitone = NOTE_TO_SEMITONE[note] ?? 0;
    return (octaves[i] + 1) * 12 + semitone;
  });
}

export function useChordAudio() {
  const [audioState, setAudioState] = useState<AudioState>({
    isReady: false,
    isPlaying: false,
    currentChordIndex: -1,
    currentSectionIndex: -1,
  });

  // Audio nodes
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const isLoopingRef = useRef(false);
  const strumDirectionRef = useRef<'down' | 'up'>('down');

  // Voice leading: track the last played voicing for smooth transitions
  const lastVoicingRef = useRef<(number | null)[] | null>(null);

  // Initialize audio context and create guitar-like sound
  const initializeAudio = useCallback(async () => {
    if (audioState.isReady) return true;

    try {
      await Tone.start();

      // Limiter to prevent clipping
      limiterRef.current = new Tone.Limiter(-3).toDestination();

      // Reverb for room sound
      reverbRef.current = new Tone.Reverb({
        decay: 1.5,
        wet: 0.2,
      });
      await reverbRef.current.generate();
      reverbRef.current.connect(limiterRef.current);

      // Low-pass filter to soften the sound (guitars don't have harsh highs)
      filterRef.current = new Tone.Filter({
        type: 'lowpass',
        frequency: 3000,
        Q: 1,
      });
      filterRef.current.connect(reverbRef.current);

      // PolySynth with FMSynth for plucky guitar-like tones
      synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
        volume: -8,
        harmonicity: 3,
        modulationIndex: 10,
        envelope: {
          attack: 0.001,
          decay: 0.3,
          sustain: 0.2,
          release: 1.2,
        },
        modulation: {
          type: 'triangle',
        },
        modulationEnvelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0.1,
          release: 0.5,
        },
      });
      synthRef.current.maxPolyphony = 12;
      synthRef.current.connect(filterRef.current);

      setAudioState(prev => ({ ...prev, isReady: true }));
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, [audioState.isReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      reverbRef.current?.dispose();
      limiterRef.current?.dispose();
    };
  }, []);

  // Play a strummed chord with realistic guitar sound and voice leading
  const playStrummedChord = useCallback(
    (chord: Chord, time: number, duration: string = '2n') => {
      if (!synthRef.current) return;

      // Select the best voicing using minimum travel algorithm
      const selectedMidi = selectBestVoicing(chord, lastVoicingRef.current);

      // Update the last voicing for the next chord
      lastVoicingRef.current = selectedMidi;

      // Convert MIDI values to note names for playback
      const voicedNotes = midiToNoteNames(selectedMidi);

      if (voicedNotes.length === 0) return;

      const strumTime = 0.06; // 60ms for audible strum effect
      const direction = strumDirectionRef.current;

      // Play each note with staggered timing to simulate strumming
      voicedNotes.forEach((note, index) => {
        const strumOffset = direction === 'down'
          ? index * (strumTime / voicedNotes.length)
          : (voicedNotes.length - 1 - index) * (strumTime / voicedNotes.length);

        const noteTime = time + strumOffset;
        // Slight velocity variation for realism (lower strings slightly louder)
        const velocity = direction === 'down'
          ? 0.7 + (index * 0.03)
          : 0.85 - (index * 0.02);

        try {
          synthRef.current?.triggerAttackRelease(
            note,
            duration,
            noteTime,
            Math.min(1, Math.max(0.3, velocity))
          );
        } catch (e) {
          // Ignore timing errors for notes scheduled in the past
        }
      });

      // Alternate strum direction for natural feel
      strumDirectionRef.current = direction === 'down' ? 'up' : 'down';
    },
    []
  );

  // Play a single chord (for clicking on individual chords)
  const playChord = useCallback(
    async (chord: Chord, duration: string = '2n') => {
      if (!audioState.isReady) {
        const success = await initializeAudio();
        if (!success) return;
      }

      const now = Tone.now();
      playStrummedChord(chord, now, duration);
    },
    [audioState.isReady, initializeAudio, playStrummedChord]
  );

  // Stop all playback
  const stopPlayback = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    Tone.getTransport().position = 0;
    Tone.getTransport().loop = false;
    synthRef.current?.releaseAll();
    strumDirectionRef.current = 'down';
    // Reset voice leading state so next playback starts fresh
    lastVoicingRef.current = null;
    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      currentChordIndex: -1,
      currentSectionIndex: -1,
    }));
  }, []);

  // Play a multi-section song
  const playSong = useCallback(
    async (song: Song, tempo: number, loop: boolean = false) => {
      if (!audioState.isReady) {
        const success = await initializeAudio();
        if (!success) return;
      }

      stopPlayback();

      isLoopingRef.current = loop;
      Tone.getTransport().bpm.value = tempo;

      // Flatten all chords with section tracking
      const allChords: { chord: Chord; sectionIndex: number; chordIndex: number }[] = [];
      song.sections.forEach((section, sectionIndex) => {
        section.chords.forEach((chord, chordIndex) => {
          allChords.push({ chord, sectionIndex, chordIndex });
        });
      });

      if (allChords.length === 0) return;

      // Schedule each chord
      const measureDuration = Tone.Time('1m').toSeconds();

      allChords.forEach((item, index) => {
        const { chord, sectionIndex, chordIndex } = item;
        const startTime = index * measureDuration;

        Tone.getTransport().schedule((time) => {
          playStrummedChord(chord, time, '2n');

          // Update UI on the main thread
          Tone.getDraw().schedule(() => {
            setAudioState(prev => ({
              ...prev,
              currentSectionIndex: sectionIndex,
              currentChordIndex: chordIndex,
            }));
          }, time);
        }, startTime);
      });

      // Set up looping
      if (loop) {
        const loopDuration = allChords.length * measureDuration;
        Tone.getTransport().loop = true;
        Tone.getTransport().loopStart = 0;
        Tone.getTransport().loopEnd = loopDuration;
      }

      Tone.getTransport().start();
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        currentSectionIndex: 0,
        currentChordIndex: 0,
      }));

      // Schedule end for non-looping playback
      if (!loop) {
        const endTime = allChords.length * measureDuration + 2;
        Tone.getTransport().scheduleOnce(() => {
          stopPlayback();
        }, endTime);
      }
    },
    [audioState.isReady, initializeAudio, stopPlayback, playStrummedChord]
  );

  // Play a simple progression
  const playProgression = useCallback(
    async (progression: Progression, tempo: number, loop: boolean = false) => {
      if (!audioState.isReady) {
        const success = await initializeAudio();
        if (!success) return;
      }

      stopPlayback();

      isLoopingRef.current = loop;
      Tone.getTransport().bpm.value = tempo;

      const chords = progression.chords;
      if (chords.length === 0) return;

      // Schedule each chord
      const measureDuration = Tone.Time('1m').toSeconds();

      chords.forEach((chord, index) => {
        const startTime = index * measureDuration;

        Tone.getTransport().schedule((time) => {
          playStrummedChord(chord, time, '2n');

          Tone.getDraw().schedule(() => {
            setAudioState(prev => ({ ...prev, currentChordIndex: index }));
          }, time);
        }, startTime);
      });

      // Set up looping
      if (loop) {
        const loopDuration = chords.length * measureDuration;
        Tone.getTransport().loop = true;
        Tone.getTransport().loopStart = 0;
        Tone.getTransport().loopEnd = loopDuration;
      }

      Tone.getTransport().start();
      setAudioState(prev => ({ ...prev, isPlaying: true, currentChordIndex: 0 }));

      // Schedule end for non-looping playback
      if (!loop) {
        const endTime = chords.length * measureDuration + 2;
        Tone.getTransport().scheduleOnce(() => {
          stopPlayback();
        }, endTime);
      }
    },
    [audioState.isReady, initializeAudio, stopPlayback, playStrummedChord]
  );

  // Update tempo while playing
  const setTempo = useCallback((tempo: number) => {
    Tone.getTransport().bpm.value = tempo;
  }, []);

  // Update loop setting
  const setLooping = useCallback((loop: boolean) => {
    isLoopingRef.current = loop;
    Tone.getTransport().loop = loop;
  }, []);

  return {
    audioState,
    initializeAudio,
    playChord,
    playProgression,
    playSong,
    stopPlayback,
    setTempo,
    setLooping,
  };
}

export default useChordAudio;
