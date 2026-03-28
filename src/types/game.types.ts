export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum GameMode {
  QUICK = 'Quick Play',
  FULL = 'Full Game',
}

export enum ContinentFilter {
  WORLD = 'World',
  AFRICA = 'Africa',
  ASIA = 'Asia',
  EUROPE = 'Europe',
  NORTH_AMERICA = 'North America',
  SOUTH_AMERICA = 'South America',
  OCEANIA = 'Oceania',
}

export enum ChallengeType {
  DAILY = 'daily',
  FRIEND = 'friend',
}

export enum ShareState {
  IDLE = 'idle',
  SHARING = 'sharing',
  SHARED = 'shared',
  ERROR = 'error',
}

export enum SubmitState {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
  ERROR = 'error',
}

export interface ScoreMetric {
  points: number;
  count: number;
}

export interface ScoreBreakdown {
  correctAnswers: ScoreMetric;
  firstTryBonus: ScoreMetric;
  recoveryBonus: ScoreMetric;
  clutchSaveBonus: ScoreMetric;
  streakBonus: ScoreMetric;
  noSkipFinish: ScoreMetric;
  flawlessFinish: ScoreMetric;
}

export interface ScoreBreakdownLine {
  id: keyof ScoreBreakdown;
  label: string;
  points: number;
  count: number;
}

export type FeedbackOutcome = 'correct' | 'wrong' | 'skip';
export type CompletionPhase = 'active' | 'showing_final_feedback' | 'complete';

export interface FeedbackState {
  outcome: FeedbackOutcome;
  streak: number;
  scoreDelta: number;
  skippedRegion: string | null;
  wasFirstTry: boolean;
  wasThirdTrySave: boolean;
  streakMilestone: boolean;
}

export interface GameState {
  runId: string;
  regionsToFind: string[];
  regionToFind: string | undefined;
  selectedRegion: string | undefined;
  regionsFound: string[];
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeId?: string;
  challengeType?: ChallengeType;
  seed?: string;
  isDailyChallenge?: boolean;
  score: number;
  baseScore: number;
  bonusScore: number;
  maxPossibleScore: number;
  scoreBreakdown: ScoreBreakdown;
  correctAnswers: number;
  firstTryCount: number;
  secondTryCount: number;
  thirdTrySaveCount: number;
  errors: number;
  currentGuessErrors: number;
  skippedCount: number;
  streak: number;
  bestStreak: number;
  gameOver: boolean;
  completionPhase: CompletionPhase;
  feedback: FeedbackState | null;
  startTime: number | null;
  endTime: number | null;
}

export enum ActionType {
  SELECT_REGION = 'SELECT_REGION',
  SKIP_REGION = 'SKIP_REGION',
  CHANGE_DIFFICULTY = 'CHANGE_DIFFICULTY',
  CHANGE_CONTINENT = 'CHANGE_CONTINENT',
  CHANGE_GAME_MODE = 'CHANGE_GAME_MODE',
  CHANGE_RULESET = 'CHANGE_RULESET',
  RESET_GAME = 'RESET_GAME',
  CLEAR_FEEDBACK = 'CLEAR_FEEDBACK',
}

export type GameAction =
  | { type: ActionType.SELECT_REGION; region: string }
  | { type: ActionType.SKIP_REGION }
  | { type: ActionType.CHANGE_DIFFICULTY; difficulty: Difficulty }
  | { type: ActionType.CHANGE_CONTINENT; continent: ContinentFilter }
  | { type: ActionType.CHANGE_GAME_MODE; gameMode: GameMode }
  | {
      type: ActionType.CHANGE_RULESET;
      difficulty: Difficulty;
      continent: ContinentFilter;
      gameMode: GameMode;
    }
  | { type: ActionType.RESET_GAME }
  | { type: ActionType.CLEAR_FEEDBACK };
