import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Key, Chord, DetailLevel, ChordFunction, CanonicalNote, SongSection } from '../../types/music';
import {
  CIRCLE_OF_FIFTHS_MAJOR,
  CIRCLE_OF_FIFTHS_MINOR,
  getKeyDisplayName,
  getCirclePosition,
} from '../../data/circleOfFifths';

// ============================================================================
// INDEX MAPPING UTILITIES
// ============================================================================

/**
 * Convert flat chord index to section + chord index within section
 */
function flatToSection(flatIndex: number, sections: SongSection[]): { sectionIndex: number; chordIndex: number } {
  let accumulated = 0;
  for (let i = 0; i < sections.length; i++) {
    const sectionLength = sections[i].chords.length;
    if (flatIndex < accumulated + sectionLength) {
      return {
        sectionIndex: i,
        chordIndex: flatIndex - accumulated
      };
    }
    accumulated += sectionLength;
  }
  // If index out of bounds, return last chord
  const lastSection = sections.length - 1;
  return {
    sectionIndex: lastSection,
    chordIndex: Math.max(0, sections[lastSection]?.chords.length - 1 || 0)
  };
}

/**
 * Convert section + chord index to flat chord index
 */
function sectionToFlat(sectionIndex: number, chordIndex: number, sections: SongSection[]): number {
  let flatIndex = 0;
  for (let i = 0; i < sectionIndex && i < sections.length; i++) {
    flatIndex += sections[i].chords.length;
  }
  return flatIndex + chordIndex;
}

// ============================================================================
// SECTION STYLING (matches SongView.tsx)
// ============================================================================

const SECTION_COLORS: Record<string, string> = {
  intro: 'border-l-amber-500 bg-amber-500/5',
  verse: 'border-l-blue-500 bg-blue-500/5',
  'pre-chorus': 'border-l-purple-500 bg-purple-500/5',
  chorus: 'border-l-pink-500 bg-pink-500/5',
  bridge: 'border-l-teal-500 bg-teal-500/5',
  outro: 'border-l-amber-500 bg-amber-500/5',
  solo: 'border-l-orange-500 bg-orange-500/5',
  breakdown: 'border-l-red-500 bg-red-500/5',
};

const SECTION_BADGES: Record<string, string> = {
  intro: 'bg-amber-500/20 text-amber-300',
  verse: 'bg-blue-500/20 text-blue-300',
  'pre-chorus': 'bg-purple-500/20 text-purple-300',
  chorus: 'bg-pink-500/20 text-pink-300',
  bridge: 'bg-teal-500/20 text-teal-300',
  outro: 'bg-amber-500/20 text-amber-300',
  solo: 'bg-orange-500/20 text-orange-300',
  breakdown: 'bg-red-500/20 text-red-300',
};

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

interface NavigationState {
  sectionIndex: number;
  chordIndexInSection: number;
  flatIndex: number;
}

interface CircleOfFifthsVisualizationProps {
  currentKey: Key;
  // Backward compatible: flat chord array
  highlightedChords?: Chord[];
  // NEW: Section-aware props
  sections?: SongSection[];
  currentSectionIndex?: number;
  currentChordIndexInSection?: number;
  // Existing props
  detailLevel?: DetailLevel;
  onKeyClick?: (key: Key) => void;
  size?: number;
}

// Helper to generate accurate circle position descriptions
function getCirclePositionDescription(
  clockwiseDist: number,
  counterClockwiseDist: number,
  detailLevel: DetailLevel
): string {
  // Handle special cases
  if (clockwiseDist === 0) {
    return 'At the home position on the circle.';
  }

  if (clockwiseDist === 6 && counterClockwiseDist === 6) {
    return detailLevel === 'beginner'
      ? 'On the opposite side of the circle from home - the furthest away you can get.'
      : 'Opposite the tonic (6 steps away), creating maximum harmonic distance and tension.';
  }

  // Determine which direction is shorter
  const isClockwiseShorter = clockwiseDist < counterClockwiseDist;
  const shortDistance = Math.min(clockwiseDist, counterClockwiseDist);
  const direction = isClockwiseShorter ? 'clockwise' : 'counter-clockwise';
  const intervalName = isClockwiseShorter ? 'fifth' : 'fourth';
  const stepText = shortDistance === 1 ? 'step' : 'steps';

  if (detailLevel === 'beginner') {
    return `${shortDistance} ${stepText} ${direction} from home.`;
  } else if (detailLevel === 'intermediate') {
    return `${shortDistance} position${shortDistance === 1 ? '' : 's'} ${direction} (${shortDistance === 1 ? 'a' : shortDistance} perfect ${intervalName}${shortDistance === 1 ? '' : 's'} away).`;
  } else {
    return `Position ${isClockwiseShorter ? '+' : '-'}${shortDistance} (${shortDistance} ${intervalName}${shortDistance === 1 ? '' : 's'} ${isClockwiseShorter ? 'up' : 'down'}).`;
  }
}

