import type { ChordFunction, DetailLevel } from '../types/music';

// ============================================================================
// CHORD FUNCTION EXPLANATIONS
// ============================================================================

export interface ChordFunctionExplanation {
  beginner: { name: string; description: string };
  intermediate: { name: string; description: string; romanNumerals: string };
  advanced: { name: string; description: string; theory: string };
}

export const CHORD_FUNCTION_CONTENT: Record<ChordFunction, ChordFunctionExplanation> = {
  tonic: {
    beginner: {
      name: 'Home',
      description: 'This IS home - the tonal center. The song feels most stable and resolved here.',
    },
    intermediate: {
      name: 'Tonic (I/i)',
      description: 'THE home chord of the key - the actual tonal center. Maximum stability and resolution.',
      romanNumerals: 'I in major keys, i in minor keys',
    },
    advanced: {
      name: 'Tonic',
      description: 'The tonal center. Contains the tonic note as root, 3rd, and 5th of the scale. All harmonic tension ultimately resolves here.',
      theory: 'The tonic (I/i) is the gravitational center of tonal music. It establishes the key and provides the ultimate point of resolution. All other harmonic functions are defined by their relationship to the tonic.',
    },
  },
  'tonic-substitute': {
    beginner: {
      name: 'Near Home',
      description: 'This chord shares notes with home, creating a similar stable feeling but with more color.',
    },
    intermediate: {
      name: 'Tonic Substitute (vi/iii)',
      description: 'Shares tones with the tonic and can substitute for it, but is not the actual tonal center.',
      romanNumerals: 'vi or iii in major keys, III in minor keys',
    },
    advanced: {
      name: 'Tonic Substitute',
      description: 'Shares two of three tones with the tonic triad, allowing it to function similarly but with different color.',
      theory: 'The vi chord shares scale degrees 1 and 3 with I; iii shares 3 and 5. This overlap allows them to substitute for tonic function in deceptive cadences (V→vi) or mediant motion, while providing modal color. They resolve tension but not as definitively as I.',
    },
  },
  subdominant: {
    beginner: {
      name: 'Bridge',
      description: 'This chord sets up what comes next. It creates gentle movement.',
    },
    intermediate: {
      name: 'Subdominant (IV/ii)',
      description: 'Creates motion away from home. Often leads to the dominant.',
      romanNumerals: 'Usually IV or ii in major, iv or ii° in minor',
    },
    advanced: {
      name: 'Subdominant Function',
      description: 'Pre-dominant function. Contains scale degree 4 (fa) but not 7 (ti). Creates "plagal" motion.',
      theory: 'Subdominant chords (IV, ii) move away from tonic without the urgency of dominant function. The IV-I "plagal" cadence is often called the "Amen cadence."',
    },
  },
  dominant: {
    beginner: {
      name: 'Tension',
      description: 'This chord creates tension. It really wants to go back home!',
    },
    intermediate: {
      name: 'Dominant (V)',
      description: 'Creates strong pull toward home (tonic). The most important chord for creating resolution.',
      romanNumerals: 'V or V7 in both major and minor keys',
    },
    advanced: {
      name: 'Dominant Function',
      description: 'Contains tritone (scale degrees 4 and 7). Maximum tension requiring resolution to tonic.',
      theory: 'The dominant seventh (V7) contains a tritone between the 3rd (ti) and 7th (fa) that resolves naturally to tonic. This is the foundation of common-practice harmony.',
    },
  },
  predominant: {
    beginner: {
      name: 'Setup',
      description: 'This chord helps prepare for the tension chord.',
    },
    intermediate: {
      name: 'Predominant (ii/IV)',
      description: 'Precedes dominant chords. Part of the common ii-V-I progression.',
      romanNumerals: 'ii, IV, or borrowed chords like Neapolitan (bII)',
    },
    advanced: {
      name: 'Predominant Function',
      description: 'Prepares dominant function. The ii chord is often preferred over IV in jazz for smooth voice leading.',
      theory: 'Predominant chords set up the V chord. The ii-V-I is ubiquitous in jazz because the ii7 to V7 motion creates strong root movement by 5th and smooth chromatic voice leading.',
    },
  },
  borrowed: {
    beginner: {
      name: 'Borrowed',
      description: 'This chord is "borrowed" from a parallel key for extra color!',
    },
    intermediate: {
      name: 'Borrowed Chord',
      description: 'Taken from the parallel major or minor key to add color and emotion.',
      romanNumerals: 'Common: iv in major (from minor), bVII, bVI, bIII',
    },
    advanced: {
      name: 'Modal Interchange',
      description: 'Chords borrowed from parallel modes. Creates chromatic color while maintaining tonal function.',
      theory: 'Modal interchange (or modal mixture) borrows chords from parallel modes. In C major, using Fm (iv from C minor) adds minor-mode color. The bVII is borrowed from Mixolydian.',
    },
  },
};

