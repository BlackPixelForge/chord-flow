import type {
  StrummingPattern,
  StrumBeat,
  MoodAnalysis,
  RhythmGuidance,
  StrummingStyle,
  Mood,
} from '../types/music';

// ============================================================================
// HELPER FUNCTIONS FOR CREATING PATTERNS
// ============================================================================

function beat(direction: 'D' | 'U' | 'x' | '-', accent = false, tie = false): StrumBeat {
  return { direction, accent, tie };
}

const D = (accent = false) => beat('D', accent);
const U = (accent = false) => beat('U', accent);
const X = (accent = false) => beat('x', accent);
const R = () => beat('-'); // Rest

// ============================================================================
// STRUMMING PATTERN LIBRARY
// ============================================================================

export const STRUMMING_PATTERNS: StrummingPattern[] = [
  // -------------------------------------------------------------------------
  // BEGINNER PATTERNS
  // -------------------------------------------------------------------------
  {
    id: 'all-downstrokes',
    name: 'All Downstrokes',
    description: 'The simplest pattern - just down strums on each beat. Perfect for getting started.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), D(), D(), D()],
    subdivisions: 4,
    difficulty: 'beginner',
    genres: ['rock', 'punk', 'folk'],
    tempoRange: { min: 60, max: 140 },
    tips: [
      'Keep your wrist loose and relaxed',
      'Accent the first beat of each measure',
      'Practice with a metronome to build steady timing',
    ],
  },
  {
    id: 'basic-down-up',
    name: 'Basic Down-Up',
    description: 'Alternating down and up strokes on eighth notes. The foundation for most strumming.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), U(), D(), U(), D(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'beginner',
    genres: ['pop', 'folk', 'country', 'acoustic'],
    tempoRange: { min: 70, max: 130 },
    tips: [
      'Down strokes on the beat (1, 2, 3, 4)',
      'Up strokes on the "and" (+) between beats',
      'Keep a steady pendulum motion in your arm',
    ],
  },
  {
    id: 'campfire-strum',
    name: 'Campfire Strum',
    description: 'A gentle pattern perfect for acoustic singalongs. Emphasizes beats 1 and 3.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), D(), U(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'beginner',
    genres: ['folk', 'acoustic', 'singer-songwriter'],
    tempoRange: { min: 70, max: 110 },
    tips: [
      'Think: DOWN, down-up, up-down-up',
      'The first down strum should be the strongest',
      'Great for songs like "Wonderwall" and "Horse With No Name"',
    ],
  },

  // -------------------------------------------------------------------------
  // INTERMEDIATE PATTERNS
  // -------------------------------------------------------------------------
  {
    id: 'pop-strum',
    name: 'Pop Strum',
    description: 'The classic pop/rock pattern. Skipping the up on beat 1 creates a driving feel.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), R(), D(), U(), R(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['pop', 'rock', 'indie'],
    tempoRange: { min: 90, max: 140 },
    tips: [
      'Think: DOWN, (miss), DOWN-up, (miss)-up, DOWN-up',
      'The missing strokes create the groove',
      'Keep your arm moving even during the misses',
    ],
  },
  {
    id: 'folk-fingerpicking',
    name: 'Folk Fingerpick',
    description: 'Basic Travis picking pattern. Bass notes alternate with melody.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), U(), D(), U(), D(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['folk', 'country', 'acoustic', 'singer-songwriter'],
    tempoRange: { min: 60, max: 100 },
    tips: [
      'Thumb plays bass notes (strings 6, 5, 4) on downbeats',
      'Fingers play treble strings (3, 2, 1) on upbeats',
      'Practice each hand separately first',
    ],
  },
  {
    id: 'island-strum',
    name: 'Island Strum',
    description: 'A laid-back pattern with reggae influence. Emphasis on the off-beats.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [R(), U(true), R(), U(true), R(), U(true), R(), U(true)],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['reggae', 'ska', 'island', 'tropical'],
    tempoRange: { min: 70, max: 110 },
    tips: [
      'Emphasize the "and" of each beat (the up-strums)',
      'Quickly release pressure after each strum for a choppy sound',
      'Palm muting can add to the authentic reggae feel',
    ],
  },
  {
    id: 'rock-eighth',
    name: 'Driving Rock',
    description: 'Palm-muted eighth notes with accents. Creates a powerful, driving rhythm.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [X(true), X(), X(), X(), X(true), X(), X(), X()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['rock', 'punk', 'metal', 'alternative'],
    tempoRange: { min: 100, max: 180 },
    tips: [
      'Rest the side of your picking hand on the strings near the bridge',
      'Accent beats 1 and 3 for rock, or 2 and 4 for punk',
      'Vary the muting pressure for different tones',
    ],
  },
  {
    id: 'ballad-strum',
    name: 'Ballad Pattern',
    description: 'A gentle, flowing pattern for slow emotional songs.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), R(), D(), U(), D(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['ballad', 'slow-rock', 'pop', 'worship'],
    tempoRange: { min: 50, max: 80 },
    tips: [
      'Let the chords ring out fully',
      'The space after beat 1 creates breathing room',
      'Dynamic control is key - vary your strumming intensity',
    ],
  },
  {
    id: 'country-boom-chick',
    name: 'Country Boom-Chick',
    description: 'Traditional country pattern alternating bass notes with chord strums.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), R(), U(true), R(), D(), R(), U(true), R()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['country', 'bluegrass', 'folk', 'americana'],
    tempoRange: { min: 100, max: 140 },
    tips: [
      'Beat 1 and 3: play only the bass note (root of chord)',
      'Beat 2 and 4: strum the higher strings',
      'This creates the classic "boom-chick" country sound',
    ],
  },

  // -------------------------------------------------------------------------
  // ADVANCED PATTERNS
  // -------------------------------------------------------------------------
  {
    id: 'syncopated-funk',
    name: 'Funky Syncopation',
    description: 'A syncopated pattern with muted scratches for a funky groove.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [
      D(true), X(), U(), X(), R(), U(true), X(), U(),
      D(), X(), U(), X(), R(), U(true), X(), U(),
    ],
    subdivisions: 16,
    difficulty: 'advanced',
    genres: ['funk', 'r&b', 'soul', 'neo-soul'],
    tempoRange: { min: 85, max: 115 },
    tips: [
      'The muted "scratches" (X) are as important as the strums',
      'Keep your fretting hand loose for ghost notes',
      'Practice slowly with a drum beat or metronome',
    ],
  },
  {
    id: 'jazz-swing',
    name: 'Jazz Swing',
    description: 'Swung rhythm for jazz standards. The "and" beats are delayed.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), R(), U(), D(), R(), U(), D(true), R(), U(), D(), R(), U()],
    subdivisions: 8,
    difficulty: 'advanced',
    genres: ['jazz', 'swing', 'blues', 'standards'],
    tempoRange: { min: 100, max: 180 },
    tips: [
      'Eighth notes are swung (first note longer, second shorter)',
      'Think "da-DUM, da-DUM" instead of "da-da, da-da"',
      'Add chord substitutions for authentic jazz feel',
    ],
  },
  {
    id: 'latin-bossa',
    name: 'Bossa Nova',
    description: 'The classic Brazilian bossa nova rhythm pattern.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), R(), D(), U(), R(), U(), D(), R(), D(), U(), R(), U(), D(), R(), U(), R()],
    subdivisions: 16,
    difficulty: 'advanced',
    genres: ['bossa-nova', 'jazz', 'latin', 'brazilian'],
    tempoRange: { min: 120, max: 150 },
    tips: [
      'The syncopation is key - accents fall on unexpected beats',
      'Think of it as two slightly different 2-beat patterns',
      'Thumb handles bass, fingers handle melody/chords',
    ],
  },
  {
    id: 'flamenco-rasgueado',
    name: 'Flamenco Rasgueado',
    description: 'A dramatic Spanish-style strumming technique using finger rolls.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [
      D(true), U(), U(), U(), D(), U(), D(true), U(),
    ],
    subdivisions: 8,
    difficulty: 'advanced',
    genres: ['flamenco', 'spanish', 'latin', 'classical'],
    tempoRange: { min: 80, max: 140 },
    tips: [
      'Rasgueado uses finger rolls: pinky, ring, middle, index',
      'Keep wrist very loose and let fingers flick outward',
      'Practice the finger roll slowly before adding speed',
    ],
  },
  {
    id: '6-8-folk',
    name: '6/8 Folk Pattern',
    description: 'A lilting pattern in 6/8 time for Celtic and folk music.',
    timeSignature: { beats: 6, value: 8 },
    pattern: [D(true), D(), U(), D(true), D(), U()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['celtic', 'folk', 'irish', 'ballad'],
    tempoRange: { min: 80, max: 140 },
    tips: [
      '6/8 has two groups of three: "ONE two three FOUR five six"',
      'Accent beats 1 and 4 for the characteristic lilt',
      'Great for songs like "House of the Rising Sun"',
    ],
  },
  {
    id: 'waltz-3-4',
    name: 'Waltz Pattern',
    description: 'A classic 3/4 pattern for waltzes and ballads.',
    timeSignature: { beats: 3, value: 4 },
    pattern: [D(true), D(), D()],
    subdivisions: 4,
    difficulty: 'beginner',
    genres: ['waltz', 'classical', 'folk', 'ballad'],
    tempoRange: { min: 80, max: 140 },
    tips: [
      'Strong accent on beat 1, lighter on 2 and 3',
      'Think "OOM-pah-pah" with emphasis on the first beat',
      'Bass note on 1, chord strums on 2 and 3 for variation',
    ],
  },

  // -------------------------------------------------------------------------
  // ADDITIONAL PATTERNS FOR BETTER COVERAGE
  // -------------------------------------------------------------------------
  {
    id: 'shuffle-blues',
    name: 'Blues Shuffle',
    description: 'The classic 12/8 blues feel with a swung triplet groove.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), R(), D(), D(), R(), D(), D(true), R(), D(), D(), R(), D()],
    subdivisions: 16,
    difficulty: 'intermediate',
    genres: ['blues', 'rock', 'classic-rock', 'boogie'],
    tempoRange: { min: 80, max: 130 },
    tips: [
      'Feel each beat as a triplet: "da-da-DA, da-da-DA"',
      'The third note of each triplet is accented',
      'Keep it loose and relaxed - blues is about feel',
    ],
  },
  {
    id: 'arpeggio-climb',
    name: 'Arpeggio Pattern',
    description: 'Pick strings individually from low to high for a flowing, harp-like sound.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), U(), D(), U(), D(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['ballad', 'classical', 'ambient', 'new-age', 'cinematic'],
    tempoRange: { min: 50, max: 100 },
    tips: [
      'Pick each string individually, low to high',
      'Let notes ring together to build the chord',
      'Use fingers (not pick) for a softer tone',
      'Great for emotional, introspective moments',
    ],
  },
  {
    id: 'power-ballad',
    name: 'Power Ballad Build',
    description: 'Starts gentle, builds intensity. Perfect for emotional rock ballads.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), R(), R(), U(), R(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['power-ballad', 'rock', 'arena-rock', '80s', 'emotional'],
    tempoRange: { min: 60, max: 90 },
    tips: [
      'Start verses with just bass notes or gentle strums',
      'Build intensity through the pre-chorus',
      'Full powerful strums on the chorus',
      'Dynamics tell the story as much as the notes',
    ],
  },
  {
    id: 'muted-groove',
    name: 'Muted Groove',
    description: 'Percussive muted strumming for R&B and neo-soul grooves.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [X(true), X(), U(), X(), R(), U(true), X(), U()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['r&b', 'neo-soul', 'hip-hop', 'groove'],
    tempoRange: { min: 70, max: 100 },
    tips: [
      'Mute strings with fretting hand for the "X" hits',
      'Release mute for the actual chord tones',
      'The percussive mutes create the pocket',
      'Feel the backbeat on 2 and 4',
    ],
  },
  {
    id: 'surf-tremolo',
    name: 'Surf Rock Tremolo',
    description: 'Fast, driving tremolo picking for that classic surf sound.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [
      D(true), U(), D(), U(), D(), U(), D(), U(),
      D(), U(), D(), U(), D(), U(), D(), U(),
    ],
    subdivisions: 16,
    difficulty: 'advanced',
    genres: ['surf', 'rockabilly', 'retro', 'instrumental'],
    tempoRange: { min: 130, max: 180 },
    tips: [
      'Use wrist motion, not arm, for speed',
      'Keep pick angle consistent',
      'Add reverb for authentic surf tone',
      'Practice slowly then build speed',
    ],
  },
  {
    id: 'electronic-pulse',
    name: 'Electronic Pulse',
    description: 'Steady eighth-note pulse for electronic and synth-driven music.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), D(), D(), D(), D(true), D(), D(), D()],
    subdivisions: 8,
    difficulty: 'beginner',
    genres: ['electronic', 'edm', 'synth', 'new-wave', 'indie-electronic'],
    tempoRange: { min: 110, max: 140 },
    tips: [
      'Keep strums even and mechanical',
      'Slight accent on 1 and 5 (beats 1 and 3)',
      'Palm muting can add a more electronic feel',
      'Match the steady pulse of electronic drums',
    ],
  },
  {
    id: 'gentle-arpeggio',
    name: 'Gentle Fingerstyle',
    description: 'Soft, delicate picking pattern for intimate, quiet moments.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [D(true), U(), D(), U(), D(), U(), D(), U()],
    subdivisions: 8,
    difficulty: 'beginner',
    genres: ['ambient', 'lullaby', 'meditation', 'soft', 'intimate'],
    tempoRange: { min: 50, max: 80 },
    tips: [
      'Play very softly - dynamics matter',
      'Use fingertips, not pick',
      'Let notes sustain and overlap',
      'Less is more - leave space',
    ],
  },
  {
    id: 'aggressive-eighth',
    name: 'Aggressive Chug',
    description: 'Heavy, aggressive palm-muted chugging for metal and hard rock.',
    timeSignature: { beats: 4, value: 4 },
    pattern: [X(true), X(), X(), X(), X(true), X(), X(), X()],
    subdivisions: 8,
    difficulty: 'intermediate',
    genres: ['metal', 'hard-rock', 'heavy', 'aggressive', 'hardcore'],
    tempoRange: { min: 100, max: 160 },
    tips: [
      'Heavy palm muting throughout',
      'Accent the downbeats hard',
      'Keep right hand tight against bridge',
      'Use thick picks for more attack',
    ],
  },
];

