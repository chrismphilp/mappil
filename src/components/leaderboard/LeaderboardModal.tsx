import { FC, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { fetchLeaderboard, LeaderboardResult, ScoreEntry } from '../../lib/leaderboard';
import { ChallengeType, ContinentFilter, Difficulty, GameMode } from '../../types/game.types';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeId?: string;
  challengeType?: ChallengeType;
  isDailyChallenge?: boolean;
}

function formatDuration(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getTitle(challengeType?: ChallengeType, isDailyChallenge?: boolean): string {
  if (isDailyChallenge || challengeType === ChallengeType.DAILY) {
    return 'Daily Leaderboard';
  }

  if (challengeType === ChallengeType.FRIEND) {
    return 'Challenge Leaderboard';
  }

  return 'Leaderboard';
}

function EntryRow({ entry, index }: { entry: ScoreEntry; index: number }) {
  const rankClasses =
    index === 0
      ? 'bg-amber-500/20 text-amber-400'
      : index === 1
        ? 'bg-slate-300/20 text-slate-300'
        : index === 2
          ? 'bg-orange-500/20 text-orange-400'
          : 'bg-slate-700/50 text-slate-500';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        entry.isCurrentPlayer
          ? 'bg-cyan-500/10 border-cyan-400/25'
          : 'bg-slate-800/50 border-white/5'
      }`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankClasses}`}>
        {entry.rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {entry.username}
          {entry.isCurrentPlayer && (
            <span className="ml-2 text-[10px] uppercase tracking-[0.22em] text-cyan-300">You</span>
          )}
        </div>
        <div className="text-xs text-slate-500">
          {formatDuration(entry.duration_secs)} • {entry.best_streak} streak
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-emerald-400">{entry.score}</div>
        <div className="text-xs text-slate-500">{entry.errors} err</div>
      </div>
    </div>
  );
}

const LeaderboardModal: FC<LeaderboardModalProps> = ({
  open,
  onClose,
  difficulty,
  continent,
  gameMode,
  challengeId,
  challengeType,
  isDailyChallenge,
}) => {
  const { profile } = usePlayerProfile();
  const [result, setResult] = useState<LeaderboardResult>({
    entries: [],
    playerEntry: null,
    totalPlayers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>(difficulty);
  const [filterContinent, setFilterContinent] = useState<string>(continent);
  const [filterGameMode, setFilterGameMode] = useState<string>(gameMode);

  useEffect(() => {
    if (!open) return;
    setFilterDifficulty(difficulty);
    setFilterContinent(continent);
    setFilterGameMode(gameMode);
  }, [open, difficulty, continent, gameMode]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    fetchLeaderboard(
      filterDifficulty || undefined,
      filterContinent === ContinentFilter.WORLD ? undefined : filterContinent || undefined,
      filterGameMode || undefined,
      challengeId,
      profile.playerId,
    )
      .then((nextResult) => {
        if (!cancelled) {
          setResult(nextResult);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            entries: [],
            playerEntry: null,
            totalPlayers: 0,
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, filterDifficulty, filterContinent, filterGameMode, challengeId, profile.playerId]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full sm:w-[90vw] h-[90dvh] sm:h-auto sm:max-w-[480px] sm:max-h-[80vh] bg-slate-900/95 backdrop-blur-2xl sm:border border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden mt-auto sm:mt-0"
            style={{ paddingBottom: 'max(0px, var(--sab))' }}
          >
            <div className="p-4 sm:p-6 pb-4 shrink-0 border-b border-white/5 sm:border-0 z-10 bg-slate-900/50 sm:bg-transparent">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {getTitle(challengeType, isDailyChallenge)}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Best attempt per player is shown.</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {result.playerEntry && (
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 px-3 py-2 mb-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 font-semibold mb-1">
                    Your Best
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">#{result.playerEntry.rank} overall</div>
                      <div className="text-xs text-slate-400">
                        {formatDuration(result.playerEntry.duration_secs)} • {result.playerEntry.best_streak} streak
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-300 font-bold">{result.playerEntry.score}</div>
                      <div className="text-xs text-slate-500">{result.playerEntry.errors} err</div>
                    </div>
                  </div>
                </div>
              )}

              {!isDailyChallenge && challengeType !== ChallengeType.FRIEND && (
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterGameMode}
                    onChange={(event) => setFilterGameMode(event.target.value)}
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value={GameMode.QUICK}>Quick Play</option>
                    <option value={GameMode.FULL}>Full Game</option>
                  </select>
                  <select
                    value={filterDifficulty}
                    onChange={(event) => setFilterDifficulty(event.target.value)}
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value={Difficulty.EASY}>Easy</option>
                    <option value={Difficulty.MEDIUM}>Medium</option>
                    <option value={Difficulty.HARD}>Hard</option>
                  </select>
                  <select
                    value={filterContinent}
                    onChange={(event) => setFilterContinent(event.target.value)}
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value={ContinentFilter.WORLD}>World</option>
                    <option value={ContinentFilter.AFRICA}>Africa</option>
                    <option value={ContinentFilter.ASIA}>Asia</option>
                    <option value={ContinentFilter.EUROPE}>Europe</option>
                    <option value={ContinentFilter.NORTH_AMERICA}>N. America</option>
                    <option value={ContinentFilter.SOUTH_AMERICA}>S. America</option>
                    <option value={ContinentFilter.OCEANIA}>Oceania</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {loading && (
                <p className="text-slate-500 text-sm text-center py-8">Loading leaderboard...</p>
              )}

              {!loading && result.entries.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">No scores yet. Be the first.</p>
              )}

              {!loading && result.entries.length > 0 && (
                <div className="space-y-2">
                  {result.entries.map((entry, index) => (
                    <EntryRow key={entry.id} entry={entry} index={index} />
                  ))}
                </div>
              )}

              {!loading &&
                result.playerEntry &&
                result.playerEntry.rank &&
                result.playerEntry.rank > result.entries.length && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold mb-2">
                      Your Position
                    </div>
                    <EntryRow entry={result.playerEntry} index={result.playerEntry.rank - 1} />
                  </div>
                )}

              {!loading && result.totalPlayers > 0 && (
                <p className="text-center text-xs text-slate-500 mt-4">
                  {result.totalPlayers} players ranked on this board.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaderboardModal;
