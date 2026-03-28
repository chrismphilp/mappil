import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  ChallengeType,
  ContinentFilter,
  Difficulty,
  GameMode,
} from '../types/game.types';
import {
  PLAYER_ID_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  USERNAME_STORAGE_KEY,
  loadPlayerProfile,
  recordCompletedRun,
  updatePlayerUsername,
} from './playerProfileStorage';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

function installStorage() {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
}

function createRunInput(
  overrides: Partial<Parameters<typeof recordCompletedRun>[0]> = {},
): Parameters<typeof recordCompletedRun>[0] {
  return {
    runId: 'run-1',
    difficulty: Difficulty.MEDIUM,
    continent: ContinentFilter.WORLD,
    gameMode: GameMode.QUICK,
    score: 120,
    baseScore: 100,
    bonusScore: 20,
    maxPossibleScore: 200,
    errors: 1,
    bestStreak: 4,
    durationSecs: 48,
    totalRegions: 20,
    correctAnswers: 19,
    skippedCount: 0,
    firstTryCount: 12,
    secondTryCount: 6,
    thirdTrySaveCount: 1,
    ...overrides,
  };
}

function createStoredRuleset(overrides: Record<string, unknown> = {}) {
  return {
    key: 'difficulty=Medium|continent=World|mode=Quick Play|source=free_play',
    difficulty: Difficulty.MEDIUM,
    continent: ContinentFilter.WORLD,
    gameMode: GameMode.QUICK,
    challengeSource: 'free_play',
    ...overrides,
  };
}

function createStoredRun(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    completedAt: '2026-03-20T12:00:00.000Z',
    ruleset: createStoredRuleset(),
    score: 120,
    baseScore: 100,
    bonusScore: 20,
    maxPossibleScore: 200,
    errors: 1,
    bestStreak: 4,
    durationSecs: 48,
    totalRegions: 20,
    correctAnswers: 19,
    skippedCount: 0,
    firstTryCount: 12,
    secondTryCount: 6,
    thirdTrySaveCount: 1,
    personalBestFlags: ['highest_score'],
    ...overrides,
  };
}

beforeEach(() => {
  installStorage();
});

