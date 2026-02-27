import { FC, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Difficulty, ContinentFilter } from '../types/game.types';
import { fetchLeaderboard, ScoreEntry } from '../lib/leaderboard';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  continent: ContinentFilter;
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const LeaderboardModal: FC<LeaderboardModalProps> = ({
  open,
  onClose,
  difficulty,
  continent,
}) => {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>(difficulty);
  const [filterContinent, setFilterContinent] = useState<string>(continent);

  useEffect(() => {
    if (!open) return;
    setFilterDifficulty(difficulty);
    setFilterContinent(continent);
  }, [open, difficulty, continent]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(
      filterDifficulty || undefined,
      filterContinent === ContinentFilter.WORLD ? undefined : filterContinent || undefined,
    )
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch(() => { if (!cancelled) setEntries([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, filterDifficulty, filterContinent]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-[90vw] max-w-[480px] max-h-[80vh] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Leaderboard</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value={Difficulty.EASY}>Easy</option>
                  <option value={Difficulty.MEDIUM}>Medium</option>
                  <option value={Difficulty.HARD}>Hard</option>
                </select>
                <select
                  value={filterContinent}
                  onChange={(e) => setFilterContinent(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
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
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {loading && (
                <p className="text-slate-500 text-sm text-center py-8">Loading...</p>
              )}

              {!loading && entries.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">No scores yet. Be the first!</p>
              )}

              {!loading && entries.length > 0 && (
                <div className="space-y-2">
                  {entries.map((entry, i) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-300/20 text-slate-300' :
                        i === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-700/50 text-slate-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{entry.username}</div>
                        <div className="text-xs text-slate-500">
                          {formatDuration(entry.duration_secs)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{entry.score}/{entry.total_regions}</div>
                        <div className="text-xs text-slate-500">{entry.errors} err</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaderboardModal;
