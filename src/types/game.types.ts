export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export interface GameState {
  regionsToFind: string[];
  regionToFind: string | undefined;
  selectedRegion: string | undefined;
  regionsFound: string[];
  difficulty: Difficulty;
  score: number;
  errors: number;
  currentGuessErrors: number;
  streak: number;
  bestStreak: number;
  gameOver: boolean;
  lastAnswerCorrect: boolean | null;
  skippedRegion: string | null;
}

export type GameAction =
  | { type: 'SELECT_REGION'; region: string }
  | { type: 'CHANGE_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'RESET_GAME' }
  | { type: 'CLEAR_FEEDBACK' };