// Music theory explanation generator
function getChordTheoryExplanation(
  chord: Chord,
  songKey: Key,
  position: number,
  totalChords: number,
  previousChord: Chord | null,
  detailLevel: DetailLevel
): { title: string; explanation: string; circleRelation: string } {
  const chordRoot = chord.root;

  // Calculate circle positions
  const keyPosition = getCirclePosition(songKey);
  const chordPosition = CIRCLE_OF_FIFTHS_MAJOR.indexOf(chordRoot);
  const minorChordPosition = CIRCLE_OF_FIFTHS_MINOR.indexOf(chordRoot);

  // Determine if chord is in major or minor ring based on quality
  const isMinorChord = chord.quality === 'minor' || chord.quality === 'minor7';
  const effectivePosition = isMinorChord ? minorChordPosition : chordPosition;

  // Calculate clockwise distance from tonic
  const clockwiseDistance = ((effectivePosition - keyPosition) + 12) % 12;
  const counterClockwiseDistance = ((keyPosition - effectivePosition) + 12) % 12;
  const distance = Math.min(clockwiseDistance, counterClockwiseDistance);

  // Determine relationship based on chord function and position
  const fn = chord.function || 'tonic';

  let title = '';
  let explanation = '';
  let circleRelation = '';

  // Generate explanations based on chord function
  switch (fn) {
    case 'tonic':
      title = detailLevel === 'beginner' ? 'Home Base' : 'Tonic';
      if (detailLevel === 'beginner') {
        explanation = position === 0
          ? `We start on ${chord.name}, the "home" chord. This IS the tonal center - where the song feels most stable.`
          : position === totalChords - 1
            ? `We return home to ${chord.name}. The progression resolves to the tonal center.`
            : `${chord.name} is the tonal center, providing maximum stability and resolution.`;
        circleRelation = 'This IS the center of our key - the tonic that everything else relates to.';
      } else if (detailLevel === 'intermediate') {
        explanation = `${chord.name} (${chord.romanNumeral || 'I'}) is THE tonic - the actual tonal center of the key. ${
          position === 0 ? 'Starting here establishes our tonal home.' :
          position === totalChords - 1 ? 'Ending here provides complete resolution.' :
          'It provides maximum stability as the true center of the key.'
        }`;
        circleRelation = `The tonic sits at position 0 - all other chords are measured by their distance from this center.`;
      } else {
        explanation = `${chord.name} (${chord.romanNumeral || 'I'}) IS the tonic, establishing ${songKey.tonic} ${songKey.mode} as our tonal center. Contains scale degrees 1, 3, and 5, providing maximum stability and the ultimate point of resolution.`;
        circleRelation = `Position 0 on the circle. The tonic is the axis around which all harmonic relationships operate.`;
      }
      break;

    case 'tonic-substitute':
      title = detailLevel === 'beginner' ? 'Near Home' : 'Tonic Substitute';
      if (detailLevel === 'beginner') {
        explanation = `${chord.name} shares notes with the home chord, so it feels stable but with a different color. It's like being in a room next to home.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} This chord is closely related to the tonic but is NOT the actual center of the key.`;
      } else if (detailLevel === 'intermediate') {
        explanation = `${chord.name} (${chord.romanNumeral || 'vi'}) is a tonic substitute - it shares two notes with the tonic triad and can stand in for it, but is not the actual tonal center. It provides stability with added color.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} Common tonic substitutes share the tonic's key signature and can create deceptive cadences.`;
      } else {
        explanation = `${chord.name} (${chord.romanNumeral || 'vi'}) functions as a tonic substitute due to shared tones with the tonic triad. The vi shares scale degrees 1 and 3 with I, allowing it to resolve dominant tension (V→vi deceptive cadence) while providing modal color.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} Can substitute for tonic but doesn't provide the same definitive resolution.`;
      }
      break;

    case 'dominant':
      title = detailLevel === 'beginner' ? 'Tension Chord' : 'Dominant Function';
      if (detailLevel === 'beginner') {
        explanation = `${chord.name} creates tension that wants to resolve. It's like taking a breath before speaking - you can feel it pulling back toward home.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${clockwiseDistance === 1 ? 'This "fifth" relationship creates the strongest pull in music.' : 'Provides dominant function through its scale degree relationship.'}`;
      } else if (detailLevel === 'intermediate') {
        explanation = `${chord.name} (${chord.romanNumeral || 'V'}) provides dominant function - it creates harmonic tension that naturally resolves to the tonic.${clockwiseDistance === 1 ? ' The tritone between its 3rd and 7th drives the resolution.' : ''}`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${clockwiseDistance === 1 ? 'The V→I motion is the most fundamental resolution in tonal music.' : 'Dominant function can be served by chords at various positions.'}`;
      } else {
        explanation = `${chord.name} (${chord.romanNumeral || 'V'}) provides dominant function${clockwiseDistance === 1 ? ', containing the leading tone (scale degree 7) which has a half-step pull to the tonic, plus scale degree 4 which resolves down to 3' : ' through its role in the scale'}. This ${clockwiseDistance === 1 ? 'tritone resolution' : 'tension'} ${clockwiseDistance === 1 ? 'is the engine of tonal harmony' : 'seeks resolution to the tonic'}.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${clockwiseDistance === 1 ? 'The circle of fifths is built on this dominant-tonic relationship.' : 'Dominant function is primarily about scale degree relationships.'}`;
      }
      break;

    case 'subdominant':
      title = detailLevel === 'beginner' ? 'Bridge Chord' : 'Subdominant Function';
      if (detailLevel === 'beginner') {
        explanation = `${chord.name} moves us away from home gently. It often sets up the tension chord that follows.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${counterClockwiseDistance === 1 ? 'A gentler movement than the dominant.' : 'Provides subdominant color.'}`;
      } else if (detailLevel === 'intermediate') {
        explanation = `${chord.name} (${chord.romanNumeral || 'IV'}) provides subdominant function - it moves away from tonic without the urgency of the dominant.${counterClockwiseDistance === 1 ? ' The IV→V→I pattern is one of the most common progressions.' : ''}`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${counterClockwiseDistance === 1 ? 'This "plagal" relationship is softer than the dominant.' : 'Subdominant function prepares motion to the dominant.'}`;
      } else {
        explanation = `${chord.name} (${chord.romanNumeral || 'IV'}) provides subdominant function${counterClockwiseDistance === 1 ? ', containing scale degree 4 (the "fa") but not the leading tone' : ''}, creating motion without the same urgency as dominant function. The subdominant often precedes the dominant in classical harmony.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${counterClockwiseDistance === 1 ? 'Our key is the dominant of the subdominant.' : 'Subdominant function is primarily about harmonic preparation.'}`;
      }
      break;

    case 'predominant':
      title = detailLevel === 'beginner' ? 'Setup Chord' : 'Predominant Function';
      if (detailLevel === 'beginner') {
        explanation = `${chord.name} helps prepare for what's coming next. It creates smooth movement in the progression.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} This chord connects other chords smoothly, creating forward motion.`;
      } else if (detailLevel === 'intermediate') {
        explanation = `${chord.name} (${chord.romanNumeral || 'ii'}) serves a predominant function, typically leading to the dominant.${counterClockwiseDistance === 2 ? ' The ii-V-I progression is ubiquitous in jazz and pop.' : ''}`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${counterClockwiseDistance === 2 ? 'Making ii→V→I a chain of falling fifths.' : 'Predominant chords prepare the dominant.'}`;
      } else {
        explanation = `${chord.name} (${chord.romanNumeral || 'ii'}) functions as a predominant${counterClockwiseDistance === 2 ? ', sharing tones with IV but providing smoother voice leading to V' : ', preparing the approach to dominant harmony'}. ${counterClockwiseDistance === 2 ? 'The root motion ii→V→I follows the circle of fifths counter-clockwise.' : 'Predominant function creates harmonic momentum toward resolution.'}`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} ${counterClockwiseDistance === 2 ? 'The ii→V→I creates descending fifth root motion, the most natural harmonic flow.' : 'Predominant chords bridge tonic and dominant areas.'}`;
      }
      break;

    case 'borrowed':
      title = detailLevel === 'beginner' ? 'Borrowed Color' : 'Modal Interchange';
      if (detailLevel === 'beginner') {
        explanation = `${chord.name} is "borrowed" from the parallel ${songKey.mode === 'major' ? 'minor' : 'major'} key. It adds unexpected color and emotion.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} This chord comes from the ${songKey.mode === 'major' ? 'inner' : 'outer'} ring (parallel mode).`;
      } else if (detailLevel === 'intermediate') {
        explanation = `${chord.name} (${chord.romanNumeral}) is borrowed from ${songKey.tonic} ${songKey.mode === 'major' ? 'minor' : 'major'}. Modal interchange adds chromatic color while maintaining tonal function.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} From the parallel mode (${songKey.mode === 'major' ? 'inner' : 'outer'} ring).`;
      } else {
        explanation = `${chord.name} (${chord.romanNumeral}) represents modal interchange from the parallel ${songKey.mode === 'major' ? 'minor' : 'major'}. This creates chromatic voice leading opportunities while the chord's function remains analogous to its diatonic counterpart.`;
        circleRelation = `${getCirclePositionDescription(clockwiseDistance, counterClockwiseDistance, detailLevel)} The parallel mode shares the tonic but uses different scale degrees (${songKey.mode === 'major' ? 'inner' : 'outer'} ring).`;
      }
      break;

    default:
      title = 'Harmonic Color';
      explanation = `${chord.name} adds harmonic interest to the progression.`;
      circleRelation = `This chord is ${distance} steps from the tonic on the circle of fifths.`;
  }

  // Add movement context if there was a previous chord
  if (previousChord && detailLevel !== 'beginner') {
    const prevPosition = CIRCLE_OF_FIFTHS_MAJOR.indexOf(previousChord.root);
    const movement = ((effectivePosition - prevPosition) + 12) % 12;
    if (movement === 1) {
      circleRelation += ' Moving clockwise by one step (up a 5th).';
    } else if (movement === 11) {
      circleRelation += ' Moving counter-clockwise by one step (down a 5th / up a 4th).';
    } else if (movement === 0) {
      circleRelation += ' Same root position as the previous chord.';
    }
  }

  return { title, explanation, circleRelation };
}

