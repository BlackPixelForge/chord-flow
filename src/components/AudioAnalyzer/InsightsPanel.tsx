/**
 * InsightsPanel Component
 *
 * Displays educational insights about the detected progression.
 */

import type { TheoryInsight, BorrowedChord } from '../../types/audioAnalysis';

interface InsightsPanelProps {
  insights: TheoryInsight[];
  borrowedChords: BorrowedChord[];
  onChordHighlight?: (indices: number[]) => void;
}

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  interesting_harmony: <HarmonyIcon />,
  common_pattern: <PatternIcon />,
  technique: <TechniqueIcon />,
  suggestion: <SuggestionIcon />,
};

const INSIGHT_COLORS: Record<string, string> = {
  interesting_harmony: 'border-purple-500/30 bg-purple-500/5',
  common_pattern: 'border-blue-500/30 bg-blue-500/5',
  technique: 'border-green-500/30 bg-green-500/5',
  suggestion: 'border-amber-500/30 bg-amber-500/5',
};

export function InsightsPanel({
  insights,
  borrowedChords,
  onChordHighlight,
}: InsightsPanelProps) {
  if (insights.length === 0 && borrowedChords.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <LightbulbIcon />
        Theory Insights
      </h3>

      {/* Insights list */}
      {insights.map((insight, index) => (
        <InsightCard
          key={index}
          insight={insight}
          onHighlight={() => onChordHighlight?.(insight.relatedChords)}
        />
      ))}

      {/* Borrowed chords section */}
      {borrowedChords.length > 0 && (
        <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center gap-2 mb-2">
            <BorrowedIcon />
            <span className="text-sm font-medium text-purple-300">
              Borrowed Chords ({borrowedChords.length})
            </span>
          </div>
          <div className="space-y-2">
            {borrowedChords.map((chord, index) => (
              <div key={index} className="pl-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{chord.chord}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    from {chord.borrowedFrom}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{chord.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({
  insight,
  onHighlight,
}: {
  insight: TheoryInsight;
  onHighlight?: () => void;
}) {
  const icon = INSIGHT_ICONS[insight.type] || INSIGHT_ICONS.suggestion;
  const colorClass = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.suggestion;

  return (
    <div
      className={`p-3 rounded-lg border ${colorClass} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={onHighlight}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">{insight.title}</p>
          <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
          {insight.learnMoreUrl && (
            <a
              href={insight.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function LightbulbIcon() {
  return (
    <svg
      className="w-4 h-4 text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function HarmonyIcon() {
  return (
    <svg
      className="w-4 h-4 text-purple-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
  );
}

function PatternIcon() {
  return (
    <svg
      className="w-4 h-4 text-blue-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function TechniqueIcon() {
  return (
    <svg
      className="w-4 h-4 text-green-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function SuggestionIcon() {
  return (
    <svg
      className="w-4 h-4 text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function BorrowedIcon() {
  return (
    <svg
      className="w-4 h-4 text-purple-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

export default InsightsPanel;
