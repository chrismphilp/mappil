import { FC, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ScoreCounter from './ScoreCounter';
import StreakIndicator from './StreakIndicator';
import ProgressBar from './ProgressBar';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { ChallengeType } from '../../types/game.types';
import { getStreakState } from '../../lib/scoring';

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
  isDailyChallenge?: boolean;
  challengeType?: ChallengeType;
}

const STREAK_SHELL: Record<ReturnType<typeof getStreakState>['key'], string> = {
  cold: 'border-white/10',
  warm: 'border-amber-400/20 shadow-lg shadow-amber-500/10',
  hot: 'border-orange-400/25 shadow-lg shadow-orange-500/15',
  on_fire: 'border-rose-400/25 shadow-xl shadow-rose-500/20',
  legendary: 'border-cyan-400/30 shadow-xl shadow-cyan-500/20',
};

const STREAK_BANNER: Record<ReturnType<typeof getStreakState>['key'], string> = {
  cold: 'bg-slate-800/50 text-slate-400',
  warm: 'bg-amber-500/15 text-amber-300',
  hot: 'bg-orange-500/15 text-orange-300',
  on_fire: 'bg-rose-500/15 text-rose-300',
  legendary: 'bg-cyan-500/15 text-cyan-300',
};

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
  isDailyChallenge,
  challengeType,
}) => {
  const { isMobile } = useIsMobileViewport();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [hasInteracted, setHasInteracted] = useState(false);
  const streakState = getStreakState(streak);

  useEffect(() => {
    if (!hasInteracted) {
      setCollapsed(isMobile);
    }
  }, [isMobile, hasInteracted]);

  return (
    <div
      className="fixed inset-x-0 sm:right-4 sm:left-auto sm:w-80 z-20 pointer-events-none transition-all duration-300"
      style={{ top: 'max(var(--sat), 1rem)' }}
    >
      <div
        className={`bg-slate-900/75 backdrop-blur-xl border-b sm:border sm:rounded-2xl pointer-events-auto overflow-hidden ${STREAK_SHELL[streakState.key]}`}
      >
        {(isDailyChallenge || challengeType === ChallengeType.DAILY) && (
          <div className="w-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest py-1 text-center border-b border-white/5">
            Daily Challenge
          </div>
        )}
        {challengeType === ChallengeType.FRIEND && (
          <div className="w-full bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest py-1 text-center border-b border-white/5">
            Friend Challenge
          </div>
        )}

        {streakState.key !== 'cold' && (
          <div
            className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-center border-b border-white/5 ${STREAK_BANNER[streakState.key]}`}
          >
            {streakState.label} Streak
          </div>
        )}

        <button
          onClick={() => {
            setHasInteracted(true);
            setCollapsed((value) => !value);
          }}
          className="w-full px-4 py-2 sm:py-3 flex items-center gap-3 cursor-pointer"
        >
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest shrink-0">
              Find
            </span>
            <span className="sm:hidden min-w-0">
              <AnimatePresence mode="wait">
                <motion.span
                  key={regionToFind ?? 'done'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-base font-bold text-white block truncate"
                >
                  {regionToFind ?? 'All done!'}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="hidden sm:block px-4 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={regionToFind ?? 'done'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold text-white break-words"
            >
              {regionToFind ?? 'All done!'}
            </motion.div>
          </AnimatePresence>
        </div>

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
                <div className="flex justify-around mb-3">
                  <ScoreCounter value={score} label="Score" color="text-emerald-400" />
                  <ScoreCounter value={errors} label="Errors" color="text-red-400" />
                  <StreakIndicator streak={streak} />
                </div>

                <div className="flex justify-center gap-1.5 mb-2">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index < currentGuessErrors ? 'bg-red-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex justify-center mb-3">
                  <button
                    onClick={onSkip}
                    disabled={gameOver}
                    className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Skip
                  </button>
                </div>

                <ProgressBar progress={progress} />
                <div className="flex items-center justify-between mt-1.5 text-[10px] sm:text-xs text-slate-500">
                  <span>{regionsFound} / {totalRegions}</span>
                  <span>{Math.round(progress * 100)}% cleared</span>
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
