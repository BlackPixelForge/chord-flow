interface PlaybackControlsProps {
  isPlaying: boolean;
  tempo: number;
  isLooping: boolean;
  isAudioReady: boolean;
  onPlay: () => void;
  onStop: () => void;
  onTempoChange: (tempo: number) => void;
  onLoopToggle: () => void;
}

export function PlaybackControls({
  isPlaying,
  tempo,
  isLooping,
  isAudioReady,
  onPlay,
  onStop,
  onTempoChange,
  onLoopToggle,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-slate-800/80 backdrop-blur rounded-lg">
      {/* Play/Pause Button */}
      <button
        onClick={isPlaying ? onStop : onPlay}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full
          transition-all touch-target
          ${isPlaying
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-indigo-600 hover:bg-indigo-700'
          }
          ${!isAudioReady ? 'opacity-50' : ''}
        `}
        title={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? (
          <StopIcon className="w-6 h-6 text-white" />
        ) : (
          <PlayIcon className="w-6 h-6 text-white ml-1" />
        )}
      </button>

      {/* Loop Toggle */}
      <button
        onClick={onLoopToggle}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg
          transition-all touch-target
          ${isLooping
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }
        `}
        title={isLooping ? 'Loop On' : 'Loop Off'}
      >
        <LoopIcon className="w-5 h-5" />
      </button>

      {/* Tempo Control */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm font-medium w-8">BPM</span>
        <input
          type="range"
          min={40}
          max={200}
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className="w-24 sm:w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-indigo-500
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="text-slate-100 font-mono text-sm w-8">{tempo}</span>
      </div>

      {/* Audio status indicator */}
      {!isAudioReady && (
        <span className="text-xs text-slate-500">Tap play to enable audio</span>
      )}
    </div>
  );
}

// Simple SVG icons
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  );
}

function LoopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export default PlaybackControls;
