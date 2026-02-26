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
    <div className="fixed top-4 right-4 z-20 w-72 sm:w-80 pointer-events-none">
      <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
        {/* Header — always visible, acts as collapse toggle on mobile */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full px-4 py-3 flex items-center justify-between cursor-pointer"
        >
          <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest">
            Find this country
          </span>
          {/* Chevron — only visible on mobile */}
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${
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

        {/* Country name — always visible */}
        <div className="px-4 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={regionToFind ?? 'done'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-lg sm:text-xl font-bold text-white truncate"
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
