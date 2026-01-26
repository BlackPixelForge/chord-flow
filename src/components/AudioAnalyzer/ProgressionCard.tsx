/**
 * ProgressionCard Component
 *
 * Displays the detected chord progression with Roman numerals and functions.
 */

import type { DetectedChord, TheoryAnalysis, ProgressionPattern } from '../../types/audioAnalysis';

interface ProgressionCardProps {
  chords: DetectedChord[];
  theoryAnalysis: TheoryAnalysis;
  currentChordIndex?: number;
  onChordClick?: (index: number) => void;
}

const FUNCTION_COLORS: Record<string, string> = {
  tonic: 'border-green-500 bg-green-500/10 text-green-300',
  'tonic-substitute': 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
  subdominant: 'border-blue-500 bg-blue-500/10 text-blue-300',
  dominant: 'border-red-500 bg-red-500/10 text-red-300',
  predominant: 'border-amber-500 bg-amber-500/10 text-amber-300',
  borrowed: 'border-purple-500 bg-purple-500/10 text-purple-300',
};

export function ProgressionCard({
  chords,
  theoryAnalysis,
  currentChordIndex = -1,
  onChordClick,
}: ProgressionCardProps) {
  const { progression } = theoryAnalysis;
  const uniqueChords = getUniqueProgressionChords(chords, progression.romanNumerals, progression.functions);

  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ProgressionIcon />
        <h3 className="text-lg font-semibold text-white">Chord Progression</h3>
      </div>

      {/* Chord sequence */}
      <div className="flex flex-wrap gap-2 mb-4">
        {uniqueChords.map((item, index) => {
          const isActive = currentChordIndex >= 0 && chords[currentChordIndex]?.chord === item.chord;
          const isBorrowed = progression.borrowedChords.some(b => b.chord === item.chord);
          const functionColor = FUNCTION_COLORS[item.function] || FUNCTION_COLORS.tonic;

          return (
            <button
              key={`${item.chord}-${index}`}
              onClick={() => {
                // Find first occurrence in original chords
                const originalIndex = chords.findIndex(c => c.chord === item.chord);
                if (originalIndex >= 0) onChordClick?.(originalIndex);
              }}
              className={`
                relative flex flex-col items-center justify-center
                px-4 py-2 rounded-lg border-2 transition-all
                ${functionColor}
                ${isActive ? 'ring-2 ring-white scale-105' : 'hover:scale-105'}
              `}
            >
              {/* Chord name */}
              <span className="text-lg font-bold">{item.chord}</span>

              {/* Roman numeral */}
              <span className="text-xs opacity-70">{item.romanNumeral}</span>

              {/* Borrowed indicator */}
              {isBorrowed && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" title="Borrowed chord" />
              )}
            </button>
          );
        })}
      </div>

      {/* Arrow indicators showing flow */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
        {uniqueChords.map((item, index) => (
          <div key={`flow-${index}`} className="flex items-center">
            <span className="text-sm text-slate-400">{item.romanNumeral}</span>
            {index < uniqueChords.length - 1 && (
              <ArrowIcon />
            )}
          </div>
        ))}
      </div>

      {/* Pattern recognition */}
      {progression.pattern && (
        <PatternBadge pattern={progression.pattern} />
      )}

      {/* Function legend */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700/50">
        <FunctionLegend name="Tonic" color="green" description="Home base" />
        <FunctionLegend name="Subdominant" color="blue" description="Movement" />
        <FunctionLegend name="Dominant" color="red" description="Tension" />
        {progression.borrowedChords.length > 0 && (
          <FunctionLegend name="Borrowed" color="purple" description="From other key" />
        )}
      </div>
    </div>
  );
}

interface UniqueChord {
  chord: string;
  romanNumeral: string;
  function: string;
}

function getUniqueProgressionChords(
  chords: DetectedChord[],
  romanNumerals: string[],
  functions: string[]
): UniqueChord[] {
  const seen = new Set<string>();
  const result: UniqueChord[] = [];

  chords.forEach((chord, index) => {
    if (chord.chord === 'N/C') return;
    if (seen.has(chord.chord)) return;

    seen.add(chord.chord);
    result.push({
      chord: chord.chord,
      romanNumeral: romanNumerals[index] || '?',
      function: functions[index] || 'tonic',
    });
  });

  return result;
}

function PatternBadge({ pattern }: { pattern: ProgressionPattern }) {
  return (
    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg mb-4">
      <div className="flex items-center gap-2 mb-1">
        <PatternIcon />
        <span className="text-sm font-semibold text-indigo-300">{pattern.name}</span>
      </div>
      <p className="text-sm text-slate-400">{pattern.description}</p>
    </div>
  );
}

function FunctionLegend({
  name,
  color,
  description,
}: {
  name: string;
  color: 'green' | 'blue' | 'red' | 'purple';
  description: string;
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${colorClasses[color]}`} />
      <span className="text-xs text-slate-400">{name}</span>
      <span className="text-xs text-slate-500">({description})</span>
    </div>
  );
}

function ProgressionIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4 text-slate-500 mx-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function PatternIcon() {
  return (
    <svg
      className="w-4 h-4 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default ProgressionCard;
