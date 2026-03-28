import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createFriendChallenge } from '../../lib/friendChallenge';
import { submitScore } from '../../lib/leaderboard';
import {
  buildRulesetIdentity,
  buildFreePlayHref,
  buildRulesetKey,
  describeRuleset,
} from '../../lib/ruleset';
import { getRunGrade, getScoreBreakdownLines } from '../../lib/scoring';
import { shareChallengeLink } from '../../lib/share';
import {
  getUsernameValidationMessage,
  validateUsername,
} from '../../lib/usernameModeration';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import {
  ChallengeType,
  ContinentFilter,
  Difficulty,
  GameMode,
  ScoreBreakdown,
  ShareState,
  SubmitState,
} from '../../types/game.types';
import type { PersonalBestFlag, RecordRunResult, RulesetBest } from '../../types/profile.types';

interface GameCompleteModalProps {
  open: boolean;
  runId: string;
  score: number;
  baseScore: number;
  bonusScore: number;
  maxPossibleScore: number;
  scoreBreakdown: ScoreBreakdown;
  errors: number;
  bestStreak: number;
  totalRegions: number;
  correctAnswers: number;
  skippedCount: number;
  firstTryCount: number;
  secondTryCount: number;
  thirdTrySaveCount: number;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  durationSecs: number;
  challengeId?: string;
  challengeType?: ChallengeType;
  seed?: string;
  isDailyChallenge?: boolean;
  onOpenProfile: () => void;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onStartFreePlay: (difficulty: Difficulty, continent: ContinentFilter, gameMode: GameMode) => void;
}

interface ActionConfig {
  label: string;
  helper: string;
  href?: string;
  onClick?: () => void;
}

interface ShareConfig {
  title: string;
  text: string;
  url: string;
  ctaLabel: string;
}

interface ComparisonRow {
  label: string;
  previous: string;
  current: string;
  delta: string;
  tone: 'better' | 'worse' | 'tied';
}

function getLeaderboardActionLabel(args: {
  challengeType?: ChallengeType;
  isDailyChallenge?: boolean;
}): string {
  if (args.isDailyChallenge) {
    return 'View Daily Leaderboard';
  }

  if (args.challengeType === ChallengeType.FRIEND) {
    return 'View Challenge Board';
  }

  return 'View Leaderboard';
}

const PERSONAL_BEST_LABELS: Record<
  PersonalBestFlag,
  { fresh: string; tied: string }
> = {
  highest_score: {
    fresh: 'New Best Score',
    tied: 'Best Score Tied',
  },
  fewest_errors: {
    fresh: 'Fewest Errors',
    tied: 'Fewest Errors Tied',
  },
  best_streak: {
    fresh: 'New Best Streak',
    tied: 'Best Streak Tied',
  },
  fastest_clean_clear: {
    fresh: 'Fastest Clean Clear',
    tied: 'Fastest Clean Clear Tied',
  },
  highest_bonus_score: {
    fresh: 'Biggest Bonus Haul',
    tied: 'Bonus Haul Tied',
  },
};