// ============================================================================
// PATTERN LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get a strumming pattern by ID
 */
export function getStrummingPatternById(id: string): StrummingPattern | undefined {
  return STRUMMING_PATTERNS.find(p => p.id === id);
}

/**
 * Get patterns filtered by difficulty
 */
export function getPatternsByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): StrummingPattern[] {
  return STRUMMING_PATTERNS.filter(p => p.difficulty === difficulty);
}

/**
 * Get patterns suitable for a given genre
 */
export function getPatternsForGenre(genre: string): StrummingPattern[] {
  const normalizedGenre = genre.toLowerCase();
  return STRUMMING_PATTERNS.filter(p =>
    p.genres.some(g => g.toLowerCase().includes(normalizedGenre) ||
      normalizedGenre.includes(g.toLowerCase()))
  );
}

/**
 * Get patterns suitable for a given tempo
 */
export function getPatternsForTempo(tempo: number): StrummingPattern[] {
  return STRUMMING_PATTERNS.filter(
    p => tempo >= p.tempoRange.min && tempo <= p.tempoRange.max
  );
}

// ============================================================================
// MOOD-TO-PATTERN MAPPING
// ============================================================================

interface StrummingMoodMapping {
  style: StrummingStyle;
  preferredPatterns: string[]; // Pattern IDs
  rhythmComplexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Map moods to strumming characteristics
 */
const MOOD_STRUMMING_MAP: Record<string, Partial<StrummingMoodMapping>> = {
  // =========================================================================
  // GENRES
  // =========================================================================
  rock: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'pop-strum', 'all-downstrokes'] },
  punk: { style: 'palm-muted', preferredPatterns: ['all-downstrokes', 'rock-eighth'], rhythmComplexity: 'simple' },
  metal: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'rock-eighth', 'all-downstrokes'] },
  heavymetal: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'rock-eighth'] },
  hardcore: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'all-downstrokes'] },
  grunge: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'power-ballad'] },
  alternative: { style: 'straight', preferredPatterns: ['pop-strum', 'rock-eighth'] },
  pop: { style: 'straight', preferredPatterns: ['pop-strum', 'basic-down-up', 'ballad-strum'] },
  indie: { style: 'straight', preferredPatterns: ['pop-strum', 'campfire-strum', 'arpeggio-climb'] },
  folk: { style: 'fingerpicking', preferredPatterns: ['campfire-strum', 'folk-fingerpicking', '6-8-folk'] },
  acoustic: { style: 'fingerpicking', preferredPatterns: ['campfire-strum', 'folk-fingerpicking', 'ballad-strum'] },
  country: { style: 'straight', preferredPatterns: ['country-boom-chick', 'campfire-strum'] },
  bluegrass: { style: 'straight', preferredPatterns: ['country-boom-chick', 'all-downstrokes'] },
  jazz: { style: 'swing', preferredPatterns: ['jazz-swing'], rhythmComplexity: 'complex' },
  blues: { style: 'swing', preferredPatterns: ['shuffle-blues', 'jazz-swing'], rhythmComplexity: 'moderate' },
  shuffle: { style: 'swing', preferredPatterns: ['shuffle-blues'] },
  funk: { style: 'straight', preferredPatterns: ['syncopated-funk', 'muted-groove'], rhythmComplexity: 'complex' },
  'r&b': { style: 'straight', preferredPatterns: ['muted-groove', 'syncopated-funk', 'ballad-strum'] },
  rnb: { style: 'straight', preferredPatterns: ['muted-groove', 'syncopated-funk', 'ballad-strum'] },
  soul: { style: 'straight', preferredPatterns: ['syncopated-funk', 'muted-groove', 'ballad-strum'] },
  neosoul: { style: 'straight', preferredPatterns: ['muted-groove', 'syncopated-funk'] },
  'neo-soul': { style: 'straight', preferredPatterns: ['muted-groove', 'syncopated-funk'] },
  hiphop: { style: 'straight', preferredPatterns: ['muted-groove', 'basic-down-up'] },
  'hip-hop': { style: 'straight', preferredPatterns: ['muted-groove', 'basic-down-up'] },
  reggae: { style: 'reggae', preferredPatterns: ['island-strum'] },
  ska: { style: 'reggae', preferredPatterns: ['island-strum', 'all-downstrokes'] },
  tropical: { style: 'reggae', preferredPatterns: ['island-strum', 'latin-bossa'] },
  latin: { style: 'latin', preferredPatterns: ['latin-bossa', 'flamenco-rasgueado'] },
  bossa: { style: 'latin', preferredPatterns: ['latin-bossa'] },
  bossanova: { style: 'latin', preferredPatterns: ['latin-bossa'] },
  flamenco: { style: 'latin', preferredPatterns: ['flamenco-rasgueado'] },
  spanish: { style: 'latin', preferredPatterns: ['flamenco-rasgueado', 'latin-bossa'] },
  celtic: { style: 'straight', preferredPatterns: ['6-8-folk', 'campfire-strum'] },
  irish: { style: 'straight', preferredPatterns: ['6-8-folk'] },
  classical: { style: 'arpeggiated', preferredPatterns: ['arpeggio-climb', 'waltz-3-4', 'folk-fingerpicking'] },
  worship: { style: 'straight', preferredPatterns: ['ballad-strum', 'campfire-strum', 'pop-strum'] },
  christian: { style: 'straight', preferredPatterns: ['ballad-strum', 'campfire-strum'] },
  gospel: { style: 'straight', preferredPatterns: ['pop-strum', 'syncopated-funk'] },
  electronic: { style: 'straight', preferredPatterns: ['electronic-pulse', 'all-downstrokes'] },
  edm: { style: 'straight', preferredPatterns: ['electronic-pulse'] },
  synth: { style: 'straight', preferredPatterns: ['electronic-pulse', 'basic-down-up'] },
  synthpop: { style: 'straight', preferredPatterns: ['electronic-pulse', 'pop-strum'] },
  newwave: { style: 'straight', preferredPatterns: ['electronic-pulse', 'pop-strum'] },
  'new-wave': { style: 'straight', preferredPatterns: ['electronic-pulse', 'pop-strum'] },
  surf: { style: 'straight', preferredPatterns: ['surf-tremolo', 'all-downstrokes'] },
  rockabilly: { style: 'straight', preferredPatterns: ['surf-tremolo', 'shuffle-blues'] },
  retro: { style: 'straight', preferredPatterns: ['shuffle-blues', 'surf-tremolo'] },
  cinematic: { style: 'arpeggiated', preferredPatterns: ['arpeggio-climb', 'power-ballad', 'gentle-arpeggio'] },
  film: { style: 'arpeggiated', preferredPatterns: ['arpeggio-climb', 'gentle-arpeggio'] },
  soundtrack: { style: 'arpeggiated', preferredPatterns: ['arpeggio-climb', 'power-ballad'] },
  ambient: { style: 'arpeggiated', preferredPatterns: ['gentle-arpeggio', 'arpeggio-climb'] },

  // =========================================================================
  // MOODS / EMOTIONS
  // =========================================================================
  happy: { style: 'straight', preferredPatterns: ['pop-strum', 'basic-down-up'], rhythmComplexity: 'simple' },
  joyful: { style: 'straight', preferredPatterns: ['pop-strum', 'campfire-strum'] },
  cheerful: { style: 'straight', preferredPatterns: ['pop-strum', 'basic-down-up'] },
  playful: { style: 'straight', preferredPatterns: ['pop-strum', 'island-strum', 'campfire-strum'] },
  whimsical: { style: 'straight', preferredPatterns: ['campfire-strum', 'folk-fingerpicking'] },
  sad: { style: 'arpeggiated', preferredPatterns: ['ballad-strum', 'arpeggio-climb', 'gentle-arpeggio'] },
  melancholic: { style: 'arpeggiated', preferredPatterns: ['ballad-strum', 'arpeggio-climb'] },
  melancholy: { style: 'arpeggiated', preferredPatterns: ['ballad-strum', 'arpeggio-climb'] },
  bittersweet: { style: 'arpeggiated', preferredPatterns: ['ballad-strum', 'folk-fingerpicking'] },
  wistful: { style: 'arpeggiated', preferredPatterns: ['folk-fingerpicking', 'arpeggio-climb'] },
  epic: { style: 'straight', preferredPatterns: ['all-downstrokes', 'power-ballad', 'rock-eighth'] },
  triumphant: { style: 'straight', preferredPatterns: ['pop-strum', 'all-downstrokes', 'power-ballad'] },
  majestic: { style: 'straight', preferredPatterns: ['all-downstrokes', 'power-ballad'] },
  grand: { style: 'straight', preferredPatterns: ['all-downstrokes', 'power-ballad'] },
  powerful: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'aggressive-eighth', 'all-downstrokes'] },
  strong: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'all-downstrokes'] },
  dreamy: { style: 'arpeggiated', preferredPatterns: ['gentle-arpeggio', 'arpeggio-climb', 'folk-fingerpicking'] },
  ethereal: { style: 'arpeggiated', preferredPatterns: ['gentle-arpeggio', 'arpeggio-climb'] },
  peaceful: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'folk-fingerpicking'], rhythmComplexity: 'simple' },
  calm: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'folk-fingerpicking', 'ballad-strum'] },
  serene: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'folk-fingerpicking'] },
  tranquil: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'arpeggio-climb'] },
  relaxed: { style: 'fingerpicking', preferredPatterns: ['island-strum', 'folk-fingerpicking', 'gentle-arpeggio'] },
  gentle: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'folk-fingerpicking'] },
  soft: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'ballad-strum'] },
  tender: { style: 'arpeggiated', preferredPatterns: ['gentle-arpeggio', 'arpeggio-climb'] },
  intimate: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'folk-fingerpicking'] },
  tense: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'aggressive-eighth', 'all-downstrokes'] },
  anxious: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'electronic-pulse'] },
  nervous: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'electronic-pulse'] },
  suspenseful: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'arpeggio-climb'] },
  dark: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'aggressive-eighth', 'all-downstrokes'] },
  mysterious: { style: 'arpeggiated', preferredPatterns: ['arpeggio-climb', 'gentle-arpeggio'] },
  mystical: { style: 'arpeggiated', preferredPatterns: ['arpeggio-climb', 'gentle-arpeggio'] },
  eerie: { style: 'arpeggiated', preferredPatterns: ['arpeggio-climb', 'gentle-arpeggio'] },
  angry: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'rock-eighth', 'all-downstrokes'] },
  aggressive: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'rock-eighth'] },
  intense: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'rock-eighth', 'all-downstrokes'] },
  fierce: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'rock-eighth'] },
  energetic: { style: 'straight', preferredPatterns: ['pop-strum', 'rock-eighth', 'all-downstrokes'] },
  upbeat: { style: 'straight', preferredPatterns: ['pop-strum', 'basic-down-up'] },
  lively: { style: 'straight', preferredPatterns: ['pop-strum', 'country-boom-chick'] },
  romantic: { style: 'arpeggiated', preferredPatterns: ['ballad-strum', 'latin-bossa', 'arpeggio-climb'] },
  loving: { style: 'arpeggiated', preferredPatterns: ['ballad-strum', 'gentle-arpeggio'] },
  passionate: { style: 'latin', preferredPatterns: ['flamenco-rasgueado', 'latin-bossa', 'power-ballad'] },
  nostalgic: { style: 'fingerpicking', preferredPatterns: ['folk-fingerpicking', 'campfire-strum', 'arpeggio-climb'] },
  reflective: { style: 'fingerpicking', preferredPatterns: ['folk-fingerpicking', 'arpeggio-climb'] },
  hopeful: { style: 'straight', preferredPatterns: ['campfire-strum', 'pop-strum', 'ballad-strum'] },
  optimistic: { style: 'straight', preferredPatterns: ['pop-strum', 'campfire-strum'] },
  inspiring: { style: 'straight', preferredPatterns: ['power-ballad', 'pop-strum'] },
  uplifting: { style: 'straight', preferredPatterns: ['pop-strum', 'power-ballad'] },
  emotional: { style: 'arpeggiated', preferredPatterns: ['power-ballad', 'ballad-strum', 'arpeggio-climb'] },
  heartfelt: { style: 'arpeggiated', preferredPatterns: ['ballad-strum', 'arpeggio-climb'] },

  // =========================================================================
  // ENERGY / STYLE DESCRIPTORS
  // =========================================================================
  chill: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'folk-fingerpicking', 'island-strum'], rhythmComplexity: 'simple' },
  'lo-fi': { style: 'fingerpicking', preferredPatterns: ['muted-groove', 'gentle-arpeggio', 'jazz-swing'] },
  lofi: { style: 'fingerpicking', preferredPatterns: ['muted-groove', 'gentle-arpeggio', 'jazz-swing'] },
  mellow: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'folk-fingerpicking'] },
  smooth: { style: 'fingerpicking', preferredPatterns: ['jazz-swing', 'muted-groove', 'ballad-strum'] },
  driving: { style: 'palm-muted', preferredPatterns: ['rock-eighth', 'electronic-pulse', 'all-downstrokes'] },
  pulsing: { style: 'straight', preferredPatterns: ['electronic-pulse', 'all-downstrokes'] },
  groovy: { style: 'straight', preferredPatterns: ['syncopated-funk', 'muted-groove', 'island-strum'] },
  funky: { style: 'straight', preferredPatterns: ['syncopated-funk', 'muted-groove'] },
  swinging: { style: 'swing', preferredPatterns: ['jazz-swing', 'shuffle-blues'] },
  bouncy: { style: 'straight', preferredPatterns: ['pop-strum', 'island-strum'] },
  heavy: { style: 'palm-muted', preferredPatterns: ['aggressive-eighth', 'rock-eighth'] },
  light: { style: 'fingerpicking', preferredPatterns: ['gentle-arpeggio', 'campfire-strum'] },
  sparse: { style: 'arpeggiated', preferredPatterns: ['gentle-arpeggio', 'arpeggio-climb'] },
  full: { style: 'straight', preferredPatterns: ['pop-strum', 'all-downstrokes'] },
  building: { style: 'straight', preferredPatterns: ['power-ballad', 'ballad-strum'] },
  climactic: { style: 'straight', preferredPatterns: ['power-ballad', 'all-downstrokes'] },
};

