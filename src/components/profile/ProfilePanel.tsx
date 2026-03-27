'use client';

import { FC, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { buildFreePlayHref, describeRuleset } from '../../lib/ruleset';
import type {
  PersonalBestFlag,
  RulesetBest,
  RulesetReference,
  RunRecord,
} from '../../types/profile.types';
import { formatDuration } from '../leaderboard/leaderboardUtils';

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

const PERSONAL_BEST_TAGS: Record<PersonalBestFlag, string> = {
  highest_score: 'Best Score',
  fewest_errors: 'Fewest Errors',
  best_streak: 'Best Streak',
  fastest_clean_clear: 'Fastest Clean',
  highest_bonus_score: 'Best Bonus',
};

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Never';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getRulesetHref(ruleset: RulesetReference): string | null {
  if (ruleset.challengeSource === 'free_play') {
    return buildFreePlayHref(ruleset.difficulty, ruleset.continent, ruleset.gameMode);
  }

  if (ruleset.challengeSource === 'friend' && ruleset.challengeId) {
    return `/play?challenge=${encodeURIComponent(ruleset.challengeId)}`;
  }

  return null;
}

function getRulesetCtaLabel(ruleset: RulesetReference): string | null {
  if (ruleset.challengeSource === 'free_play') {
    return 'Replay';
  }

  if (ruleset.challengeSource === 'friend' && ruleset.challengeId) {
    return 'Rematch';
  }

  return null;
}

