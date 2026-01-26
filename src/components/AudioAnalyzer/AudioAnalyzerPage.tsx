/**
 * AudioAnalyzerPage Component
 *
 * Main page for the audio analysis feature.
 * Handles file upload, analysis, and result display.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  AnalyzerState,
  AnalysisError,
} from '../../types/audioAnalysis';
import { analyzeAudio, preloadEssentia } from '../../services/audioAnalysis';
import { UploadZone } from './UploadZone';
import { ProcessingStatus } from './ProcessingStatus';
import { ChordTimeline } from './ChordTimeline';
import { KeyDisplay } from './KeyDisplay';
import { ProgressionCard } from './ProgressionCard';
import { InsightsPanel } from './InsightsPanel';

const initialState: AnalyzerState = {
  status: 'idle',
  audioFile: null,
  result: null,
  error: null,
  progress: 0,
  playback: {
    isPlaying: false,
    currentTime: 0,
    currentChordIndex: -1,
  },
  display: {
    showConfidence: true,
    showRomanNumerals: true,
    showTimestamps: true,
    highlightBorrowedChords: true,
    detailLevel: 'beginner',
  },
};

export function AudioAnalyzerPage() {
  const [state, setState] = useState<AnalyzerState>(initialState);
  const [fileName, setFileName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Preload Essentia when component mounts
  useEffect(() => {
    preloadEssentia();
  }, []);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setFileName(file.name);

    // Create audio element for playback
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    audioUrlRef.current = URL.createObjectURL(file);

    // Reset state
    setState({
      ...initialState,
      status: 'loading',
      progress: 0,
    });

    try {
      const result = await analyzeAudio(file, {
        onProgress: (status, progress, _message) => {
          setState(prev => ({
            ...prev,
            status,
            progress,
          }));
        },
        confidenceThreshold: 0.5,
        detectExtendedChords: true,
      });

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        result,
      }));
    } catch (error) {
      const analysisError = error as AnalysisError;
      setState(prev => ({
        ...prev,
        status: 'error',
        error: analysisError.message || 'Analysis failed',
      }));
    }
  }, []);

  // Playback controls
  const handlePlay = useCallback(() => {
    if (audioRef.current && audioUrlRef.current) {
      audioRef.current.src = audioUrlRef.current;
      audioRef.current.play();
      setState(prev => ({
        ...prev,
        playback: { ...prev.playback, isPlaying: true },
      }));
    }
  }, []);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({
        ...prev,
        playback: { ...prev.playback, isPlaying: false },
      }));
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({
        ...prev,
        playback: { ...prev.playback, currentTime: time },
      }));
    }
  }, []);

  // Update current time during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const chords = state.result?.chords || [];
      const currentChordIndex = chords.findIndex(
        chord => currentTime >= chord.start && currentTime < chord.end
      );

      setState(prev => ({
        ...prev,
        playback: {
          ...prev.playback,
          currentTime,
          currentChordIndex,
        },
      }));
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        playback: { ...prev.playback, isPlaying: false },
      }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [state.result?.chords]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setFileName(null);
    setState(initialState);
  }, []);

  const { status, result, error, progress, playback } = state;
  const isProcessing = status !== 'idle' && status !== 'complete' && status !== 'error';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Analyze Song</h1>
        <p className="text-slate-400">
          Upload an audio file to detect chords and understand the music theory
        </p>
      </div>

      {/* Upload zone (show when idle or to allow re-upload) */}
      {(status === 'idle' || status === 'error') && (
        <UploadZone onFileSelect={handleFileSelect} disabled={isProcessing} />
      )}

      {/* Error message */}
      {status === 'error' && error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400">{error}</p>
          <button
            onClick={handleReset}
            className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Processing status */}
      {isProcessing && (
        <ProcessingStatus
          status={status}
          progress={progress}
          fileName={fileName || undefined}
        />
      )}

      {/* Results */}
      {status === 'complete' && result && (
        <div className="space-y-6">
          {/* Playback controls */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-4">
              <button
                onClick={playback.isPlaying ? handlePause : handlePlay}
                className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400
                           flex items-center justify-center transition-colors"
              >
                {playback.isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <div>
                <p className="text-sm text-slate-300 truncate max-w-xs">{fileName}</p>
                <p className="text-xs text-slate-500">
                  {formatTime(playback.currentTime)} / {formatTime(result.fileInfo.duration)}
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200
                         border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
            >
              Analyze Another
            </button>
          </div>

          {/* Chord timeline */}
          <ChordTimeline
            chords={result.chords}
            currentTime={playback.currentTime}
            duration={result.fileInfo.duration}
            onSeek={handleSeek}
            showConfidence={state.display.showConfidence}
            romanNumerals={result.theoryAnalysis.progression.romanNumerals}
          />

          {/* Key and progression side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KeyDisplay keyAnalysis={result.theoryAnalysis.key} />
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Analysis Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">{result.chords.filter(c => c.chord !== 'N/C').length}</p>
                  <p className="text-xs text-slate-500">Chords detected</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{Math.round(result.beatGrid.tempo)}</p>
                  <p className="text-xs text-slate-500">BPM</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{Math.round(result.overallConfidence * 100)}%</p>
                  <p className="text-xs text-slate-500">Confidence</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{(result.processingTime / 1000).toFixed(1)}s</p>
                  <p className="text-xs text-slate-500">Analysis time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progression card */}
          <ProgressionCard
            chords={result.chords}
            theoryAnalysis={result.theoryAnalysis}
            currentChordIndex={playback.currentChordIndex}
            onChordClick={(index) => {
              const chord = result.chords[index];
              if (chord) handleSeek(chord.start);
            }}
          />

          {/* Insights */}
          <InsightsPanel
            insights={result.theoryAnalysis.insights}
            borrowedChords={result.theoryAnalysis.progression.borrowedChords}
          />
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function PlayIcon() {
  return (
    <svg
      className="w-6 h-6 text-white ml-1"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

export default AudioAnalyzerPage;
