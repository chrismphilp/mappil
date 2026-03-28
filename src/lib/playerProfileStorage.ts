import { ChallengeType, ContinentFilter, Difficulty, GameMode } from '../types/game.types';
import {
  PersonalBestFlag,
  PlayerProfile,
  PlayerSummary,
  RecordRunResult,
  RulesetBest,
  RulesetReference,
  RunRecord,
} from '../types/profile.types';
import { buildRulesetIdentity, buildRulesetKey } from './ruleset';
import {
  getUsernameValidationMessage,
  sanitizeStoredUsername,
  validateUsername,
} from './usernameModeration';

export const PLAYER_ID_STORAGE_KEY = 'mappil_player_id';
export const USERNAME_STORAGE_KEY = 'mappil_username';
export const PROFILE_STORAGE_KEY = 'mappil_profile_v1';
const CURRENT_PROFILE_VERSION = 1 as const;
const RECENT_RUN_LIMIT = 15;
const RECORDED_RUN_ID_LIMIT = 100;

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
  const safeUsername = sanitizeStoredUsername(username);

  return {
    version: CURRENT_PROFILE_VERSION,
    playerId,
    username: safeUsername,
    createdAt: now,
    updatedAt: now,
    summary: createSummary(),
    personalBests: {},
    recentRuns: [],
    recordedRunIds: [],
  };
}