export function CircleOfFifthsVisualization({
  currentKey,
  highlightedChords = [],
  sections,
  currentSectionIndex,
  currentChordIndexInSection,
  detailLevel = 'beginner',
  onKeyClick,
  size = 350,
}: CircleOfFifthsVisualizationProps) {
  // Determine if we're in section mode
  const isSectionMode = useMemo(() => {
    return sections !== undefined && sections.length > 0;
  }, [sections]);

  // Navigation state
  const [navState, setNavState] = useState<NavigationState>({
    sectionIndex: currentSectionIndex || 0,
    chordIndexInSection: currentChordIndexInSection || 0,
    flatIndex: 0
  });

  const [viewMode, setViewMode] = useState<'flat' | 'sectioned'>('sectioned');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const [pendingNextSection, setPendingNextSection] = useState<number | null>(null);

  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.28;
  const labelOuterRadius = size * 0.35;
  const labelInnerRadius = size * 0.22;

  // Derive flat chord array from either sections or highlightedChords
  const flatChords = useMemo(() => {
    if (isSectionMode && sections) {
      return sections.flatMap(s => s.chords);
    }
    return highlightedChords;
  }, [isSectionMode, sections, highlightedChords]);

  const totalChords = flatChords.length;

  // Get current chord based on navigation state
  const currentChord = useMemo(() => {
    if (isSectionMode && sections) {
      const section = sections[navState.sectionIndex];
      return section?.chords[navState.chordIndexInSection] || null;
    }
    return flatChords[navState.flatIndex] || null;
  }, [isSectionMode, sections, navState, flatChords]);

  const previousChord = useMemo(() => {
    if (navState.flatIndex > 0) {
      return flatChords[navState.flatIndex - 1] || null;
    }
    return null;
  }, [navState.flatIndex, flatChords]);

  // For backward compatibility - keep legacy naming
  const chordProgression = flatChords;
  const totalSteps = totalChords;

  // Sync external props with internal navigation state
  useEffect(() => {
    if (isSectionMode && sections && currentSectionIndex !== undefined && currentChordIndexInSection !== undefined) {
      setNavState({
        sectionIndex: currentSectionIndex,
        chordIndexInSection: currentChordIndexInSection,
        flatIndex: sectionToFlat(currentSectionIndex, currentChordIndexInSection, sections)
      });
    }
  }, [currentSectionIndex, currentChordIndexInSection, isSectionMode, sections]);

  // Get theory explanation for current chord
  const theoryExplanation = useMemo(() => {
    if (!currentChord) return null;
    return getChordTheoryExplanation(
      currentChord,
      currentKey,
      navState.flatIndex,
      totalSteps,
      previousChord,
      detailLevel
    );
  }, [currentChord, currentKey, navState.flatIndex, totalSteps, previousChord, detailLevel]);

  // Calculate segment angle (30 degrees each for 12 segments)
  const segmentAngle = (2 * Math.PI) / 12;

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (!isSectionMode || !sections || viewMode === 'flat') {
      // Flat mode navigation
      setNavState(prev => ({
        ...prev,
        flatIndex: Math.min(prev.flatIndex + 1, totalChords - 1)
      }));
      return;
    }

    // Section-aware navigation
    const currentSection = sections[navState.sectionIndex];
    if (!currentSection) return;

    const isLastChordInSection = navState.chordIndexInSection === currentSection.chords.length - 1;

    if (isLastChordInSection) {
      const isLastSection = navState.sectionIndex === sections.length - 1;
      if (isLastSection) {
        return; // Already at end
      }

      // Move to first chord of next section
      setNavState({
        sectionIndex: navState.sectionIndex + 1,
        chordIndexInSection: 0,
        flatIndex: sectionToFlat(navState.sectionIndex + 1, 0, sections)
      });
    } else {
      // Move to next chord in same section
      setNavState(prev => ({
        ...prev,
        chordIndexInSection: prev.chordIndexInSection + 1,
        flatIndex: prev.flatIndex + 1
      }));
    }
  }, [isSectionMode, sections, viewMode, navState, totalChords]);

  const goToPrev = useCallback(() => {
    if (!isSectionMode || !sections || viewMode === 'flat') {
      // Flat mode navigation
      setNavState(prev => ({
        ...prev,
        flatIndex: Math.max(prev.flatIndex - 1, 0)
      }));
      return;
    }

    // Section-aware navigation
    const isFirstChordInSection = navState.chordIndexInSection === 0;

    if (isFirstChordInSection) {
      if (navState.sectionIndex === 0) {
        return; // Already at first chord
      }

      // Move to last chord of previous section
      const prevSection = sections[navState.sectionIndex - 1];
      setNavState({
        sectionIndex: navState.sectionIndex - 1,
        chordIndexInSection: prevSection.chords.length - 1,
        flatIndex: sectionToFlat(navState.sectionIndex - 1, prevSection.chords.length - 1, sections)
      });
    } else {
      // Move to previous chord in same section
      setNavState(prev => ({
        ...prev,
        chordIndexInSection: prev.chordIndexInSection - 1,
        flatIndex: prev.flatIndex - 1
      }));
    }
  }, [isSectionMode, sections, viewMode, navState]);

  // For clicking on specific chord pills
  const goToChord = useCallback((sectionIndex: number, chordIndex: number) => {
    if (!sections) return;

    setNavState({
      sectionIndex,
      chordIndexInSection: chordIndex,
      flatIndex: sectionToFlat(sectionIndex, chordIndex, sections)
    });

    // If auto-play was paused at section boundary, resume
    if (isAutoPlayPaused && isPlaying) {
      setIsAutoPlayPaused(false);
      setPendingNextSection(null);
    }
  }, [sections, isAutoPlayPaused, isPlaying]);

  // Legacy flat index navigation (for backward compatibility)
  const goToStep = useCallback((step: number) => {
    if (isSectionMode && sections) {
      const { sectionIndex, chordIndex } = flatToSection(step, sections);
      setNavState({
        sectionIndex,
        chordIndexInSection: chordIndex,
        flatIndex: step
      });
    } else {
      setNavState(prev => ({
        ...prev,
        flatIndex: step
      }));
    }
  }, [isSectionMode, sections]);

  // Handler for continuing to next section after pause
  const handleContinueToNextSection = useCallback(() => {
    if (pendingNextSection === null || !sections) return;

    setNavState({
      sectionIndex: pendingNextSection,
      chordIndexInSection: 0,
      flatIndex: sectionToFlat(pendingNextSection, 0, sections)
    });

    setIsAutoPlayPaused(false);
    setPendingNextSection(null);
    setIsPlaying(true);
  }, [pendingNextSection, sections]);

  // Auto-play functionality with section boundary pauses
  useEffect(() => {
    if (!isPlaying || isAutoPlayPaused) return;

    const timer = setInterval(() => {
      if (!isSectionMode || !sections || viewMode === 'flat') {
        // Flat mode auto-play
        setNavState(prev => {
          if (prev.flatIndex >= totalChords - 1) {
            setIsPlaying(false);
            return prev;
          }
          return { ...prev, flatIndex: prev.flatIndex + 1 };
        });
        return;
      }

      // Section-aware auto-play
      const currentSection = sections[navState.sectionIndex];
      if (!currentSection) {
        setIsPlaying(false);
        return;
      }

      const isLastChordInSection = navState.chordIndexInSection === currentSection.chords.length - 1;

      if (isLastChordInSection) {
        const isLastSection = navState.sectionIndex === sections.length - 1;

        if (isLastSection) {
          setIsPlaying(false);
          return;
        }

        // PAUSE at section boundary
        setIsPlaying(false);
        setIsAutoPlayPaused(true);
        setPendingNextSection(navState.sectionIndex + 1);
        return;
      }

      // Continue within section
      goToNext();
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlaying, isAutoPlayPaused, navState, sections, isSectionMode, viewMode, totalChords, goToNext]);

  // Generate segment paths
  const generateSegmentPath = (
    startAngle: number,
    endAngle: number,
    innerR: number,
    outerR: number
  ): string => {
    const startOuter = polarToCartesian(center, center, outerR, startAngle);
    const endOuter = polarToCartesian(center, center, outerR, endAngle);
    const startInner = polarToCartesian(center, center, innerR, startAngle);
    const endInner = polarToCartesian(center, center, innerR, endAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');
  };

  // Helper to check if a chord quality is minor-like
  // Note: diminished chords are NOT included - they should appear on the major (outer) ring
  const isMinorQuality = (quality: string | undefined): boolean => {
    if (!quality) return false;
    return quality === 'minor' || quality === 'minor7';
  };

  // Determine segment highlighting
  const getSegmentState = (note: CanonicalNote, isMinorRing: boolean) => {
    const isCurrentKeySegment = isMinorRing
      ? currentKey.mode === 'minor' && currentKey.tonic === note
      : currentKey.mode === 'major' && currentKey.tonic === note;

    // Check if this is the current step's chord - must match both root AND quality
    const isCurrentStepChord = currentChord?.root === note &&
      (isMinorRing ? isMinorQuality(currentChord?.quality) : !isMinorQuality(currentChord?.quality));

    // Check if this chord was in previous steps - must match both root AND quality
    const wasVisited = chordProgression.slice(0, navState.flatIndex).some(c =>
      c.root === note && (isMinorRing ? isMinorQuality(c.quality) : !isMinorQuality(c.quality))
    );

    // Check if this chord is upcoming - must match both root AND quality
    const isUpcoming = chordProgression.slice(navState.flatIndex + 1).some(c =>
      c.root === note && (isMinorRing ? isMinorQuality(c.quality) : !isMinorQuality(c.quality))
    );

    return { isCurrentKeySegment, isCurrentStepChord, wasVisited, isUpcoming };
  };

  if (totalSteps === 0) {
    return (
      <div className="text-center p-8 text-slate-400">
        <p>No chord progression to visualize.</p>
        <p className="text-sm mt-2">Generate a song to see the chord journey on the circle of fifths.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className={`${isSectionMode && sections ? 'flex items-center justify-between' : 'text-center'}`}>
        <div className={isSectionMode && sections ? '' : 'text-center'}>
          <h3 className="text-lg font-semibold text-slate-200">Chord Journey</h3>
          {isSectionMode && sections && sections[navState.sectionIndex] ? (
            <p className="text-sm text-slate-400 mt-1">
              Chord {navState.chordIndexInSection + 1} of {sections[navState.sectionIndex].chords.length} in {sections[navState.sectionIndex].name}
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-1">
              Step {navState.flatIndex + 1} of {totalSteps}
            </p>
          )}
        </div>

        {/* View mode toggle (only in section mode) */}
        {isSectionMode && sections && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">View:</span>
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              <button
                onClick={() => setViewMode('sectioned')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'sectioned'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                By Section
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'flat'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                All Chords
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chord pills - sectioned or flat view */}
      {isSectionMode && sections && viewMode === 'sectioned' ? (
        /* Sectioned view with section headers */
        <div className="space-y-3">
          {sections.map((section, sectionIdx) => {
            const colorClass = SECTION_COLORS[section.type] || SECTION_COLORS.verse;
            const badgeClass = SECTION_BADGES[section.type] || SECTION_BADGES.verse;
            const isCurrentSection = sectionIdx === navState.sectionIndex;

            return (
              <div
                key={section.id}
                className={`border-l-4 rounded-lg p-3 transition-all ${colorClass}`}
              >
                {/* Section header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${badgeClass}`}>
                      {section.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{section.name}</span>
                    {section.bars && (
                      <span className="text-xs text-slate-500">{section.bars} bars</span>
                    )}
                  </div>
                </div>

                {/* Chord pills for this section */}
                <div className="flex flex-wrap gap-2">
                  {section.chords.map((chord, chordIdx) => {
                    const isCurrentChord = isCurrentSection && chordIdx === navState.chordIndexInSection;
                    const flatIdx = sectionToFlat(sectionIdx, chordIdx, sections);
                    const wasVisited = flatIdx < navState.flatIndex;
                    const isUpcoming = flatIdx > navState.flatIndex;

                    return (
                      <button
                        key={`${section.id}-chord-${chordIdx}`}
                        onClick={() => goToChord(sectionIdx, chordIdx)}
                        className={`px-3 py-1 text-sm rounded-full transition-all ${
                          isCurrentChord
                            ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                            : wasVisited
                              ? 'bg-slate-700 text-slate-300'
                              : isUpcoming
                                ? 'bg-slate-800 text-slate-500'
                                : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {chord.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat view - all chords in one row */
        <div className="flex flex-wrap justify-center gap-2">
          {chordProgression.map((chord, idx) => (
            <button
              key={`step-${idx}`}
              onClick={() => goToStep(idx)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                idx === navState.flatIndex
                  ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                  : idx < navState.flatIndex
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-800 text-slate-500'
              }`}
            >
              {chord.name}
            </button>
          ))}
        </div>
      )}

      {/* Section boundary pause UI */}
      {isAutoPlayPaused && pendingNextSection !== null && sections && (
        <div className="flex items-center justify-center gap-3 p-3 bg-indigo-900/30 border border-indigo-600/50 rounded-lg">
          <span className="text-sm text-slate-300">
            Reached end of {sections[navState.sectionIndex].name}
          </span>
          <button
            onClick={handleContinueToNextSection}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Continue to {sections[pendingNextSection].name} →
          </button>
        </div>
      )}

      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 5}
          fill="none"
          stroke="rgb(51, 65, 85)"
          strokeWidth="1"
        />

        {/* Outer ring (Major keys) */}
        {CIRCLE_OF_FIFTHS_MAJOR.map((note, index) => {
          const startAngle = index * segmentAngle - Math.PI / 2 - segmentAngle / 2;
          const endAngle = startAngle + segmentAngle;
          const { isCurrentKeySegment, isCurrentStepChord, wasVisited } = getSegmentState(note, false);

          let fillColor = 'rgb(30, 41, 59)'; // slate-800
          let strokeColor = 'rgb(51, 65, 85)';
          let strokeWidth = 1;

          if (isCurrentStepChord) {
            fillColor = 'rgb(79, 70, 229)'; // indigo-600
            strokeColor = 'rgb(129, 140, 248)'; // indigo-400
            strokeWidth = 3;
          } else if (isCurrentKeySegment) {
            fillColor = 'rgb(55, 48, 163)'; // indigo-800
            strokeColor = 'rgb(99, 102, 241)';
            strokeWidth = 2;
          } else if (wasVisited) {
            fillColor = 'rgb(67, 56, 202, 0.4)'; // indigo-700/40
          }

          const key: Key = { tonic: note, mode: 'major' };

          return (
            <g key={`major-${note}`}>
              <path
                d={generateSegmentPath(startAngle, endAngle, innerRadius + 2, outerRadius)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                className={`transition-all duration-300 ${onKeyClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => onKeyClick?.(key)}
              />
              {/* Pulsing highlight for current chord */}
              {isCurrentStepChord && (
                <path
                  d={generateSegmentPath(startAngle, endAngle, innerRadius + 2, outerRadius)}
                  fill="none"
                  stroke="rgb(165, 180, 252)"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}
              <KeyLabel
                note={note}
                mode="major"
                angle={startAngle + segmentAngle / 2}
                radius={labelOuterRadius}
                center={center}
                isCurrentKey={isCurrentKeySegment}
                isHighlighted={isCurrentStepChord}
                wasVisited={wasVisited}
                highlightedChord={isCurrentStepChord ? currentChord : undefined}
              />
            </g>
          );
        })}

        {/* Inner ring (Minor keys) */}
        {CIRCLE_OF_FIFTHS_MINOR.map((note, index) => {
          const startAngle = index * segmentAngle - Math.PI / 2 - segmentAngle / 2;
          const endAngle = startAngle + segmentAngle;
          const { isCurrentKeySegment, isCurrentStepChord, wasVisited } = getSegmentState(note, true);

          let fillColor = 'rgb(15, 23, 42)'; // slate-900
          let strokeColor = 'rgb(51, 65, 85)';
          let strokeWidth = 1;

          if (isCurrentStepChord) {
            fillColor = 'rgb(79, 70, 229)'; // indigo-600
            strokeColor = 'rgb(129, 140, 248)';
            strokeWidth = 3;
          } else if (isCurrentKeySegment) {
            fillColor = 'rgb(55, 48, 163)'; // indigo-800
            strokeColor = 'rgb(99, 102, 241)';
            strokeWidth = 2;
          } else if (wasVisited) {
            fillColor = 'rgb(67, 56, 202, 0.4)'; // indigo-700/40
          }

          const key: Key = { tonic: note, mode: 'minor' };

          return (
            <g key={`minor-${note}`}>
              <path
                d={generateSegmentPath(startAngle, endAngle, 0, innerRadius)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                className={`transition-all duration-300 ${onKeyClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => onKeyClick?.(key)}
              />
              {isCurrentStepChord && (
                <path
                  d={generateSegmentPath(startAngle, endAngle, 0, innerRadius)}
                  fill="none"
                  stroke="rgb(165, 180, 252)"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}
              <KeyLabel
                note={note}
                mode="minor"
                angle={startAngle + segmentAngle / 2}
                radius={labelInnerRadius}
                center={center}
                isCurrentKey={isCurrentKeySegment}
                isHighlighted={isCurrentStepChord}
                wasVisited={wasVisited}
                highlightedChord={isCurrentStepChord ? currentChord : undefined}
              />
            </g>
          );
        })}

        {/* Center label - shows current chord */}
        <text
          x={center}
          y={center - 12}
          textAnchor="middle"
          className="fill-slate-400 text-[10px]"
        >
          Key: {getKeyDisplayName(currentKey)}
        </text>
        <text
          x={center}
          y={center + 6}
          textAnchor="middle"
          className="fill-indigo-400 text-lg font-bold"
        >
          {currentChord?.name || '—'}
        </text>
        <text
          x={center}
          y={center + 22}
          textAnchor="middle"
          className="fill-slate-500 text-[10px]"
        >
          {currentChord?.romanNumeral || ''}
        </text>
      </svg>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrev}
          disabled={navState.flatIndex === 0}
          className={`p-2 rounded-lg transition-colors ${
            navState.flatIndex === 0
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:bg-slate-700'
          }`}
          aria-label="Previous chord"
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isPlaying ? 'Pause' : 'Auto-Play'}
        </button>

        <button
          onClick={goToNext}
          disabled={navState.flatIndex === totalSteps - 1}
          className={`p-2 rounded-lg transition-colors ${
            navState.flatIndex === totalSteps - 1
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:bg-slate-700'
          }`}
          aria-label="Next chord"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Theory explanation panel */}
      {theoryExplanation && (
        <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700 space-y-3">
          {/* Function badge and title */}
          <div className="flex items-center gap-3">
            <ChordFunctionBadge function={currentChord?.function} />
            <h4 className="font-semibold text-slate-200">{theoryExplanation.title}</h4>
          </div>

          {/* Main explanation */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {theoryExplanation.explanation}
          </p>

          {/* Circle relation */}
          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-400 flex items-start gap-2">
              <CircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
              <span>{theoryExplanation.circleRelation}</span>
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-400 pt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-indigo-600 ring-2 ring-indigo-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-indigo-700/40" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-indigo-800 ring-1 ring-indigo-500" />
          <span>Tonic</span>
        </div>
      </div>
    </div>
  );
}

interface KeyLabelProps {
  note: string;
  mode: 'major' | 'minor';
  angle: number;
  radius: number;
  center: number;
  isCurrentKey: boolean;
  isHighlighted: boolean;
  wasVisited?: boolean;
  highlightedChord?: Chord; // The actual chord being highlighted (if any)
}

function KeyLabel({ note, mode, angle, radius, center, isCurrentKey, isHighlighted, wasVisited, highlightedChord }: KeyLabelProps) {
  const pos = polarToCartesian(center, center, radius, angle);

  // If this segment is highlighted with a specific chord, show the chord name
  // This ensures diminished, augmented, and other chord qualities display correctly
  let displayName: string;
  if (isHighlighted && highlightedChord && highlightedChord.root === note) {
    // Use the chord's formatted name (e.g., "Bdim", "F#°", "Caug")
    displayName = highlightedChord.name;
  } else {
    // Show key name for non-highlighted segments
    displayName = mode === 'minor' ? `${note}m` : note;
  }

  let className = 'text-[11px] transition-all duration-300 ';
  if (isHighlighted) {
    className += 'fill-white font-bold text-[13px]';
  } else if (isCurrentKey) {
    className += 'fill-indigo-300 font-semibold';
  } else if (wasVisited) {
    className += 'fill-indigo-400/70 font-medium';
  } else {
    className += mode === 'major' ? 'fill-slate-400' : 'fill-slate-500';
  }

  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="middle"
      className={className}
    >
      {displayName}
    </text>
  );
}

function ChordFunctionBadge({ function: fn }: { function?: ChordFunction }) {
  const colors: Record<ChordFunction | 'default', string> = {
    tonic: 'bg-green-500/20 text-green-400 border-green-500/30',
    'tonic-substitute': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    subdominant: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dominant: 'bg-red-500/20 text-red-400 border-red-500/30',
    predominant: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    borrowed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const labels: Record<ChordFunction | 'default', string> = {
    tonic: 'Tonic',
    'tonic-substitute': 'Near Home',
    subdominant: 'Subdominant',
    dominant: 'Dominant',
    predominant: 'Predominant',
    borrowed: 'Borrowed',
    default: 'Color',
  };

  const key = fn || 'default';

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[key]}`}>
      {labels[key]}
    </span>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInRadians: number
): { x: number; y: number } {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export default CircleOfFifthsVisualization;
