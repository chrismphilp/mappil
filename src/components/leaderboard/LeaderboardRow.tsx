import { getScoreEntryDisplayName, ScoreEntry } from '../../lib/leaderboard';
import {
  formatDuration,
  getEntryBadges,
  getRankTier,
  LeaderboardTone,
} from './leaderboardUtils';

interface LeaderboardRowProps {
  entry: ScoreEntry;
  tone: LeaderboardTone;
  pinned?: boolean;
}

function getToneClasses(tone: LeaderboardTone) {
  if (tone === 'daily') {
    return {
      current: 'border-amber-400/30 bg-amber-400/10 shadow-[0_12px_36px_rgba(251,191,36,0.10)]',
      score: 'text-amber-300',
      rank: 'border-amber-400/20 bg-amber-400/12 text-amber-100',
      tier: 'border-amber-400/16',
      you: 'text-amber-200',
    };
  }

  if (tone === 'friend') {
    return {
      current: 'border-fuchsia-400/30 bg-fuchsia-400/10 shadow-[0_12px_36px_rgba(192,132,252,0.10)]',
      score: 'text-fuchsia-300',
      rank: 'border-fuchsia-400/20 bg-fuchsia-400/12 text-fuchsia-100',
      tier: 'border-fuchsia-400/16',
      you: 'text-fuchsia-200',
    };
  }

  return {
    current: 'border-cyan-400/30 bg-cyan-400/10 shadow-[0_12px_36px_rgba(34,211,238,0.10)]',
    score: 'text-cyan-300',
    rank: 'border-cyan-400/20 bg-cyan-400/12 text-cyan-100',
    tier: 'border-cyan-400/16',
    you: 'text-cyan-200',
  };
}

function getRankBadgeClasses(rank: number) {
  if (rank === 1) {
    return 'border-amber-300/30 bg-amber-300/16 text-amber-200';
  }

  if (rank === 2) {
    return 'border-slate-200/20 bg-slate-200/10 text-slate-200';
  }

  if (rank === 3) {
    return 'border-orange-300/25 bg-orange-300/12 text-orange-200';
  }

  return 'border-white/6 bg-slate-950/40 text-slate-300';
}

const LeaderboardRow = ({
  entry,
  tone,
  pinned = false,
}: LeaderboardRowProps) => {
  const toneClasses = getToneClasses(tone);
  const tier = getRankTier(entry.rank ?? 999);
  const badges = getEntryBadges(entry);
  const displayName = getScoreEntryDisplayName(entry);

  return (
    <div
      className={`rounded-[1.5rem] border p-4 transition-colors ${
        entry.isCurrentPlayer
          ? toneClasses.current
          : 'border-white/6 bg-slate-800/55'
      } ${tier === 'top10' && !entry.isCurrentPlayer ? toneClasses.tier : ''} ${
        pinned ? 'border-dashed' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-black ${getRankBadgeClasses(
            entry.rank ?? 0,
          )}`}
        >
          {entry.rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-base font-bold text-white">
              {displayName}
            </div>
            {entry.isCurrentPlayer && (
              <span
                className={`rounded-full border border-white/8 bg-slate-950/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${toneClasses.you}`}
              >
                You
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/8 bg-slate-950/40 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              {formatDuration(entry.duration_secs)}
            </span>
            <span className="rounded-full border border-white/8 bg-slate-950/40 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              {entry.best_streak} streak
            </span>
            <span className="rounded-full border border-white/8 bg-slate-950/40 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              {entry.errors} err
            </span>
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className={`text-2xl font-black leading-none ${toneClasses.score}`}>
            {entry.score}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">
            Points
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardRow;
