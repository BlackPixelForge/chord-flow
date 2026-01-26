import { describe, it, expect } from 'vitest';
import {
  normalizeNoteName,
  displayNoteName,
  transposeNote,
  getInterval,
  formatChordName,
  buildChordNotes,
  createChord,
  getChordFunction,
  getDiatonicChords,
  getRelativeMinor,
  getRelativeMajor,
  getDominant,
  getSubdominant,
  getKeyRelationships,
  getScaleNotes,
  isNoteInKey,
  getScaleDegree,
  getKeyId,
  parseKeyId,
} from './musicTheory';
import type { Key } from '../types/music';

describe('Note Utilities', () => {
  describe('normalizeNoteName', () => {
    it('returns canonical note unchanged', () => {
      expect(normalizeNoteName('C')).toBe('C');
      expect(normalizeNoteName('F#')).toBe('F#');
    });

    it('converts flats to sharps', () => {
      expect(normalizeNoteName('Db')).toBe('C#');
      expect(normalizeNoteName('Eb')).toBe('D#');
      expect(normalizeNoteName('Gb')).toBe('F#');
      expect(normalizeNoteName('Ab')).toBe('G#');
      expect(normalizeNoteName('Bb')).toBe('A#');
    });
  });

  describe('displayNoteName', () => {
    it('displays sharps for sharp keys', () => {
      expect(displayNoteName('C#', 'G')).toBe('C#');
      expect(displayNoteName('F#', 'D')).toBe('F#');
    });

    it('displays flats for flat keys', () => {
      expect(displayNoteName('C#', 'F')).toBe('Db');
      expect(displayNoteName('A#', 'Bb')).toBe('Bb');
    });

    it('defaults to sharps without context', () => {
      expect(displayNoteName('C#')).toBe('C#');
      expect(displayNoteName('G#')).toBe('G#');
    });
  });

  describe('transposeNote', () => {
    it('transposes up by semitones', () => {
      expect(transposeNote('C', 1)).toBe('C#');
      expect(transposeNote('C', 2)).toBe('D');
      expect(transposeNote('C', 7)).toBe('G');
      expect(transposeNote('C', 12)).toBe('C');
    });

    it('transposes down (wraps around)', () => {
      expect(transposeNote('C', -1)).toBe('B');
      expect(transposeNote('C', -2)).toBe('A#');
    });

    it('handles flats correctly', () => {
      expect(transposeNote('Bb', 2)).toBe('C');
      expect(transposeNote('Eb', 5)).toBe('G#');
    });
  });

  describe('getInterval', () => {
    it('calculates intervals correctly', () => {
      expect(getInterval('C', 'E')).toBe(4);  // Major 3rd
      expect(getInterval('C', 'G')).toBe(7);  // Perfect 5th
      expect(getInterval('A', 'C')).toBe(3);  // Minor 3rd
    });

    it('handles enharmonic equivalents', () => {
      expect(getInterval('C', 'Db')).toBe(1);
      expect(getInterval('C', 'C#')).toBe(1);
    });
  });
});

