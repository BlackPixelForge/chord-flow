import type { NoteName, CanonicalNote, ChordQuality, GuitarFingering, BarreShape } from '../types/music';
import { normalizeNoteName, formatChordName } from '../utils/musicTheory';

// ============================================================================
// BARRE CHORD SHAPES
// ============================================================================

// Moveable barre chord shapes - fret 0 represents the barre position
// These shapes transpose by moving the barre up/down the neck
export const BARRE_SHAPES: BarreShape[] = [
  // E-shape major (root on 6th string)
  { name: 'E-shape', quality: 'major', rootString: 6,
    shape: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1] },

  // E-shape minor
  { name: 'E-shape', quality: 'minor', rootString: 6,
    shape: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1] },

  // E-shape dominant 7
  { name: 'E-shape', quality: 'dominant7', rootString: 6,
    shape: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1] },

  // E-shape minor 7
  { name: 'E-shape', quality: 'minor7', rootString: 6,
    shape: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1] },

  // E-shape major 7
  { name: 'E-shape', quality: 'major7', rootString: 6,
    shape: [0, 2, 1, 1, 0, 0], fingers: [1, 4, 2, 3, 1, 1] },

  // A-shape major (root on 5th string)
  { name: 'A-shape', quality: 'major', rootString: 5,
    shape: ['x', 0, 2, 2, 2, 0], fingers: [null, 1, 2, 3, 4, 1] },

  // A-shape minor
  { name: 'A-shape', quality: 'minor', rootString: 5,
    shape: ['x', 0, 2, 2, 1, 0], fingers: [null, 1, 3, 4, 2, 1] },

  // A-shape dominant 7
  { name: 'A-shape', quality: 'dominant7', rootString: 5,
    shape: ['x', 0, 2, 0, 2, 0], fingers: [null, 1, 2, 1, 3, 1] },

  // A-shape minor 7
  { name: 'A-shape', quality: 'minor7', rootString: 5,
    shape: ['x', 0, 2, 0, 1, 0], fingers: [null, 1, 3, 1, 2, 1] },

  // A-shape major 7
  { name: 'A-shape', quality: 'major7', rootString: 5,
    shape: ['x', 0, 2, 1, 2, 0], fingers: [null, 1, 3, 2, 4, 1] },

  // D-shape major (root on 4th string)
  { name: 'D-shape', quality: 'major', rootString: 4,
    shape: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, 1, 2, 4, 3] },

  // D-shape minor
  { name: 'D-shape', quality: 'minor', rootString: 4,
    shape: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, 1, 2, 4, 1] },

  // Diminished (symmetric shape, moveable)
  { name: 'dim-shape', quality: 'diminished', rootString: 5,
    shape: ['x', 0, 1, 2, 1, 'x'], fingers: [null, 1, 2, 4, 3, null] },

  // Sus4 shapes
  { name: 'E-shape', quality: 'sus4', rootString: 6,
    shape: [0, 2, 2, 2, 0, 0], fingers: [1, 2, 3, 4, 1, 1] },

  { name: 'A-shape', quality: 'sus4', rootString: 5,
    shape: ['x', 0, 2, 2, 3, 0], fingers: [null, 1, 2, 3, 4, 1] },

  // Sus2 shapes
  { name: 'E-shape', quality: 'sus2', rootString: 6,
    shape: [0, 2, 4, 4, 0, 0], fingers: [1, 2, 3, 4, 1, 1] },

  { name: 'A-shape', quality: 'sus2', rootString: 5,
    shape: ['x', 0, 2, 2, 0, 0], fingers: [null, 1, 3, 4, 1, 1] },

  // Augmented shapes (symmetrical - every note is root)
  { name: 'E-shape', quality: 'augmented', rootString: 6,
    shape: ['x', 'x', 2, 1, 1, 0], fingers: [null, null, 3, 1, 2, null] },

  { name: 'A-shape', quality: 'augmented', rootString: 5,
    shape: ['x', 0, 3, 2, 2, 1], fingers: [null, 1, 4, 2, 3, 1] },

  // Diminished 7th shapes (symmetrical - moveable every 3 frets)
  { name: 'E-shape', quality: 'dim7', rootString: 6,
    shape: ['x', 'x', 1, 2, 1, 2], fingers: [null, null, 1, 3, 2, 4] },

  { name: 'A-shape', quality: 'dim7', rootString: 5,
    shape: ['x', 0, 1, 2, 1, 2], fingers: [null, 1, 2, 4, 3, 4] },

  // Half-diminished 7th (min7b5) shapes
  { name: 'E-shape', quality: 'half-dim7', rootString: 6,
    shape: ['x', 'x', 1, 2, 1, 3], fingers: [null, null, 1, 2, 1, 4] },

  { name: 'A-shape', quality: 'half-dim7', rootString: 5,
    shape: ['x', 0, 1, 2, 1, 'x'], fingers: [null, 1, 2, 4, 3, null] },

  // Add9 shapes
  { name: 'E-shape', quality: 'add9', rootString: 6,
    shape: [0, 2, 2, 1, 0, 2], fingers: [null, 2, 3, 1, null, 4] },

  { name: 'A-shape', quality: 'add9', rootString: 5,
    shape: ['x', 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null] },

  // Power chord shapes (root + 5th only, for rock/metal)
  { name: 'E-shape', quality: 'power', rootString: 6,
    shape: [0, 2, 2, 'x', 'x', 'x'], fingers: [1, 3, 4, null, null, null] },

  { name: 'A-shape', quality: 'power', rootString: 5,
    shape: ['x', 0, 2, 2, 'x', 'x'], fingers: [null, 1, 3, 4, null, null] },

  { name: 'D-shape', quality: 'power', rootString: 4,
    shape: ['x', 'x', 0, 2, 3, 'x'], fingers: [null, null, 1, 2, 3, null] },
];

