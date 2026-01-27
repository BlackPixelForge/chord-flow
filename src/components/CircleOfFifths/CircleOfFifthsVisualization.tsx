import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Key, Chord, DetailLevel, ChordFunction, CanonicalNote } from '../../types/music';
import {
  CIRCLE_OF_FIFTHS_MAJOR,
  CIRCLE_OF_FIFTHS_MINOR,
  getKeyDisplayName,
  getCirclePosition,
} from '../../data/circleOfFifths';

interface CircleOfFifthsVisualizationProps {
  currentKey: Key;
  highlightedChords?: Chord[];
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
  detailLevel = 'beginner',
  onKeyClick,
  size = 350,
}: CircleOfFifthsVisualizationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.28;
  const labelOuterRadius = size * 0.35;
  const labelInnerRadius = size * 0.22;

  // Get unique chords in order
  const chordProgression = useMemo(() => {
    return highlightedChords.length > 0 ? highlightedChords : [];
  }, [highlightedChords]);

  const totalSteps = chordProgression.length;

  // Current chord info
  const currentChord = chordProgression[currentStep] || null;
  const previousChord = currentStep > 0 ? chordProgression[currentStep - 1] : null;

  // Get theory explanation for current chord
  const theoryExplanation = useMemo(() => {
    if (!currentChord) return null;
    return getChordTheoryExplanation(
      currentChord,
      currentKey,
      currentStep,
      totalSteps,
      previousChord,
      detailLevel
    );
  }, [currentChord, currentKey, currentStep, totalSteps, previousChord, detailLevel]);

  // Calculate segment angle (30 degrees each for 12 segments)
  const segmentAngle = (2 * Math.PI) / 12;

  // Navigation handlers
  const goToNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const goToPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

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
  const isMinorQuality = (quality: string | undefined): boolean => {
    if (!quality) return false;
    return quality === 'minor' || quality === 'minor7' || quality === 'dim7' ||
           quality === 'half-dim7' || quality === 'diminished';
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
    const wasVisited = chordProgression.slice(0, currentStep).some(c =>
      c.root === note && (isMinorRing ? isMinorQuality(c.quality) : !isMinorQuality(c.quality))
    );

    // Check if this chord is upcoming - must match both root AND quality
    const isUpcoming = chordProgression.slice(currentStep + 1).some(c =>
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
      {/* Header with step indicator */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-200">Chord Journey</h3>
        <p className="text-sm text-slate-400 mt-1">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      {/* Chord step pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {chordProgression.map((chord, idx) => (
          <button
            key={`step-${idx}`}
            onClick={() => goToStep(idx)}
            className={`px-3 py-1 text-sm rounded-full transition-all ${
              idx === currentStep
                ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                : idx < currentStep
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-slate-800 text-slate-500'
            }`}
          >
            {chord.name}
          </button>
        ))}
      </div>

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
          disabled={currentStep === 0}
          className={`p-2 rounded-lg transition-colors ${
            currentStep === 0
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
          disabled={currentStep === totalSteps - 1}
          className={`p-2 rounded-lg transition-colors ${
            currentStep === totalSteps - 1
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
}

function KeyLabel({ note, mode, angle, radius, center, isCurrentKey, isHighlighted, wasVisited }: KeyLabelProps) {
  const pos = polarToCartesian(center, center, radius, angle);
  const displayName = mode === 'minor' ? `${note}m` : note;

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
