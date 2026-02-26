import { FC } from 'react';

const SPINNER_SIZE = 80;
const STROKE_WIDTH = 4;
const RADIUS = (SPINNER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LoadingOverlay: FC<{ progress: number }> = ({ progress }) => {
  const pct = Math.round(progress * 100);
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <svg width={SPINNER_SIZE} height={SPINNER_SIZE} className="-rotate-90">
        <circle
          cx={SPINNER_SIZE / 2}
          cy={SPINNER_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={SPINNER_SIZE / 2}
          cy={SPINNER_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 150ms ease-out' }}
        />
      </svg>
      <span className="text-slate-400 text-sm mt-3 tabular-nums">{pct}%</span>
    </div>
  );
};

export default LoadingOverlay;