/**
 * Select appropriate strumming patterns based on mood analysis
 */
export function selectStrummingPatterns(
  moodAnalysis: MoodAnalysis,
  tempo: number
): RhythmGuidance {
  const keywords = moodAnalysis.detectedKeywords || [];
  const candidates: Map<string, number> = new Map();

  // Score patterns based on keyword matches
  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    const mapping = MOOD_STRUMMING_MAP[normalizedKeyword];

    if (mapping?.preferredPatterns) {
      for (const patternId of mapping.preferredPatterns) {
        const currentScore = candidates.get(patternId) || 0;
        candidates.set(patternId, currentScore + 1);
      }
    }
  }

  // Also consider energy level
  if (moodAnalysis.energy === 'high') {
    ['pop-strum', 'rock-eighth', 'all-downstrokes'].forEach(id => {
      candidates.set(id, (candidates.get(id) || 0) + 0.5);
    });
  } else if (moodAnalysis.energy === 'low') {
    ['ballad-strum', 'folk-fingerpicking', 'campfire-strum'].forEach(id => {
      candidates.set(id, (candidates.get(id) || 0) + 0.5);
    });
  }

  // Filter by tempo suitability
  const tempoSuitable = getPatternsForTempo(tempo);
  const tempoSuitableIds = new Set(tempoSuitable.map(p => p.id));

  // Get best matches
  const sortedCandidates = Array.from(candidates.entries())
    .filter(([id]) => tempoSuitableIds.has(id))
    .sort((a, b) => b[1] - a[1]);

  // Select primary and alternatives
  let primaryPattern: StrummingPattern;
  let alternativePatterns: StrummingPattern[] = [];

  if (sortedCandidates.length > 0) {
    primaryPattern = getStrummingPatternById(sortedCandidates[0][0])!;
    alternativePatterns = sortedCandidates
      .slice(1, 3)
      .map(([id]) => getStrummingPatternById(id)!)
      .filter(Boolean);
  } else {
    // Default fallback based on energy
    if (moodAnalysis.energy === 'low') {
      primaryPattern = getStrummingPatternById('campfire-strum')!;
    } else if (moodAnalysis.energy === 'high') {
      primaryPattern = getStrummingPatternById('pop-strum')!;
    } else {
      primaryPattern = getStrummingPatternById('basic-down-up')!;
    }
  }

  // Generate explanation based on analysis
  const explanation = generateStrummingExplanation(primaryPattern, moodAnalysis, keywords);

  return {
    primaryPattern,
    alternativePatterns: alternativePatterns.length > 0 ? alternativePatterns : undefined,
    explanation,
  };
}

