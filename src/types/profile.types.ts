import { ContinentFilter, Difficulty, GameMode } from './game.types';
import type { ChallengeSource } from '../lib/ruleset';

export type PersonalBestFlag =
  | 'highest_score'
  | 'fewest_errors'
  | 'best_streak'
  | 'fastest_clean_clear'
  | 'highest_bonus_score';

export interface RulesetReference {
  key: string;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeSource: ChallengeSource;
  challengeId?: string;
  modifier?: string;
}

export interface RunRecord {
  id: string;
  completedAt: string;
  ruleset: RulesetReference;
  score: number;
  baseScore: number;
  bonusScore: number;
  maxPossibleScore: number;
  errors: number;
  bestStreak: number;
  durationSecs: number;
  totalRegions: number;
  correctAnswers: number;
  skippedCount: number;
  firstTryCount: number;
  secondTryCount: number;
  thirdTrySaveCount: number;
  personalBestFlags: PersonalBestFlag[];
}

export interface RulesetBest {
  ruleset: RulesetReference;
  highestScore: number;
  fewestErrors: number;
  bestStreak: number;
  fastestCleanClearSecs: number | null;
  highestBonusScore: number;
  totalRuns: number;
  updatedAt: string;
}

export interface PlayerSummary {
  totalRuns: number;
  totalRegionsFound: number;
  cumulativePlayTimeSecs: number;
  bestOverallStreak: number;
  totalPerfectRuns: number;
  totalFlawlessRuns: number;
  favoriteRulesetKey: string | null;
  lastPlayedAt: string | null;
}

export interface PlayerProfile {
  playerId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  summary: PlayerSummary;
  personalBests: Record<string, RulesetBest>;
  recentRuns: RunRecord[];
}

export interface RecordRunResult {
  profile: PlayerProfile;
  run: RunRecord;
  previousBest: RulesetBest | null;
  personalBest: RulesetBest;
  newBests: PersonalBestFlag[];
  tiedBests: PersonalBestFlag[];
}