// ============================================================================
// KEY/MODE EXPLANATIONS
// ============================================================================

export interface ModeExplanation {
  beginner: { feeling: string; example: string };
  intermediate: { description: string; characteristics: string[] };
  advanced: { theory: string; intervals: string; commonUses: string[] };
}

export const MODE_CONTENT: Record<'major' | 'minor', ModeExplanation> = {
  major: {
    beginner: {
      feeling: 'Generally happy, bright, and uplifting',
      example: 'Think of "Happy Birthday" or most upbeat pop songs',
    },
    intermediate: {
      description: 'The major scale creates a bright, positive sound due to its raised 3rd and 7th degrees.',
      characteristics: [
        'Natural tendency toward resolution',
        'Bright quality from major 3rd interval',
        'Strong dominant function from leading tone (7th degree)',
      ],
    },
    advanced: {
      theory: 'Ionian mode. Intervallic structure: W-W-H-W-W-W-H. The major third creates consonance, and the half-step between 7-8 creates strong voice leading to tonic.',
      intervals: '1-2-3-4-5-6-7 (no alterations from major scale)',
      commonUses: ['Pop', 'Country', 'Classical', 'Happy/uplifting music', 'Children\'s songs'],
    },
  },
  minor: {
    beginner: {
      feeling: 'Generally sad, dark, or mysterious',
      example: 'Think of sad ballads or dramatic movie music',
    },
    intermediate: {
      description: 'The minor scale has a darker, more introspective quality due to its lowered 3rd.',
      characteristics: [
        'Melancholic or serious quality',
        'Dark sound from minor 3rd interval',
        'Three forms: natural, harmonic, melodic minor',
      ],
    },
    advanced: {
      theory: 'Natural minor (Aeolian). Intervallic structure: W-H-W-W-H-W-W. The minor third creates tension with the root, and lack of leading tone in natural minor creates modal ambiguity.',
      intervals: '1-2-b3-4-5-b6-b7 (flat 3rd, 6th, 7th from major)',
      commonUses: ['Blues', 'Rock', 'Classical', 'Film scores', 'Emotional ballads', 'Metal'],
    },
  },
};

// ============================================================================
// ENERGY/BRIGHTNESS/TENSION EXPLANATIONS
// ============================================================================

export interface TraitExplanation {
  label: string;
  description: string;
  musicalEffect: string;
}

export const ENERGY_CONTENT: Record<'low' | 'medium' | 'high', TraitExplanation> = {
  low: {
    label: 'Low Energy',
    description: 'Calm, gentle, reflective',
    musicalEffect: 'Slower tempo, longer chord durations, simpler rhythms',
  },
  medium: {
    label: 'Medium Energy',
    description: 'Balanced, flowing, moderate',
    musicalEffect: 'Comfortable tempo, varied dynamics, natural phrasing',
  },
  high: {
    label: 'High Energy',
    description: 'Intense, driving, powerful',
    musicalEffect: 'Faster tempo, shorter chords, rhythmic intensity',
  },
};

export const BRIGHTNESS_CONTENT: Record<'dark' | 'neutral' | 'bright', TraitExplanation> = {
  dark: {
    label: 'Dark',
    description: 'Heavy, somber, mysterious',
    musicalEffect: 'Minor modes, lower register, flattened scale degrees',
  },
  neutral: {
    label: 'Neutral',
    description: 'Balanced, versatile, natural',
    musicalEffect: 'Mix of major and minor elements, middle register',
  },
  bright: {
    label: 'Bright',
    description: 'Light, sparkling, uplifting',
    musicalEffect: 'Major modes, higher register, raised scale degrees',
  },
};