// ============================================================================
// STRING NOTE MAPPING
// ============================================================================

// Fret positions for each note on each string (0 = open, up to 12)
// Index 0 = String 6 (low E), Index 5 = String 1 (high E)
export const STRING_NOTES: CanonicalNote[][] = [
  // String 6 (low E)
  ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
  // String 5 (A)
  ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
  // String 4 (D)
  ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
  // String 3 (G)
  ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
  // String 2 (B)
  ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  // String 1 (high E)
  ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
];

// ============================================================================
// OPEN CHORD VOICINGS
// ============================================================================

// Open chord voicings - beginner-friendly, no barre required
// These take priority when available
export const OPEN_VOICINGS: Record<string, GuitarFingering> = {
  // Major chords
  'C':  { chord: 'C',  strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], voicingType: 'open' },
  'D':  { chord: 'D',  strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], voicingType: 'open' },
  'E':  { chord: 'E',  strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], voicingType: 'open' },
  'G':  { chord: 'G',  strings: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], voicingType: 'open' },
  'A':  { chord: 'A',  strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], voicingType: 'open' },

  // Minor chords
  'Am': { chord: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], voicingType: 'open' },
  'Dm': { chord: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], voicingType: 'open' },
  'Em': { chord: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], voicingType: 'open' },

  // Dominant 7 chords
  'A7': { chord: 'A7', strings: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], voicingType: 'open' },
  'B7': { chord: 'B7', strings: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], voicingType: 'open' },
  'C7': { chord: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], voicingType: 'open' },
  'D7': { chord: 'D7', strings: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], voicingType: 'open' },
  'E7': { chord: 'E7', strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], voicingType: 'open' },
  'G7': { chord: 'G7', strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], voicingType: 'open' },

  // Minor 7 chords
  'Am7': { chord: 'Am7', strings: ['x', 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], voicingType: 'open' },
  'Dm7': { chord: 'Dm7', strings: ['x', 'x', 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], voicingType: 'open' },
  'Em7': { chord: 'Em7', strings: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], voicingType: 'open' },

  // Major 7 chords
  'Cmaj7': { chord: 'Cmaj7', strings: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], voicingType: 'open' },
  'Dmaj7': { chord: 'Dmaj7', strings: ['x', 'x', 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], voicingType: 'open' },
  'Emaj7': { chord: 'Emaj7', strings: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null], voicingType: 'open' },
  'Fmaj7': { chord: 'Fmaj7', strings: ['x', 'x', 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null], voicingType: 'open' },
  'Gmaj7': { chord: 'Gmaj7', strings: [3, 2, 0, 0, 0, 2], fingers: [2, 1, null, null, null, 3], voicingType: 'open' },
  'Amaj7': { chord: 'Amaj7', strings: ['x', 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], voicingType: 'open' },

  // Sus2 chords
  'Asus2': { chord: 'Asus2', strings: ['x', 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null], voicingType: 'open' },
  'Dsus2': { chord: 'Dsus2', strings: ['x', 'x', 0, 2, 3, 0], fingers: [null, null, null, 1, 3, null], voicingType: 'open' },
  'Esus2': { chord: 'Esus2', strings: [0, 2, 4, 4, 0, 0], fingers: [null, 1, 3, 4, null, null], voicingType: 'open' },

  // Sus4 chords
  'Asus4': { chord: 'Asus4', strings: ['x', 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], voicingType: 'open' },
  'Dsus4': { chord: 'Dsus4', strings: ['x', 'x', 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], voicingType: 'open' },
  'Esus4': { chord: 'Esus4', strings: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], voicingType: 'open' },

  // Diminished (common voicings)
  'Bdim': { chord: 'Bdim', strings: ['x', 2, 3, 4, 3, 'x'], fingers: [null, 1, 2, 4, 3, null], voicingType: 'open' },

  // F with mini-barre (common beginner approach)
  'F': { chord: 'F', strings: ['x', 'x', 3, 2, 1, 1], fingers: [null, null, 3, 2, 1, 1], barrePosition: 1, voicingType: 'open' },
  'Fm': { chord: 'Fm', strings: ['x', 'x', 3, 1, 1, 1], fingers: [null, null, 3, 1, 1, 1], barrePosition: 1, voicingType: 'open' },
};

