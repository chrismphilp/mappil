import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, Difficulty } from '../types/game.types';
import { getFilteredRegions } from '../data/maps';

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildInitialState(difficulty: Difficulty): GameState {
  const regions = getFilteredRegions(difficulty);
  const first = pickRandom(regions);
  return {
    regionsToFind: regions.filter((r) => r !== first),
    regionToFind: first,
    selectedRegion: undefined,
    regionsFound: [],
    difficulty,
    score: 0,
    errors: 0,
    currentGuessErrors: 0,
    streak: 0,
    bestStreak: 0,
    gameOver: false,
    lastAnswerCorrect: null,
    skippedRegion: null,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_REGION': {
      const { region } = action;
      if (state.gameOver || !state.regionToFind) return state;

      if (region === state.regionToFind) {
        const remaining = state.regionsToFind.filter((r) => r !== region);
        const newStreak = state.currentGuessErrors > 0 ? 1 : state.streak + 1;
        const newBestStreak = Math.max(state.bestStreak, newStreak);

        if (remaining.length === 0) {
          return {
            ...state,
            regionsToFind: [],
            selectedRegion: region,
            regionsFound: [state.regionToFind, ...state.regionsFound],
            regionToFind: undefined,
            streak: newStreak,
            bestStreak: newBestStreak,
            score: state.score + 1,
            currentGuessErrors: 0,
            gameOver: true,
            lastAnswerCorrect: true,
            skippedRegion: null,
          };
        }

        const next = pickRandom(remaining);
        return {
          ...state,
          regionsToFind: remaining.filter((r) => r !== next),
          selectedRegion: region,
          regionsFound: [state.regionToFind, ...state.regionsFound],
          regionToFind: next,
          streak: newStreak,
          bestStreak: newBestStreak,
          score: state.score + 1,
          currentGuessErrors: 0,
          lastAnswerCorrect: true,
          skippedRegion: null,
        };
      }

      // Wrong answer — 3rd strike: skip this region
      if (state.currentGuessErrors >= 2) {
        const skipped = state.regionToFind;
        const remaining = state.regionsToFind.filter((r) => r !== skipped);
        if (remaining.length === 0) {
          return {
            ...state,
            regionsToFind: [],
            selectedRegion: region,
            errors: state.errors + 1,
            regionsFound: skipped
              ? [skipped, ...state.regionsFound]
              : state.regionsFound,
            regionToFind: undefined,
            streak: 0,
            currentGuessErrors: 0,
            gameOver: true,
            lastAnswerCorrect: false,
            skippedRegion: skipped ?? null,
          };
        }
        const next = pickRandom(remaining);
        return {
          ...state,
          regionsToFind: remaining.filter((r) => r !== next),
          selectedRegion: region,
          errors: state.errors + 1,
          regionsFound: skipped
            ? [skipped, ...state.regionsFound]
            : state.regionsFound,
          regionToFind: next,
          streak: 0,
          currentGuessErrors: 0,
          lastAnswerCorrect: false,
          skippedRegion: skipped ?? null,
        };
      }

      // Wrong answer — still has attempts
      return {
        ...state,
        selectedRegion: region,
        errors: state.errors + 1,
        streak: 0,
        currentGuessErrors: state.currentGuessErrors + 1,
        lastAnswerCorrect: false,
        skippedRegion: null,
      };
    }

    case 'CHANGE_DIFFICULTY':
      return buildInitialState(action.difficulty);

    case 'RESET_GAME':
      return buildInitialState(state.difficulty);

    case 'CLEAR_FEEDBACK':
      return { ...state, lastAnswerCorrect: null, skippedRegion: null };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, Difficulty.MEDIUM, buildInitialState);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  const selectRegion = useCallback((region: string) => {
    dispatch({ type: 'SELECT_REGION', region });
  }, []);

  const changeDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'CHANGE_DIFFICULTY', difficulty });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const clearFeedback = useCallback(() => {
    dispatch({ type: 'CLEAR_FEEDBACK' });
  }, []);

  // Auto-clear feedback after 800ms
  useEffect(() => {
    if (state.lastAnswerCorrect !== null) {
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(clearFeedback, 500);
    }
    return () => clearTimeout(feedbackTimer.current);
  }, [state.lastAnswerCorrect, state.score, state.errors, clearFeedback]);

  const totalRegions =
    state.regionsFound.length + state.regionsToFind.length + (state.regionToFind ? 1 : 0);
  const progress = totalRegions > 0 ? state.regionsFound.length / totalRegions : 0;

  return {
    state,
    selectRegion,
    changeDifficulty,
    resetGame,
    clearFeedback,
    progress,
    totalRegions,
  };
}
