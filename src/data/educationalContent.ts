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
// CHORD EXTENSION EXPLANATIONS (per-chord context)
// ============================================================================

import type { ChordQuality } from '../types/music';

export interface ExtensionExplanation {
  badge: string;
  beginner: string;
  intermediate: string;
  advanced: string;
}

export const CHORD_EXTENSION_CONTENT: Partial<Record<ChordQuality, ExtensionExplanation>> = {
  major7: {
    badge: 'maj7',
    beginner: 'The added 7th gives this chord a dreamy, sophisticated quality.',
    intermediate: 'The major 7th (one half-step below the root) adds a lush, jazzy color while maintaining the chord\'s stable character.',
    advanced: 'The major 7th interval creates a mild dissonance that adds color without destabilizing the chord. Common in jazz, neo-soul, and sophisticated pop.',
  },
  minor7: {
    badge: 'm7',
    beginner: 'The added 7th makes this minor chord sound smoother and jazzier.',
    intermediate: 'The minor 7th softens the chord, making it feel less final and more flowing. Essential in jazz and R&B.',
    advanced: 'The minor 7th (b7) extends the minor triad, creating the quintessential jazz minor sound. Often functions as ii7 in ii-V-I progressions.',
  },
  dominant7: {
    badge: '7',
    beginner: 'The added 7th creates tension that wants to resolve - like a question waiting for an answer.',
    intermediate: 'The dominant 7th contains a tritone (between the 3rd and 7th) that creates strong pull toward resolution.',
    advanced: 'The dominant 7th\'s tritone (between scale degrees 7 and 4) is the engine of tonal harmony. It resolves naturally to the tonic by half-step motion.',
  },
  dim7: {
    badge: 'dim7',
    beginner: 'This tense, mysterious chord has an extra note that makes it even more dramatic.',
    intermediate: 'The diminished 7th is fully symmetric - all intervals are minor 3rds. This creates maximum tension and ambiguity.',
    advanced: 'Diminished 7th chords are enharmonically respellable and can resolve to any of 4 different keys, making them powerful pivot chords for modulation.',
  },
  'half-dim7': {
    badge: 'm7♭5',
    beginner: 'This chord has a dark, unresolved quality - often used before tension chords.',
    intermediate: 'Half-diminished (m7♭5) is the natural ii chord in minor keys. It sets up the V7 beautifully in minor ii-V-i.',
    advanced: 'The half-diminished 7th differs from fully diminished by having a minor 7th instead of diminished 7th. Essential as iiø7 in minor key ii-V-i progressions.',
  },
  sus2: {
    badge: 'sus2',
    beginner: 'The 3rd is replaced with the 2nd, creating an open, airy sound.',
    intermediate: 'Suspended 2nd chords remove the major/minor quality, creating ambiguity. They often resolve to the regular chord.',
    advanced: 'Sus2 replaces the 3rd with the 2nd (9th down an octave). Unlike traditional suspensions, modern usage often treats sus2 as a color chord without resolution.',
  },
  sus4: {
    badge: 'sus4',
    beginner: 'The 3rd is replaced with the 4th, creating a hanging, unresolved feeling.',
    intermediate: 'Suspended 4th chords traditionally resolve down to the 3rd. The 4th creates tension against the 5th.',
    advanced: 'The sus4 is the classic suspension from counterpoint - the 4th is a dissonance against the 5th that resolves stepwise to the 3rd. In modern music, often left unresolved.',
  },
  add9: {
    badge: 'add9',
    beginner: 'An extra high note is added, making the chord sparkle and sound fuller.',
    intermediate: 'Add9 includes the 9th (2nd up an octave) without the 7th. It adds color while keeping the chord\'s basic character.',
    advanced: 'Unlike a 9th chord which includes the 7th, add9 stacks the 9th directly on the triad. Common in pop, rock, and worship music for added shimmer.',
  },
  power: {
    badge: '5',
    beginner: 'Only the root and 5th - no 3rd. This makes the chord heavy and neutral.',
    intermediate: 'Power chords omit the 3rd, removing major/minor quality. Works great with distortion in rock and metal.',
    advanced: 'The absence of the 3rd creates a harmonically ambiguous sound that works well with distortion (which would turn the 3rd into dissonant overtones).',
  },
  augmented: {
    badge: 'aug',
    beginner: 'The top note is raised, creating an unsettled, dreamy feeling.',
    intermediate: 'Augmented chords have a raised 5th, creating tension that typically resolves up by half-step.',
    advanced: 'Augmented triads are symmetric (all major 3rds) and can resolve to multiple keys. Often used as V+ resolving to I with the raised 5th becoming the 3rd.',
  },
  diminished: {
    badge: 'dim',
    beginner: 'A tense, unstable chord that really wants to move somewhere else.',
    intermediate: 'Diminished chords have a lowered 5th, creating a tritone with the root. They often function as leading-tone chords (vii°).',
    advanced: 'The diminished triad contains a tritone between root and ♭5. As vii°, it shares two notes with V7 and has dominant function.',
  },
};

