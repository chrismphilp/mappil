import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, ActionType, Difficulty, ContinentFilter, GameMode, ChallengeType } from '../../types/game.types';
import { getFilteredRegions } from '../../data/maps';
import { SeededRandom } from '../../lib/seededRandom';

const QUICK_PLAY_COUNT = 10;

function shuffleArray(arr: string[], rng?: SeededRandom): string[] {
  if (rng) return rng.shuffle(arr);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface RunConfig {
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeId?: string;
  challengeType?: ChallengeType;
  seed?: string;
  isDailyChallenge?: boolean;
}

function buildInitialState(config: RunConfig): GameState {
  let regions = getFilteredRegions(config.difficulty, config.continent);
  const rng = config.seed ? new SeededRandom(config.seed) : undefined;
  
  regions = shuffleArray(regions, rng);

  if (config.gameMode === GameMode.QUICK && regions.length > QUICK_PLAY_COUNT) {
    regions = regions.slice(0, QUICK_PLAY_COUNT);
  }

  const first = regions.length > 0 ? regions[0] : undefined;
  const remaining = regions.length > 1 ? regions.slice(1) : [];

  return {
    regionsToFind: remaining,
    regionToFind: first,
    selectedRegion: undefined,
    regionsFound: [],
    difficulty: config.difficulty,
    continent: config.continent,
    gameMode: config.gameMode,
    challengeId: config.challengeId,
    challengeType: config.challengeType,
    seed: config.seed,
    isDailyChallenge: config.isDailyChallenge,
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
  const remaining = state.regionsToFind;

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

  const next = remaining[0];
  return {
    ...state,
    regionsToFind: remaining.slice(1),
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
      if (state.regionsFound.includes(region)) return state;
      
      state = state.startTime === null ? { ...state, startTime: Date.now() } : state;

      if (region === state.regionToFind) {
        const remaining = state.regionsToFind;
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

        const next = remaining[0];
        return {
          ...state,
          regionsToFind: remaining.slice(1),
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
      return buildInitialState({ difficulty: action.difficulty, continent: state.continent, gameMode: state.gameMode });

    case ActionType.CHANGE_CONTINENT:
      return buildInitialState({ difficulty: state.difficulty, continent: action.continent, gameMode: state.gameMode });

    case ActionType.CHANGE_GAME_MODE:
      return buildInitialState({ difficulty: state.difficulty, continent: state.continent, gameMode: action.gameMode });

    case ActionType.RESET_GAME:
      return buildInitialState({ 
        difficulty: state.difficulty, 
        continent: state.continent, 
        gameMode: state.gameMode,
        challengeId: state.challengeId,
        challengeType: state.challengeType,
        seed: state.seed,
        isDailyChallenge: state.isDailyChallenge
      });

    case ActionType.CLEAR_FEEDBACK:
      return { ...state, lastAnswerCorrect: null, skippedRegion: null };

    default:
      return state;
  }
}

export function useGameState(
  initialContinent: ContinentFilter = ContinentFilter.WORLD,
  initialDifficulty: Difficulty = Difficulty.MEDIUM,
  initialGameMode: GameMode = GameMode.QUICK,
  challengeId?: string,
  challengeType?: ChallengeType,
  seed?: string,
  isDailyChallenge?: boolean,
) {
  const [state, dispatch] = useReducer(reducer, null, () =>
    buildInitialState({ 
      difficulty: initialDifficulty, 
      continent: initialContinent, 
      gameMode: initialGameMode,
      challengeId,
      challengeType,
      seed,
      isDailyChallenge
    })
  );
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
