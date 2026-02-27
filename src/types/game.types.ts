export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export type ContinentFilter = 'World' | 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';

export interface GameState {
  regionsToFind: string[];
  regionToFind: string | undefined;
  selectedRegion: string | undefined;
  regionsFound: string[];
  difficulty: Difficulty;
  continent: ContinentFilter;
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

export type GameAction =
  | { type: 'SELECT_REGION'; region: string }
  | { type: 'SKIP_REGION' }
  | { type: 'CHANGE_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'CHANGE_CONTINENT'; continent: ContinentFilter }
  | { type: 'RESET_GAME' }
  | { type: 'CLEAR_FEEDBACK' };
