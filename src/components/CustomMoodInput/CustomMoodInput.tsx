import { useState, useEffect, useCallback, useRef } from 'react';
import type { Key } from '../../types/music';
import { recommendKeyForMood, type KeyRecommendation } from '../../services/algorithmicGenerator';

interface CustomMoodInputProps {
  onGenerate: (mood: string, apiKey: string | null, options: GenerationOptions) => void;
  isLoading: boolean;
  currentKey: Key;
}

export interface GenerationOptions {
  key?: Key; // Now optional - if not provided, key will be auto-recommended
  style?: string;
  complexity: 'simple' | 'moderate' | 'complex';
  useAutoKey?: boolean; // Flag to indicate auto key was used
}

// Rate limiting: minimum time between generations (in ms)
const RATE_LIMIT_MS = 2000;

export function CustomMoodInput({ onGenerate, isLoading, currentKey }: CustomMoodInputProps) {
  const [mood, setMood] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [style, setStyle] = useState('');
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useAutoKey, setUseAutoKey] = useState(true); // Default to auto-recommend
  const [keyRecommendation, setKeyRecommendation] = useState<KeyRecommendation | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [securityAcknowledged, setSecurityAcknowledged] = useState(false);

  // Rate limiting
  const lastGenerationRef = useRef<number>(0);

  // Update key recommendation when mood changes
  const updateRecommendation = useCallback((moodText: string) => {
    if (moodText.trim().length >= 3) {
      const recommendation = recommendKeyForMood(moodText.trim());
      setKeyRecommendation(recommendation);
    } else {
      setKeyRecommendation(null);
    }
  }, []);

  // Debounce the recommendation update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateRecommendation(mood);
    }, 300);
    return () => clearTimeout(timer);
  }, [mood, updateRecommendation]);

  // Clear rate limit error after showing it
  useEffect(() => {
    if (rateLimitError) {
      const timer = setTimeout(() => setRateLimitError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationRef.current;
    if (timeSinceLastGeneration < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastGeneration) / 1000);
      setRateLimitError(`Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before generating again`);
      return;
    }

    // Security check for API key usage
    if (apiKey && !securityAcknowledged) {
      setShowApiKey(true); // Ensure the warning is visible
      return;
    }

    lastGenerationRef.current = now;
    setRateLimitError(null);

    const selectedKey = useAutoKey && keyRecommendation
      ? keyRecommendation.key
      : currentKey;

    onGenerate(mood.trim(), apiKey.trim() || null, {
      key: selectedKey,
      style: style.trim() || undefined,
      complexity,
      useAutoKey,
    });
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    // Reset security acknowledgment when key changes
    if (!value) {
      setSecurityAcknowledged(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mood Input */}
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-slate-300 mb-2">
            Describe your mood or song idea
          </label>
          <textarea
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g., A nostalgic summer evening, bittersweet memories of first love, driving through rain at midnight..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100
                       placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Key Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-300">Key:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseAutoKey(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${useAutoKey
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
              >
                Auto-recommend
              </button>
              <button
                type="button"
                onClick={() => setUseAutoKey(false)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${!useAutoKey
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
              >
                Manual ({currentKey.tonic} {currentKey.mode})
              </button>
            </div>
          </div>

          {/* Key Recommendation Display */}
          {useAutoKey && keyRecommendation && (
            <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-indigo-400">
                  {keyRecommendation.key.tonic} {keyRecommendation.key.mode}
                </span>
                <ConfidenceBadge confidence={keyRecommendation.confidence} />
              </div>
              <p className="text-sm text-slate-400">{keyRecommendation.rationale}</p>
              {keyRecommendation.alternativeKeys.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Alternatives: {keyRecommendation.alternativeKeys.map(k => `${k.tonic} ${k.mode}`).join(', ')}
                </p>
              )}
            </div>
          )}

          {useAutoKey && !keyRecommendation && mood.trim().length > 0 && mood.trim().length < 3 && (
            <p className="text-xs text-slate-500">
              Type more to get a key recommendation...
            </p>
          )}
        </div>

        {/* API Key Section */}
        <div className="border-t border-slate-700 pt-4">
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className={`transform transition-transform ${showApiKey ? 'rotate-90' : ''}`}>
              ▶
            </span>
            AI-Powered Generation (Optional)
          </button>

          {showApiKey && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-slate-500">
                Add your Anthropic API key to enable AI-powered progression generation.
                Without an API key, we'll use built-in patterns which work great for most use cases.
              </p>

              {/* Security Warning */}
              {apiKey && (
                <SecurityWarning
                  acknowledged={securityAcknowledged}
                  onAcknowledge={() => setSecurityAcknowledged(true)}
                />
              )}

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-1">
                  Anthropic API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100
                             placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-transparent font-mono text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Your API key is sent directly to Anthropic and is not stored on any server.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div className="border-t border-slate-700 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className={`transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
              ▶
            </span>
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3">
              {/* Style Input */}
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-slate-300 mb-1">
                  Genre / Style (optional)
                </label>
                <input
                  id="style"
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="e.g., Folk, Jazz, Rock ballad, Lo-fi hip hop..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100
                             placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-transparent"
                />
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chord Complexity
                </label>
                <div className="flex gap-2">
                  {(['simple', 'moderate', 'complex'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setComplexity(level)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${complexity === level
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {complexity === 'simple' && 'Basic major/minor chords, beginner-friendly'}
                  {complexity === 'moderate' && 'Includes 7th chords and some extensions'}
                  {complexity === 'complex' && 'Extended chords, borrowed chords, sophisticated harmony'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rate Limit Error */}
        {rateLimitError && (
          <div className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
            <p className="text-amber-300 text-sm">{rateLimitError}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!mood.trim() || isLoading || (!!apiKey && !securityAcknowledged)}
          className={`w-full py-3 rounded-lg font-medium transition-all touch-target
            ${!mood.trim() || isLoading || (apiKey && !securityAcknowledged)
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Generating...
            </span>
          ) : apiKey && !securityAcknowledged ? (
            'Acknowledge Security Warning to Continue'
          ) : (
            <>Generate Progression {apiKey ? '(AI)' : '(Patterns)'}</>
          )}
        </button>
      </form>
    </div>
  );
}

function SecurityWarning({ acknowledged, onAcknowledge }: { acknowledged: boolean; onAcknowledge: () => void }) {
  return (
    <div className={`p-3 rounded-lg border ${acknowledged ? 'bg-green-900/20 border-green-700' : 'bg-amber-900/30 border-amber-600'}`}>
      <div className="flex items-start gap-2">
        <span className="text-amber-400 text-lg">
          {acknowledged ? '✓' : '⚠️'}
        </span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${acknowledged ? 'text-green-300' : 'text-amber-200'}`}>
            {acknowledged ? 'Security Warning Acknowledged' : 'Security Notice'}
          </p>
          {!acknowledged && (
            <>
              <ul className="text-xs text-amber-300/90 mt-2 space-y-1 list-disc list-inside">
                <li>Your API key is sent directly from your browser to Anthropic</li>
                <li>Avoid using this on public WiFi or shared computers</li>
                <li>Set spending limits in your Anthropic account dashboard</li>
                <li>Never share your screen with the API key visible</li>
              </ul>
              <button
                type="button"
                onClick={onAcknowledge}
                className="mt-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                I Understand, Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-green-500/20 text-green-400',
    medium: 'bg-amber-500/20 text-amber-400',
    low: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[confidence]}`}>
      {confidence} confidence
    </span>
  );
}

export default CustomMoodInput;
