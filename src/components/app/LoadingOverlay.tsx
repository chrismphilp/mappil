import { FC, memo } from 'react';

const SPINNER_SIZE = 80;
const STROKE_WIDTH = 4;
const RADIUS = (SPINNER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const INDETERMINATE_ARC = CIRCUMFERENCE * 0.28;

interface LoadingOverlayProps {
  label: string;
  progress?: number;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ label, progress }) => {
  const clampedProgress =
    typeof progress === 'number' ? Math.max(0, Math.min(progress, 1)) : undefined;
  const pct =
    typeof clampedProgress === 'number'
      ? Math.round(clampedProgress * 100)
      : null;
  const offset =
    typeof clampedProgress === 'number'
      ? CIRCUMFERENCE * (1 - clampedProgress)
      : 0;

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <svg
        width={SPINNER_SIZE}
        height={SPINNER_SIZE}
        className={typeof clampedProgress === 'number' ? '-rotate-90' : 'animate-spin'}
      >
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
          strokeDasharray={
            typeof clampedProgress === 'number'
              ? CIRCUMFERENCE
              : `${INDETERMINATE_ARC} ${CIRCUMFERENCE}`
          }
          strokeDashoffset={offset}
          style={
            typeof clampedProgress === 'number'
              ? { transition: 'stroke-dashoffset 150ms ease-out' }
              : undefined
          }
        />
      </svg>
      <div className="mt-4 flex flex-col items-center gap-1">
        <span className="text-slate-200 text-sm font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
        {pct !== null && (
          <span className="text-slate-400 text-sm tabular-nums">{pct}%</span>
        )}
      </div>
    </div>
  );
};

export default memo(LoadingOverlay);