function RulesetBestCard({ best }: { best: RulesetBest }) {
  const replayHref = getRulesetHref(best.ruleset);
  const replayLabel = getRulesetCtaLabel(best.ruleset);

  return (
    <div className="rounded-[1.75rem] border border-white/8 bg-slate-900/65 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/75">
            {best.ruleset.challengeSource.replace('_', ' ')}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {describeRuleset(best.ruleset)}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {best.totalRuns} run{best.totalRuns === 1 ? '' : 's'} recorded
          </p>
        </div>
        {replayHref && replayLabel && (
          <a
            href={replayHref}
            className="shrink-0 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-500/20"
          >
            {replayLabel}
          </a>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Best Score</div>
          <div className="mt-1 text-xl font-bold text-emerald-300">{best.highestScore}</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Fewest Errors</div>
          <div className="mt-1 text-xl font-bold text-amber-300">{best.fewestErrors}</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Best Streak</div>
          <div className="mt-1 text-xl font-bold text-cyan-300">{best.bestStreak}</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Fastest Clean</div>
          <div className="mt-1 text-xl font-bold text-fuchsia-300">
            {best.fastestCleanClearSecs === null ? '—' : formatDuration(best.fastestCleanClearSecs)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/6 pt-3 text-sm text-slate-400">
        <span>Best bonus {best.highestBonusScore}</span>
        <span>Updated {formatTimestamp(best.updatedAt)}</span>
      </div>
    </div>
  );
}

function RecentRunCard({ run }: { run: RunRecord }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
            {formatTimestamp(run.completedAt)}
          </div>
          <div className="mt-2 text-base font-semibold text-white">
            {describeRuleset(run.ruleset)}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/75">Score</div>
          <div className="text-lg font-bold text-emerald-300">{run.score}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Errors</div>
          <div className="mt-1 font-semibold text-white">{run.errors}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Streak</div>
          <div className="mt-1 font-semibold text-white">{run.bestStreak}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Time</div>
          <div className="mt-1 font-semibold text-white">{formatDuration(run.durationSecs)}</div>
        </div>
      </div>

      {run.personalBestFlags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {run.personalBestFlags.map((flag) => (
            <span
              key={`${run.id}-${flag}`}
              className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100"
            >
              {PERSONAL_BEST_TAGS[flag]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const ProfilePanel: FC<ProfilePanelProps> = ({ open, onClose }) => {
  const { isMobile } = useIsMobileViewport();
  const { profile, refreshProfile, clearProfile } = usePlayerProfile();

  useEffect(() => {
    if (!open) {
      return;
    }

    refreshProfile();
  }, [open, refreshProfile]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  const rulesetBests = useMemo(
    () =>
      Object.values(profile.personalBests).sort(
        (a, b) =>
          b.totalRuns - a.totalRuns ||
          Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
          a.ruleset.key.localeCompare(b.ruleset.key),
      ),
    [profile.personalBests],
  );
  const favoriteRuleset = useMemo(() => {
    if (!profile.summary.favoriteRulesetKey) {
      return null;
    }

    return profile.personalBests[profile.summary.favoriteRulesetKey] ?? null;
  }, [profile.personalBests, profile.summary.favoriteRulesetKey]);
  const latestHighlight = useMemo(
    () => profile.recentRuns.find((run) => run.personalBestFlags.length > 0) ?? null,
    [profile.recentRuns],
  );
  const hasMultipleRulesetBests = rulesetBests.length > 1;
  const hasMultipleRecentRuns = profile.recentRuns.length > 1;

  const handleClearProgress = () => {
    if (!window.confirm('Clear your local progress and personal bests on this device?')) {
      return;
    }

    clearProfile();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <div
            className="fixed inset-0 z-[61] flex items-end justify-center p-0 sm:items-center sm:p-6"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.div
              initial={isMobile ? { y: '100%' } : { y: 28, opacity: 0, scale: 0.98 }}
              animate={isMobile ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { y: 28, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="relative flex h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] shadow-[0_30px_120px_rgba(2,6,23,0.55)] sm:h-[min(88dvh,54rem)] sm:rounded-[2rem]"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-300 transition-colors hover:text-white"
                aria-label="Close profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-14 sm:px-6 sm:pb-6 sm:pt-6">
                <div className="mx-auto flex w-full flex-col gap-5">
                  <section className="rounded-[2rem] border border-cyan-400/14 bg-slate-900/55 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/70">
                          Local Progress Profile
                        </div>
                        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                          {profile.username || 'Player Profile'}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                          Review recent runs, ruleset bests, and the strongest board to replay next.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <div className="rounded-2xl border border-white/6 bg-slate-950/45 p-3">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Runs</div>
                          <div className="mt-1 text-2xl font-bold text-white">{profile.summary.totalRuns}</div>
                        </div>
                        <div className="rounded-2xl border border-white/6 bg-slate-950/45 p-3">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Best Streak</div>
                          <div className="mt-1 text-2xl font-bold text-amber-300">{profile.summary.bestOverallStreak}</div>
                        </div>
                        <div className="rounded-2xl border border-white/6 bg-slate-950/45 p-3">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Perfect Runs</div>
                          <div className="mt-1 text-2xl font-bold text-cyan-300">{profile.summary.totalPerfectRuns}</div>
                        </div>
                        <div className="rounded-2xl border border-white/6 bg-slate-950/45 p-3">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Regions Found</div>
                          <div className="mt-1 text-2xl font-bold text-emerald-300">{profile.summary.totalRegionsFound}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-4">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Last Played</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {formatTimestamp(profile.summary.lastPlayedAt)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-4">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Play Time</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {formatDuration(profile.summary.cumulativePlayTimeSecs)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-4">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Tracked Rulesets</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {rulesetBests.length}
                        </div>
                      </div>
                    </div>
                  </section>

                  {profile.summary.totalRuns === 0 ? (
                    <section className="rounded-[2rem] border border-white/8 bg-slate-900/55 px-6 py-10 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/16 bg-cyan-500/10 text-cyan-100">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20" />
                          <path d="M2 12h20" />
                        </svg>
                      </div>
                      <h3 className="mt-5 text-2xl font-bold text-white">No progress yet</h3>
                      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                        Finish a run and this panel will start tracking your recent boards, ruleset bests, and replay targets.
                      </p>
                    </section>
                  ) : (
                    <>
                      <section className="grid gap-4 lg:grid-cols-[1.06fr,0.94fr]">
                        <div className="rounded-[1.75rem] border border-white/8 bg-slate-900/55 p-5">
                          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                            Favorite Ruleset
                          </div>
                          {favoriteRuleset ? (
                            <>
                              <h3 className="mt-3 text-xl font-semibold text-white">
                                {describeRuleset(favoriteRuleset.ruleset)}
                              </h3>
                              <p className="mt-2 text-sm text-slate-400">
                                {favoriteRuleset.totalRuns} runs • best {favoriteRuleset.highestScore} pts • fewest errors {favoriteRuleset.fewestErrors}
                              </p>
                              {getRulesetHref(favoriteRuleset.ruleset) && getRulesetCtaLabel(favoriteRuleset.ruleset) && (
                                <a
                                  href={getRulesetHref(favoriteRuleset.ruleset)!}
                                  className="mt-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                >
                                  {getRulesetCtaLabel(favoriteRuleset.ruleset)}
                                </a>
                              )}
                            </>
                          ) : (
                            <p className="mt-3 text-sm text-slate-400">
                              Your favorite ruleset will appear after you build up a few runs.
                            </p>
                          )}
                        </div>

                        <div className="rounded-[1.75rem] border border-white/8 bg-slate-900/55 p-5">
                          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                            Latest Highlight
                          </div>
                          {latestHighlight ? (
                            <>
                              <h3 className="mt-3 text-xl font-semibold text-white">
                                {describeRuleset(latestHighlight.ruleset)}
                              </h3>
                              <p className="mt-2 text-sm text-slate-400">
                                {latestHighlight.score} pts • {latestHighlight.errors} errors • {formatDuration(latestHighlight.durationSecs)}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {latestHighlight.personalBestFlags.map((flag) => (
                                  <span
                                    key={`highlight-${flag}`}
                                    className="rounded-full border border-emerald-400/18 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100"
                                  >
                                    {PERSONAL_BEST_TAGS[flag]}
                                  </span>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="mt-3 text-sm text-slate-400">
                              New-best moments will show up here once you start beating your own marks.
                            </p>
                          )}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                              Ruleset Bests
                            </div>
                            <h3 className="mt-2 text-2xl font-bold text-white">
                              The boards you are improving on
                            </h3>
                          </div>
                        </div>
                        <div className={hasMultipleRulesetBests ? 'grid gap-4 md:grid-cols-2' : 'grid max-w-2xl gap-4'}>
                          {rulesetBests.map((best) => (
                            <RulesetBestCard key={best.ruleset.key} best={best} />
                          ))}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                            Recent Runs
                          </div>
                          <h3 className="mt-2 text-2xl font-bold text-white">
                            Latest boards on this device
                          </h3>
                        </div>
                        <div className={hasMultipleRecentRuns ? 'grid gap-4 md:grid-cols-2' : 'grid max-w-2xl gap-4'}>
                          {profile.recentRuns.map((run) => (
                            <RecentRunCard key={run.id} run={run} />
                          ))}
                        </div>
                      </section>
                    </>
                  )}

                  <section className="rounded-[1.75rem] border border-white/8 bg-slate-900/55 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                          Local Storage
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-white">
                          Reset this device’s progress
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                          This clears local runs and personal bests while keeping the same local player id.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearProgress}
                        className="rounded-full border border-rose-400/20 bg-rose-500/12 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose-200 transition-colors hover:bg-rose-500/18"
                      >
                        Clear Progress
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfilePanel;
