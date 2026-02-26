import { FC, useEffect, useState } from 'react';
import { useSpring, useTransform } from 'framer-motion';

interface ScoreCounterProps {
  value: number;
  label: string;
  color: string;
}

const ScoreCounter: FC<ScoreCounterProps> = ({ value, label, color }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v));
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return rounded.on('change', (v) => setDisplay(v));
  }, [rounded]);

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