// ============================================================================
// CHORD FINGERING FUNCTIONS
// ============================================================================

/**
 * Find the fret position for a note on a given string
 */
function findFretForNote(note: NoteName, stringIndex: number): number | null {
  const normalizedNote = normalizeNoteName(note);
  const fret = STRING_NOTES[stringIndex].indexOf(normalizedNote);
  return fret >= 0 && fret <= 12 ? fret : null;
}

/**
 * Generate a chord fingering by transposing a barre shape
 */
export function generateBarreFingering(
  root: NoteName,
  quality: ChordQuality,
  preferredShape?: string
): GuitarFingering | null {
  // Find matching barre shapes for this quality
  const matchingShapes = BARRE_SHAPES.filter(s =>
    s.quality === quality &&
    (!preferredShape || s.name === preferredShape)
  );

  for (const shape of matchingShapes) {
    const stringIndex = 6 - shape.rootString; // Convert to 0-indexed
    const rootFret = findFretForNote(root, stringIndex);

    if (rootFret !== null && rootFret <= 12) {
      // Transpose the shape to this fret position
      const strings = shape.shape.map((fret) => {
        if (fret === 'x') return 'x' as const;
        return (fret as number) + rootFret;
      });

      return {
        chord: formatChordName(root, quality),
        strings: strings as (number | 'x' | 0)[],
        barrePosition: rootFret > 0 ? rootFret : undefined,
        fingers: shape.fingers,
        shapeName: shape.name,
        voicingType: 'barre'
      };
    }
  }

  return null;
}

/**
 * Get a chord fingering (prefers open voicings, falls back to barre shapes)
 */
export function getChordFingering(
  root: NoteName,
  quality: ChordQuality,
  preferOpen: boolean = true
): GuitarFingering | null {
  const chordName = formatChordName(root, quality);

  // Try open voicing first if preferred
  if (preferOpen && OPEN_VOICINGS[chordName]) {
    return OPEN_VOICINGS[chordName];
  }

  // Generate from barre shape
  const barreFingering = generateBarreFingering(root, quality);
  if (barreFingering) {
    return barreFingering;
  }

  // Fallback: try open voicing even if not preferred
  if (OPEN_VOICINGS[chordName]) {
    return OPEN_VOICINGS[chordName];
  }

  // Last resort: generate E-shape barre for basic quality
  const fallbackQuality: ChordQuality = quality.includes('minor') ? 'minor' : 'major';
  return generateBarreFingering(root, fallbackQuality, 'E-shape');
}

/**
 * Get multiple voicing options for a chord
 */
export function getChordVoicings(
  root: NoteName,
  quality: ChordQuality
): GuitarFingering[] {
  const voicings: GuitarFingering[] = [];
  const chordName = formatChordName(root, quality);

  // Add open voicing if available
  if (OPEN_VOICINGS[chordName]) {
    voicings.push(OPEN_VOICINGS[chordName]);
  }

  // Add barre voicings from different shapes
  const shapeNames = ['E-shape', 'A-shape', 'D-shape'];
  for (const shapeName of shapeNames) {
    const fingering = generateBarreFingering(root, quality, shapeName);
    if (fingering && fingering.barrePosition !== undefined && fingering.barrePosition <= 12) {
      // Avoid duplicates (same fret positions)
      const isDuplicate = voicings.some(v =>
        JSON.stringify(v.strings) === JSON.stringify(fingering.strings)
      );
      if (!isDuplicate) {
        voicings.push(fingering);
      }
    }
  }

  return voicings;
}

/**
 * Get fingering for a Chord object
 */
export function getFingeringForChord(chord: { root: CanonicalNote; quality: ChordQuality }): GuitarFingering | null {
  return getChordFingering(chord.root, chord.quality);
}
