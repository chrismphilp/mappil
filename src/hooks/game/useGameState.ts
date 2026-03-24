import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  ActionType,
  ChallengeType,
  ContinentFilter,
  Difficulty,
  FeedbackState,
  GameAction,
  GameMode,
  GameState,
} from '../../types/game.types';
import { getFilteredRegions } from '../../data/maps';
import { SeededRandom } from '../../lib/seededRandom';
import {
  SCORING_RULES,
  addBreakdownPoints,
  calculateMaxPossibleScore,
  createEmptyScoreBreakdown,
  getStreakState,
  getStreakBonus,
} from '../../lib/scoring';

const QUICK_PLAY_COUNT = 10;

function createRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function shuffleArray(arr: string[], rng?: SeededRandom): string[] {
  if (rng) return rng.shuffle(arr);

  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
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
    runId: createRunId(),
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
    baseScore: 0,
    bonusScore: 0,
    maxPossibleScore: calculateMaxPossibleScore(regions.length),
    scoreBreakdown: createEmptyScoreBreakdown(),
    correctAnswers: 0,
    firstTryCount: 0,
    secondTryCount: 0,
    thirdTrySaveCount: 0,
    errors: 0,
    currentGuessErrors: 0,
    skippedCount: 0,
    streak: 0,
    bestStreak: 0,
    gameOver: false,
    feedback: null,
    startTime: null,
  };
}

function ensureStarted(state: GameState): GameState {
  if (state.startTime !== null) return state;
  return { ...state, startTime: Date.now() };
}

function createFeedback(input: Partial<FeedbackState> & Pick<FeedbackState, 'outcome' | 'streak' | 'scoreDelta'>): FeedbackState {
  return {
    outcome: input.outcome,
    streak: input.streak,
    scoreDelta: input.scoreDelta,
    skippedRegion: input.skippedRegion ?? null,
    wasFirstTry: input.wasFirstTry ?? false,
    wasThirdTrySave: input.wasThirdTrySave ?? false,
    streakMilestone: input.streakMilestone ?? false,
  };
}

function finalizeRun(state: GameState): GameState {
  if (!state.gameOver || !state.feedback) return state;

  let nextState = state;
  let scoreDelta = state.feedback.scoreDelta;
  const feedback = state.feedback;

  if (state.skippedCount === 0) {
    nextState = {
      ...nextState,
      bonusScore: nextState.bonusScore + SCORING_RULES.noSkipFinishBonus,
      scoreBreakdown: addBreakdownPoints(
        nextState.scoreBreakdown,
        'noSkipFinish',
        SCORING_RULES.noSkipFinishBonus,
      ),
    };
    scoreDelta += SCORING_RULES.noSkipFinishBonus;
  }

  if (state.errors === 0 && state.skippedCount === 0) {
    nextState = {
      ...nextState,
      bonusScore: nextState.bonusScore + SCORING_RULES.flawlessFinishBonus,
      scoreBreakdown: addBreakdownPoints(
        nextState.scoreBreakdown,
        'flawlessFinish',
        SCORING_RULES.flawlessFinishBonus,
      ),
    };
    scoreDelta += SCORING_RULES.flawlessFinishBonus;
  }

  return {
    ...nextState,
    score: nextState.baseScore + nextState.bonusScore,
    feedback: createFeedback({
      outcome: feedback.outcome,
      streak: feedback.streak,
      scoreDelta,
      skippedRegion: feedback.skippedRegion,
      wasFirstTry: feedback.wasFirstTry,
      wasThirdTrySave: feedback.wasThirdTrySave,
      streakMilestone: feedback.streakMilestone,
    }),
  };
}

function scoreCorrectAnswer(state: GameState): {
  baseScore: number;
  bonusScore: number;
  score: number;
  scoreBreakdown: GameState['scoreBreakdown'];
  correctAnswers: number;
  firstTryCount: number;
  secondTryCount: number;
  thirdTrySaveCount: number;
  streak: number;
  bestStreak: number;
  feedback: FeedbackState;
} {
  const newStreak = state.currentGuessErrors > 0 ? 1 : state.streak + 1;
  const nextStreakState = getStreakState(newStreak);
  const previousStreakState = getStreakState(state.streak);
  const streakBonus = getStreakBonus(newStreak);
  let bonusScore = state.bonusScore;
  let scoreBreakdown = addBreakdownPoints(
    state.scoreBreakdown,
    'correctAnswers',
    SCORING_RULES.correctAnswer,
  );
  const baseScore = state.baseScore + SCORING_RULES.correctAnswer;
  let scoreDelta = SCORING_RULES.correctAnswer;
  let firstTryCount = state.firstTryCount;
  let secondTryCount = state.secondTryCount;
  let thirdTrySaveCount = state.thirdTrySaveCount;
  let wasFirstTry = false;
  let wasThirdTrySave = false;

  if (state.currentGuessErrors === 0) {
    bonusScore += SCORING_RULES.firstTryBonus;
    scoreBreakdown = addBreakdownPoints(scoreBreakdown, 'firstTryBonus', SCORING_RULES.firstTryBonus);
    scoreDelta += SCORING_RULES.firstTryBonus;
    firstTryCount += 1;
    wasFirstTry = true;
  } else if (state.currentGuessErrors === 1) {
    bonusScore += SCORING_RULES.recoveryBonus;
    scoreBreakdown = addBreakdownPoints(scoreBreakdown, 'recoveryBonus', SCORING_RULES.recoveryBonus);
    scoreDelta += SCORING_RULES.recoveryBonus;
    secondTryCount += 1;
  } else {
    bonusScore += SCORING_RULES.clutchSaveBonus;
    scoreBreakdown = addBreakdownPoints(scoreBreakdown, 'clutchSaveBonus', SCORING_RULES.clutchSaveBonus);
    scoreDelta += SCORING_RULES.clutchSaveBonus;
    thirdTrySaveCount += 1;
    wasThirdTrySave = true;
  }

  if (streakBonus > 0) {
    bonusScore += streakBonus;
    scoreBreakdown = addBreakdownPoints(scoreBreakdown, 'streakBonus', streakBonus);
    scoreDelta += streakBonus;
  }

  return {
    baseScore,
    bonusScore,
    score: baseScore + bonusScore,
    scoreBreakdown,
    correctAnswers: state.correctAnswers + 1,
    firstTryCount,
    secondTryCount,
    thirdTrySaveCount,
    streak: newStreak,
    bestStreak: Math.max(state.bestStreak, newStreak),
    feedback: createFeedback({
      outcome: 'correct',
      streak: newStreak,
      scoreDelta,
      wasFirstTry,
      wasThirdTrySave,
      streakMilestone:
        nextStreakState.key !== 'cold' && nextStreakState.key !== previousStreakState.key,
    }),
  };
}

