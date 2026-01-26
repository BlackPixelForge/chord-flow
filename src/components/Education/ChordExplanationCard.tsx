import { useState } from 'react';
import type { Chord, Key, DetailLevel, ChordFunction } from '../../types/music';
import {
  CHORD_FUNCTION_CONTENT,
  getChordFunctionColor,
} from '../../data/educationalContent';

interface ChordExplanationCardProps {
  chord: Chord;
  position: number;
  keyContext: Key;
  detailLevel: DetailLevel;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function ChordExplanationCard({
  chord,
  position,
  keyContext: _keyContext,
  detailLevel,
  isExpanded = false,
  onToggleExpand,
}: ChordExplanationCardProps) {
  const [showMore, setShowMore] = useState(false);
  const chordFunction = chord.function || 'tonic';
  const functionContent = CHORD_FUNCTION_CONTENT[chordFunction];
  const colorClass = getChordFunctionColor(chordFunction);

  // Get content based on detail level
  const getContent = () => {
    switch (detailLevel) {
      case 'beginner':
        return functionContent.beginner;
      case 'intermediate':
        return functionContent.intermediate;
      case 'advanced':
        return functionContent.advanced;
    }
  };

  const content = getContent();

  return (
    <div
      className={`p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 transition-all
        ${isExpanded ? 'ring-1 ring-indigo-500/50' : ''}
      `}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">
            {position + 1}. {chord.name}
          </span>
          {chord.romanNumeral && (
            <span className="text-xs text-slate-500">
              ({chord.romanNumeral})
            </span>
          )}
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${colorClass}`}>
          {content.name}
        </span>
      </div>

      {/* Basic description (always visible) */}
      <p className="mt-2 text-sm text-slate-400">
        {content.description}
      </p>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
          {/* Roman numeral info for intermediate/advanced */}
          {detailLevel === 'intermediate' && (
            <p className="text-xs text-slate-500">
              {functionContent.intermediate.romanNumerals}
            </p>
          )}

          {/* Theory info for advanced */}
          {detailLevel === 'advanced' && (
            <>
              <p className="text-xs text-slate-500">
                {functionContent.advanced.theory.slice(0, 100)}...
              </p>
              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMore(!showMore);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {showMore ? 'Show less' : 'Learn more'}
                </button>
                {showMore && (
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {functionContent.advanced.theory}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Chord function visualization */}
          <ChordFunctionIndicator function={chordFunction} />
        </div>
      )}
    </div>
  );
}

interface ChordFunctionIndicatorProps {
  function: ChordFunction;
}

function ChordFunctionIndicator({ function: fn }: ChordFunctionIndicatorProps) {
  // Simple visual showing where this chord fits in the tonic-subdominant-dominant flow
  const positions: Record<ChordFunction, number> = {
    tonic: 0,
    'tonic-substitute': 0.3, // Near tonic but slightly away
    subdominant: 1,
    predominant: 1,
    dominant: 2,
    borrowed: 1.5, // Between subdominant and dominant
  };

  const pos = positions[fn];

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-slate-500 w-12">Tonic</span>
      <div className="flex-1 h-1 bg-slate-700 rounded-full relative">
        <div
          className="absolute w-2 h-2 rounded-full bg-indigo-500 -top-0.5 transition-all"
          style={{ left: `calc(${(pos / 2) * 100}% - 4px)` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-16 text-right">Dominant</span>
    </div>
  );
}

// Compact version for inline display
interface ChordFunctionBadgeProps {
  chord: Chord;
  detailLevel: DetailLevel;
}

export function ChordFunctionBadge({ chord, detailLevel }: ChordFunctionBadgeProps) {
  const chordFunction = chord.function || 'tonic';
  const functionContent = CHORD_FUNCTION_CONTENT[chordFunction];
  const colorClass = getChordFunctionColor(chordFunction);

  const label = detailLevel === 'beginner'
    ? functionContent.beginner.name
    : functionContent.intermediate.name;

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colorClass}`}>
      {label}
    </span>
  );
}

export default ChordExplanationCard;
