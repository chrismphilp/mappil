import { FC, useEffect, useRef, useState } from 'react';

interface ScoreCounterProps {
  value: number;
  label: string;
  color: string;
}

const ScoreCounter: FC<ScoreCounterProps> = ({ value, label, color }) => {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    const from = displayRef.current;
    const delta = value - from;

    if (delta === 0) {
      return;
    }

    const start = performance.now();
    const duration = 280;

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(from + delta * eased);

      displayRef.current = nextValue;
      setDisplay(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg sm:text-xl font-bold tabular-nums ${color}`}>
        {display}
      </span>
      <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

export default ScoreCounter;
