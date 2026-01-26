import type { Mood } from '../../types/music';
import { MOOD_DISPLAY, getAllMoods, getMoodDescription } from '../../data/moods';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

export function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  const moods = getAllMoods();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">Mood</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {moods.map(mood => {
          const display = MOOD_DISPLAY[mood];
          const isSelected = selectedMood === mood;

          return (
            <button
              key={mood}
              onClick={() => onMoodSelect(mood)}
              title={getMoodDescription(mood)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg
                transition-all duration-200 touch-target
                ${isSelected
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              <span className="text-lg mb-1">{display.icon}</span>
              <span className="text-xs font-medium">{display.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MoodSelector;
