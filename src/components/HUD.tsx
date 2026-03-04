import { FC, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ScoreCounter from './ScoreCounter';
import StreakIndicator from './StreakIndicator';
import ProgressBar from './ProgressBar';

interface HUDProps {
  regionToFind: string | undefined;
  score: number;
  errors: number;
  streak: number;
  currentGuessErrors: number;
  progress: number;
  regionsFound: number;
  totalRegions: number;
  gameOver: boolean;
  onSkip: () => void;
}

const HUD: FC<HUDProps> = ({
  regionToFind,
  score,
  errors,
  streak,
  currentGuessErrors,
  progress,
  regionsFound,
  totalRegions,
  gameOver,
  onSkip,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed top-0 inset-x-0 sm:top-4 sm:right-4 sm:left-auto sm:w-80 z-20 pointer-events-none">
      <div className="bg-slate-900/70 backdrop-blur-xl border-b border-white/10 sm:border sm:rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
        {/* Header — country name + collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full px-4 py-2 sm:py-3 flex items-center gap-3 cursor-pointer"
        >
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest shrink-0">
              Find
            </span>
            {/* Country name inline on mobile, block on sm+ */}
            <span className="sm:hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={regionToFind ?? 'done'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-base font-bold text-white truncate block"
                >
                  {regionToFind ?? 'All done!'}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${
              collapsed ? '' : 'rotate-180'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Country name — large, only visible on sm+ */}
        <div className="hidden sm:block px-4 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={regionToFind ?? 'done'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold text-white truncate"
            >
              {regionToFind ?? 'All done!'}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Collapsible details */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {/* Stats row */}
                <div className="flex justify-around mb-3">
                  <ScoreCounter value={score} label="Score" color="text-emerald-400" />
                  <ScoreCounter value={errors} label="Errors" color="text-red-400" />
                  <StreakIndicator streak={streak} />
                </div>

                {/* Strike dots */}
                <div className="flex justify-center gap-1.5 mb-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        i < currentGuessErrors ? 'bg-red-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Skip button */}
                <div className="flex justify-center mb-3">
                  <button
                    onClick={onSkip}
                    disabled={gameOver}
                    className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Skip
                  </button>
                </div>

                {/* Progress bar */}
                <ProgressBar progress={progress} />
                <div className="text-center mt-1.5">
                  <span className="text-[10px] sm:text-xs text-slate-500">
                    {regionsFound} / {totalRegions}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HUD;