describe('Chord Utilities', () => {
  describe('formatChordName', () => {
    it('formats major chords', () => {
      expect(formatChordName('C', 'major')).toBe('C');
      expect(formatChordName('G', 'major')).toBe('G');
    });

    it('formats minor chords', () => {
      expect(formatChordName('A', 'minor')).toBe('Am');
      expect(formatChordName('E', 'minor')).toBe('Em');
    });

    it('formats seventh chords', () => {
      expect(formatChordName('G', 'dominant7')).toBe('G7');
      expect(formatChordName('C', 'major7')).toBe('Cmaj7');
      expect(formatChordName('A', 'minor7')).toBe('Am7');
    });

    it('respects key context for display', () => {
      expect(formatChordName('Bb', 'major', 'F')).toBe('Bb');
      expect(formatChordName('Bb', 'major', 'G')).toBe('A#');
    });
  });

  describe('buildChordNotes', () => {
    it('builds major chord notes', () => {
      expect(buildChordNotes('C', 'major')).toEqual(['C', 'E', 'G']);
      expect(buildChordNotes('G', 'major')).toEqual(['G', 'B', 'D']);
    });

    it('builds minor chord notes', () => {
      expect(buildChordNotes('A', 'minor')).toEqual(['A', 'C', 'E']);
      expect(buildChordNotes('E', 'minor')).toEqual(['E', 'G', 'B']);
    });

    it('builds diminished chord notes', () => {
      expect(buildChordNotes('B', 'diminished')).toEqual(['B', 'D', 'F']);
    });

    it('builds seventh chord notes', () => {
      expect(buildChordNotes('G', 'dominant7')).toEqual(['G', 'B', 'D', 'F']);
      expect(buildChordNotes('C', 'major7')).toEqual(['C', 'E', 'G', 'B']);
    });
  });

  describe('createChord', () => {
    it('creates a complete chord object', () => {
      const chord = createChord('C', 'major', 'I', 'tonic', 'C');
      expect(chord.root).toBe('C');
      expect(chord.quality).toBe('major');
      expect(chord.name).toBe('C');
      expect(chord.notes).toEqual(['C', 'E', 'G']);
      expect(chord.romanNumeral).toBe('I');
      expect(chord.function).toBe('tonic');
    });
  });

  describe('getChordFunction', () => {
    it('returns correct functions for major key', () => {
      expect(getChordFunction(0, 'major')).toBe('tonic');      // I
      expect(getChordFunction(3, 'major')).toBe('subdominant'); // IV
      expect(getChordFunction(4, 'major')).toBe('dominant');    // V
      expect(getChordFunction(5, 'major')).toBe('tonic');       // vi
    });

    it('returns correct functions for minor key', () => {
      expect(getChordFunction(0, 'minor')).toBe('tonic');       // i
      expect(getChordFunction(3, 'minor')).toBe('subdominant'); // iv
      expect(getChordFunction(4, 'minor')).toBe('dominant');    // v
    });
  });
});