/**
 * Generate educational explanation for why a pattern was chosen
 */
function generateStrummingExplanation(
  pattern: StrummingPattern,
  analysis: MoodAnalysis,
  keywords: string[]
): RhythmGuidance['explanation'] {
  const genreKeywords = keywords.filter(k =>
    ['rock', 'pop', 'folk', 'jazz', 'blues', 'country', 'reggae', 'latin', 'funk', 'metal'].includes(k.toLowerCase())
  );
  const moodKeywords = keywords.filter(k =>
    ['happy', 'sad', 'dreamy', 'energetic', 'peaceful', 'tense', 'romantic'].includes(k.toLowerCase())
  );

  const genreText = genreKeywords.length > 0
    ? `genres like ${genreKeywords.join(', ')}`
    : 'this style';

  const energyText = analysis.energy === 'high'
    ? 'high energy'
    : analysis.energy === 'low'
      ? 'mellow, relaxed'
      : 'moderate energy';

  return {
    beginner: `This strumming pattern works great for ${genreText}. It has a ${energyText} feel that matches the mood.`,

    intermediate: `The "${pattern.name}" pattern is commonly used in ${pattern.genres.slice(0, 3).join(', ')} music. ` +
      `Its ${pattern.subdivisions === 8 ? 'eighth-note' : pattern.subdivisions === 16 ? 'sixteenth-note' : 'quarter-note'} ` +
      `rhythm creates the ${energyText} groove this mood calls for. ` +
      `${moodKeywords.length > 0 ? `The ${moodKeywords.join('/')} mood suggests this rhythmic approach.` : ''}`,

    advanced: `Pattern analysis: "${pattern.name}" in ${pattern.timeSignature.beats}/${pattern.timeSignature.value} time ` +
      `with ${pattern.subdivisions} subdivisions per measure. ` +
      `This pattern emphasizes ${getAccentDescription(pattern)} creating rhythmic tension and release. ` +
      `The ${analysis.energy} energy and ${analysis.brightness} tonal quality of the mood ` +
      `pairs well with this pattern's characteristic groove. ` +
      `Consider varying dynamics to enhance emotional expression.`,
  };
}

