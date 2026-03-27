import { FC } from 'react';
import { getStreakState } from '../../lib/scoring';

interface StreakIndicatorProps {
  streak: number;
}

const STREAK_TONE: Record<ReturnType<typeof getStreakState>['key'], string> = {
  cold: 'text-slate-300',
  warm: 'text-amber-300',
  hot: 'text-orange-300',
  on_fire: 'text-rose-300',
  legendary: 'text-cyan-300',
};

const STREAK_BADGE: Record<ReturnType<typeof getStreakState>['key'], string> = {
  cold: 'bg-slate-800/80 border-white/10 text-slate-400',
  warm: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
  hot: 'bg-orange-500/15 border-orange-400/30 text-orange-300',
  on_fire: 'bg-rose-500/15 border-rose-400/30 text-rose-300',
  legendary: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300',
};

const StreakIndicator: FC<StreakIndicatorProps> = ({ streak }) => {
  const streakState = getStreakState(streak);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span className={`text-lg sm:text-xl font-bold tabular-nums ${STREAK_TONE[streakState.key]}`}>
          {streak}
        </span>
        {streakState.icon && (
          <span className="text-sm sm:text-base transition-transform duration-200">
            {streakState.icon}
          </span>
        )}
      </div>
      <span
        className={`min-w-[4.75rem] rounded-full border px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.24em] text-center ${STREAK_BADGE[streakState.key]}`}
      >
        {streakState.label}
      </span>
    </div>
  );
};

export default StreakIndicator;
