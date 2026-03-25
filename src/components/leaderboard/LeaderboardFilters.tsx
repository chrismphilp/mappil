import {
  ContinentFilter,
  Difficulty,
  GameMode,
} from '../../types/game.types';
import {
  FREE_PLAY_FILTERS,
  LeaderboardTone,
} from './leaderboardUtils';

interface LeaderboardFiltersProps {
  tone: LeaderboardTone;
  contextLabel: string;
  filterGameMode: string;
  filterDifficulty: string;
  filterContinent: string;
  onChangeGameMode: (value: string) => void;
  onChangeDifficulty: (value: string) => void;
  onChangeContinent: (value: string) => void;
}

function getToneClasses(tone: LeaderboardTone) {
  if (tone === 'daily') {
    return {
      active:
        'border-amber-400/35 bg-gradient-to-r from-amber-400/20 to-orange-400/16 text-amber-100 shadow-[0_10px_30px_rgba(251,191,36,0.14)]',
      context:
        'border-amber-400/30 bg-amber-400/12 text-amber-100',
    };
  }

  if (tone === 'friend') {
    return {
      active:
        'border-fuchsia-400/35 bg-gradient-to-r from-fuchsia-500/18 to-violet-400/16 text-fuchsia-100 shadow-[0_10px_30px_rgba(192,132,252,0.14)]',
      context:
        'border-fuchsia-400/30 bg-fuchsia-400/12 text-fuchsia-100',
    };
  }

  return {
    active:
      'border-cyan-400/35 bg-gradient-to-r from-cyan-400/18 to-emerald-400/16 text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.14)]',
    context:
      'border-cyan-400/30 bg-cyan-400/12 text-cyan-100',
  };
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  activeClassName,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  activeClassName: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === value;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? activeClassName
                  : 'border-white/8 bg-slate-800/75 text-slate-300 hover:border-white/14 hover:bg-slate-800'
              }`}
            >
              {option === ContinentFilter.NORTH_AMERICA ? 'N. America' : option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const LeaderboardFilters = ({
  tone,
  contextLabel,
  filterGameMode,
  filterDifficulty,
  filterContinent,
  onChangeGameMode,
  onChangeDifficulty,
  onChangeContinent,
}: LeaderboardFiltersProps) => {
  const toneClasses = getToneClasses(tone);

  if (tone !== 'free') {
    return (
      <div
        className={`inline-flex max-w-full items-center rounded-full border px-4 py-2 text-xs font-semibold ${toneClasses.context}`}
      >
        <span className="truncate">{contextLabel}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/8 bg-slate-950/35 p-4">
      <FilterGroup
        label="Mode"
        options={FREE_PLAY_FILTERS.gameModes}
        value={filterGameMode}
        onChange={onChangeGameMode}
        activeClassName={toneClasses.active}
      />
      <FilterGroup
        label="Difficulty"
        options={FREE_PLAY_FILTERS.difficulties}
        value={filterDifficulty}
        onChange={onChangeDifficulty}
        activeClassName={toneClasses.active}
      />
      <FilterGroup
        label="Region"
        options={FREE_PLAY_FILTERS.continents}
        value={filterContinent}
        onChange={onChangeContinent}
        activeClassName={toneClasses.active}
      />
    </div>
  );
};

export default LeaderboardFilters;
