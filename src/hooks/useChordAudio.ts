import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import type { Chord, Progression, Song, AudioState } from '../types/music';

/**
 * Convert chord notes to guitar-appropriate voicing
 * Creates a realistic 6-string guitar voicing across octaves 2-4
 */
function getGuitarVoicing(chord: Chord): string[] {
  const notes = chord.notes;

  if (notes.length === 0) return [];

  const root = notes[0];
  const third = notes[1] || root;
  const fifth = notes[2] || root;
  const seventh = notes[3];

  // Create a typical open guitar chord voicing (low to high strings)
  // E2-A2-D3-G3-B3-E4 are standard guitar tuning
  const voicing: string[] = [];

  // String 6 (low E) - root in bass
  voicing.push(root + '2');

  // String 5 (A) - fifth
  voicing.push(fifth + '2');

  // String 4 (D) - root or seventh
  if (seventh) {
    voicing.push(seventh + '3');
  } else {
    voicing.push(root + '3');
  }

  // String 3 (G) - third
  voicing.push(third + '3');

  // String 2 (B) - fifth
  voicing.push(fifth + '3');

  // String 1 (high E) - root
  voicing.push(root + '4');

  return voicing;
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

  // Play a strummed chord with realistic guitar sound
  const playStrummedChord = useCallback(
    (chord: Chord, time: number, duration: string = '2n') => {
      if (!synthRef.current) return;

      const voicedNotes = getGuitarVoicing(chord);
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