describe('Key Utilities', () => {
  describe('getKeyId and parseKeyId', () => {
    it('converts key to ID string', () => {
      expect(getKeyId({ tonic: 'C', mode: 'major' })).toBe('C');
      expect(getKeyId({ tonic: 'A', mode: 'minor' })).toBe('Am');
      expect(getKeyId({ tonic: 'F#', mode: 'minor' })).toBe('F#m');
    });

    it('parses ID string to key', () => {
      expect(parseKeyId('C')).toEqual({ tonic: 'C', mode: 'major' });
      expect(parseKeyId('Am')).toEqual({ tonic: 'A', mode: 'minor' });
      expect(parseKeyId('F#m')).toEqual({ tonic: 'F#', mode: 'minor' });
    });
  });

  describe('getDiatonicChords', () => {
    it('returns 7 diatonic chords', () => {
      const cMajor: Key = { tonic: 'C', mode: 'major' };
      const chords = getDiatonicChords(cMajor);
      expect(chords).toHaveLength(7);
    });

    it('returns correct chords for C major', () => {
      const cMajor: Key = { tonic: 'C', mode: 'major' };
      const chords = getDiatonicChords(cMajor);

      expect(chords[0].name).toBe('C');
      expect(chords[0].romanNumeral).toBe('I');

      expect(chords[1].name).toBe('Dm');
      expect(chords[1].romanNumeral).toBe('ii');

      expect(chords[4].name).toBe('G');
      expect(chords[4].romanNumeral).toBe('V');

      expect(chords[5].name).toBe('Am');
      expect(chords[5].romanNumeral).toBe('vi');
    });

    it('returns correct chords for A minor', () => {
      const aMinor: Key = { tonic: 'A', mode: 'minor' };
      const chords = getDiatonicChords(aMinor);

      expect(chords[0].name).toBe('Am');
      expect(chords[0].romanNumeral).toBe('i');

      expect(chords[2].name).toBe('C');
      expect(chords[2].romanNumeral).toBe('III');

      expect(chords[6].name).toBe('G');
      expect(chords[6].romanNumeral).toBe('VII');
    });
  });

  describe('Key Relationships', () => {
    it('finds relative minor', () => {
      expect(getRelativeMinor('C')).toBe('A');
      expect(getRelativeMinor('G')).toBe('E');
      expect(getRelativeMinor('F')).toBe('D');
    });

    it('finds relative major', () => {
      expect(getRelativeMajor('A')).toBe('C');
      expect(getRelativeMajor('E')).toBe('G');
      expect(getRelativeMajor('D')).toBe('F');
    });

    it('finds dominant', () => {
      expect(getDominant('C')).toBe('G');
      expect(getDominant('G')).toBe('D');
      expect(getDominant('F')).toBe('C');
    });

    it('finds subdominant', () => {
      expect(getSubdominant('C')).toBe('F');
      expect(getSubdominant('G')).toBe('C');
      expect(getSubdominant('D')).toBe('G');
    });

    it('gets all relationships for major key', () => {
      const cMajor: Key = { tonic: 'C', mode: 'major' };
      const relationships = getKeyRelationships(cMajor);

      expect(relationships.relativeKey).toBe('Am');
      expect(relationships.parallelKey).toBe('Cm');
      expect(relationships.dominantKey).toBe('G');
      expect(relationships.subdominantKey).toBe('F');
    });

    it('gets all relationships for minor key', () => {
      const aMinor: Key = { tonic: 'A', mode: 'minor' };
      const relationships = getKeyRelationships(aMinor);

      expect(relationships.relativeKey).toBe('C');
      expect(relationships.parallelKey).toBe('A');
      expect(relationships.dominantKey).toBe('Em');
      expect(relationships.subdominantKey).toBe('Dm');
    });
  });
});

describe('Scale Utilities', () => {
  describe('getScaleNotes', () => {
    it('returns C major scale', () => {
      const cMajor: Key = { tonic: 'C', mode: 'major' };
      expect(getScaleNotes(cMajor)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('returns A minor scale', () => {
      const aMinor: Key = { tonic: 'A', mode: 'minor' };
      expect(getScaleNotes(aMinor)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('returns G major scale', () => {
      const gMajor: Key = { tonic: 'G', mode: 'major' };
      expect(getScaleNotes(gMajor)).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
    });
  });

  describe('isNoteInKey', () => {
    const cMajor: Key = { tonic: 'C', mode: 'major' };

    it('returns true for notes in key', () => {
      expect(isNoteInKey('C', cMajor)).toBe(true);
      expect(isNoteInKey('E', cMajor)).toBe(true);
      expect(isNoteInKey('G', cMajor)).toBe(true);
    });

    it('returns false for notes not in key', () => {
      expect(isNoteInKey('C#', cMajor)).toBe(false);
      expect(isNoteInKey('Eb', cMajor)).toBe(false);
      expect(isNoteInKey('Bb', cMajor)).toBe(false);
    });
  });

  describe('getScaleDegree', () => {
    const cMajor: Key = { tonic: 'C', mode: 'major' };

    it('returns correct scale degrees', () => {
      expect(getScaleDegree('C', cMajor)).toBe(0);
      expect(getScaleDegree('D', cMajor)).toBe(1);
      expect(getScaleDegree('E', cMajor)).toBe(2);
      expect(getScaleDegree('G', cMajor)).toBe(4);
    });

    it('returns -1 for notes not in scale', () => {
      expect(getScaleDegree('C#', cMajor)).toBe(-1);
      expect(getScaleDegree('Bb', cMajor)).toBe(-1);
    });
  });
});