describe('playerProfileStorage', () => {
  it('creates a versioned default profile', () => {
    const profile = loadPlayerProfile();

    assert.equal(profile.version, 1);
    assert.equal(profile.playerId, localStorage.getItem(PLAYER_ID_STORAGE_KEY));
    assert.deepEqual(profile.recordedRunIds, []);
    assert.equal(profile.summary.totalRuns, 0);
  });

  it('migrates legacy stored profiles into the versioned shape', () => {
    localStorage.setItem(PLAYER_ID_STORAGE_KEY, 'legacy-player');
    localStorage.setItem(USERNAME_STORAGE_KEY, 'Legacy Name');
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        playerId: 'legacy-player',
        username: 'Legacy Name',
        createdAt: '2026-03-19T12:00:00.000Z',
        updatedAt: '2026-03-20T12:00:00.000Z',
        summary: {
          totalRuns: 2,
          totalRegionsFound: 30,
          cumulativePlayTimeSecs: 90,
          bestOverallStreak: 6,
          totalPerfectRuns: 1,
          totalFlawlessRuns: 1,
          favoriteRulesetKey: 'stale-key',
          lastPlayedAt: '2026-03-20T12:00:00.000Z',
        },
        personalBests: {
          staleKey: {
            ruleset: createStoredRuleset(),
            highestScore: 120,
            fewestErrors: 1,
            bestStreak: 4,
            fastestCleanClearSecs: null,
            highestBonusScore: 20,
            totalRuns: 2,
            updatedAt: '2026-03-20T12:00:00.000Z',
          },
        },
        recentRuns: [
          createStoredRun('legacy-run'),
          createStoredRun('legacy-run'),
        ],
      }),
    );

    const profile = loadPlayerProfile();

    assert.equal(profile.version, 1);
    assert.equal(profile.playerId, 'legacy-player');
    assert.equal(profile.recentRuns.length, 1);
    assert.deepEqual(profile.recordedRunIds, ['legacy-run']);
    assert.equal(
      profile.summary.favoriteRulesetKey,
      'difficulty=Medium|continent=World|mode=Quick Play|source=free_play',
    );
  });

  it('recovers from corrupted profile storage while preserving the stable player id', () => {
    localStorage.setItem(PLAYER_ID_STORAGE_KEY, 'stable-player');
    localStorage.setItem(PROFILE_STORAGE_KEY, '{broken json');

    const profile = loadPlayerProfile();

    assert.equal(profile.playerId, 'stable-player');
    assert.equal(profile.version, 1);
    assert.equal(profile.summary.totalRuns, 0);
  });

  it('clears legacy stored usernames that now fail moderation', () => {
    localStorage.setItem(PLAYER_ID_STORAGE_KEY, 'legacy-player');
    localStorage.setItem(USERNAME_STORAGE_KEY, 'f_u_c_k');
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        playerId: 'legacy-player',
        username: 'f_u_c_k',
        createdAt: '2026-03-19T12:00:00.000Z',
        updatedAt: '2026-03-20T12:00:00.000Z',
        summary: {},
        personalBests: {},
        recentRuns: [],
        recordedRunIds: [],
      }),
    );

    const profile = loadPlayerProfile();

    assert.equal(profile.username, '');
    assert.equal(localStorage.getItem(USERNAME_STORAGE_KEY), '');
  });

  it('rejects invalid username updates before persisting them', () => {
    assert.throws(
      () => updatePlayerUsername('f_u_c_k'),
      /Choose a different username/,
    );
  });

  it('records runs idempotently by run id', () => {
    recordCompletedRun(createRunInput());
    const duplicate = recordCompletedRun(createRunInput());
    const profile = loadPlayerProfile();

    assert.equal(profile.summary.totalRuns, 1);
    assert.equal(profile.recentRuns.length, 1);
    assert.deepEqual(profile.recordedRunIds, ['run-1']);
    assert.deepEqual(duplicate.newBests, []);
  });

  it('separates personal bests by ruleset identity', () => {
    recordCompletedRun(createRunInput({ runId: 'free-play-run' }));
    recordCompletedRun(
      createRunInput({
        runId: 'daily-run',
        isDailyChallenge: true,
      }),
    );
    recordCompletedRun(
      createRunInput({
        runId: 'friend-run',
        challengeType: ChallengeType.FRIEND,
        challengeId: 'friend-123',
      }),
    );

    const profile = loadPlayerProfile();

    assert.equal(Object.keys(profile.personalBests).length, 3);
  });

  it('marks tied personal bests without creating new best flags', () => {
    recordCompletedRun(
      createRunInput({
        runId: 'first-clean-run',
        errors: 0,
        skippedCount: 0,
        durationSecs: 40,
      }),
    );

    const duplicateBest = recordCompletedRun(
      createRunInput({
        runId: 'second-clean-run',
        errors: 0,
        skippedCount: 0,
        durationSecs: 40,
      }),
    );

    assert.deepEqual(duplicateBest.newBests, []);
    assert.deepEqual(
      duplicateBest.tiedBests.sort(),
      [
        'best_streak',
        'fastest_clean_clear',
        'fewest_errors',
        'highest_bonus_score',
        'highest_score',
      ].sort(),
    );
  });

  it('caps recent run history at the configured limit', () => {
    for (let index = 0; index < 20; index += 1) {
      recordCompletedRun(
        createRunInput({
          runId: `run-${index}`,
          score: 100 + index,
        }),
      );
    }

    const profile = loadPlayerProfile();

    assert.equal(profile.recentRuns.length, 15);
    assert.equal(profile.recentRuns[0]?.id, 'run-19');
    assert.equal(profile.recentRuns.at(-1)?.id, 'run-5');
  });
});
