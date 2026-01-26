import { useState, useCallback } from 'react';
import type { Key, Mood, Progression, Song } from './types/music';
import { suggestProgressions } from './data/progressions';
import { suggestTempoForMood } from './data/moods';
import { getKeyDisplayName } from './data/circleOfFifths';
import { generateProgressionWithAI, generateProgressionFallback } from './services/aiProgressionGenerator';
import { KeySelector } from './components/KeySelector/KeySelector';
import { MoodSelector } from './components/MoodSelector/MoodSelector';
import { ProgressionBuilder } from './components/ProgressionBuilder/ProgressionBuilder';
import { PlaybackControls } from './components/PlaybackControls/PlaybackControls';
import { CustomMoodInput, type GenerationOptions } from './components/CustomMoodInput/CustomMoodInput';
import { SongView } from './components/SongView/SongView';
import { useChordAudio } from './hooks/useChordAudio';

type ViewMode = 'preset' | 'custom';

function App() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('preset');
  const [currentKey, setCurrentKey] = useState<Key>({ tonic: 'C', mode: 'major' });
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [tempo, setTempo] = useState(100);
  const [isLooping, setIsLooping] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio hook
  const {
    audioState,
    playChord,
    playProgression,
    playSong,
    stopPlayback,
    setTempo: setAudioTempo,
    setLooping: setAudioLooping,
  } = useChordAudio();

  // Generate preset progression based on current settings
  const generateProgression = useCallback(() => {
    const progressions = suggestProgressions({
      key: currentKey,
      mood: selectedMood ?? undefined,
    });

    if (progressions.length > 0) {
      const newProgression = progressions[0];
      setProgression(newProgression);
      setSong(null); // Clear song when using preset

      // Update tempo based on mood if selected
      if (selectedMood) {
        const suggestedTempo = suggestTempoForMood(selectedMood);
        setTempo(suggestedTempo);
      }
    }
  }, [currentKey, selectedMood]);

  // Handle custom mood generation (AI or fallback)
  const handleCustomGenerate = useCallback(async (
    mood: string,
    apiKey: string | null,
    options: GenerationOptions
  ) => {
    setError(null);
    setIsGenerating(true);

    try {
      let generatedSong: Song;

      if (apiKey) {
        // Use AI generation
        generatedSong = await generateProgressionWithAI(apiKey, {
          mood,
          key: options.key,
          style: options.style,
          complexity: options.complexity,
        });
      } else {
        // Use fallback patterns
        generatedSong = generateProgressionFallback({
          mood,
          key: options.key,
          style: options.style,
          complexity: options.complexity,
        });
      }

      setSong(generatedSong);
      setProgression(null); // Clear preset progression
      setTempo(generatedSong.tempo);
      setCurrentKey(generatedSong.key);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate progression');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Handle key change
  const handleKeyChange = useCallback((key: Key) => {
    setCurrentKey(key);
    // Regenerate progression with new key if one exists
    if (progression) {
      const progressions = suggestProgressions({
        key,
        mood: selectedMood ?? undefined,
      });
      if (progressions.length > 0) {
        setProgression(progressions[0]);
      }
    }
  }, [progression, selectedMood]);

  // Handle mood selection
  const handleMoodSelect = useCallback((mood: Mood) => {
    const newMood = selectedMood === mood ? null : mood;
    setSelectedMood(newMood);

    // Auto-generate when mood is selected
    if (newMood) {
      const suggestedTempo = suggestTempoForMood(newMood);
      setTempo(suggestedTempo);

      const progressions = suggestProgressions({
        key: currentKey,
        mood: newMood,
      });
      if (progressions.length > 0) {
        setProgression(progressions[0]);
        setSong(null);
      }
    }
  }, [currentKey, selectedMood]);

  // Handle play button
  const handlePlay = useCallback(async () => {
    if (song) {
      // Play multi-section song
      if (audioState.isPlaying) {
        stopPlayback();
      } else {
        await playSong(song, tempo, isLooping);
      }
    } else if (progression) {
      // Play simple progression
      if (audioState.isPlaying) {
        stopPlayback();
      } else {
        await playProgression(progression, tempo, isLooping);
      }
    } else {
      generateProgression();
    }
  }, [song, progression, audioState.isPlaying, tempo, isLooping, generateProgression, playProgression, playSong, stopPlayback]);

  // Handle tempo change
  const handleTempoChange = useCallback((newTempo: number) => {
    setTempo(newTempo);
    setAudioTempo(newTempo);
  }, [setAudioTempo]);

  // Handle loop toggle
  const handleLoopToggle = useCallback(() => {
    const newLooping = !isLooping;
    setIsLooping(newLooping);
    setAudioLooping(newLooping);
  }, [isLooping, setAudioLooping]);

  // Handle chord click (play individual chord)
  const handleChordClick = useCallback(async (index: number) => {
    if (progression && progression.chords[index]) {
      await playChord(progression.chords[index]);
    }
  }, [progression, playChord]);

  // Handle song chord click
  const handleSongChordClick = useCallback(async (sectionIndex: number, chordIndex: number) => {
    if (song && song.sections[sectionIndex]?.chords[chordIndex]) {
      await playChord(song.sections[sectionIndex].chords[chordIndex]);
    }
  }, [song, playChord]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-400">ChordFlow</h1>
          <span className="text-sm text-slate-400">
            {getKeyDisplayName(currentKey)} {currentKey.mode}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-32">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('preset')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all
              ${viewMode === 'preset'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
          >
            Preset Moods
          </button>
          <button
            onClick={() => setViewMode('custom')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all
              ${viewMode === 'custom'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
          >
            Custom Mood
          </button>
        </div>

        {/* Controls section */}
        {viewMode === 'preset' ? (
          <section className="mb-8 space-y-6">
            {/* Key and Generate */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <KeySelector currentKey={currentKey} onKeyChange={handleKeyChange} />
              </div>
              <button
                onClick={generateProgression}
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700
                         text-white font-medium rounded-lg transition-colors touch-target"
              >
                Generate Progression
              </button>
            </div>

            {/* Mood selector */}
            <MoodSelector selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
          </section>
        ) : (
          <section className="mb-8 space-y-6">
            {/* Key selector for custom mode - shown collapsed for manual override */}
            <details className="group">
              <summary className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 cursor-pointer list-none">
                <span className="transform transition-transform group-open:rotate-90">▶</span>
                Override Key Manually
              </summary>
              <div className="mt-3 max-w-xs">
                <KeySelector currentKey={currentKey} onKeyChange={handleKeyChange} />
              </div>
            </details>

            {/* Custom mood input */}
            <CustomMoodInput
              onGenerate={handleCustomGenerate}
              isLoading={isGenerating}
              currentKey={currentKey}
            />

            {/* Error display */}
            {error && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
          </section>
        )}

        {/* Content section */}
        <section>
          {song ? (
            // Display multi-section song
            <SongView
              song={song}
              currentSectionIndex={audioState.currentSectionIndex}
              currentChordIndex={audioState.currentChordIndex}
              onChordClick={handleSongChordClick}
            />
          ) : progression ? (
            // Display simple progression
            <>
              <h2 className="text-lg font-semibold text-slate-200 mb-4">
                {progression.name ?? 'Your Progression'}
                {progression.mood && (
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    ({progression.mood})
                  </span>
                )}
              </h2>
              <ProgressionBuilder
                progression={progression}
                currentChordIndex={audioState.currentChordIndex}
                onChordClick={handleChordClick}
              />
            </>
          ) : (
            // Empty state
            <div className="flex items-center justify-center p-12 bg-slate-800/30 rounded-lg border border-slate-700 border-dashed">
              <p className="text-slate-400 text-center">
                {viewMode === 'preset'
                  ? 'Select a mood or click "Generate Progression" to get started'
                  : 'Describe your mood above to generate a custom chord progression'
                }
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Fixed playback controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          <PlaybackControls
            isPlaying={audioState.isPlaying}
            tempo={tempo}
            isLooping={isLooping}
            isAudioReady={audioState.isReady}
            onPlay={handlePlay}
            onStop={stopPlayback}
            onTempoChange={handleTempoChange}
            onLoopToggle={handleLoopToggle}
          />
        </div>
      </footer>
    </div>
  );
}

export default App;