function persistProfile(profile: PlayerProfile): PlayerProfile {
  const safeUsername = sanitizeStoredUsername(profile.username);
  const nextProfile =
    safeUsername === profile.username
      ? profile
      : {
          ...profile,
          username: safeUsername,
        };

  localStorage.setItem(PLAYER_ID_STORAGE_KEY, nextProfile.playerId);
  localStorage.setItem(USERNAME_STORAGE_KEY, nextProfile.username);
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  return nextProfile;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDifficulty(value: unknown): value is Difficulty {
  return Object.values(Difficulty).includes(value as Difficulty);
}

function isContinentFilter(value: unknown): value is ContinentFilter {
  return Object.values(ContinentFilter).includes(value as ContinentFilter);
}

function isGameMode(value: unknown): value is GameMode {
  return Object.values(GameMode).includes(value as GameMode);
}

function isChallengeSource(value: unknown): value is RulesetReference['challengeSource'] {
  return value === 'free_play' || value === 'daily' || value === 'friend';
}

function isPersonalBestFlag(value: unknown): value is PersonalBestFlag {
  return [
    'highest_score',
    'fewest_errors',
    'best_streak',
    'fastest_clean_clear',
    'highest_bonus_score',
  ].includes(value as PersonalBestFlag);
}

function sanitizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sanitizeNonNegativeInteger(value: unknown, fallback = 0): number {
  return Math.max(0, Math.round(sanitizeNumber(value, fallback)));
}

function sanitizeTimestamp(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function sanitizeRulesetReference(value: unknown): RulesetReference | null {
  if (!isObject(value)) {
    return null;
  }

  const difficulty = isDifficulty(value.difficulty) ? value.difficulty : null;
  const continent = isContinentFilter(value.continent) ? value.continent : null;
  const gameMode = isGameMode(value.gameMode) ? value.gameMode : null;
  const challengeSource = isChallengeSource(value.challengeSource)
    ? value.challengeSource
    : null;

  if (!difficulty || !continent || !gameMode || !challengeSource) {
    return null;
  }

  const challengeId =
    typeof value.challengeId === 'string' && value.challengeId.length > 0
      ? value.challengeId
      : undefined;
  const modifier =
    typeof value.modifier === 'string' && value.modifier.length > 0
      ? value.modifier
      : undefined;

  const key =
    typeof value.key === 'string' && value.key.length > 0
      ? value.key
      : buildRulesetKey({
          difficulty,
          continent,
          gameMode,
          challengeSource,
          challengeId,
          modifier,
        });

  return {
    key,
    difficulty,
    continent,
    gameMode,
    challengeSource,
    challengeId,
    modifier,
  };
}

function sanitizeRulesetBest(value: unknown): RulesetBest | null {
  if (!isObject(value)) {
    return null;
  }

  const ruleset = sanitizeRulesetReference(value.ruleset);
  if (!ruleset) {
    return null;
  }

  return {
    ruleset,
    highestScore: sanitizeNonNegativeInteger(value.highestScore),
    fewestErrors: sanitizeNonNegativeInteger(value.fewestErrors),
    bestStreak: sanitizeNonNegativeInteger(value.bestStreak),
    fastestCleanClearSecs:
      value.fastestCleanClearSecs === null
        ? null
        : sanitizeNonNegativeInteger(value.fastestCleanClearSecs),
    highestBonusScore: sanitizeNonNegativeInteger(value.highestBonusScore),
    totalRuns: Math.max(1, sanitizeNonNegativeInteger(value.totalRuns, 1)),
    updatedAt: sanitizeTimestamp(value.updatedAt, new Date().toISOString()),
  };
}

function sanitizeRunRecord(value: unknown): RunRecord | null {
  if (!isObject(value)) {
    return null;
  }

  const id = typeof value.id === 'string' && value.id.length > 0 ? value.id : null;
  const ruleset = sanitizeRulesetReference(value.ruleset);

  if (!id || !ruleset) {
    return null;
  }

  return {
    id,
    completedAt: sanitizeTimestamp(value.completedAt, new Date().toISOString()),
    ruleset,
    score: sanitizeNonNegativeInteger(value.score),
    baseScore: sanitizeNonNegativeInteger(value.baseScore),
    bonusScore: sanitizeNonNegativeInteger(value.bonusScore),
    maxPossibleScore: sanitizeNonNegativeInteger(value.maxPossibleScore),
    errors: sanitizeNonNegativeInteger(value.errors),
    bestStreak: sanitizeNonNegativeInteger(value.bestStreak),
    durationSecs: sanitizeNonNegativeInteger(value.durationSecs),
    totalRegions: sanitizeNonNegativeInteger(value.totalRegions),
    correctAnswers: sanitizeNonNegativeInteger(value.correctAnswers),
    skippedCount: sanitizeNonNegativeInteger(value.skippedCount),
    firstTryCount: sanitizeNonNegativeInteger(value.firstTryCount),
    secondTryCount: sanitizeNonNegativeInteger(value.secondTryCount),
    thirdTrySaveCount: sanitizeNonNegativeInteger(value.thirdTrySaveCount),
    personalBestFlags: Array.isArray(value.personalBestFlags)
      ? value.personalBestFlags.filter(isPersonalBestFlag)
      : [],
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

function sanitizeSummary(
  value: unknown,
  favoriteRulesetKey: string | null,
  lastPlayedAt: string | null,
): PlayerSummary {
  if (!isObject(value)) {
    return {
      ...createSummary(),
      favoriteRulesetKey,
      lastPlayedAt,
    };
  }

  return {
    totalRuns: sanitizeNonNegativeInteger(value.totalRuns),
    totalRegionsFound: sanitizeNonNegativeInteger(value.totalRegionsFound),
    cumulativePlayTimeSecs: sanitizeNonNegativeInteger(value.cumulativePlayTimeSecs),
    bestOverallStreak: sanitizeNonNegativeInteger(value.bestOverallStreak),
    totalPerfectRuns: sanitizeNonNegativeInteger(value.totalPerfectRuns),
    totalFlawlessRuns: sanitizeNonNegativeInteger(value.totalFlawlessRuns),
    favoriteRulesetKey,
    lastPlayedAt:
      typeof value.lastPlayedAt === 'string' && value.lastPlayedAt.length > 0
        ? value.lastPlayedAt
        : lastPlayedAt,
  };
}

function buildInitialRulesetBest(run: RunRecord): RulesetBest {
  return {
    ruleset: run.ruleset,
    highestScore: run.score,
    fewestErrors: run.errors,
    bestStreak: run.bestStreak,
    fastestCleanClearSecs: run.errors === 0 && run.skippedCount === 0 ? run.durationSecs : null,
    highestBonusScore: run.bonusScore,
    totalRuns: 1,
    updatedAt: run.completedAt,
  };
}

function sanitizeProfile(
  value: unknown,
  fallbackPlayerId: string,
  fallbackUsername: string,
): PlayerProfile {
  const now = new Date().toISOString();
  const profile = isObject(value) ? value : {};
  const playerId =
    typeof profile.playerId === 'string' && profile.playerId.length > 0
      ? profile.playerId
      : fallbackPlayerId;
  const username = sanitizeStoredUsername(
    typeof profile.username === 'string' ? profile.username : fallbackUsername,
  );

  const recentRuns = Array.isArray(profile.recentRuns)
    ? profile.recentRuns
        .map(sanitizeRunRecord)
        .filter((run): run is RunRecord => run !== null)
    : [];
  const uniqueRecentRuns = Array.from(
    new Map(recentRuns.map((run) => [run.id, run])).values(),
  ).slice(0, RECENT_RUN_LIMIT);

  const personalBests = isObject(profile.personalBests)
    ? Object.fromEntries(
        Object.values(profile.personalBests)
          .map(sanitizeRulesetBest)
          .filter((best): best is RulesetBest => best !== null)
          .map((best) => [best.ruleset.key, best]),
      )
    : {};

  const favoriteRulesetKey = getFavoriteRulesetKey(personalBests);
  const recordedRunIds = Array.from(
    new Set([
      ...(Array.isArray(profile.recordedRunIds)
        ? profile.recordedRunIds.filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          )
        : []),
      ...uniqueRecentRuns.map((run) => run.id),
    ]),
  ).slice(0, RECORDED_RUN_ID_LIMIT);
  const lastPlayedAt = uniqueRecentRuns[0]?.completedAt ?? null;

  return {
    version: CURRENT_PROFILE_VERSION,
    playerId,
    username,
    createdAt: sanitizeTimestamp(profile.createdAt, now),
    updatedAt: sanitizeTimestamp(profile.updatedAt, now),
    summary: sanitizeSummary(profile.summary, favoriteRulesetKey, lastPlayedAt),
    personalBests,
    recentRuns: uniqueRecentRuns,
    recordedRunIds,
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
  const username = sanitizeStoredUsername(localStorage.getItem(USERNAME_STORAGE_KEY) ?? '');
  const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return persistProfile(createDefaultProfile(playerId, username));
  }

  try {
    return persistProfile(sanitizeProfile(JSON.parse(storedProfile), playerId, username));
  } catch {
    return persistProfile(createDefaultProfile(playerId, username));
  }
}

export function updatePlayerUsername(username: string): PlayerProfile {
  const validation = validateUsername(username, { allowEmpty: true });

  if (!validation.ok) {
    throw new Error(getUsernameValidationMessage(validation.code));
  }

  const profile = loadPlayerProfile();
  const nextProfile: PlayerProfile = {
    ...profile,
    username: validation.normalized,
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

function buildRunRecord(input: RecordCompletedRunInput, completedAt: string): RunRecord {
  const ruleset = getRulesetReference(input);

  return {
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
}

function buildUpdatedRulesetBest(
  existingBest: RulesetBest | null,
  run: RunRecord,
): { best: RulesetBest; newBests: PersonalBestFlag[]; tiedBests: PersonalBestFlag[] } {
  const newBests: PersonalBestFlag[] = [];
  const tiedBests: PersonalBestFlag[] = [];

  if (!existingBest) {
    return {
      best: buildInitialRulesetBest(run),
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
  const run = buildRunRecord(input, completedAt);
  const ruleset = run.ruleset;

  if (profile.recordedRunIds.includes(run.id)) {
    const existingRun = profile.recentRuns.find((recentRun) => recentRun.id === run.id) ?? run;
    const personalBest = profile.personalBests[ruleset.key] ?? buildInitialRulesetBest(existingRun);

    return {
      profile,
      run: existingRun,
      previousBest: profile.personalBests[ruleset.key] ?? null,
      personalBest,
      newBests: [],
      tiedBests: [],
    };
  }

  const previousBest = profile.personalBests[ruleset.key] ?? null;
  const { best, newBests, tiedBests } = buildUpdatedRulesetBest(previousBest, run);
  run.personalBestFlags = newBests;

  const nextPersonalBests = {
    ...profile.personalBests,
    [ruleset.key]: best,
  };

  const nextProfile: PlayerProfile = {
    ...profile,
    version: CURRENT_PROFILE_VERSION,
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
    recordedRunIds: [run.id, ...profile.recordedRunIds.filter((recordedRunId) => recordedRunId !== run.id)].slice(
      0,
      RECORDED_RUN_ID_LIMIT,
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
