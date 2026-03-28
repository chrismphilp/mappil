import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { ActionType, ContinentFilter, Difficulty, GameMode, type GameState } from '../../types/game.types';
import { loadGeoJson } from '../../data/maps';
import { buildInitialState, gameStateReducer } from './useGameState';

const ORIGINAL_DATE_NOW = Date.now;
const ORIGINAL_FETCH = globalThis.fetch;
const TEST_GEOJSON = {
  features: [
    {
      properties: {
        continent: ContinentFilter.EUROPE,
        name_long: 'France',
        pop_est: 68_000_000,
      },
    },
    {
      properties: {
        continent: ContinentFilter.EUROPE,
        name_long: 'Spain',
        pop_est: 48_000_000,
      },
    },
    {
      properties: {
        continent: ContinentFilter.EUROPE,
        name_long: 'Germany',
        pop_est: 84_000_000,
      },
    },
  ],
};

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...buildInitialState({
      difficulty: Difficulty.MEDIUM,
      continent: ContinentFilter.WORLD,
      gameMode: GameMode.QUICK,
    }),
    regionToFind: 'France',
    regionsToFind: ['Spain'],
    startTime: 1_000,
    ...overrides,
  };
}

beforeEach(async () => {
  Date.now = () => 5_000;
  globalThis.fetch = async () =>
    ({
      headers: {
        get: () => null,
      },
      body: null,
      text: async () => JSON.stringify(TEST_GEOJSON),
    }) as unknown as Response;
  await loadGeoJson();
});

afterEach(() => {
  Date.now = ORIGINAL_DATE_NOW;
  globalThis.fetch = ORIGINAL_FETCH;
});

describe('gameStateReducer completion sequencing', () => {
  it('holds the completion modal until final correct feedback clears', () => {
    const state = createState({
      regionToFind: 'France',
      regionsToFind: [],
    });

    const completedState = gameStateReducer(state, {
      type: ActionType.SELECT_REGION,
      region: 'France',
    });

    assert.equal(completedState.gameOver, true);
    assert.equal(completedState.completionPhase, 'showing_final_feedback');
    assert.equal(completedState.feedback?.outcome, 'correct');
    assert.equal(completedState.endTime, 5_000);

    const postFeedbackState = gameStateReducer(completedState, {
      type: ActionType.CLEAR_FEEDBACK,
    });

    assert.equal(postFeedbackState.feedback, null);
    assert.equal(postFeedbackState.completionPhase, 'complete');
    assert.equal(postFeedbackState.endTime, 5_000);
  });

  it('marks a final skip as game over before completion becomes ready', () => {
    const state = createState({
      regionToFind: 'France',
      regionsToFind: [],
    });

    const completedState = gameStateReducer(state, {
      type: ActionType.SKIP_REGION,
    });

    assert.equal(completedState.gameOver, true);
    assert.equal(completedState.completionPhase, 'showing_final_feedback');
    assert.equal(completedState.feedback?.outcome, 'skip');
    assert.equal(completedState.endTime, 5_000);
  });

  it('keeps non-final answers in the active phase', () => {
    const state = createState({
      regionToFind: 'France',
      regionsToFind: ['Spain'],
    });

    const nextState = gameStateReducer(state, {
      type: ActionType.SELECT_REGION,
      region: 'France',
    });

    assert.equal(nextState.gameOver, false);
    assert.equal(nextState.completionPhase, 'active');
    assert.equal(nextState.feedback?.outcome, 'correct');
    assert.equal(nextState.regionToFind, 'Spain');
    assert.equal(nextState.endTime, null);
  });

  it('resets completion state for a new run', () => {
    const completedState = createState({
      gameOver: true,
      completionPhase: 'complete',
      feedback: null,
      endTime: 5_000,
    });

    const resetState = gameStateReducer(completedState, {
      type: ActionType.RESET_GAME,
    });

    assert.equal(resetState.gameOver, false);
    assert.equal(resetState.completionPhase, 'active');
    assert.equal(resetState.feedback, null);
    assert.equal(resetState.endTime, null);
  });
});
