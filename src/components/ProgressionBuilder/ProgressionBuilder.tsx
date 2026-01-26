import { useState } from 'react';
import type { Chord, Progression } from '../../types/music';
import { ChordDiagram } from '../ChordDiagram/ChordDiagram';
import { getFingeringForChord } from '../../data/chords';

interface ProgressionBuilderProps {
  progression: Progression;
  currentChordIndex: number;
  onChordClick?: (index: number) => void;
}

const FUNCTION_COLORS: Record<string, string> = {
  tonic: 'border-green-500 bg-green-500/10',
  'tonic-substitute': 'border-emerald-500 bg-emerald-500/10',
  subdominant: 'border-blue-500 bg-blue-500/10',
  dominant: 'border-red-500 bg-red-500/10',
  predominant: 'border-amber-500 bg-amber-500/10',
  borrowed: 'border-purple-500 bg-purple-500/10',
};

export function ProgressionBuilder({
  progression,
  currentChordIndex,
  onChordClick,
}: ProgressionBuilderProps) {
  const [showDiagrams, setShowDiagrams] = useState(false);

  if (progression.chords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400">
        Select a mood or key to generate a progression
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {progression.chords.length} chords
        </span>
        <button
          onClick={() => setShowDiagrams(!showDiagrams)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
        >
          <GuitarIcon />
          <span>{showDiagrams ? 'Hide' : 'Show'} Fingerings</span>
          <ChevronIcon isOpen={showDiagrams} />
        </button>
      </div>

      {/* Chord progression row */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {progression.chords.map((chord, index) => (
          <ChordSlot
            key={`${chord.name}-${index}`}
            chord={chord}
            isActive={index === currentChordIndex}
            onClick={() => onChordClick?.(index)}
          />
        ))}
      </div>

      {/* Chord diagrams (expandable) */}
      {showDiagrams && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-700/50">
          {progression.chords.map((chord, index) => {
            const fingering = getFingeringForChord(chord);
            if (!fingering) return null;

            return (
              <div
                key={`diagram-${chord.name}-${index}`}
                className={`flex flex-col items-center p-3 rounded-lg transition-all cursor-pointer ${
                  index === currentChordIndex
                    ? 'bg-indigo-900/50 ring-2 ring-indigo-500'
                    : 'bg-slate-800/50 hover:bg-slate-700/50'
                }`}
                onClick={() => onChordClick?.(index)}
              >
                <ChordDiagram
                  chord={chord.name}
                  fingering={fingering}
                  size="medium"
                  showFingerNumbers
                  isHighlighted={index === currentChordIndex}
                />
                <div className="mt-2 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    chord.function ? FUNCTION_COLORS[chord.function] : 'bg-slate-700'
                  } border`}>
                    {chord.function ?? 'unknown'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hint when collapsed */}
      {!showDiagrams && (
        <p className="text-xs text-slate-500 text-center">
          Click "Show Fingerings" to see how to play these chords on guitar
        </p>
      )}
    </div>
  );
}

interface ChordSlotProps {
  chord: Chord;
  isActive: boolean;
  onClick?: () => void;
}

function ChordSlot({ chord, isActive, onClick }: ChordSlotProps) {
  const functionColor = chord.function
    ? FUNCTION_COLORS[chord.function]
    : 'border-slate-600';

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center
        w-16 h-20 rounded-lg border-2 transition-all
        touch-target
        ${functionColor}
        ${isActive
          ? 'ring-2 ring-indigo-400 scale-105'
          : 'hover:scale-105'
        }
      `}
    >
      <span className="text-lg font-bold text-slate-100">{chord.name}</span>
      <span className="text-xs text-slate-400 mt-1">{chord.romanNumeral}</span>
    </button>
  );
}

function GuitarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400"
    >
      <path d="M11.9 12.1a4.5 4.5 0 1 0-3.8 3.8" />
      <path d="m15.5 8.5 5.6-5.6" />
      <path d="m21.1 2.9-2.1 2.1" />
      <path d="m3.6 15.4-.5 3.4c-.1.6.4 1.1 1 1.1l3.4-.5" />
      <path d="m7.5 12.5-4-4" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default ProgressionBuilder;
