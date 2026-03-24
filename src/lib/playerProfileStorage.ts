import { ChallengeType, ContinentFilter, Difficulty, GameMode } from '../types/game.types';
import {
  PlayerProfile,
  PlayerSummary,
  RecordRunResult,
  RulesetBest,
  RulesetReference,
  RunRecord,
  PersonalBestFlag,
} from '../types/profile.types';
import { buildRulesetIdentity, buildRulesetKey } from './ruleset';

export const PLAYER_ID_STORAGE_KEY = 'mappil_player_id';
export const USERNAME_STORAGE_KEY = 'mappil_username';
export const PROFILE_STORAGE_KEY = 'mappil_profile_v1';
const RECENT_RUN_LIMIT = 15;

interface RecordCompletedRunInput {
  runId: string;
  username?: string;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeId?: string;
  challengeType?: ChallengeType;
  isDailyChallenge?: boolean;
  score: number;
  baseScore: number;
  bonusScore: number;
  maxPossibleScore: number;
  errors: number;
  bestStreak: number;
  durationSecs: number;
  totalRegions: number;
  correctAnswers: number;
  skippedCount: number;
  firstTryCount: number;
  secondTryCount: number;
  thirdTrySaveCount: number;
}

function generateLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `player_${Math.random().toString(36).slice(2, 10)}`;
}

function createSummary(): PlayerSummary {
  return {
    totalRuns: 0,
    totalRegionsFound: 0,
    cumulativePlayTimeSecs: 0,
    bestOverallStreak: 0,
    totalPerfectRuns: 0,
    totalFlawlessRuns: 0,
    favoriteRulesetKey: null,
    lastPlayedAt: null,
  };
}

function createDefaultProfile(playerId: string, username = ''): PlayerProfile {
  const now = new Date().toISOString();

  return {
    playerId,
    username,
    createdAt: now,
    updatedAt: now,
    summary: createSummary(),
    personalBests: {},
    recentRuns: [],
  };
}

function persistProfile(profile: PlayerProfile): PlayerProfile {
  localStorage.setItem(PLAYER_ID_STORAGE_KEY, profile.playerId);
  localStorage.setItem(USERNAME_STORAGE_KEY, profile.username);
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

function sanitizeProfile(profile: PlayerProfile, fallbackPlayerId: string, fallbackUsername: string): PlayerProfile {
  return {
    ...profile,
    playerId: profile.playerId || fallbackPlayerId,
    username: profile.username ?? fallbackUsername,
    summary: profile.summary ?? createSummary(),
    personalBests: profile.personalBests ?? {},
    recentRuns: profile.recentRuns ?? [],
  };
}

export function getOrCreatePlayerId(): string {
  const stored = localStorage.getItem(PLAYER_ID_STORAGE_KEY);
  if (stored) return stored;

  const playerId = generateLocalId();
  localStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
  return playerId;
}

export function loadPlayerProfile(): PlayerProfile {
  const playerId = getOrCreatePlayerId();
  const username = localStorage.getItem(USERNAME_STORAGE_KEY) ?? '';
  const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return persistProfile(createDefaultProfile(playerId, username));
  }

  try {
    const parsed = JSON.parse(storedProfile) as PlayerProfile;
    return persistProfile(sanitizeProfile(parsed, playerId, username));
  } catch {
    return persistProfile(createDefaultProfile(playerId, username));
  }
}

export function updatePlayerUsername(username: string): PlayerProfile {
  const trimmed = username.trim();
  const profile = loadPlayerProfile();
  const nextProfile: PlayerProfile = {
    ...profile,
    username: trimmed,
    updatedAt: new Date().toISOString(),
  };

  return persistProfile(nextProfile);
}

export function clearLocalProgress(): PlayerProfile {
  const playerId = getOrCreatePlayerId();
  const resetProfile = createDefaultProfile(playerId, '');
  return persistProfile(resetProfile);
}

function getRulesetReference(input: RecordCompletedRunInput): RulesetReference {
  const identity = buildRulesetIdentity({
    difficulty: input.difficulty,
    continent: input.continent,
    gameMode: input.gameMode,
    challengeId: input.challengeId,
    challengeType: input.challengeType,
    isDailyChallenge: input.isDailyChallenge,
  });

  return {
    key: buildRulesetKey(identity),
    difficulty: identity.difficulty,
    continent: identity.continent,
    gameMode: identity.gameMode,
    challengeSource: identity.challengeSource,
    challengeId: identity.challengeId,
    modifier: identity.modifier,
  };
}

function getFavoriteRulesetKey(personalBests: Record<string, RulesetBest>): string | null {
  const entries = Object.values(personalBests);
  if (entries.length === 0) return null;

  return entries
    .slice()
    .sort((a, b) => b.totalRuns - a.totalRuns || a.ruleset.key.localeCompare(b.ruleset.key))[0]
    .ruleset.key;
}