/**
 * Describe where accents fall in a pattern
 */
function getAccentDescription(pattern: StrummingPattern): string {
  const accentedBeats: number[] = [];
  pattern.pattern.forEach((beat, index) => {
    if (beat.accent) {
      accentedBeats.push(index + 1);
    }
  });

  if (accentedBeats.length === 0) return 'even subdivision';
  if (accentedBeats.length === 1) return `beat ${accentedBeats[0]}`;
  return `beats ${accentedBeats.join(' and ')}`;
}

// ============================================================================
// PRESET MOOD PATTERN MAPPING
// ============================================================================

/**
 * Get default strumming pattern for a preset mood
 */
export function getPatternForPresetMood(mood: Mood): StrummingPattern {
  const moodPatternMap: Record<Mood, string> = {
    happy: 'pop-strum',
    sad: 'ballad-strum',
    epic: 'all-downstrokes',
    dreamy: 'folk-fingerpicking',
    tense: 'rock-eighth',
    hopeful: 'campfire-strum',
    melancholic: 'ballad-strum',
    energetic: 'pop-strum',
    peaceful: 'folk-fingerpicking',
    dark: 'rock-eighth',
    triumphant: 'pop-strum',
  };

  return getStrummingPatternById(moodPatternMap[mood]) || getStrummingPatternById('basic-down-up')!;
}

