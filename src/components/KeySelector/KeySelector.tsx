import type { Key } from '../../types/music';
import { CHROMATIC_NOTES } from '../../utils/musicTheory';

interface KeySelectorProps {
  currentKey: Key;
  onKeyChange: (key: Key) => void;
}

export function KeySelector({ currentKey, onKeyChange }: KeySelectorProps) {
  const handleTonicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tonic = e.target.value as Key['tonic'];
    onKeyChange({ ...currentKey, tonic });
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as Key['mode'];
    onKeyChange({ ...currentKey, mode });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">Key</label>
      <div className="flex gap-2">
        <select
          value={currentKey.tonic}
          onChange={handleTonicChange}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     touch-target"
        >
          {CHROMATIC_NOTES.map(note => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>

        <select
          value={currentKey.mode}
          onChange={handleModeChange}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     touch-target"
        >
          <option value="major">Major</option>
          <option value="minor">Minor</option>
        </select>
      </div>
    </div>
  );
}

export default KeySelector;
