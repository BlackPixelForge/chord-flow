import { useState, useMemo } from 'react';
import type { Song, SongSection, DetailLevel } from '../../types/music';
import { ChordDiagram } from '../ChordDiagram/ChordDiagram';
import { getFingeringForChord } from '../../data/chords';
import { ProgressionExplainer } from '../Education/ProgressionExplainer';
import { TheoryConceptModal } from '../Education/TheoryConceptModal';

interface SongViewProps {
  song: Song;
  currentSectionIndex: number;
  currentChordIndex: number;
  onChordClick?: (sectionIndex: number, chordIndex: number) => void;
  onSectionClick?: (sectionIndex: number) => void;
}

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

export function SongView({
  song,
  currentSectionIndex,
  currentChordIndex,
  onChordClick,
  onSectionClick,
}: SongViewProps) {
  const [showExplainer, setShowExplainer] = useState(false);
  const [showCircleOfFifths, setShowCircleOfFifths] = useState(false);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('beginner');
  // Track which sections are expanded (independent of playback)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Pass sections directly for section-aware visualization
  // (Backward compatibility: can still flatten if needed)
  const sections = useMemo(() => song.sections, [song.sections]);

  const toggleSectionExpanded = (sectionIndex: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionIndex)) {
        next.delete(sectionIndex);
      } else {
        next.add(sectionIndex);
      }
      return next;
    });
  };

  if (song.sections.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400">
        No sections in this song
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Song info */}
      {(song.title || song.description) && (
        <div className="mb-6">
          {song.title && (
            <h2 className="text-xl font-bold text-slate-100">{song.title}</h2>
          )}
          {song.customMood && (
            <p className="text-sm text-indigo-400 mt-1">Mood: {song.customMood}</p>
          )}
          {song.description && (
            <p className="text-sm text-slate-400 mt-2">{song.description}</p>
          )}
          {song.generatedBy === 'ai' && (
            <span className="inline-block mt-2 text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
              AI Generated
            </span>
          )}
        </div>
      )}

      {/* Why These Chords? Section */}
      {song.moodAnalysis && (
        <div className="border border-slate-700/50 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LightbulbIcon />
              <span className="text-sm font-medium text-slate-300">
                Why these chords?
              </span>
              <span className="text-xs text-slate-500">
                Learn the music theory
              </span>
            </div>
            <ChevronIcon isOpen={showExplainer} />
          </button>

          {showExplainer && (
            <div className="p-4 border-t border-slate-700/50">
              <ProgressionExplainer
                song={song}
                onOpenCircleOfFifths={() => setShowCircleOfFifths(true)}
              />
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {song.sections.map((section, sectionIndex) => (
          <SectionCard
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            isPlaying={sectionIndex === currentSectionIndex}
            isExpanded={expandedSections.has(sectionIndex) || sectionIndex === currentSectionIndex}
            activeChordIndex={sectionIndex === currentSectionIndex ? currentChordIndex : -1}
            onChordClick={(chordIndex) => onChordClick?.(sectionIndex, chordIndex)}
            onToggleExpand={() => toggleSectionExpanded(sectionIndex)}
            onClick={() => onSectionClick?.(sectionIndex)}
          />
        ))}
      </div>

      {/* Circle of Fifths Modal */}
      <TheoryConceptModal
        isOpen={showCircleOfFifths}
        onClose={() => setShowCircleOfFifths(false)}
        currentKey={song.key}
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        currentChordIndexInSection={currentChordIndex}
        detailLevel={detailLevel}
        onDetailLevelChange={setDetailLevel}
      />
    </div>
  );
}

function LightbulbIcon() {
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
      className="text-amber-400"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
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

interface SectionCardProps {
  section: SongSection;
  sectionIndex: number;
  isPlaying: boolean;
  isExpanded: boolean;
  activeChordIndex: number;
  onChordClick?: (chordIndex: number) => void;
  onToggleExpand?: () => void;
  onClick?: () => void;
}

function SectionCard({
  section,
  sectionIndex: _sectionIndex,
  isPlaying,
  isExpanded,
  activeChordIndex,
  onChordClick,
  onToggleExpand,
  onClick: _onClick,
}: SectionCardProps) {
  const colorClass = SECTION_COLORS[section.type] || SECTION_COLORS.verse;
  const badgeClass = SECTION_BADGES[section.type] || SECTION_BADGES.verse;

  return (
    <div
      className={`border-l-4 rounded-lg p-4 transition-all
        ${colorClass}
        ${isPlaying ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''}
      `}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-1 rounded ${badgeClass}`}>
            {section.type.toUpperCase()}
          </span>
          <h3 className="font-semibold text-slate-200">{section.name}</h3>
          {section.bars && (
            <span className="text-xs text-slate-500">{section.bars} bars</span>
          )}
        </div>
        {/* Expand/Collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
        >
          <GuitarIcon />
          <span>{isExpanded ? 'Hide' : 'Show'} Fingerings</span>
          <ChevronIcon isOpen={isExpanded} />
        </button>
      </div>

      {/* Chord progression (compact view) */}
      <div className="flex flex-wrap gap-2 mb-2">
        {section.chords.map((chord, chordIndex) => (
          <button
            key={`${chord.name}-${chordIndex}`}
            onClick={(e) => {
              e.stopPropagation();
              onChordClick?.(chordIndex);
            }}
            className={`px-3 py-2 rounded-lg font-medium transition-all
              ${chordIndex === activeChordIndex
                ? 'bg-indigo-600 text-white scale-105'
                : 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50'
              }`}
          >
            {chord.name}
          </button>
        ))}
      </div>

      {/* Chord diagrams (expandable) */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-700/50">
          {section.chords.map((chord, chordIndex) => {
            const fingering = getFingeringForChord(chord);
            if (!fingering) return null;

            return (
              <div
                key={`diagram-${chord.name}-${chordIndex}`}
                className={`flex flex-col items-center p-2 rounded-lg transition-all cursor-pointer
                  ${chordIndex === activeChordIndex
                    ? 'bg-indigo-900/50 ring-1 ring-indigo-500'
                    : 'bg-slate-800/30 hover:bg-slate-700/30'
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChordClick?.(chordIndex);
                }}
              >
                <ChordDiagram
                  chord={chord.name}
                  fingering={fingering}
                  size="medium"
                  showFingerNumbers
                  isHighlighted={chordIndex === activeChordIndex}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Hint to expand when collapsed */}
      {!isExpanded && (
        <p className="text-xs text-slate-500 mt-2">
          Click "Show Fingerings" to see how to play these chords
        </p>
      )}
    </div>
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

export default SongView;
