import { LeaderboardTone } from './leaderboardUtils';

interface LeaderboardHeaderProps {
  tone: LeaderboardTone;
  title: string;
  badgeLabel: string;
  subtitle: string;
  totalPlayers: number;
  onClose: () => void;
}

function getToneClasses(tone: LeaderboardTone) {
  if (tone === 'daily') {
    return {
      shell:
        'border-amber-400/18 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_42%),linear-gradient(180deg,rgba(251,191,36,0.08),rgba(15,23,42,0.82))]',
      badge:
        'border-amber-400/30 bg-amber-400/12 text-amber-100',
      accent: 'text-amber-200',
      playerCount: 'border-amber-400/22 bg-slate-950/35 text-amber-50',
    };
  }

  if (tone === 'friend') {
    return {
      shell:
        'border-fuchsia-400/18 bg-[radial-gradient(circle_at_top_right,rgba(192,132,252,0.22),transparent_42%),linear-gradient(180deg,rgba(168,85,247,0.08),rgba(15,23,42,0.82))]',
      badge:
        'border-fuchsia-400/30 bg-fuchsia-400/12 text-fuchsia-100',
      accent: 'text-fuchsia-200',
      playerCount: 'border-fuchsia-400/22 bg-slate-950/35 text-fuchsia-50',
    };
  }

  return {
    shell:
      'border-cyan-400/18 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_42%),linear-gradient(180deg,rgba(20,184,166,0.08),rgba(15,23,42,0.82))]',
    badge: 'border-cyan-400/30 bg-cyan-400/12 text-cyan-100',
    accent: 'text-cyan-200',
    playerCount: 'border-cyan-400/22 bg-slate-950/35 text-cyan-50',
  };
}

const LeaderboardHeader = ({
  tone,
  title,
  badgeLabel,
  subtitle,
  totalPlayers,
  onClose,
}: LeaderboardHeaderProps) => {
  const toneClasses = getToneClasses(tone);
  const playerCountLabel =
    totalPlayers > 0 ? `${totalPlayers} ranked` : 'Fresh board';

  return (
    <div
      className={`rounded-[1.75rem] border px-4 py-4 sm:px-5 sm:py-5 ${toneClasses.shell}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${toneClasses.badge}`}
            >
              {badgeLabel}
            </span>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${toneClasses.playerCount}`}
            >
              {playerCountLabel}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className={`mt-2 text-sm leading-relaxed ${toneClasses.accent}`}>
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 rounded-full border border-white/10 bg-slate-950/35 p-2 text-slate-400 transition-colors hover:text-white"
          aria-label="Close leaderboard"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LeaderboardHeader;
