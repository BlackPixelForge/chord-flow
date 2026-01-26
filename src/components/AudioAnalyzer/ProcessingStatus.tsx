/**
 * ProcessingStatus Component
 *
 * Shows the progress of audio analysis with stage labels.
 */

import type { AnalyzerStatus } from '../../types/audioAnalysis';

interface ProcessingStatusProps {
  status: AnalyzerStatus;
  progress: number;
  message?: string;
  fileName?: string;
}

const STATUS_LABELS: Record<AnalyzerStatus, string> = {
  idle: 'Ready',
  loading: 'Loading audio',
  detecting_beats: 'Detecting beats',
  extracting_chroma: 'Extracting pitch information',
  recognizing_chords: 'Recognizing chords',
  analyzing_theory: 'Analyzing music theory',
  complete: 'Analysis complete',
  error: 'Error',
};

const STATUS_ICONS: Record<AnalyzerStatus, React.ReactNode> = {
  idle: null,
  loading: <LoadingSpinner />,
  detecting_beats: <LoadingSpinner />,
  extracting_chroma: <LoadingSpinner />,
  recognizing_chords: <LoadingSpinner />,
  analyzing_theory: <LoadingSpinner />,
  complete: <CheckIcon />,
  error: <ErrorIcon />,
};

export function ProcessingStatus({
  status,
  progress,
  message,
  fileName,
}: ProcessingStatusProps) {
  const isProcessing = status !== 'idle' && status !== 'complete' && status !== 'error';

  return (
    <div className="w-full p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      {/* File name */}
      {fileName && (
        <div className="flex items-center gap-2 mb-3">
          <MusicIcon />
          <span className="text-sm text-slate-300 truncate">{fileName}</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className={`
            absolute inset-y-0 left-0 rounded-full transition-all duration-300
            ${status === 'error' ? 'bg-red-500' : status === 'complete' ? 'bg-green-500' : 'bg-indigo-500'}
          `}
          style={{ width: `${progress}%` }}
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}
      </div>

      {/* Status label and message */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STATUS_ICONS[status]}
          <span
            className={`
              text-sm font-medium
              ${status === 'error' ? 'text-red-400' : status === 'complete' ? 'text-green-400' : 'text-slate-300'}
            `}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>
        <span className="text-sm text-slate-500">
          {message || `${Math.round(progress)}%`}
        </span>
      </div>

      {/* Stage indicators */}
      {isProcessing && (
        <div className="flex items-center gap-1 mt-4">
          <StageIndicator label="Load" active={status === 'loading'} complete={isStageComplete(status, 'loading')} />
          <StageDivider />
          <StageIndicator label="Beats" active={status === 'detecting_beats'} complete={isStageComplete(status, 'detecting_beats')} />
          <StageDivider />
          <StageIndicator label="Pitch" active={status === 'extracting_chroma'} complete={isStageComplete(status, 'extracting_chroma')} />
          <StageDivider />
          <StageIndicator label="Chords" active={status === 'recognizing_chords'} complete={isStageComplete(status, 'recognizing_chords')} />
          <StageDivider />
          <StageIndicator label="Theory" active={status === 'analyzing_theory'} complete={isStageComplete(status, 'analyzing_theory')} />
        </div>
      )}
    </div>
  );
}

function isStageComplete(currentStatus: AnalyzerStatus, stage: AnalyzerStatus): boolean {
  const order: AnalyzerStatus[] = [
    'loading',
    'detecting_beats',
    'extracting_chroma',
    'recognizing_chords',
    'analyzing_theory',
    'complete',
  ];

  const currentIndex = order.indexOf(currentStatus);
  const stageIndex = order.indexOf(stage);

  return currentIndex > stageIndex;
}

function StageIndicator({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`
        px-2 py-1 text-xs rounded-md transition-colors
        ${complete
          ? 'bg-green-500/20 text-green-400'
          : active
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'bg-slate-700/50 text-slate-500'
        }
      `}
    >
      {label}
    </div>
  );
}

function StageDivider() {
  return (
    <div className="w-2 h-px bg-slate-600" />
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-green-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="w-4 h-4 text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg
      className="w-4 h-4 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default ProcessingStatus;
