/**
 * ChordTimeline Component
 *
 * Visual timeline of detected chords synchronized with playback.
 */

import type { DetectedChord } from '../../types/audioAnalysis';

interface ChordTimelineProps {
  chords: DetectedChord[];
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  showConfidence?: boolean;
  romanNumerals?: string[];
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  return 'bg-orange-500';
}

function getConfidenceBgColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500/20 border-green-500/40';
  if (confidence >= 0.6) return 'bg-yellow-500/20 border-yellow-500/40';
  return 'bg-orange-500/20 border-orange-500/40';
}

export function ChordTimeline({
  chords,
  currentTime,
  duration,
  onSeek,
  showConfidence = true,
  romanNumerals,
}: ChordTimelineProps) {
  // Find current chord index
  const currentChordIndex = chords.findIndex(
    (chord) => currentTime >= chord.start && currentTime < chord.end
  );

  // Calculate playhead position
  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      {/* Timeline container */}
      <div
        className="relative h-20 bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (!onSeek || duration <= 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const seekTime = (x / rect.width) * duration;
          onSeek(Math.max(0, Math.min(seekTime, duration)));
        }}
      >
        {/* Chord blocks */}
        <div className="absolute inset-0 flex">
          {chords.map((chord, index) => {
            const startPercent = duration > 0 ? (chord.start / duration) * 100 : 0;
            const widthPercent = duration > 0 ? ((chord.end - chord.start) / duration) * 100 : 0;
            const isActive = index === currentChordIndex;
            const isNoChord = chord.chord === 'N/C';

            return (
              <div
                key={`${chord.chord}-${chord.start}`}
                className={`
                  absolute inset-y-0 flex flex-col items-center justify-center
                  border-r border-slate-600/50 transition-colors
                  ${isActive
                    ? 'bg-indigo-500/30 z-10'
                    : isNoChord
                      ? 'bg-slate-700/30'
                      : showConfidence
                        ? getConfidenceBgColor(chord.confidence)
                        : 'bg-slate-700/50'
                  }
                `}
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                }}
              >
                {/* Chord name */}
                {widthPercent > 3 && (
                  <span
                    className={`
                      text-sm font-semibold truncate px-1
                      ${isActive ? 'text-white' : isNoChord ? 'text-slate-500' : 'text-slate-200'}
                    `}
                  >
                    {chord.chord}
                  </span>
                )}

                {/* Roman numeral */}
                {widthPercent > 5 && romanNumerals?.[index] && (
                  <span className="text-xs text-slate-400 truncate px-1">
                    {romanNumerals[index]}
                  </span>
                )}

                {/* Confidence indicator */}
                {showConfidence && widthPercent > 2 && !isNoChord && (
                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getConfidenceColor(chord.confidence)}`}
                      style={{ width: `${chord.confidence * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20 transition-all duration-100"
          style={{ left: `${playheadPosition}%` }}
        >
          {/* Playhead handle */}
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-white rounded-full shadow" />
        </div>
      </div>

      {/* Legend */}
      {showConfidence && (
        <div className="flex items-center justify-end gap-4 mt-2">
          <span className="text-xs text-slate-500">Confidence:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-xs text-slate-400">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-xs text-slate-400">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-xs text-slate-400">Low</span>
          </div>
        </div>
      )}

      {/* Time markers */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">{formatTime(0)}</span>
        <span className="text-xs text-slate-400 font-medium">{formatTime(currentTime)}</span>
        <span className="text-xs text-slate-500">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default ChordTimeline;