function skipCurrentRegion(state: GameState): GameState {
  if (state.gameOver || !state.regionToFind) return state;

  const skippedRegion = state.regionToFind;
  const activeState = ensureStarted(state);
  const remaining = activeState.regionsToFind;
  const baseState = {
    ...activeState,
    selectedRegion: undefined,
    regionsFound: [skippedRegion, ...activeState.regionsFound],
    errors: activeState.errors + 1,
    currentGuessErrors: 0,
    skippedCount: activeState.skippedCount + 1,
    streak: 0,
    feedback: createFeedback({
      outcome: 'skip',
      streak: 0,
      scoreDelta: 0,
      skippedRegion,
    }),
  };

  if (remaining.length === 0) {
    return {
      ...baseState,
      regionsToFind: [],
      regionToFind: undefined,
      gameOver: true,
    };
  }

  return {
    ...baseState,
    regionsToFind: remaining.slice(1),
    regionToFind: remaining[0],
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionType.SELECT_REGION: {
      if (state.gameOver || !state.regionToFind) return state;
      if (state.regionsFound.includes(action.region)) return state;

      const activeState = ensureStarted(state);

      if (action.region === activeState.regionToFind) {
        const scoring = scoreCorrectAnswer(activeState);
        const remaining = activeState.regionsToFind;
        const nextState: GameState = {
          ...activeState,
          ...scoring,
          selectedRegion: action.region,
          regionsFound: [activeState.regionToFind, ...activeState.regionsFound],
          regionToFind: remaining[0],
          regionsToFind: remaining.slice(1),
          currentGuessErrors: 0,
          gameOver: remaining.length === 0,
        };

        return remaining.length === 0
          ? finalizeRun({
              ...nextState,
              regionToFind: undefined,
              regionsToFind: [],
            })
          : nextState;
      }

      if (activeState.currentGuessErrors >= 2) {
        return skipCurrentRegion(activeState);
      }

      return {
        ...activeState,
        selectedRegion: action.region,
        errors: activeState.errors + 1,
        currentGuessErrors: activeState.currentGuessErrors + 1,
        streak: 0,
        feedback: createFeedback({
          outcome: 'wrong',
          streak: 0,
          scoreDelta: 0,
        }),
      };
    }

    case ActionType.SKIP_REGION:
      return skipCurrentRegion(state);

    case ActionType.CHANGE_DIFFICULTY:
      return buildInitialState({
        difficulty: action.difficulty,
        continent: state.continent,
        gameMode: state.gameMode,
      });

    case ActionType.CHANGE_CONTINENT:
      return buildInitialState({
        difficulty: state.difficulty,
        continent: action.continent,
        gameMode: state.gameMode,
      });

    case ActionType.CHANGE_GAME_MODE:
      return buildInitialState({
        difficulty: state.difficulty,
        continent: state.continent,
        gameMode: action.gameMode,
      });

    case ActionType.RESET_GAME:
      return buildInitialState({
        difficulty: state.difficulty,
        continent: state.continent,
        gameMode: state.gameMode,
        challengeId: state.challengeId,
        challengeType: state.challengeType,
        seed: state.seed,
        isDailyChallenge: state.isDailyChallenge,
      });

    case ActionType.CLEAR_FEEDBACK:
      return { ...state, feedback: null };

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
      isDailyChallenge,
    }),
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

  useEffect(() => {
    if (state.feedback) {
      clearTimeout(feedbackTimer.current);
      const delay = state.feedback.outcome === 'skip' ? 1600 : 650;
      feedbackTimer.current = setTimeout(clearFeedback, delay);
    }

    return () => clearTimeout(feedbackTimer.current);
  }, [state.feedback, clearFeedback]);

  const totalRegions =
    state.regionsFound.length + state.regionsToFind.length + (state.regionToFind ? 1 : 0);
  const progress = totalRegions > 0 ? state.regionsFound.length / totalRegions : 0;
  const durationSecs =
    state.startTime !== null && state.gameOver
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