function buildUpdatedRulesetBest(
  existingBest: RulesetBest | null,
  run: RunRecord,
): { best: RulesetBest; newBests: PersonalBestFlag[]; tiedBests: PersonalBestFlag[] } {
  const newBests: PersonalBestFlag[] = [];
  const tiedBests: PersonalBestFlag[] = [];

  if (!existingBest) {
    return {
      best: {
        ruleset: run.ruleset,
        highestScore: run.score,
        fewestErrors: run.errors,
        bestStreak: run.bestStreak,
        fastestCleanClearSecs: run.errors === 0 && run.skippedCount === 0 ? run.durationSecs : null,
        highestBonusScore: run.bonusScore,
        totalRuns: 1,
        updatedAt: run.completedAt,
      },
      newBests: ['highest_score', 'fewest_errors', 'best_streak', 'highest_bonus_score'].concat(
        run.errors === 0 && run.skippedCount === 0 ? ['fastest_clean_clear'] : [],
      ) as PersonalBestFlag[],
      tiedBests,
    };
  }

  let fastestCleanClearSecs = existingBest.fastestCleanClearSecs;

  if (run.score > existingBest.highestScore) {
    newBests.push('highest_score');
  } else if (run.score === existingBest.highestScore) {
    tiedBests.push('highest_score');
  }

  if (run.errors < existingBest.fewestErrors) {
    newBests.push('fewest_errors');
  } else if (run.errors === existingBest.fewestErrors) {
    tiedBests.push('fewest_errors');
  }

  if (run.bestStreak > existingBest.bestStreak) {
    newBests.push('best_streak');
  } else if (run.bestStreak === existingBest.bestStreak) {
    tiedBests.push('best_streak');
  }

  if (run.bonusScore > existingBest.highestBonusScore) {
    newBests.push('highest_bonus_score');
  } else if (run.bonusScore === existingBest.highestBonusScore) {
    tiedBests.push('highest_bonus_score');
  }

  if (run.errors === 0 && run.skippedCount === 0) {
    if (fastestCleanClearSecs === null || run.durationSecs < fastestCleanClearSecs) {
      fastestCleanClearSecs = run.durationSecs;
      newBests.push('fastest_clean_clear');
    } else if (run.durationSecs === fastestCleanClearSecs) {
      tiedBests.push('fastest_clean_clear');
    }
  }

  return {
    best: {
      ruleset: run.ruleset,
      highestScore: Math.max(existingBest.highestScore, run.score),
      fewestErrors: Math.min(existingBest.fewestErrors, run.errors),
      bestStreak: Math.max(existingBest.bestStreak, run.bestStreak),
      fastestCleanClearSecs,
      highestBonusScore: Math.max(existingBest.highestBonusScore, run.bonusScore),
      totalRuns: existingBest.totalRuns + 1,
      updatedAt: run.completedAt,
    },
    newBests,
    tiedBests,
  };
}

export function recordCompletedRun(input: RecordCompletedRunInput): RecordRunResult {
  const profile = input.username ? updatePlayerUsername(input.username) : loadPlayerProfile();
  const completedAt = new Date().toISOString();
  const ruleset = getRulesetReference(input);

  const run: RunRecord = {
    id: input.runId,
    completedAt,
    ruleset,
    score: input.score,
    baseScore: input.baseScore,
    bonusScore: input.bonusScore,
    maxPossibleScore: input.maxPossibleScore,
    errors: input.errors,
    bestStreak: input.bestStreak,
    durationSecs: input.durationSecs,
    totalRegions: input.totalRegions,
    correctAnswers: input.correctAnswers,
    skippedCount: input.skippedCount,
    firstTryCount: input.firstTryCount,
    secondTryCount: input.secondTryCount,
    thirdTrySaveCount: input.thirdTrySaveCount,
    personalBestFlags: [],
  };

  const previousBest = profile.personalBests[ruleset.key] ?? null;
  const { best, newBests, tiedBests } = buildUpdatedRulesetBest(previousBest, run);
  run.personalBestFlags = newBests;

  const nextPersonalBests = {
    ...profile.personalBests,
    [ruleset.key]: best,
  };

  const nextProfile: PlayerProfile = {
    ...profile,
    updatedAt: completedAt,
    summary: {
      totalRuns: profile.summary.totalRuns + 1,
      totalRegionsFound: profile.summary.totalRegionsFound + input.correctAnswers,
      cumulativePlayTimeSecs: profile.summary.cumulativePlayTimeSecs + input.durationSecs,
      bestOverallStreak: Math.max(profile.summary.bestOverallStreak, input.bestStreak),
      totalPerfectRuns:
        profile.summary.totalPerfectRuns + (input.errors === 0 ? 1 : 0),
      totalFlawlessRuns:
        profile.summary.totalFlawlessRuns + (input.errors === 0 && input.skippedCount === 0 ? 1 : 0),
      favoriteRulesetKey: getFavoriteRulesetKey(nextPersonalBests),
      lastPlayedAt: completedAt,
    },
    personalBests: nextPersonalBests,
    recentRuns: [run, ...profile.recentRuns.filter((recentRun) => recentRun.id !== run.id)].slice(
      0,
      RECENT_RUN_LIMIT,
    ),
  };

  persistProfile(nextProfile);

  return {
    profile: nextProfile,
    run,
    previousBest,
    personalBest: best,
    newBests,
    tiedBests,
  };
}
