import { LeaderboardGap, ScoreEntry } from '../../lib/leaderboard';
import {
  formatDuration,
  getPlayerGapMessage,
  getPlayerStandingLabel,
  LeaderboardTone,
} from './leaderboardUtils';

interface LeaderboardPlayerSummaryProps {
  tone: LeaderboardTone;
  playerEntry: ScoreEntry;
  playerGap: LeaderboardGap | null;
  totalPlayers: number;
  isVisibleOnBoard: boolean;
}

function getToneClasses(tone: LeaderboardTone) {
  if (tone === 'daily') {
    return {
      shell:
        'border-amber-400/24 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_48%),linear-gradient(180deg,rgba(251,191,36,0.06),rgba(15,23,42,0.72))]',
      tag: 'text-amber-200',
      accent: 'text-amber-300',
    };
  }

  if (tone === 'friend') {
    return {
      shell:
        'border-fuchsia-400/24 bg-[radial-gradient(circle_at_top_right,rgba(192,132,252,0.18),transparent_48%),linear-gradient(180deg,rgba(168,85,247,0.06),rgba(15,23,42,0.72))]',
      tag: 'text-fuchsia-200',
      accent: 'text-fuchsia-300',
    };
  }

  return {
    shell:
      'border-cyan-400/24 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_48%),linear-gradient(180deg,rgba(20,184,166,0.06),rgba(15,23,42,0.72))]',
    tag: 'text-cyan-200',
    accent: 'text-cyan-300',
  };
}

const LeaderboardPlayerSummary = ({
  tone,
  playerEntry,
  playerGap,
  totalPlayers,
  isVisibleOnBoard,
}: LeaderboardPlayerSummaryProps) => {
  const toneClasses = getToneClasses(tone);
  const gapMessage =
    playerEntry.rank === 1
      ? 'You currently lead this board.'
      : getPlayerGapMessage(playerGap);
  const standingLabel = getPlayerStandingLabel(
    playerEntry.rank ?? 1,
    totalPlayers,
  );

  return (
    <div className={`rounded-[1.5rem] border p-4 ${toneClasses.shell}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Your Best
          </div>
          <div className={`mt-1 text-sm font-semibold ${toneClasses.tag}`}>
            {standingLabel}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white">
            #{playerEntry.rank}
          </div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
            Overall
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-3">
          <div className={`text-lg font-black ${toneClasses.accent}`}>
            {playerEntry.score}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Score
          </div>
        </div>
        <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-3">
          <div className="text-lg font-black text-rose-200">
            {playerEntry.errors}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Errors
          </div>
        </div>
        <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-3">
          <div className="text-lg font-black text-slate-100">
            {formatDuration(playerEntry.duration_secs)}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Time
          </div>
        </div>
        <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-3">
          <div className="text-lg font-black text-emerald-200">
            {playerEntry.best_streak}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Streak
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/8 bg-slate-950/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
          {isVisibleOnBoard ? 'Visible In Top Board' : 'Pinned Below Top Board'}
        </span>
      </div>

      {gapMessage && (
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {gapMessage}
        </p>
      )}
    </div>
  );
};

export default LeaderboardPlayerSummary;
