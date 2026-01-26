/**
 * KeyDisplay Component
 *
 * Shows the detected key with confidence and alternatives.
 */

import type { KeyAnalysis } from '../../types/audioAnalysis';

interface KeyDisplayProps {
  keyAnalysis: KeyAnalysis;
  onKeyChange?: (key: { tonic: string; mode: 'major' | 'minor' }) => void;
}

export function KeyDisplay({ keyAnalysis, onKeyChange }: KeyDisplayProps) {
  const confidencePercent = Math.round(keyAnalysis.confidence * 100);

  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      {/* Main key display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <KeyIcon />
          </div>
          <div>
            <p className="text-sm text-slate-400">Detected Key</p>
            <p className="text-xl font-bold text-white">
              {keyAnalysis.tonic} {keyAnalysis.mode}
            </p>
          </div>
        </div>

        {/* Confidence badge */}
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${confidencePercent >= 80
            ? 'bg-green-500/20 text-green-400'
            : confidencePercent >= 60
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-orange-500/20 text-orange-400'
          }
        `}>
          {confidencePercent}% confident
        </div>
      </div>

      {/* Confidence bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all ${
            confidencePercent >= 80
              ? 'bg-green-500'
              : confidencePercent >= 60
                ? 'bg-yellow-500'
                : 'bg-orange-500'
          }`}
          style={{ width: `${confidencePercent}%` }}
        />
      </div>

      {/* Alternative keys */}
      {keyAnalysis.alternateKeys.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Also possible:</p>
          <div className="flex flex-wrap gap-2">
            {keyAnalysis.alternateKeys.map((alt) => (
              <button
                key={`${alt.tonic}-${alt.mode}`}
                onClick={() => onKeyChange?.({ tonic: alt.tonic, mode: alt.mode })}
                className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-700
                           rounded-lg border border-slate-600/50 hover:border-slate-500
                           text-slate-300 transition-colors flex items-center gap-2"
              >
                <span>{alt.tonic} {alt.mode}</span>
                <span className="text-xs text-slate-500">
                  {Math.round(alt.confidence * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KeyIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default KeyDisplay;
