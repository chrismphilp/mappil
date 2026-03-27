import { FC, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LeaderboardResult } from '../../lib/leaderboard';
import {
  ChallengeType,
  ContinentFilter,
  Difficulty,
  GameMode,
} from '../../types/game.types';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import LeaderboardFilters from './LeaderboardFilters';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardPlayerSummary from './LeaderboardPlayerSummary';
import LeaderboardPodium from './LeaderboardPodium';
import LeaderboardRow from './LeaderboardRow';
import {
  getLeaderboardBadgeLabel,
  getLeaderboardContextLabel,
  getLeaderboardSubtitle,
  getLeaderboardTitle,
  getLeaderboardTone,
} from './leaderboardUtils';

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

function getToneClasses(tone: 'free' | 'daily' | 'friend') {
  if (tone === 'daily') {
    return {
      shell:
        'bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]',
      rules: 'text-amber-200/90',
      emptyIcon: 'text-amber-200/80',
      emptyBorder: 'border-amber-400/14',
    };
  }

  if (tone === 'friend') {
    return {
      shell:
        'bg-[radial-gradient(circle_at_top,rgba(192,132,252,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]',
      rules: 'text-fuchsia-200/90',
      emptyIcon: 'text-fuchsia-200/80',
      emptyBorder: 'border-fuchsia-400/14',
    };
  }

  return {
    shell:
      'bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]',
    rules: 'text-cyan-200/90',
    emptyIcon: 'text-cyan-200/80',
    emptyBorder: 'border-cyan-400/14',
  };
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`rounded-[1.75rem] border border-white/6 bg-slate-800/55 p-4 ${
              index === 0 ? 'sm:order-2 sm:min-h-[15rem]' : index === 1 ? 'sm:order-1 sm:min-h-[13rem]' : 'sm:order-3 sm:min-h-[12rem]'
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-slate-700/70" />
            <div className="mt-4 h-5 w-2/3 rounded-full bg-slate-700/70" />
            <div className="mt-3 h-10 w-24 rounded-full bg-slate-700/60" />
            <div className="mt-5 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-slate-700/60" />
              <div className="h-6 w-16 rounded-full bg-slate-700/60" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="rounded-[1.5rem] border border-white/6 bg-slate-800/55 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-700/70" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-1/3 rounded-full bg-slate-700/70" />
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-slate-700/60" />
                  <div className="h-6 w-16 rounded-full bg-slate-700/60" />
                  <div className="h-6 w-16 rounded-full bg-slate-700/60" />
                </div>
              </div>
              <div className="h-10 w-12 rounded-full bg-slate-700/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  tone,
  contextLabel,
}: {
  tone: 'free' | 'daily' | 'friend';
  contextLabel: string;
}) {
  const toneClasses = getToneClasses(tone);

  return (
    <div
      className={`rounded-[1.75rem] border ${toneClasses.emptyBorder} bg-slate-900/55 px-6 py-10 text-center`}
    >
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/8 bg-slate-950/40 ${toneClasses.emptyIcon}`}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" />
          <path d="M7 5H5a2 2 0 0 0 0 4h2" />
          <path d="M17 5h2a2 2 0 0 1 0 4h-2" />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-bold text-white">Fresh board</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        No scores have landed on the {contextLabel.toLowerCase()} yet. Be the
        first run on the board.
      </p>
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
    playerGap: null,
    totalPlayers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
    setErrorMessage('');

    void import('../../lib/leaderboard')
      .then(({ fetchLeaderboard }) =>
        fetchLeaderboard(
          filterDifficulty || undefined,
          filterContinent === ContinentFilter.WORLD
            ? undefined
            : filterContinent || undefined,
          filterGameMode || undefined,
          challengeId,
          profile.playerId,
        ),
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
            playerGap: null,
            totalPlayers: 0,
          });
          setErrorMessage('Unable to load leaderboard right now.');
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
  }, [
    open,
    filterDifficulty,
    filterContinent,
    filterGameMode,
    challengeId,
    profile.playerId,
  ]);

  const tone = useMemo(
    () => getLeaderboardTone(challengeType, isDailyChallenge),
    [challengeType, isDailyChallenge],
  );
  const toneClasses = getToneClasses(tone);
  const title = useMemo(
    () => getLeaderboardTitle(challengeType, isDailyChallenge),
    [challengeType, isDailyChallenge],
  );
  const badgeLabel = useMemo(
    () => getLeaderboardBadgeLabel(tone, filterContinent as ContinentFilter),
    [tone, filterContinent],
  );
  const subtitle = useMemo(
    () =>
      getLeaderboardSubtitle({
        tone,
        difficulty: filterDifficulty,
        continent: filterContinent,
        gameMode: filterGameMode,
      }),
    [tone, filterDifficulty, filterContinent, filterGameMode],
  );
  const contextLabel = useMemo(
    () =>
      getLeaderboardContextLabel(
        tone,
        filterDifficulty,
        filterContinent,
        filterGameMode,
      ),
    [tone, filterDifficulty, filterContinent, filterGameMode],
  );

  const podiumEntries = result.entries.slice(0, 3);
  const remainingEntries = result.entries.slice(3);
  const isPlayerVisibleOnBoard = !!result.playerEntry &&
    result.entries.some((entry) => entry.id === result.playerEntry?.id);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 28 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 28 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`relative flex h-[92dvh] w-full flex-col overflow-y-auto rounded-t-[2rem] border border-white/10 px-4 pt-4 shadow-2xl sm:h-auto sm:max-h-[88vh] sm:max-w-[720px] sm:rounded-[2rem] sm:px-6 sm:pt-6 ${toneClasses.shell}`}
            style={{ paddingBottom: 'max(1rem, var(--sab))' }}
          >
            <div className="shrink-0 space-y-4 border-b border-white/6 pb-4">
              <LeaderboardHeader
                tone={tone}
                title={title}
                badgeLabel={badgeLabel}
                subtitle={subtitle}
                totalPlayers={result.totalPlayers}
                onClose={onClose}
              />

              {result.playerEntry && (
                <LeaderboardPlayerSummary
                  tone={tone}
                  playerEntry={result.playerEntry}
                  playerGap={result.playerGap}
                  totalPlayers={result.totalPlayers}
                  isVisibleOnBoard={isPlayerVisibleOnBoard}
                />
              )}

              <LeaderboardFilters
                tone={tone}
                contextLabel={contextLabel}
                filterGameMode={filterGameMode}
                filterDifficulty={filterDifficulty}
                filterContinent={filterContinent}
                onChangeGameMode={setFilterGameMode}
                onChangeDifficulty={setFilterDifficulty}
                onChangeContinent={setFilterContinent}
              />
            </div>

            <div className="pb-2 pt-5">
              {loading && <LeaderboardSkeleton />}

              {!loading && errorMessage && (
                <div className="rounded-[1.75rem] border border-amber-400/14 bg-amber-400/8 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-amber-100">
                    {errorMessage}
                  </p>
                </div>
              )}

              {!loading && !errorMessage && result.entries.length === 0 && (
                <EmptyState tone={tone} contextLabel={contextLabel} />
              )}

              {!loading && !errorMessage && result.entries.length > 0 && (
                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <LeaderboardPodium entries={podiumEntries} tone={tone} />
                  </motion.div>

                  {remainingEntries.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: 0.04 }}
                      className="space-y-3"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Chasing Pack
                      </div>
                      {remainingEntries.map((entry) => (
                        <LeaderboardRow
                          key={entry.id}
                          entry={entry}
                          tone={tone}
                        />
                      ))}
                    </motion.div>
                  )}

                  {result.playerEntry &&
                    (result.playerEntry.rank ?? 0) > result.entries.length && (
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: 0.08 }}
                        className="space-y-3 pt-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-white/8" />
                          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Your Position
                          </div>
                          <div className="h-px flex-1 bg-white/8" />
                        </div>
                        <LeaderboardRow
                          entry={result.playerEntry}
                          tone={tone}
                          pinned
                        />
                      </motion.div>
                    )}
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
