// Note names including enharmonic equivalents
export type NoteName =
  | 'C' | 'C#' | 'Db'
  | 'D' | 'D#' | 'Eb'
  | 'E'
  | 'F' | 'F#' | 'Gb'
  | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb'
  | 'B';

// Canonical note names use sharps internally for consistency
export type CanonicalNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

// Chord qualities
export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'dim7'
  | 'half-dim7'
  | 'sus2'
  | 'sus4'
  | 'add9'
  | 'power';

// Roman numeral notation
export type RomanNumeral =
  | 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°'
  | 'i' | 'ii°' | 'III' | 'iv' | 'v' | 'VI' | 'VII'
  | 'bII' | 'bIII' | 'bVI' | 'bVII';

// Chord function in harmonic context
export type ChordFunction = 'tonic' | 'tonic-substitute' | 'subdominant' | 'dominant' | 'predominant' | 'borrowed';

// Core chord interface
export interface Chord {
  root: CanonicalNote;
  quality: ChordQuality;
  name: string;
  notes: CanonicalNote[];
  romanNumeral?: RomanNumeral;
  function?: ChordFunction;
  bassNote?: CanonicalNote; // For slash chords/inversions (e.g., C/E has bassNote: 'E')
}

// Guitar fingering representation
export interface GuitarFingering {
  chord: string;
  strings: (number | 'x' | 0)[];
  barrePosition?: number;
  fingers?: (number | null)[];
  shapeName?: string;
  voicingType?: 'open' | 'barre';
}

// Musical key
export interface Key {
  tonic: CanonicalNote;
  mode: 'major' | 'minor';
}

// Key identifier string (e.g., "C", "Am", "F#m")
export type KeyId = string;

// Key relationships (computed, not stored)
export interface KeyRelationships {
  relativeKey: KeyId;
  parallelKey: KeyId;
  dominantKey: KeyId;
  subdominantKey: KeyId;
}

// Chord progression
export interface Progression {
  id: string;
  name?: string;
  key: Key;
  chords: Chord[];
  tempo: number;
  mood?: Mood;
}

// Mood types
export type Mood =
  | 'happy'
  | 'sad'
  | 'epic'
  | 'dreamy'
  | 'tense'
  | 'hopeful'
  | 'melancholic'
  | 'energetic'
  | 'peaceful'
  | 'dark'
  | 'triumphant';

// Mood to progression mapping
export interface MoodMapping {
  mood: Mood;
  preferredMode: 'major' | 'minor';
  suggestedProgressions: RomanNumeral[][];
  borrowedChords: RomanNumeral[];
  tempo: { min: number; max: number };
  description: string;
}

// Barre chord shape definition
export interface BarreShape {
  name: string;
  quality: ChordQuality;
  rootString: number;
  shape: (number | 'x')[];
  fingers: (number | null)[];
}

// Audio playback state
export interface AudioState {
  isReady: boolean;
  isPlaying: boolean;
  currentChordIndex: number;
  currentSectionIndex: number;
}

// Song section types
export type SectionType = 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'outro' | 'solo' | 'breakdown';

// A section of a song (verse, chorus, etc.)
export interface SongSection {
  id: string;
  type: SectionType;
  name: string;
  chords: Chord[];
  bars?: number; // Number of bars/measures
}

// Strumming style characteristics
export type StrummingStyle =
  | 'straight'       // Even strumming
  | 'swing'          // Swung eighth notes
  | 'fingerpicking'  // Fingerstyle patterns
  | 'arpeggiated'    // Broken chords
  | 'palm-muted'     // Muted driving rhythm
  | 'reggae'         // Offbeat emphasis
  | 'latin';         // Syncopated patterns

// Mood analysis result from algorithmic generator
export interface MoodAnalysis {
  preferredMode: 'major' | 'minor';
  energy: 'low' | 'medium' | 'high';
  tension: 'low' | 'medium' | 'high';
  brightness: 'dark' | 'neutral' | 'bright';
  tempoRange: { min: number; max: number };
  useSevenths: boolean;
  useBorrowedChords: boolean;
  useSuspensions: boolean;
  useInversions: boolean; // Whether to use slash chords/inversions
  pedalBassChance: number; // 0-1, probability of pedal point per section
  preferredFunctions: ('tonic' | 'subdominant' | 'dominant')[];
  positivity: number; // -1 to 1
  intensity: number;  // 0 to 1
  detectedKeywords?: string[]; // Keywords found in mood text
  // Strumming characteristics
  strummingStyle?: StrummingStyle;
  rhythmComplexity?: 'simple' | 'moderate' | 'complex';
  suggestedTimeSignature?: { beats: number; value: number };
}

// Detail level for educational content
export type DetailLevel = 'beginner' | 'intermediate' | 'advanced';

// Multi-section song structure
export interface Song {
  id: string;
  title?: string;
  description?: string;
  key: Key;
  tempo: number;
  sections: SongSection[];
  customMood?: string; // User-entered mood description
  generatedBy?: 'preset' | 'ai';
  moodAnalysis?: MoodAnalysis; // Analysis data for educational explanations
  rhythmGuidance?: RhythmGuidance; // Suggested strumming patterns
}

// AI generation request
export interface AIGenerationRequest {
  mood: string;
  key?: Key;
  style?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
}

// AI generation response (parsed)
export interface AIGenerationResponse {
  song: Song;
  explanation?: string;
}

// ============================================================================
// STRUMMING PATTERNS
// ============================================================================

// Individual beat in a strumming pattern
export type StrumDirection = 'D' | 'U' | 'x' | '-'; // Down, Up, Muted, Rest

export interface StrumBeat {
  direction: StrumDirection;
  accent?: boolean;  // Emphasized beat
  tie?: boolean;     // Tied to previous beat (let ring)
}

// Time signature
export interface TimeSignature {
  beats: number;     // Numerator (beats per measure)
  value: number;     // Denominator (note value getting one beat)
}

// Complete strumming pattern
export interface StrummingPattern {
  id: string;
  name: string;
  description: string;
  timeSignature: TimeSignature;
  pattern: StrumBeat[];          // One measure of strumming
  subdivisions: 4 | 8 | 16;      // How fine the pattern is divided
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  genres: string[];              // Associated genres
  tempoRange: { min: number; max: number };
  tips: string[];                // Playing tips
}

// Rhythm guidance for a song/section
export interface RhythmGuidance {
  primaryPattern: StrummingPattern;
  alternativePatterns?: StrummingPattern[];
  explanation: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}
