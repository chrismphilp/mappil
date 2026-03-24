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

  return {
    challengeId,
    seed: challengeId,
    difficulty: Difficulty.MEDIUM,
    continent: ContinentFilter.WORLD,
    gameMode: GameMode.QUICK,
    isDailyChallenge: true,
  };
}