// Helper to get extension explanation for a chord quality
export function getExtensionExplanation(quality: ChordQuality): ExtensionExplanation | null {
  return CHORD_EXTENSION_CONTENT[quality] || null;
}

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
  inversions: {
    beginner: 'Slash chords put a different note in the bass, creating smoother transitions between chords.',
    intermediate: 'Inversions place the 3rd or 5th in the bass instead of the root. C/E means "C major with E in the bass." This creates stepwise bass motion and smoother voice leading.',
    advanced: 'Chord inversions redistribute chord tones vertically. 1st inversion (3rd in bass) lightens the sound, 2nd inversion (5th in bass) is less stable and often used for passing motion. Slash chords also include non-chord-tone bass notes for pedal effects.',
  },
  pedalBass: {
    beginner: 'The bass note stays the same while the chords change above it, creating a dreamy, floating feeling.',
    intermediate: 'Pedal point (or pedal bass) sustains one note in the bass while harmonies change above. This creates tension that resolves when the pedal finally moves.',
    advanced: 'Pedal point originates from organ music where a sustained bass note creates harmonic tension against changing chords. Tonic pedals (on scale degree 1) create stability; dominant pedals (on 5) create anticipation. Common in cinematic and ambient music.',
  },
};

// ============================================================================
// INVERSION EXPLANATIONS (for individual slash chords)
// ============================================================================

export interface InversionExplanation {
  badge: string;
  beginner: string;
  intermediate: string;
  advanced: string;
}

/**
 * Get explanation for why a specific bass note was chosen for a chord
 */
export function getInversionExplanation(
  chordRoot: string,
  bassNote: string,
  chordNotes: string[]
): InversionExplanation | null {
  if (!bassNote || bassNote === chordRoot) {
    return null; // No inversion, root position
  }

  // Determine inversion type based on bass note position in chord
  const bassIndex = chordNotes.indexOf(bassNote);

  if (bassIndex === 1) {
    // First inversion (3rd in bass)
    return {
      badge: '1st inv',
      beginner: `The 3rd of the chord (${bassNote}) is in the bass, making the sound lighter and smoother.`,
      intermediate: `First inversion with ${bassNote} in bass. This creates a lighter quality and enables stepwise bass motion between chords.`,
      advanced: `First inversion (6/3 position). The 3rd in bass creates less root emphasis, useful for passing motion and voice leading. Common for connecting chords with stepwise bass lines.`,
    };
  }

  if (bassIndex === 2) {
    // Second inversion (5th in bass)
    return {
      badge: '2nd inv',
      beginner: `The 5th of the chord (${bassNote}) is in the bass, creating an open, floating feeling.`,
      intermediate: `Second inversion with ${bassNote} in bass. Less stable than root position, often used for passing chords or pedal effects.`,
      advanced: `Second inversion (6/4 position). Traditionally unstable and used for cadential (I6/4-V-I), passing, or pedal functions. The perfect 4th against bass creates mild dissonance requiring resolution.`,
    };
  }

  // Non-chord tone bass (pedal or chromatic bass)
  return {
    badge: 'slash',
    beginner: `${bassNote} in the bass isn't part of the chord - it's held over from another chord for a smooth sound.`,
    intermediate: `Slash chord with non-chord tone ${bassNote} in bass. This creates a pedal point effect or chromatic bass line.`,
    advanced: `Non-chord tone bass (${bassNote}). This slash chord creates a polychordal effect or serves as pedal point. The bass note may be a sustained tonic, passing tone, or anticipation of the next chord.`,
  };
}

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
