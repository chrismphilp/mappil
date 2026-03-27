import { FC, useEffect, useState } from 'react';
import ScoreCounter from './ScoreCounter';
import StreakIndicator from './StreakIndicator';
import ProgressBar from './ProgressBar';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { ChallengeType } from '../../types/game.types';
import { getStreakState } from '../../lib/scoring';
import { getRegionFlagEmoji } from '../../lib/regionFlags';

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

interface FinderTargetProps {
  regionToFind: string | undefined;
  className: string;
  textClassName?: string;
}

const FinderTarget: FC<FinderTargetProps> = ({
  regionToFind,
  className,
  textClassName = '',
}) => {
  const regionFlag = getRegionFlagEmoji(regionToFind);

  return (
    <span className={className}>
      <span className={textClassName}>{regionToFind ?? 'All done!'}</span>
      {regionFlag && (
        <span aria-hidden="true" className="shrink-0 text-[1.1em] leading-none">
          {regionFlag}
        </span>
      )}
    </span>
  );
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
      className="fixed inset-x-0 z-20 pointer-events-none transition-all duration-300 sm:left-auto sm:right-4 sm:w-80"
      style={{ top: 'max(var(--sat), 1rem)' }}
    >
      <div
        className={`overflow-hidden border-b bg-slate-900/75 backdrop-blur-xl pointer-events-auto sm:rounded-2xl sm:border ${STREAK_SHELL[streakState.key]}`}
      >
        {(isDailyChallenge || challengeType === ChallengeType.DAILY) && (
          <div className="w-full border-b border-white/5 bg-amber-500/20 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Daily Challenge
          </div>
        )}
        {challengeType === ChallengeType.FRIEND && (
          <div className="w-full border-b border-white/5 bg-purple-500/20 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-purple-400">
            Friend Challenge
          </div>
        )}

        {streakState.key !== 'cold' && (
          <div
            className={`px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.28em] border-b border-white/5 ${STREAK_BANNER[streakState.key]}`}
          >
            {streakState.label} Streak
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setHasInteracted(true);
            setCollapsed((value) => !value);
          }}
          className="flex w-full items-center gap-3 px-4 py-2 sm:py-3"
        >
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-slate-400 sm:text-xs">
              Find
            </span>
            <span className="min-w-0 sm:hidden">
              <span className="flex min-w-0 items-center gap-2 text-base font-bold text-white">
                <FinderTarget
                  regionToFind={regionToFind}
                  className="flex min-w-0 items-center gap-2"
                  textClassName="min-w-0 truncate"
                />
              </span>
            </span>
          </div>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="hidden px-4 pb-2 sm:block">
          <div className="text-xl font-bold text-white">
            <FinderTarget
              regionToFind={regionToFind}
              className="flex max-w-full items-center gap-3"
              textClassName="min-w-0 break-words"
            />
          </div>
        </div>

        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
            collapsed ? 'max-h-0 opacity-0' : 'max-h-[24rem] opacity-100'
          }`}
        >
          <div className="px-4 pb-4">
            <div className="mb-3 flex justify-around">
              <ScoreCounter value={score} label="Score" color="text-emerald-400" />
              <ScoreCounter value={errors} label="Errors" color="text-red-400" />
              <StreakIndicator streak={streak} />
            </div>

            <div className="mb-2 flex justify-center gap-1.5">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                    index < currentGuessErrors ? 'bg-red-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <div className="mb-3 flex justify-center">
              <button
                type="button"
                onClick={onSkip}
                disabled={gameOver}
                className="text-xs text-slate-400 transition-colors hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Skip
              </button>
            </div>

            <ProgressBar progress={progress} />
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 sm:text-xs">
              <span>
                {regionsFound} / {totalRegions}
              </span>
              <span>{Math.round(progress * 100)}% cleared</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
