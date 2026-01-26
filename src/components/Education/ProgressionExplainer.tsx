import { useState } from 'react';
import type { Song, DetailLevel, Chord } from '../../types/music';
import { MoodAnalysisDisplay } from './MoodAnalysisDisplay';
import { ChordExplanationCard } from './ChordExplanationCard';
import {
  MODE_CONTENT,
  CHORD_FEATURES,
  getDetailLevelLabel,
} from '../../data/educationalContent';

interface ProgressionExplainerProps {
  song: Song;
  onOpenCircleOfFifths?: () => void;
}

export function ProgressionExplainer({ song, onOpenCircleOfFifths }: ProgressionExplainerProps) {
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('beginner');
  const [expandedChordIndex, setExpandedChordIndex] = useState<number | null>(null);

  const { moodAnalysis, key, sections } = song;

  // Get all unique chords from all sections
  const allChords = sections.flatMap((section) => section.chords);
  const uniqueChords = allChords.reduce<Chord[]>((acc, chord) => {
    if (!acc.find((c) => c.name === chord.name)) {
      acc.push(chord);
    }
    return acc;
  }, []);

  const modeContent = MODE_CONTENT[key.mode];

  if (!moodAnalysis) {
    return (
      <div className="p-4 text-slate-400 text-sm">
        Mood analysis not available for this song.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail Level Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">
          Why These Chords?
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Detail:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDetailLevel(level)}
                className={`px-3 py-1 text-xs font-medium transition-colors
                  ${detailLevel === level
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                {getDetailLevelLabel(level)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Mood Analysis Section */}
      <section className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <MoodAnalysisDisplay analysis={moodAnalysis} detailLevel={detailLevel} />
      </section>

      {/* 2. Key Selection Rationale */}
      <section className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
          Why This Key
        </h4>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 text-lg font-bold bg-indigo-600/30 text-indigo-300 rounded-lg">
            {key.tonic} {key.mode}
          </span>
        </div>

        {/* Mode explanation based on detail level */}
        {detailLevel === 'beginner' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{modeContent.beginner.feeling}</p>
            <p className="text-xs text-slate-500 italic">
              Example: {modeContent.beginner.example}
            </p>
          </div>
        )}

        {detailLevel === 'intermediate' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{modeContent.intermediate.description}</p>
            <ul className="text-xs text-slate-500 space-y-1 mt-2">
              {modeContent.intermediate.characteristics.map((char, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400">-</span>
                  {char}
                </li>
              ))}
            </ul>
          </div>
        )}

        {detailLevel === 'advanced' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{modeContent.advanced.theory}</p>
            <p className="text-xs text-slate-500 mt-2">
              Intervals: {modeContent.advanced.intervals}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {modeContent.advanced.commonUses.map((use, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-400 rounded">
                  {use}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Circle of Fifths button */}
        {onOpenCircleOfFifths && (
          <button
            onClick={onOpenCircleOfFifths}
            className="mt-4 flex items-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
          >
            <CircleIcon />
            View Circle of Fifths
          </button>
        )}
      </section>

      {/* 3. Chord Function Breakdown */}
      <section className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
          The Chord Journey
        </h4>

        {/* Visual progression flow */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {uniqueChords.slice(0, 8).map((chord, i) => (
            <div key={`${chord.name}-${i}`} className="flex items-center">
              <button
                onClick={() => setExpandedChordIndex(expandedChordIndex === i ? null : i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${expandedChordIndex === i
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
              >
                {chord.name}
              </button>
              {i < uniqueChords.slice(0, 8).length - 1 && (
                <span className="text-slate-600 mx-1">&rarr;</span>
              )}
            </div>
          ))}
        </div>

        {/* Chord explanation cards */}
        <div className="space-y-2">
          {uniqueChords.slice(0, 8).map((chord, i) => (
            <ChordExplanationCard
              key={`${chord.name}-${i}`}
              chord={chord}
              position={i}
              keyContext={key}
              detailLevel={detailLevel}
              isExpanded={expandedChordIndex === i}
              onToggleExpand={() => setExpandedChordIndex(expandedChordIndex === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* 4. Special Ingredients */}
      {(moodAnalysis.useSevenths || moodAnalysis.useBorrowedChords || moodAnalysis.useSuspensions) && (
        <section className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
            Special Ingredients
          </h4>
          <div className="space-y-3">
            {moodAnalysis.useSevenths && (
              <FeatureExplanation
                title="7th Chords"
                detailLevel={detailLevel}
                content={CHORD_FEATURES.sevenths}
              />
            )}
            {moodAnalysis.useBorrowedChords && (
              <FeatureExplanation
                title="Borrowed Chords"
                detailLevel={detailLevel}
                content={CHORD_FEATURES.borrowed}
              />
            )}
            {moodAnalysis.useSuspensions && (
              <FeatureExplanation
                title="Suspended Chords"
                detailLevel={detailLevel}
                content={CHORD_FEATURES.suspensions}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

interface FeatureExplanationProps {
  title: string;
  detailLevel: DetailLevel;
  content: { beginner: string; intermediate: string; advanced: string };
}

function FeatureExplanation({ title, detailLevel, content }: FeatureExplanationProps) {
  const text = content[detailLevel];

  return (
    <div className="flex items-start gap-3">
      <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded shrink-0">
        {title}
      </span>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function CircleIcon() {
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
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}

export default ProgressionExplainer;
