import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LeaderboardGap, ScoreEntry } from './leaderboard';
import { getPlayerGapMessage } from '../components/leaderboard/leaderboardUtils';

function createEntry(overrides: Partial<ScoreEntry> = {}): ScoreEntry {
  return {
    id: 'score-1',
    created_at: '2026-03-28T10:00:00.000Z',
    player_id: null,
    username: 'MapPlayer',
    display_username: 'MapPlayer',
    username_redacted: false,
    score: 1000,
    errors: 0,
    best_streak: 8,
    total_regions: 20,
    duration_secs: 42,
    challenge_id: null,
    challenge_source: 'free_play',
    is_daily_challenge: false,
    rank: 1,
    isCurrentPlayer: false,
    ...overrides,
  };
}

describe('leaderboard display names', () => {
  it('uses the display-safe username in gap messages', () => {
    const gap: LeaderboardGap = {
      aboveEntry: createEntry({
        username: 'f_u_c_k',
        display_username: 'Player',
        username_redacted: true,
      }),
      scoreDelta: 1,
      errorsDelta: 0,
      durationDelta: 0,
      streakDelta: 0,
    };

    assert.equal(getPlayerGapMessage(gap), '1 more point passes Player.');
  });

  it('never falls back to a raw blocked username when display data is missing', () => {
    const gap: LeaderboardGap = {
      aboveEntry: createEntry({
        username: 'f_u_c_k',
        display_username: null,
        username_redacted: false,
      }),
      scoreDelta: 1,
      errorsDelta: 0,
      durationDelta: 0,
      streakDelta: 0,
    };

    assert.equal(getPlayerGapMessage(gap), '1 more point passes Player.');
  });
});
