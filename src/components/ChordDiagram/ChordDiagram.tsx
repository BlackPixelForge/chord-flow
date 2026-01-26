import type { GuitarFingering } from '../../types/music';

interface ChordDiagramProps {
  chord: string;
  fingering: GuitarFingering;
  size?: 'small' | 'medium' | 'large';
  showFingerNumbers?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const SIZE_CONFIG = {
  small: { width: 80, height: 100, fretHeight: 14, stringSpacing: 9, dotRadius: 3.5, fontSize: 10, fretBadgeSize: 14, leftPadding: 22 },
  medium: { width: 120, height: 140, fretHeight: 20, stringSpacing: 13, dotRadius: 5, fontSize: 13, fretBadgeSize: 18, leftPadding: 30 },
  large: { width: 170, height: 200, fretHeight: 30, stringSpacing: 22, dotRadius: 7, fontSize: 16, fretBadgeSize: 24, leftPadding: 40 },
};

export function ChordDiagram({
  chord,
  fingering,
  size = 'medium',
  showFingerNumbers = false,
  isHighlighted = false,
  onClick,
}: ChordDiagramProps) {
  const config = SIZE_CONFIG[size];
  const { width, height, fretHeight, stringSpacing, dotRadius, fontSize, fretBadgeSize, leftPadding } = config;

  const numStrings = 6;
  const numFrets = 5;

  // Calculate grid dimensions
  const gridWidth = stringSpacing * (numStrings - 1);
  const gridHeight = fretHeight * numFrets;
  const startY = 28; // Space for chord name and open/mute indicators

  // Determine starting fret for display
  const fretNumbers = fingering.strings
    .filter((f): f is number => typeof f === 'number' && f > 0)
    .map(f => f);
  const minFret = Math.min(...fretNumbers, 12);

  // Show fret position indicator if not at nut
  const startingFret = fingering.barrePosition ?? (minFret > 4 ? minFret : 1);
  const showFretIndicator = startingFret > 1;

  // When showing fret indicator, shift grid right to make room for the badge
  const startX = showFretIndicator
    ? leftPadding + (width - leftPadding - gridWidth) / 2
    : (width - gridWidth) / 2;

  return (
    <div
      className={`inline-flex flex-col items-center cursor-pointer transition-transform ${
        isHighlighted ? 'scale-105' : ''
      } ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="select-none"
      >
        {/* Chord name */}
        <text
          x={width / 2}
          y={fontSize}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="bold"
          fill={isHighlighted ? '#60a5fa' : '#e2e8f0'}
        >
          {chord}
        </text>

        {/* Nut (thick line at top if starting at fret 1) */}
        {!showFretIndicator && (
          <line
            x1={startX - 2}
            y1={startY}
            x2={startX + gridWidth + 2}
            y2={startY}
            stroke="#e2e8f0"
            strokeWidth={4}
          />
        )}

        {/* Fret position indicator - prominent badge for barre chords */}
        {showFretIndicator && (
          <g>
            {/* Badge background */}
            <rect
              x={2}
              y={startY + fretHeight / 2 - fretBadgeSize / 2}
              width={fretBadgeSize + 6}
              height={fretBadgeSize}
              rx={3}
              fill="#4f46e5"
            />
            {/* Fret number */}
            <text
              x={5 + fretBadgeSize / 2}
              y={startY + fretHeight / 2 + (fontSize - 4) / 3}
              textAnchor="middle"
              fontSize={fontSize - 2}
              fontWeight="bold"
              fill="white"
            >
              {startingFret}
            </text>
            {/* "fr" label below for clarity */}
            <text
              x={5 + fretBadgeSize / 2}
              y={startY + fretHeight / 2 + fretBadgeSize / 2 + 8}
              textAnchor="middle"
              fontSize={fontSize - 4}
              fill="#94a3b8"
            >
              fr
            </text>
          </g>
        )}

        {/* Fret lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={startX}
            y1={startY + i * fretHeight}
            x2={startX + gridWidth}
            y2={startY + i * fretHeight}
            stroke="#64748b"
            strokeWidth={i === 0 && !showFretIndicator ? 0 : 1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={startX + i * stringSpacing}
            y1={startY}
            x2={startX + i * stringSpacing}
            y2={startY + gridHeight}
            stroke="#94a3b8"
            strokeWidth={i === 0 || i === 5 ? 1.5 : 1}
          />
        ))}

        {/* Open/Mute indicators and finger positions */}
        {fingering.strings.map((fret, stringIndex) => {
          const x = startX + stringIndex * stringSpacing;

          if (fret === 'x') {
            // Muted string
            return (
              <text
                key={`indicator-${stringIndex}`}
                x={x}
                y={startY - 5}
                textAnchor="middle"
                fontSize={fontSize - 1}
                fontWeight="bold"
                fill="#ef4444"
              >
                ×
              </text>
            );
          }

          if (fret === 0) {
            // Open string
            return (
              <circle
                key={`indicator-${stringIndex}`}
                cx={x}
                cy={startY - 7}
                r={dotRadius - 1}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
              />
            );
          }

          // Fretted note
          const displayFret = fret - startingFret + 1;
          if (displayFret < 1 || displayFret > numFrets) return null;

          const y = startY + (displayFret - 0.5) * fretHeight;
          const finger = fingering.fingers?.[stringIndex];

          return (
            <g key={`finger-${stringIndex}`}>
              <circle
                cx={x}
                cy={y}
                r={dotRadius}
                fill={isHighlighted ? '#60a5fa' : '#e2e8f0'}
              />
              {showFingerNumbers && finger && (
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize={fontSize - 4}
                  fill="#1e293b"
                  fontWeight="bold"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}

        {/* Barre indicator */}
        {fingering.barrePosition && (
          <BarreIndicator
            fingering={fingering}
            startX={startX}
            startY={startY}
            stringSpacing={stringSpacing}
            fretHeight={fretHeight}
            dotRadius={dotRadius}
            startingFret={startingFret}
            isHighlighted={isHighlighted}
          />
        )}

        {/* Fret numbers along the side for reference when showing higher frets */}
        {showFretIndicator && (
          <g>
            {Array.from({ length: numFrets }).map((_, i) => {
              const fretNum = startingFret + i;
              // Only show every other fret number to avoid clutter
              if (i > 0 && i < numFrets - 1) return null;
              return (
                <text
                  key={`fret-label-${i}`}
                  x={width - 6}
                  y={startY + (i + 0.5) * fretHeight + 3}
                  textAnchor="end"
                  fontSize={fontSize - 4}
                  fill="#64748b"
                >
                  {fretNum}
                </text>
              );
            })}
          </g>
        )}
      </svg>

      {/* Caption for barre chords */}
      {showFretIndicator && (
        <div className="text-xs text-amber-400 mt-1 font-medium">
          Barre at fret {startingFret}
        </div>
      )}
    </div>
  );
}

function BarreIndicator({
  fingering,
  startX,
  startY,
  stringSpacing,
  fretHeight,
  dotRadius,
  startingFret,
  isHighlighted,
}: {
  fingering: GuitarFingering;
  startX: number;
  startY: number;
  stringSpacing: number;
  fretHeight: number;
  dotRadius: number;
  startingFret: number;
  isHighlighted: boolean;
}) {
  if (!fingering.barrePosition) return null;

  const barreFret = fingering.barrePosition - startingFret + 1;
  if (barreFret < 1 || barreFret > 5) return null;

  // Find the range of strings covered by the barre
  const barredStrings = fingering.strings
    .map((fret, i) => ({ fret, index: i }))
    .filter(({ fret }) => fret === fingering.barrePosition);

  if (barredStrings.length < 2) return null;

  const firstString = barredStrings[0].index;
  const lastString = barredStrings[barredStrings.length - 1].index;

  const y = startY + (barreFret - 0.5) * fretHeight;
  const x1 = startX + firstString * stringSpacing;
  const x2 = startX + lastString * stringSpacing;

  return (
    <g>
      {/* Barre bar */}
      <rect
        x={x1 - dotRadius}
        y={y - dotRadius}
        width={x2 - x1 + dotRadius * 2}
        height={dotRadius * 2}
        rx={dotRadius}
        fill={isHighlighted ? '#60a5fa' : '#e2e8f0'}
      />
      {/* Barre finger indicator (usually index finger = 1) */}
      <text
        x={(x1 + x2) / 2}
        y={y + 3}
        textAnchor="middle"
        fontSize={dotRadius * 1.5}
        fill="#1e293b"
        fontWeight="bold"
      >
        1
      </text>
    </g>
  );
}

export default ChordDiagram;
