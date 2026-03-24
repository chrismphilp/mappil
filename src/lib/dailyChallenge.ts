import { ContinentFilter, Difficulty, GameMode } from '../types/game.types';

export interface DailyChallengeConfig {
  challengeId: string;
  seed: string;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  isDailyChallenge: boolean;
}

export function getDailyChallengeConfig(): DailyChallengeConfig {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
  const challengeId = `daily:${dateStr}`;
  
  // Rotate rules based on day of week
  const dayOfWeek = now.getUTCDay(); // 0 (Sun) to 6 (Sat)
  
  let difficulty = Difficulty.MEDIUM;
  let continent = ContinentFilter.WORLD;
  let gameMode = GameMode.QUICK;

  // Simple rotation rule
  switch (dayOfWeek) {
    case 0: // Sunday
      continent = ContinentFilter.WORLD;
      difficulty = Difficulty.HARD;
      gameMode = GameMode.FULL;
      break;
    case 1: // Monday
      continent = ContinentFilter.EUROPE;
      difficulty = Difficulty.EASY;
      break;
    case 2: // Tuesday
      continent = ContinentFilter.AFRICA;
      difficulty = Difficulty.MEDIUM;
      break;
    case 3: // Wednesday
      continent = ContinentFilter.WORLD;
      difficulty = Difficulty.MEDIUM;
      break;
    case 4: // Thursday
      continent = ContinentFilter.ASIA;
      difficulty = Difficulty.MEDIUM;
      break;
    case 5: // Friday
      continent = ContinentFilter.SOUTH_AMERICA;
      difficulty = Difficulty.EASY;
      break;
    case 6: // Saturday
      continent = ContinentFilter.NORTH_AMERICA;
      difficulty = Difficulty.HARD;
      break;
  }

  return {
    challengeId,
    seed: challengeId,
    difficulty,
    continent,
    gameMode,
    isDailyChallenge: true,
  };
}