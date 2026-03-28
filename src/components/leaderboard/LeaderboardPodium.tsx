import { getScoreEntryDisplayName, ScoreEntry } from '../../lib/leaderboard';
import {
  formatDuration,
  LeaderboardTone,
} from './leaderboardUtils';

interface LeaderboardPodiumProps {
  entries: ScoreEntry[];
  tone: LeaderboardTone;
}

function getToneClasses(tone: LeaderboardTone) {
  if (tone === 'daily') {
    return {
      accent: 'text-amber-200',
      glow: 'shadow-[0_22px_60px_rgba(251,191,36,0.14)]',
      current: 'border-amber-400/35',
    };
  }

  if (tone === 'friend') {
    return {
      accent: 'text-fuchsia-200',
      glow: 'shadow-[0_22px_60px_rgba(192,132,252,0.14)]',
      current: 'border-fuchsia-400/35',
    };
  }

  return {
    accent: 'text-cyan-200',
    glow: 'shadow-[0_22px_60px_rgba(34,211,238,0.14)]',
    current: 'border-cyan-400/35',
  };
}

function getPodiumMetal(rank: number) {
  if (rank === 1) {
    return {
      ring: 'border-amber-300/35 bg-amber-300/14 text-amber-100',
      score: 'text-amber-200',
      shell:
        'border-amber-300/18 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_46%),linear-gradient(180deg,rgba(251,191,36,0.10),rgba(15,23,42,0.84))]',
      height: 'sm:min-h-[15rem]',
      order: 'sm:order-2',
    };
  }

  if (rank === 2) {
    return {
      ring: 'border-slate-200/24 bg-slate-200/10 text-slate-100',
      score: 'text-slate-100',
      shell:
        'border-slate-200/12 bg-[radial-gradient(circle_at_top,rgba(226,232,240,0.16),transparent_46%),linear-gradient(180deg,rgba(226,232,240,0.06),rgba(15,23,42,0.82))]',
      height: 'sm:min-h-[13rem]',
      order: 'sm:order-1',
    };
  }

  return {
    ring: 'border-orange-300/24 bg-orange-300/10 text-orange-100',
    score: 'text-orange-200',
    shell:
      'border-orange-300/12 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.16),transparent_46%),linear-gradient(180deg,rgba(251,146,60,0.06),rgba(15,23,42,0.82))]',
    height: 'sm:min-h-[12rem]',
    order: 'sm:order-3',
  };
}

function PodiumCard({
  entry,
  tone,
}: {
  entry: ScoreEntry;
  tone: LeaderboardTone;
}) {
  const metal = getPodiumMetal(entry.rank ?? 0);
  const toneClasses = getToneClasses(tone);
  const displayName = getScoreEntryDisplayName(entry);

  return (
    <div
      className={`rounded-[1.75rem] border p-4 ${metal.shell} ${metal.height} ${metal.order} ${
        entry.isCurrentPlayer ? toneClasses.current : ''
      } ${toneClasses.glow}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black ${metal.ring}`}
        >
          {entry.rank}
        </div>
        {entry.isCurrentPlayer && (
          <span
            className={`rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${toneClasses.accent}`}
          >
            You
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="truncate text-lg font-bold text-white">{displayName}</div>
        <div className={`mt-2 text-4xl font-black leading-none ${metal.score}`}>
          {entry.score}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">
          Points
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/8 bg-slate-950/35 px-2.5 py-1 text-[11px] font-medium text-slate-200">
          {formatDuration(entry.duration_secs)}
        </span>
        <span className="rounded-full border border-white/8 bg-slate-950/35 px-2.5 py-1 text-[11px] font-medium text-slate-200">
          {entry.best_streak} streak
        </span>
        <span className="rounded-full border border-white/8 bg-slate-950/35 px-2.5 py-1 text-[11px] font-medium text-slate-200">
          {entry.errors} err
        </span>
      </div>
    </div>
  );
}

const LeaderboardPodium = ({
  entries,
  tone,
}: LeaderboardPodiumProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        Podium
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        {entries.map((entry) => (
          <PodiumCard key={entry.id} entry={entry} tone={tone} />
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPodium;
