import { useState } from 'react';
import type {
  StrummingPattern,
  RhythmGuidance,
  DetailLevel,
  StrumBeat,
} from '../../types/music';
import { STRUMMING_EDUCATIONAL_CONTENT } from '../../data/strummingPatterns';

interface StrummingPatternDisplayProps {
  rhythmGuidance: RhythmGuidance;
  tempo: number;
  detailLevel: DetailLevel;
  onDetailLevelChange?: (level: DetailLevel) => void;
}

export function StrummingPatternDisplay({
  rhythmGuidance,
  tempo,
  detailLevel,
  onDetailLevelChange,
}: StrummingPatternDisplayProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const { primaryPattern, alternativePatterns, explanation } = rhythmGuidance;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StrumIcon />
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Strumming Pattern
          </h4>
        </div>

        {/* Detail level selector */}
        {onDetailLevelChange && (
          <div className="flex gap-1">
            {(['beginner', 'intermediate', 'advanced'] as DetailLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => onDetailLevelChange(level)}
                className={`px-2 py-1 text-xs rounded transition-colors
                  ${detailLevel === level
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Pattern Display */}
      <PatternCard
        pattern={primaryPattern}
        tempo={tempo}
        isPrimary
        detailLevel={detailLevel}
      />

      {/* Explanation */}
      <div className="p-3 bg-slate-800/30 rounded-lg">
        <p className="text-sm text-slate-300 leading-relaxed">
          {explanation[detailLevel]}
        </p>
      </div>

      {/* Pattern Tips */}
      {detailLevel !== 'beginner' && primaryPattern.tips.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Practice Tips
          </h5>
          <ul className="space-y-1">
            {primaryPattern.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-indigo-400 mt-0.5">*</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternative Patterns */}
      {alternativePatterns && alternativePatterns.length > 0 && (
        <div className="border-t border-slate-700/50 pt-4">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronIcon isOpen={showAlternatives} />
            <span>
              {showAlternatives ? 'Hide' : 'Show'} {alternativePatterns.length} alternative pattern{alternativePatterns.length > 1 ? 's' : ''}
            </span>
          </button>

          {showAlternatives && (
            <div className="mt-3 space-y-3">
              {alternativePatterns.map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  tempo={tempo}
                  isPrimary={false}
                  detailLevel={detailLevel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notation Legend (for beginners) */}
      {detailLevel === 'beginner' && (
        <NotationLegend />
      )}
    </div>
  );
}

// ============================================================================
// PATTERN CARD
// ============================================================================

interface PatternCardProps {
  pattern: StrummingPattern;
  tempo: number;
  isPrimary: boolean;
  detailLevel: DetailLevel;
}

function PatternCard({ pattern, tempo, isPrimary, detailLevel }: PatternCardProps) {
  const isTempoSuitable =
    tempo >= pattern.tempoRange.min && tempo <= pattern.tempoRange.max;

  return (
    <div
      className={`p-4 rounded-lg border transition-all
        ${isPrimary
          ? 'bg-slate-800/50 border-indigo-500/30'
          : 'bg-slate-800/30 border-slate-700/30'
        }`}
    >
      {/* Pattern Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className={`font-semibold ${isPrimary ? 'text-slate-100' : 'text-slate-300'}`}>
            {pattern.name}
          </h5>
          <p className="text-xs text-slate-400 mt-0.5">{pattern.description}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty badge */}
          <DifficultyBadge difficulty={pattern.difficulty} />

          {/* Time signature */}
          <div className="text-xs font-mono bg-slate-700/50 px-2 py-1 rounded text-slate-300">
            {pattern.timeSignature.beats}/{pattern.timeSignature.value}
          </div>
        </div>
      </div>

      {/* Visual Pattern Grid */}
      <PatternGrid pattern={pattern} />

      {/* Pattern Text Notation */}
      <div className="mt-3 font-mono text-sm text-center text-slate-400">
        {patternToString(pattern.pattern)}
      </div>

      {/* Metadata */}
      {detailLevel !== 'beginner' && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          {/* Tempo range */}
          <div className={`flex items-center gap-1 ${isTempoSuitable ? 'text-green-400' : 'text-amber-400'}`}>
            <TempoIcon />
            <span>{pattern.tempoRange.min}-{pattern.tempoRange.max} BPM</span>
            {!isTempoSuitable && (
              <span className="text-amber-400">(current: {tempo})</span>
            )}
          </div>

          {/* Genres */}
          <div className="flex items-center gap-1 text-slate-400">
            <span>Genres:</span>
            {pattern.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISUAL PATTERN GRID
// ============================================================================

interface PatternGridProps {
  pattern: StrummingPattern;
}

function PatternGrid({ pattern }: PatternGridProps) {
  const { pattern: beats, timeSignature, subdivisions } = pattern;

  // Calculate how many beats to show per group
  const beatsPerGroup = subdivisions / timeSignature.beats;

  // Group beats by main beats of the time signature
  const groups: StrumBeat[][] = [];
  for (let i = 0; i < beats.length; i += beatsPerGroup) {
    groups.push(beats.slice(i, i + beatsPerGroup));
  }

  return (
    <div className="flex justify-center gap-1">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex gap-0.5">
          {group.map((beat, beatIndex) => (
            <BeatCell
              key={beatIndex}
              beat={beat}
              isDownbeat={beatIndex === 0}
              groupIndex={groupIndex}
            />
          ))}
          {/* Separator between groups */}
          {groupIndex < groups.length - 1 && (
            <div className="w-px bg-slate-600/50 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

interface BeatCellProps {
  beat: StrumBeat;
  isDownbeat: boolean;
  groupIndex: number;
}

function BeatCell({ beat, isDownbeat, groupIndex }: BeatCellProps) {
  const getBeatContent = () => {
    switch (beat.direction) {
      case 'D':
        return <DownArrow accent={beat.accent} />;
      case 'U':
        return <UpArrow accent={beat.accent} />;
      case 'x':
        return <MutedStrum accent={beat.accent} />;
      case '-':
        return <Rest />;
    }
  };

  return (
    <div
      className={`w-8 h-12 flex flex-col items-center justify-center rounded
        ${isDownbeat ? 'bg-slate-700/50' : 'bg-slate-800/30'}
        ${beat.accent ? 'ring-1 ring-amber-500/50' : ''}
      `}
    >
      {getBeatContent()}
      {/* Beat number indicator for downbeats */}
      {isDownbeat && (
        <span className="text-[10px] text-slate-500 mt-1">
          {groupIndex + 1}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// STRUM DIRECTION SYMBOLS
// ============================================================================

function DownArrow({ accent }: { accent?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={accent ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={accent ? 'text-amber-400' : 'text-indigo-400'}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function UpArrow({ accent }: { accent?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={accent ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={accent ? 'text-amber-400' : 'text-emerald-400'}
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function MutedStrum({ accent }: { accent?: boolean }) {
  return (
    <div
      className={`text-lg font-bold ${accent ? 'text-amber-400' : 'text-slate-400'}`}
    >
      x
    </div>
  );
}

function Rest() {
  return (
    <div className="text-lg text-slate-600">-</div>
  );
}

// ============================================================================
// NOTATION LEGEND
// ============================================================================

function NotationLegend() {
  const notation = STRUMMING_EDUCATIONAL_CONTENT.notation;

  return (
    <div className="p-3 bg-slate-800/30 rounded-lg">
      <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
        Notation Guide
      </h5>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-6 flex justify-center"><DownArrow /></span>
          <span className="text-slate-300">{notation.D.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 flex justify-center"><UpArrow /></span>
          <span className="text-slate-300">{notation.U.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 flex justify-center text-slate-400 font-bold">x</span>
          <span className="text-slate-300">{notation.x.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 flex justify-center text-slate-500">-</span>
          <span className="text-slate-300">{notation['-'].name}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function DifficultyBadge({ difficulty }: { difficulty: 'beginner' | 'intermediate' | 'advanced' }) {
  const colors = {
    beginner: 'bg-green-500/20 text-green-300',
    intermediate: 'bg-amber-500/20 text-amber-300',
    advanced: 'bg-red-500/20 text-red-300',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function StrumIcon() {
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
      className="text-indigo-400"
    >
      <path d="M12 3v18" />
      <path d="M8 7l4-4 4 4" />
      <path d="M8 17l4 4 4-4" />
    </svg>
  );
}

function TempoIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
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
      className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert pattern to string notation
 */
function patternToString(pattern: StrumBeat[]): string {
  return pattern
    .map((beat) => {
      const char = beat.direction;
      return beat.accent ? char.toUpperCase() : char;
    })
    .join(' ');
}

export default StrummingPatternDisplay;
