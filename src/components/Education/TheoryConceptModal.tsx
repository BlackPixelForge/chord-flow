import { useCallback, useEffect } from 'react';
import type { Key, Chord, DetailLevel, SongSection } from '../../types/music';
import { CircleOfFifthsVisualization } from '../CircleOfFifths/CircleOfFifthsVisualization';

interface TheoryConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: Key;
  // Support both flat and section-aware modes
  highlightedChords?: Chord[];
  sections?: SongSection[];
  currentSectionIndex?: number;
  currentChordIndexInSection?: number;
  detailLevel: DetailLevel;
  onDetailLevelChange?: (level: DetailLevel) => void;
}

export function TheoryConceptModal({
  isOpen,
  onClose,
  currentKey,
  highlightedChords,
  sections,
  currentSectionIndex,
  currentChordIndexInSection,
  detailLevel,
  onDetailLevelChange,
}: TheoryConceptModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700 z-10">
          <h2 className="text-lg font-semibold text-slate-200">
            Circle of Fifths
          </h2>
          <div className="flex items-center gap-3">
            {/* Detail level toggle */}
            {onDetailLevelChange && (
              <select
                value={detailLevel}
                onChange={(e) => onDetailLevelChange(e.target.value as DetailLevel)}
                className="px-2 py-1 text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded"
              >
                <option value="beginner">Simple</option>
                <option value="intermediate">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <CircleOfFifthsVisualization
            currentKey={currentKey}
            highlightedChords={highlightedChords}
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            currentChordIndexInSection={currentChordIndexInSection}
            detailLevel={detailLevel}
            size={350}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default TheoryConceptModal;