function formatDuration(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function buildComparisonRows(args: {
  previousBest: RulesetBest;
  score: number;
  errors: number;
  bestStreak: number;
  durationSecs: number;
  skippedCount: number;
}): ComparisonRow[] {
  const rows: ComparisonRow[] = [];

  rows.push({
    label: 'Score',
    previous: `${args.previousBest.highestScore} pts`,
    current: `${args.score} pts`,
    delta:
      args.score === args.previousBest.highestScore
        ? 'Matched'
        : `${args.score > args.previousBest.highestScore ? '+' : ''}${args.score - args.previousBest.highestScore}`,
    tone:
      args.score > args.previousBest.highestScore
        ? 'better'
        : args.score < args.previousBest.highestScore
          ? 'worse'
          : 'tied',
  });

  rows.push({
    label: 'Errors',
    previous: `${args.previousBest.fewestErrors}`,
    current: `${args.errors}`,
    delta:
      args.errors === args.previousBest.fewestErrors
        ? 'Matched'
        : `${args.errors < args.previousBest.fewestErrors ? '-' : '+'}${Math.abs(args.errors - args.previousBest.fewestErrors)}`,
    tone:
      args.errors < args.previousBest.fewestErrors
        ? 'better'
        : args.errors > args.previousBest.fewestErrors
          ? 'worse'
          : 'tied',
  });

  rows.push({
    label: 'Best Streak',
    previous: `${args.previousBest.bestStreak}`,
    current: `${args.bestStreak}`,
    delta:
      args.bestStreak === args.previousBest.bestStreak
        ? 'Matched'
        : `${args.bestStreak > args.previousBest.bestStreak ? '+' : ''}${args.bestStreak - args.previousBest.bestStreak}`,
    tone:
      args.bestStreak > args.previousBest.bestStreak
        ? 'better'
        : args.bestStreak < args.previousBest.bestStreak
          ? 'worse'
          : 'tied',
  });

  if (args.previousBest.fastestCleanClearSecs !== null || (args.errors === 0 && args.skippedCount === 0)) {
    const currentCleanTime = args.errors === 0 && args.skippedCount === 0 ? args.durationSecs : null;
    const previousCleanTime = args.previousBest.fastestCleanClearSecs;

    let delta = 'No clean clear';
    let tone: ComparisonRow['tone'] = 'worse';

    if (currentCleanTime !== null && previousCleanTime === null) {
      delta = 'First clean clear';
      tone = 'better';
    } else if (currentCleanTime === null && previousCleanTime !== null) {
      delta = 'Need a clean clear';
      tone = 'worse';
    } else if (currentCleanTime !== null && previousCleanTime !== null) {
      if (currentCleanTime === previousCleanTime) {
        delta = 'Matched';
        tone = 'tied';
      } else if (currentCleanTime < previousCleanTime) {
        delta = `${previousCleanTime - currentCleanTime}s faster`;
        tone = 'better';
      } else {
        delta = `${currentCleanTime - previousCleanTime}s slower`;
        tone = 'worse';
      }
    } else {
      delta = 'No clean clear';
      tone = 'tied';
    }

    rows.push({
      label: 'Clean Clear',
      previous: previousCleanTime === null ? 'None' : formatDuration(previousCleanTime),
      current: currentCleanTime === null ? 'None' : formatDuration(currentCleanTime),
      delta,
      tone,
    });
  }

  return rows;
}

function getNextDifficulty(current: Difficulty): Difficulty | null {
  if (current === Difficulty.EASY) return Difficulty.MEDIUM;
  if (current === Difficulty.MEDIUM) return Difficulty.HARD;
  return null;
}

function renderActionButton(action: ActionConfig, className: string) {
  if (action.href) {
    return (
      <a href={action.href} className={`${className} block`}>
        {action.label}
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

function buildPrimaryAction(args: {
  challengeType?: ChallengeType;
  isDailyChallenge?: boolean;
  score: number;
  previousBestScore?: number;
  errors: number;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  onPlayAgain: () => void;
  onStartFreePlay: (difficulty: Difficulty, continent: ContinentFilter, gameMode: GameMode) => void;
}): ActionConfig {
  if (args.challengeType === ChallengeType.FRIEND) {
    return {
      label: 'Rematch This Challenge',
      helper: 'Same seed, same rules, one cleaner run.',
      onClick: args.onPlayAgain,
    };
  }

  if (args.isDailyChallenge) {
    return {
      label: 'Run Today Again',
      helper: 'Every retry is still measured against the same daily seed.',
      onClick: args.onPlayAgain,
    };
  }

  if (typeof args.previousBestScore === 'number' && args.score < args.previousBestScore) {
    return {
      label: 'Beat Your Best',
      helper: `Your local best is ${args.previousBestScore} points on this ruleset.`,
      onClick: args.onPlayAgain,
    };
  }

  if (args.errors === 0 && args.difficulty !== Difficulty.HARD) {
    const harder = getNextDifficulty(args.difficulty);
    if (harder) {
      return {
        label: `Try ${harder}`,
        helper: 'You cleared this cleanly. Push the map density up one notch.',
        onClick: () => args.onStartFreePlay(harder, args.continent, args.gameMode),
      };
    }
  }

  if (args.errors <= 1 && args.gameMode === GameMode.QUICK) {
    return {
      label: 'Go Full Game',
      helper: 'Stretch this run across the full country set.',
      onClick: () => args.onStartFreePlay(args.difficulty, args.continent, GameMode.FULL),
    };
  }

  return {
    label: 'Run It Back',
    helper: 'Same ruleset, faster hands.',
    onClick: args.onPlayAgain,
  };
}

function buildNextSuggestion(args: {
  challengeType?: ChallengeType;
  isDailyChallenge?: boolean;
  errors: number;
  gameMode: GameMode;
  difficulty: Difficulty;
  continent: ContinentFilter;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onStartFreePlay: (difficulty: Difficulty, continent: ContinentFilter, gameMode: GameMode) => void;
}): ActionConfig | null {
  if (args.isDailyChallenge) {
    return {
      label: 'View Daily Leaderboard',
      helper: 'Check where your best daily run currently lands.',
      onClick: args.onViewLeaderboard,
    };
  }

  if (args.challengeType === ChallengeType.FRIEND) {
    return {
      label: 'View Challenge Board',
      helper: 'Compare best attempts for everyone who has played this seed.',
      onClick: args.onViewLeaderboard,
    };
  }

  if (args.errors > 0) {
    return {
      label: 'Aim For Fewer Errors',
      helper: 'This exact ruleset still has easy points left in the misses.',
      onClick: args.onPlayAgain,
    };
  }

  if (args.gameMode === GameMode.QUICK) {
    return {
      label: 'Play Today’s Challenge',
      helper: 'Take the same sharp form into the seeded daily board.',
      href: '/play?daily=true',
    };
  }

  const harder = getNextDifficulty(args.difficulty);
  if (harder) {
    return {
      label: `Push To ${harder}`,
      helper: 'You have enough control here to make the map denser.',
      onClick: () => args.onStartFreePlay(harder, args.continent, args.gameMode),
    };
  }

  return null;
}

function buildResultShareConfig(args: {
  score: number;
  errors: number;
  bestStreak: number;
  durationSecs: number;
  rulesetLabel: string;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeId?: string;
  challengeType?: ChallengeType;
  isDailyChallenge?: boolean;
}): ShareConfig {
  const origin = window.location.origin;

  if (args.isDailyChallenge) {
    return {
      title: 'Mappil Daily Geography Challenge',
      text: `I scored ${args.score} on today’s Mappil daily geography challenge with ${args.errors} errors, a ${args.bestStreak} streak, and a ${formatDuration(args.durationSecs)} finish. Can you beat it?`,
      url: `${origin}/play?daily=true`,
      ctaLabel: 'Share Today’s Board',
    };
  }

  if (args.challengeType === ChallengeType.FRIEND && args.challengeId) {
    return {
      title: 'Mappil Friend Challenge Result',
      text: `I just put up ${args.score} points on this Mappil friend challenge with ${args.errors} errors and a ${args.bestStreak} streak. Same seed, same rules. Can you top it?`,
      url: `${origin}/play?challenge=${encodeURIComponent(args.challengeId)}`,
      ctaLabel: 'Share Result & Rematch',
    };
  }

  return {
    title: 'Mappil Map Game Result',
    text: `I scored ${args.score} points on ${args.rulesetLabel} in Mappil with ${args.errors} errors and a ${args.bestStreak} streak. Can you beat this map run?`,
    url: `${origin}${buildFreePlayHref(args.difficulty, args.continent, args.gameMode)}`,
    ctaLabel: 'Share This Result',
  };
}

function getChallengeShareLabel(args: {
  challengeType?: ChallengeType;
  shareState: ShareState;
}): string {
  if (args.shareState === ShareState.SHARING) {
    return 'Generating...';
  }

  if (args.shareState === ShareState.SHARED) {
    return 'Link Copied!';
  }

  return args.challengeType === ChallengeType.FRIEND
    ? 'Share Rematch Link'
    : 'Challenge A Friend';
}

const GameCompleteModal: FC<GameCompleteModalProps> = ({
  open,
  runId,
  score,
  baseScore,
  bonusScore,
  maxPossibleScore,
  scoreBreakdown,
  errors,
  bestStreak,
  totalRegions,
  correctAnswers,
  skippedCount,
  firstTryCount,
  secondTryCount,
  thirdTrySaveCount,
  difficulty,
  continent,
  gameMode,
  durationSecs,
  challengeId,
  challengeType,
  seed,
  isDailyChallenge,
  onOpenProfile,
  onPlayAgain,
  onViewLeaderboard,
  onStartFreePlay,
}) => {
  const { profile, recordRun, updateUsername } = usePlayerProfile();
  const [username, setUsername] = useState(profile.username);
  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.IDLE);
  const [resultShareState, setResultShareState] = useState<ShareState>(ShareState.IDLE);
  const [challengeShareState, setChallengeShareState] = useState<ShareState>(ShareState.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [runResult, setRunResult] = useState<RecordRunResult | null>(null);
  const recordedRunIdRef = useRef<string | null>(null);
  const { isCoarsePointer } = useIsMobileViewport();

  const ruleset = useMemo(
    () =>
      buildRulesetIdentity({
        difficulty,
        continent,
        gameMode,
        challengeId,
        challengeType,
        isDailyChallenge,
      }),
    [difficulty, continent, gameMode, challengeId, challengeType, isDailyChallenge],
  );
  const rulesetLabel = useMemo(() => describeRuleset(ruleset), [ruleset]);
  const grade = useMemo(
    () =>
      getRunGrade({
        score,
        maxPossibleScore,
        errors,
        skippedCount,
      }),
    [score, maxPossibleScore, errors, skippedCount],
  );
  const scoreLines = useMemo(() => getScoreBreakdownLines(scoreBreakdown), [scoreBreakdown]);
  const publicUsernameValidation = useMemo(() => validateUsername(username), [username]);
  const usernameHelper = useMemo(() => {
    if (username.trim().length === 0) {
      return {
        tone: 'neutral' as const,
        text: 'Set a username to submit scores or share a friend challenge.',
      };
    }

    if (!publicUsernameValidation.ok) {
      return {
        tone: 'error' as const,
        text: getUsernameValidationMessage(publicUsernameValidation.code),
      };
    }

    return {
      tone: 'success' as const,
      text: 'Ready for leaderboard submit and challenge sharing.',
    };
  }, [publicUsernameValidation, username]);

  useEffect(() => {
    if (!open) return;

    setSubmitState(SubmitState.IDLE);
    setResultShareState(ShareState.IDLE);
    setChallengeShareState(ShareState.IDLE);
    setErrorMsg('');
    setUsername(profile.username);

    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: isCoarsePointer ? 70 : 145,
        spread: grade.letter === 'S' ? 115 : 90,
        origin: { y: 0.48 },
        colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'],
      });
    });
  }, [open, profile.username, isCoarsePointer, grade.letter]);

  useEffect(() => {
    if (!open || recordedRunIdRef.current === runId) return;

    recordedRunIdRef.current = runId;
    const result = recordRun({
      runId,
      difficulty,
      continent,
      gameMode,
      challengeId,
      challengeType,
      isDailyChallenge,
      score,
      baseScore,
      bonusScore,
      maxPossibleScore,
      errors,
      bestStreak,
      durationSecs,
      totalRegions,
      correctAnswers,
      skippedCount,
      firstTryCount,
      secondTryCount,
      thirdTrySaveCount,
    });

    setRunResult(result);
  }, [
    open,
    runId,
    recordRun,
    difficulty,
    continent,
    gameMode,
    challengeId,
    challengeType,
    isDailyChallenge,
    score,
    baseScore,
    bonusScore,
    maxPossibleScore,
    errors,
    bestStreak,
    durationSecs,
    totalRegions,
    correctAnswers,
    skippedCount,
    firstTryCount,
    secondTryCount,
    thirdTrySaveCount,
  ]);

  const primaryAction = useMemo(
    () =>
      buildPrimaryAction({
        challengeType,
        isDailyChallenge,
        score,
        previousBestScore: runResult?.previousBest?.highestScore,
        errors,
        difficulty,
        continent,
        gameMode,
        onPlayAgain,
        onStartFreePlay,
      }),
    [
      challengeType,
      isDailyChallenge,
      score,
      runResult,
      errors,
      difficulty,
      continent,
      gameMode,
      onPlayAgain,
      onStartFreePlay,
    ],
  );

  const nextSuggestion = useMemo(() => {
    const suggestion = buildNextSuggestion({
      challengeType,
      isDailyChallenge,
      errors,
      gameMode,
      difficulty,
      continent,
      onPlayAgain,
      onViewLeaderboard,
      onStartFreePlay,
    });

    if (suggestion && suggestion.label === primaryAction.label) {
      return null;
    }

    return suggestion;
  }, [
    challengeType,
    isDailyChallenge,
    errors,
    gameMode,
    difficulty,
    continent,
    onPlayAgain,
    onViewLeaderboard,
    onStartFreePlay,
    primaryAction.label,
  ]);

  const leaderboardActionLabel = useMemo(
    () => getLeaderboardActionLabel({ challengeType, isDailyChallenge }),
    [challengeType, isDailyChallenge],
  );

  const shouldShowSeparateLeaderboardButton =
    submitState === SubmitState.SUBMITTED &&
    (!nextSuggestion || nextSuggestion.label !== leaderboardActionLabel);

  const personalBestBadges = useMemo(() => {
    if (!runResult) return [];

    const fresh = runResult.newBests.map((flag) => ({
      key: `new-${flag}`,
      text: PERSONAL_BEST_LABELS[flag].fresh,
      tone: 'emerald',
    }));
    const tied = runResult.tiedBests
      .filter((flag) => !runResult.newBests.includes(flag))
      .map((flag) => ({
        key: `tied-${flag}`,
        text: PERSONAL_BEST_LABELS[flag].tied,
        tone: 'amber',
      }));

    return [...fresh, ...tied];
  }, [runResult]);
  const comparisonRows = useMemo(() => {
    if (!runResult?.previousBest) {
      return [];
    }

    return buildComparisonRows({
      previousBest: runResult.previousBest,
      score,
      errors,
      bestStreak,
      durationSecs,
      skippedCount,
    });
  }, [bestStreak, durationSecs, errors, runResult, score, skippedCount]);
  const profileActionLabel = personalBestBadges.length > 0 ? 'View Updated Profile' : 'View Progress Profile';

  const resultShareConfig = useMemo(
    () =>
      buildResultShareConfig({
        score,
        errors,
        bestStreak,
        durationSecs,
        rulesetLabel,
        difficulty,
        continent,
        gameMode,
        challengeId,
        challengeType,
        isDailyChallenge,
      }),
    [
      score,
      errors,
      bestStreak,
      durationSecs,
      rulesetLabel,
      difficulty,
      continent,
      gameMode,
      challengeId,
      challengeType,
      isDailyChallenge,
    ],
  );

  const handleSubmit = async () => {
    if (!publicUsernameValidation.ok) {
      return;
    }

    const nextProfile = updateUsername(publicUsernameValidation.normalized);
    setUsername(nextProfile.username);
    setSubmitState(SubmitState.SUBMITTING);
    setErrorMsg('');

    try {
      await submitScore({
        player_id: profile.playerId,
        username: publicUsernameValidation.normalized,
        score,
        errors,
        best_streak: bestStreak,
        total_regions: totalRegions,
        difficulty,
        continent,
        game_mode: gameMode,
        duration_secs: durationSecs,
        challenge_id: challengeId,
        challenge_source: ruleset.challengeSource,
        ruleset_key: runResult?.run.ruleset.key ?? buildRulesetKey(ruleset),
        seed,
        is_daily_challenge: isDailyChallenge,
      });
      setSubmitState(SubmitState.SUBMITTED);
    } catch (error: any) {
      setSubmitState(SubmitState.ERROR);
      setErrorMsg(error.message ?? 'Failed to submit score.');
    }
  };

  const handleShareChallenge = async () => {
    if (!publicUsernameValidation.ok) {
      return;
    }

    const nextProfile = updateUsername(publicUsernameValidation.normalized);
    setUsername(nextProfile.username);
    setChallengeShareState(ShareState.SHARING);
    setErrorMsg('');

    try {
      let shareId = challengeId;

      if (challengeType !== ChallengeType.FRIEND) {
        shareId = await createFriendChallenge(
          publicUsernameValidation.normalized,
          difficulty,
          continent,
          gameMode,
        );
      }

      if (!shareId) throw new Error('Failed to create a challenge link.');

      const url = `${window.location.origin}/play?challenge=${encodeURIComponent(shareId)}`;
      const title = challengeType === ChallengeType.FRIEND ? 'Mappil Rematch Challenge' : 'Mappil Friend Challenge';
      const text =
        challengeType === ChallengeType.FRIEND
          ? `I just improved my Mappil friend challenge run to ${score} points with ${errors} errors and a ${bestStreak} streak. Same seed, same rules. Can you beat it?`
          : `I just scored ${score} points on ${rulesetLabel} in Mappil with ${errors} errors and a ${bestStreak} streak. I turned it into a same-seed challenge. Can you beat it?`;

      const success = await shareChallengeLink(title, text, url);
      setChallengeShareState(success ? ShareState.SHARED : ShareState.IDLE);
    } catch (error: any) {
      setChallengeShareState(ShareState.ERROR);
      setErrorMsg(error.message ?? 'Failed to create challenge link.');
    }
  };

  const handleShareResult = async () => {
    setResultShareState(ShareState.SHARING);
    setErrorMsg('');

    try {
      const success = await shareChallengeLink(
        resultShareConfig.title,
        resultShareConfig.text,
        resultShareConfig.url,
      );

      setResultShareState(success ? ShareState.SHARED : ShareState.IDLE);
    } catch (error: any) {
      setResultShareState(ShareState.ERROR);
      setErrorMsg(error.message ?? 'Failed to share this result.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.75, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 210, damping: 22 }}
            className="bg-slate-900/92 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 w-[92vw] max-w-lg lg:max-w-4xl max-h-[92dvh] overflow-y-auto text-left shadow-2xl"
          >
            <div className="rounded-[2rem] border border-cyan-400/18 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5 sm:p-6 mb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {isDailyChallenge && (
                      <div className="inline-flex px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        Daily Challenge Complete
                      </div>
                    )}
                    {challengeType === ChallengeType.FRIEND && (
                      <div className="inline-flex px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        Friend Challenge Complete
                      </div>
                    )}
                    {!isDailyChallenge && challengeType !== ChallengeType.FRIEND && (
                      <div className="inline-flex px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        Free Play Complete
                      </div>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs sm:text-sm uppercase tracking-[0.24em] mb-2">
                    {rulesetLabel}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Run Complete</h2>
                  <p className="text-slate-300 text-sm mt-2">
                    {correctAnswers} correct, {skippedCount} skipped, {formatDuration(durationSecs)} on the clock.
                  </p>
                </div>
                <div className="shrink-0 rounded-3xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-center min-w-[5.5rem]">
                  <div className="text-3xl font-black text-cyan-300 leading-none">{grade.letter}</div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/80 mt-1">{grade.label}</div>
                </div>
              </div>

              <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Final Score</div>
                  <div className="mt-2 text-5xl sm:text-6xl font-black tracking-tight text-white leading-none">
                    {score}
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                    {bonusScore > 0
                      ? `${bonusScore} bonus points helped shape this run.`
                      : 'This run was mostly built on base points.'}{' '}
                    {errors === 0
                      ? 'No errors on the board.'
                      : `${errors} errors still left room to improve.`}
                  </p>
                  {personalBestBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {personalBestBadges.map((badge) => (
                        <span
                          key={badge.key}
                          className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-widest border ${
                            badge.tone === 'emerald'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 lg:mt-0">
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Time</div>
                    <div className="mt-2 text-2xl font-bold text-white">{formatDuration(durationSecs)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Errors</div>
                    <div className="mt-2 text-2xl font-bold text-rose-300">{errors}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Best Streak</div>
                    <div className="mt-2 text-2xl font-bold text-amber-300">{bestStreak}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Bonus</div>
                    <div className="mt-2 text-2xl font-bold text-cyan-300">{bonusScore}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 mb-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              {comparisonRows.length > 0 ? (
                <div className="rounded-2xl bg-slate-800/45 border border-white/5 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                      Compared To Your Best
                    </h3>
                    <span className="text-xs text-slate-500">Same ruleset</span>
                  </div>
                  <div className="space-y-3">
                    {comparisonRows.map((row) => (
                      <div key={row.label} className="rounded-xl border border-white/6 bg-slate-950/25 px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white">{row.label}</div>
                            <div className="text-xs text-slate-500 mt-1">Best: {row.previous}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base font-bold text-white">{row.current}</div>
                            <div
                              className={`text-xs font-semibold mt-1 ${
                                row.tone === 'better'
                                  ? 'text-emerald-300'
                                  : row.tone === 'worse'
                                    ? 'text-rose-300'
                                    : 'text-cyan-300'
                              }`}
                            >
                              {row.delta}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-800/45 border border-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    First Local Benchmark
                  </div>
                  <div className="mt-2 text-white font-semibold">
                    This is the first saved run for {rulesetLabel} on this device.
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Future attempts will compare score, errors, streak, and clean-clear time against this mark.
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-slate-800/45 border border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                    Score Breakdown
                  </h3>
                  <span className="text-xs text-slate-500">{baseScore} base + {bonusScore} bonus</span>
                </div>
                <div className="space-y-2">
                  {scoreLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 bg-slate-950/20 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="text-slate-200">{line.label}</span>
                        {line.count > 0 && line.id !== 'noSkipFinish' && line.id !== 'flawlessFinish' && (
                          <span className="text-slate-500 text-xs ml-2">x{line.count}</span>
                        )}
                      </div>
                      <span className="font-semibold text-cyan-300 shrink-0">+{line.points}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-sm">
                  <span className="text-slate-400">Max possible on this ruleset</span>
                  <span className="text-white font-semibold">{maxPossibleScore}</span>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400 font-semibold mb-3">
                Recommended Next Step
              </div>
              <div className={`grid gap-4 ${nextSuggestion ? 'lg:grid-cols-2' : ''}`}>
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500/12 to-cyan-500/12 border border-emerald-500/20 p-4">
                  <div className="text-white font-semibold text-lg">{primaryAction.label}</div>
                  <div className="text-sm text-slate-300 mt-1">{primaryAction.helper}</div>
                </div>

                {nextSuggestion && (
                  <div className="rounded-2xl bg-slate-800/45 border border-white/5 p-4">
                    <div className="text-white font-semibold">{nextSuggestion.label}</div>
                    <div className="text-sm text-slate-300 mt-1">{nextSuggestion.helper}</div>
                  </div>
                )}
              </div>
            </div>

            {submitState !== SubmitState.SUBMITTED && (
              <form
                className="mb-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit();
                }}
              >
                <label className="text-xs text-slate-400 uppercase tracking-[0.24em] block mb-2">
                  Leaderboard Username
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter username"
                    maxLength={20}
                    className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    type="submit"
                    disabled={submitState === SubmitState.SUBMITTING || !publicUsernameValidation.ok}
                    className="shrink-0 px-4 py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
                  >
                    {submitState === SubmitState.SUBMITTING ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
                <p
                  className={`mt-2 text-xs ${
                    usernameHelper.tone === 'error'
                      ? 'text-rose-300'
                      : usernameHelper.tone === 'success'
                        ? 'text-emerald-300'
                        : 'text-slate-500'
                  }`}
                >
                  {usernameHelper.text}
                </p>
              </form>
            )}

            {errorMsg && (
              <p className="text-red-400 text-sm mb-4">{errorMsg}</p>
            )}

            {submitState === SubmitState.SUBMITTED && (
              <p className="text-emerald-400 text-sm mb-4">Best attempt submitted to the leaderboard.</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {renderActionButton(
                primaryAction,
                'w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow text-center sm:col-span-2',
              )}

              {nextSuggestion &&
                renderActionButton(
                  nextSuggestion,
                  'w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold transition-colors text-center',
                )}

              {shouldShowSeparateLeaderboardButton && (
                <button
                  type="button"
                  onClick={onViewLeaderboard}
                  className="w-full py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-colors"
                >
                  {leaderboardActionLabel}
                </button>
              )}

              <button
                type="button"
                onClick={onOpenProfile}
                className="w-full py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold transition-colors"
              >
                {profileActionLabel}
              </button>

              <button
                type="button"
                onClick={handleShareResult}
                disabled={resultShareState === ShareState.SHARING}
                className={`w-full py-3 rounded-xl border font-semibold transition-colors ${
                  resultShareState === ShareState.SHARED
                    ? 'bg-cyan-500/18 border-cyan-400/30 text-cyan-200'
                    : 'bg-slate-800/95 border-cyan-400/20 hover:bg-slate-700 text-slate-100'
                }`}
              >
                {resultShareState === ShareState.SHARING
                  ? 'Sharing...'
                  : resultShareState === ShareState.SHARED
                    ? 'Share Copy Ready'
                    : resultShareConfig.ctaLabel}
              </button>

              {!isDailyChallenge && (
                <button
                  type="button"
                  onClick={handleShareChallenge}
                  disabled={challengeShareState === ShareState.SHARING || !publicUsernameValidation.ok}
                  className={`w-full py-3 rounded-xl border font-semibold transition-colors ${
                    challengeShareState === ShareState.SHARED
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-300'
                  } disabled:opacity-50`}
                >
                  {getChallengeShareLabel({
                    challengeType,
                    shareState: challengeShareState,
                  })}
                </button>
              )}

              {(isDailyChallenge || challengeType === ChallengeType.FRIEND) && (
                <a
                  href="/"
                  className="block w-full py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold transition-colors text-center"
                >
                  Back To Free Play
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameCompleteModal;
