import type { MoodAnalysis, DetailLevel } from '../../types/music';
import {
  ENERGY_CONTENT,
  BRIGHTNESS_CONTENT,
  TENSION_CONTENT,
} from '../../data/educationalContent';

interface MoodAnalysisDisplayProps {
  analysis: MoodAnalysis;
  detailLevel: DetailLevel;
}

export function MoodAnalysisDisplay({ analysis, detailLevel }: MoodAnalysisDisplayProps) {
  const energyInfo = ENERGY_CONTENT[analysis.energy];
  const brightnessInfo = BRIGHTNESS_CONTENT[analysis.brightness];
  const tensionInfo = TENSION_CONTENT[analysis.tension];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
        What We Heard
      </h4>

      {/* Detected Keywords */}
      {analysis.detectedKeywords && analysis.detectedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {analysis.detectedKeywords.map((keyword) => (
            <span
              key={keyword}
              className="px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* Trait Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Energy Meter */}
        <TraitMeter
          label={energyInfo.label}
          description={detailLevel !== 'beginner' ? energyInfo.description : undefined}
          level={getTraitLevel(analysis.energy)}
          color="amber"
          musicalEffect={detailLevel === 'advanced' ? energyInfo.musicalEffect : undefined}
        />

        {/* Brightness Meter */}
        <TraitMeter
          label={brightnessInfo.label}
          description={detailLevel !== 'beginner' ? brightnessInfo.description : undefined}
          level={getBrightnessLevel(analysis.brightness)}
          color="blue"
          musicalEffect={detailLevel === 'advanced' ? brightnessInfo.musicalEffect : undefined}
        />

        {/* Tension Meter */}
        <TraitMeter
          label={tensionInfo.label}
          description={detailLevel !== 'beginner' ? tensionInfo.description : undefined}
          level={getTraitLevel(analysis.tension)}
          color="red"
          musicalEffect={detailLevel === 'advanced' ? tensionInfo.musicalEffect : undefined}
        />
      </div>

      {/* Sentiment Score (intermediate/advanced) */}
      {detailLevel !== 'beginner' && (
        <div className="flex gap-6 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Positivity:</span>
            <PositivityIndicator value={analysis.positivity} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Intensity:</span>
            <span className="text-xs font-medium text-slate-300">
              {Math.round(analysis.intensity * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Chord Features (advanced) */}
      {detailLevel === 'advanced' && (
        <div className="flex flex-wrap gap-2 pt-2">
          {analysis.useSevenths && (
            <FeatureBadge label="7th chords" />
          )}
          {analysis.useBorrowedChords && (
            <FeatureBadge label="Borrowed chords" />
          )}
          {analysis.useSuspensions && (
            <FeatureBadge label="Suspensions" />
          )}
          {analysis.useInversions && (
            <FeatureBadge label="Slash chords" />
          )}
          {analysis.pedalBassChance > 0 && (
            <FeatureBadge label="Pedal bass" />
          )}
        </div>
      )}
    </div>
  );
}

interface TraitMeterProps {
  label: string;
  description?: string;
  level: number; // 0-2 for low/medium/high
  color: 'amber' | 'blue' | 'red';
  musicalEffect?: string;
}

function TraitMeter({ label, description, level, color, musicalEffect }: TraitMeterProps) {
  const colorClasses = {
    amber: {
      bg: 'bg-amber-500/20',
      fill: 'bg-amber-500',
      text: 'text-amber-300',
    },
    blue: {
      bg: 'bg-blue-500/20',
      fill: 'bg-blue-500',
      text: 'text-blue-300',
    },
    red: {
      bg: 'bg-red-500/20',
      fill: 'bg-red-500',
      text: 'text-red-300',
    },
  };

  const colors = colorClasses[color];
  const fillWidth = ((level + 1) / 3) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${colors.text}`}>{label}</span>
      </div>

      {/* Meter bar */}
      <div className={`h-2 rounded-full ${colors.bg} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colors.fill} transition-all duration-300`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>

      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}

      {musicalEffect && (
        <p className="text-xs text-slate-500 italic">{musicalEffect}</p>
      )}
    </div>
  );
}

function PositivityIndicator({ value }: { value: number }) {
  // value is -1 to 1
  const isNegative = value < -0.2;
  const isPositive = value > 0.2;

  if (isNegative) {
    return <span className="text-xs font-medium text-red-400">Negative</span>;
  }
  if (isPositive) {
    return <span className="text-xs font-medium text-green-400">Positive</span>;
  }
  return <span className="text-xs font-medium text-slate-400">Neutral</span>;
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded">
      {label}
    </span>
  );
}

function getTraitLevel(trait: 'low' | 'medium' | 'high'): number {
  switch (trait) {
    case 'low': return 0;
    case 'medium': return 1;
    case 'high': return 2;
  }
}

function getBrightnessLevel(brightness: 'dark' | 'neutral' | 'bright'): number {
  switch (brightness) {
    case 'dark': return 0;
    case 'neutral': return 1;
    case 'bright': return 2;
  }
}

export default MoodAnalysisDisplay;
