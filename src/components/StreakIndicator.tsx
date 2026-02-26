import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakIndicatorProps {
  streak: number;
}

function getStreakIcon(streak: number): string | null {
  if (streak >= 10) return '🔥';
  if (streak >= 5) return '⚡';
  if (streak >= 3) return '✨';
  return null;
}

const StreakIndicator: FC<StreakIndicatorProps> = ({ streak }) => {
  const icon = getStreakIcon(streak);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        <span className="text-lg sm:text-xl font-bold tabular-nums text-amber-400">
          {streak}
        </span>
        <AnimatePresence mode="wait">
          {icon && (
            <motion.span
              key={icon}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="text-sm sm:text-base"
            >
              {icon}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
        Streak
      </span>
    </div>
  );
};

export default StreakIndicator;
