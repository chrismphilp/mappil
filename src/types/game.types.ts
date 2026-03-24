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

export interface GameState {
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
  errors: number;
  currentGuessErrors: number;
  streak: number;
  bestStreak: number;
  gameOver: boolean;
  lastAnswerCorrect: boolean | null;
  skippedRegion: string | null;
  startTime: number | null;
}

export enum ActionType {
  SELECT_REGION = 'SELECT_REGION',
  SKIP_REGION = 'SKIP_REGION',
  CHANGE_DIFFICULTY = 'CHANGE_DIFFICULTY',
  CHANGE_CONTINENT = 'CHANGE_CONTINENT',
  CHANGE_GAME_MODE = 'CHANGE_GAME_MODE',
  RESET_GAME = 'RESET_GAME',
  CLEAR_FEEDBACK = 'CLEAR_FEEDBACK',
}

export type GameAction =
  | { type: ActionType.SELECT_REGION; region: string }
  | { type: ActionType.SKIP_REGION }
  | { type: ActionType.CHANGE_DIFFICULTY; difficulty: Difficulty }
  | { type: ActionType.CHANGE_CONTINENT; continent: ContinentFilter }
  | { type: ActionType.CHANGE_GAME_MODE; gameMode: GameMode }
  | { type: ActionType.RESET_GAME }
  | { type: ActionType.CLEAR_FEEDBACK };
