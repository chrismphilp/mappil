import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, ActionType, Difficulty, ContinentFilter, GameMode } from '../types/game.types';
import { getFilteredRegions } from '../data/maps';

const QUICK_PLAY_COUNT = 10;

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildInitialState(
  difficulty: Difficulty,
  continent: ContinentFilter = ContinentFilter.WORLD,
  gameMode: GameMode = GameMode.QUICK,
): GameState {
  let regions = getFilteredRegions(difficulty, continent);
  if (gameMode === GameMode.QUICK && regions.length > QUICK_PLAY_COUNT) {
    regions = shuffle(regions).slice(0, QUICK_PLAY_COUNT);
  }
  const first = pickRandom(regions);
  return {
    regionsToFind: regions.filter((r) => r !== first),
    regionToFind: first,
    selectedRegion: undefined,
    regionsFound: [],
    difficulty,
    continent,
    gameMode,
    score: 0,
    errors: 0,
    currentGuessErrors: 0,
    streak: 0,
    bestStreak: 0,
    gameOver: false,
    lastAnswerCorrect: null,
    skippedRegion: null,
    startTime: null,
  };
}

function skipCurrentRegion(state: GameState): GameState {
  if (state.gameOver || !state.regionToFind) return state;
  const skipped = state.regionToFind;
  state = state.startTime === null ? { ...state, startTime: Date.now() } : state;
  const remaining = state.regionsToFind.filter((r) => r !== skipped);

  if (remaining.length === 0) {
    return {
      ...state,
      regionsToFind: [],
      selectedRegion: undefined,
      errors: state.errors + 1,
      regionsFound: [skipped, ...state.regionsFound],
      regionToFind: undefined,
      streak: 0,
      currentGuessErrors: 0,
      gameOver: true,
      lastAnswerCorrect: false,
      skippedRegion: skipped,
    };
  }

  const next = pickRandom(remaining);
  return {
    ...state,
    regionsToFind: remaining.filter((r) => r !== next),
    selectedRegion: undefined,
    errors: state.errors + 1,
    regionsFound: [skipped, ...state.regionsFound],
    regionToFind: next,
    streak: 0,
    currentGuessErrors: 0,
    lastAnswerCorrect: false,
    skippedRegion: skipped,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionType.SELECT_REGION: {
      const { region } = action;
      if (state.gameOver || !state.regionToFind) return state;
      state = state.startTime === null ? { ...state, startTime: Date.now() } : state;

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
        return skipCurrentRegion(state);
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

    case ActionType.SKIP_REGION:
      return skipCurrentRegion(state);

    case ActionType.CHANGE_DIFFICULTY:
      return buildInitialState(action.difficulty, state.continent, state.gameMode);

    case ActionType.CHANGE_CONTINENT:
      return buildInitialState(state.difficulty, action.continent, state.gameMode);

    case ActionType.CHANGE_GAME_MODE:
      return buildInitialState(state.difficulty, state.continent, action.gameMode);

    case ActionType.RESET_GAME:
      return buildInitialState(state.difficulty, state.continent, state.gameMode);

    case ActionType.CLEAR_FEEDBACK:
      return { ...state, lastAnswerCorrect: null, skippedRegion: null };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, Difficulty.MEDIUM, buildInitialState);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  const selectRegion = useCallback((region: string) => {
    dispatch({ type: ActionType.SELECT_REGION, region });
  }, []);

  const skipRegion = useCallback(() => {
    dispatch({ type: ActionType.SKIP_REGION });
  }, []);

  const changeDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: ActionType.CHANGE_DIFFICULTY, difficulty });
  }, []);

  const changeContinent = useCallback((continent: ContinentFilter) => {
    dispatch({ type: ActionType.CHANGE_CONTINENT, continent });
  }, []);

  const changeGameMode = useCallback((gameMode: GameMode) => {
    dispatch({ type: ActionType.CHANGE_GAME_MODE, gameMode });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: ActionType.RESET_GAME });
  }, []);

  const clearFeedback = useCallback(() => {
    dispatch({ type: ActionType.CLEAR_FEEDBACK });
  }, []);

  // Auto-clear feedback — 2s for skips (fly-to animation), 500ms otherwise
  useEffect(() => {
    if (state.lastAnswerCorrect !== null) {
      clearTimeout(feedbackTimer.current);
      const delay = state.skippedRegion ? 2000 : 500;
      feedbackTimer.current = setTimeout(clearFeedback, delay);
    }
    return () => clearTimeout(feedbackTimer.current);
  }, [state.lastAnswerCorrect, state.score, state.errors, state.skippedRegion, clearFeedback]);

  const totalRegions =
    state.regionsFound.length + state.regionsToFind.length + (state.regionToFind ? 1 : 0);
  const progress = totalRegions > 0 ? state.regionsFound.length / totalRegions : 0;
  const durationSecs = state.startTime !== null && state.gameOver
    ? Math.floor((Date.now() - state.startTime) / 1000)
    : 0;

  return {
    state,
    selectRegion,
    skipRegion,
    changeDifficulty,
    changeContinent,
    changeGameMode,
    resetGame,
    clearFeedback,
    progress,
    totalRegions,
    durationSecs,
  };
}