// ============================================================================
// EDUCATIONAL CONTENT FOR STRUMMING
// ============================================================================

export const STRUMMING_EDUCATIONAL_CONTENT = {
  basics: {
    beginner: {
      title: 'Strumming Basics',
      content: 'Strumming is how you bring chords to life! Hold your pick loosely and brush it across the strings in a smooth motion.',
      tips: [
        'Keep your wrist relaxed - tension is the enemy',
        'Start with all downstrokes, then add upstrokes',
        'Practice with a metronome to build timing',
      ],
    },
    intermediate: {
      title: 'Developing Your Strum',
      content: 'Good strumming comes from your wrist and arm working together. The key is maintaining a constant motion even when you skip beats.',
      tips: [
        'Your arm should move like a pendulum - always moving',
        '"Missing" beats means your pick passes without hitting strings',
        'Accents create groove - emphasize certain beats',
      ],
    },
    advanced: {
      title: 'Advanced Rhythm Techniques',
      content: 'Professional strumming incorporates dynamics, muting, accents, and ghost notes to create a full rhythmic picture.',
      tips: [
        'Palm muting adds percussive texture',
        'Ghost strums (barely touching strings) add subtle groove',
        'Vary picking location for different tones',
        'Learn to feel subdivisions naturally',
      ],
    },
  },

  notation: {
    D: { symbol: 'D', name: 'Down Strum', description: 'Strum from low to high strings' },
    U: { symbol: 'U', name: 'Up Strum', description: 'Strum from high to low strings' },
    x: { symbol: 'x', name: 'Muted Strum', description: 'Dampen strings with fretting hand and strum for percussive sound' },
    '-': { symbol: '-', name: 'Rest', description: 'Skip this beat (but keep your arm moving!)' },
    accent: { symbol: '>', name: 'Accent', description: 'Play this strum louder/stronger' },
  },

  timeSignatures: {
    '4/4': {
      name: 'Common Time',
      description: 'Four beats per measure. The most common time signature in popular music.',
      feel: 'Steady, driving pulse',
    },
    '3/4': {
      name: 'Waltz Time',
      description: 'Three beats per measure. Creates a lilting, dance-like feel.',
      feel: 'ONE-two-three, ONE-two-three',
    },
    '6/8': {
      name: 'Compound Duple',
      description: 'Six beats grouped in two sets of three. Common in folk and slow rock.',
      feel: 'ONE-two-three-FOUR-five-six',
    },
  },
};