export const TENSION_CONTENT: Record<'low' | 'medium' | 'high', TraitExplanation> = {
  low: {
    label: 'Low Tension',
    description: 'Relaxed, resolved, peaceful',
    musicalEffect: 'Consonant harmonies, stable progressions, frequent resolution',
  },
  medium: {
    label: 'Medium Tension',
    description: 'Balanced, interesting, engaging',
    musicalEffect: 'Mix of consonance/dissonance, suspensions, expected resolutions',
  },
  high: {
    label: 'High Tension',
    description: 'Dramatic, urgent, unresolved',
    musicalEffect: 'Dissonant harmonies, delayed resolution, chromatic movement',
  },
};

// ============================================================================
// CHORD FEATURE EXPLANATIONS
// ============================================================================

export interface ChordFeatureExplanation {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export const CHORD_FEATURES: Record<string, ChordFeatureExplanation> = {
  sevenths: {
    beginner: 'Adding a 7th makes the chord richer and jazzier.',
    intermediate: '7th chords add the 7th scale degree, creating more color. Major 7ths sound dreamy, minor 7ths sound jazzy, dominant 7ths create tension.',
    advanced: 'Seventh chords extend the triad by stacking another third. The quality of the 7th (major or minor) combined with the triad type creates distinct functions: Maj7 (soft tonic), m7 (soft subdominant), dominant 7 (strong tension).',
  },
  borrowed: {
    beginner: 'Some chords are "borrowed" from a different version of the key to add color!',
    intermediate: 'Modal interchange borrows chords from parallel keys. Using the iv chord in a major key (borrowed from minor) adds melancholy.',
    advanced: 'Modal interchange or mixture occurs when chords from parallel modes are used. Common borrowings include: bVI, bVII, iv, and bIII in major contexts. These create chromatic voice leading while maintaining tonal center.',
  },
  suspensions: {
    beginner: 'Suspended chords leave out the middle note, creating an open, floating sound.',
    intermediate: 'Sus chords replace the 3rd with either the 2nd (sus2) or 4th (sus4). This removes major/minor quality and creates anticipation.',
    advanced: 'Suspensions withhold the chord\'s third, creating non-chord tones that traditionally resolve. Sus4 resolves down to 3, sus2 can resolve up. Modern usage often treats sus chords as color without resolution.',
  },
};

// ============================================================================
// COMMON PROGRESSION PATTERN EXPLANATIONS
// ============================================================================

export interface ProgressionPatternInfo {
  name: string;
  numerals: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  famousSongs: string[];
}

export const PROGRESSION_PATTERNS: ProgressionPatternInfo[] = [
  {
    name: 'The Pop Progression',
    numerals: 'I - V - vi - IV',
    beginner: 'The most popular progression in pop music! It feels happy but has a touch of emotion.',
    intermediate: 'This progression uses all three functions (tonic, dominant, subdominant) plus the relative minor (vi) for emotional color.',
    advanced: 'The I-V-vi-IV exploits the shared tones between chords for smooth voice leading. The vi provides modal ambiguity while the return to IV sets up the loop back to I.',
    famousSongs: ['Let It Be', 'With or Without You', 'Someone Like You'],
  },
  {
    name: 'The Jazz ii-V-I',
    numerals: 'ii - V - I',
    beginner: 'A smooth, sophisticated progression used in jazz. It feels like coming home.',
    intermediate: 'The most common jazz progression. The ii chord sets up V, and V resolves to I. Often played with 7th chords.',
    advanced: 'ii-V-I is the fundamental jazz progression. The ii7-V7-Imaj7 creates strong root motion by fifths and efficient voice leading. The tritone in V7 resolves to the 3rd and root of Imaj7.',
    famousSongs: ['Autumn Leaves', 'All The Things You Are', 'Fly Me To The Moon'],
  },
  {
    name: 'The Sad Progression',
    numerals: 'vi - IV - I - V',
    beginner: 'Starting on the minor chord makes this feel sad but hopeful.',
    intermediate: 'A rotation of the Pop Progression, starting on vi gives it a melancholic character while still being in major key.',
    advanced: 'This is the I-V-vi-IV rotated to start on vi. Beginning on the submediant establishes minor color within a major context, creating bittersweet quality.',
    famousSongs: ['Zombie', 'Self Esteem', 'Africa'],
  },
  {
    name: 'The Andalusian Cadence',
    numerals: 'i - bVII - bVI - V',
    beginner: 'A dramatic, flamenco-style progression that descends step by step.',
    intermediate: 'A minor key progression with chromatic descent in the bass. The V chord at the end creates tension back to i.',
    advanced: 'The Andalusian cadence features chromatic bass descent: 1-b7-b6-5. The Phrygian half cadence (bVI-V) at the end creates distinctive Spanish color.',
    famousSongs: ['Hit The Road Jack', 'Stairway to Heaven (intro)', 'Sultans of Swing'],
  },
  {
    name: 'The Canon Progression',
    numerals: 'I - V - vi - iii - IV - I - IV - V',
    beginner: 'A beautiful, flowing progression made famous by Pachelbel\'s Canon.',
    intermediate: 'A longer progression that smoothly cycles through all diatonic functions, creating a sense of continuous forward motion.',
    advanced: 'This 8-chord progression features descending thirds (I-vi-IV) interspersed with dominant motion. The predictable bass pattern creates a comforting, familiar quality.',
    famousSongs: ['Canon in D', 'Graduation', 'Basket Case'],
  },
];

// ============================================================================
// CIRCLE OF FIFTHS CONTENT
// ============================================================================

export const CIRCLE_OF_FIFTHS_CONTENT = {
  beginner: {
    title: 'The Circle of Fifths',
    description: 'A visual map showing how keys are related. Keys next to each other share almost all the same notes!',
    tips: [
      'Keys on the right have sharps (#)',
      'Keys on the left have flats (b)',
      'Moving clockwise adds one sharp',
      'Moving counter-clockwise adds one flat',
      'Inner circle shows minor keys',
    ],
  },
  intermediate: {
    title: 'Circle of Fifths',
    description: 'Each key is a perfect 5th apart from its neighbors. Adjacent keys share 6 of 7 notes, making modulation smooth.',
    tips: [
      'Clockwise = dominant key (V)',
      'Counter-clockwise = subdominant key (IV)',
      'Opposite keys are furthest apart (tritone)',
      'Relative major/minor share the same notes',
      'Common modulations stay within 1-2 positions',
    ],
  },
  advanced: {
    title: 'Circle of Fifths - Harmonic Relationships',
    description: 'The circle represents the cycle of fifths (P5 intervals). Movement by fifths is the foundation of tonal harmony, driving dominant-tonic relationships.',
    tips: [
      'Each position differs by one accidental',
      'Enharmonic equivalents at 6 o\'clock (F#/Gb)',
      'Secondary dominants relate keys across the circle',
      'Tritone substitutions connect opposite points',
      'ii-V-I chains create extended circle motion',
    ],
  },
};

// ============================================================================
// HELPER FUNCTION
// ============================================================================

export function getDetailLevelLabel(level: DetailLevel): string {
  switch (level) {
    case 'beginner': return 'Simple';
    case 'intermediate': return 'Standard';
    case 'advanced': return 'Advanced';
  }
}

export function getChordFunctionColor(fn: ChordFunction | undefined): string {
  switch (fn) {
    case 'tonic': return 'text-green-400 bg-green-500/20';
    case 'tonic-substitute': return 'text-emerald-400 bg-emerald-500/20';
    case 'subdominant': return 'text-amber-400 bg-amber-500/20';
    case 'dominant': return 'text-red-400 bg-red-500/20';
    case 'predominant': return 'text-yellow-400 bg-yellow-500/20';
    case 'borrowed': return 'text-purple-400 bg-purple-500/20';
    default: return 'text-slate-400 bg-slate-500/20';
  }
}
