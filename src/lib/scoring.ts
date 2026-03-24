import { ScoreBreakdown, ScoreBreakdownLine } from '../types/game.types';

export const SCORING_RULES = {
  correctAnswer: 100,
  firstTryBonus: 35,
  recoveryBonus: 15,
  clutchSaveBonus: 5,
  noSkipFinishBonus: 60,
  flawlessFinishBonus: 120,
} as const;

export type StreakHeat = 'cold' | 'warm' | 'hot' | 'on_fire' | 'legendary';

export interface StreakState {
  key: StreakHeat;
  label: string;
  icon: string | null;
}

const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  correctAnswers: 'Countries found',
  firstTryBonus: 'First-try bonus',
  recoveryBonus: 'Recovery bonus',
  clutchSaveBonus: 'Clutch saves',
  streakBonus: 'Streak bonus',
  noSkipFinish: 'No-skip finish',
  flawlessFinish: 'Flawless finish',
};

export function createEmptyScoreBreakdown(): ScoreBreakdown {
  return {
    correctAnswers: { points: 0, count: 0 },
    firstTryBonus: { points: 0, count: 0 },
    recoveryBonus: { points: 0, count: 0 },
    clutchSaveBonus: { points: 0, count: 0 },
    streakBonus: { points: 0, count: 0 },
    noSkipFinish: { points: 0, count: 0 },
    flawlessFinish: { points: 0, count: 0 },
  };
}

export function addBreakdownPoints(
  breakdown: ScoreBreakdown,
  key: keyof ScoreBreakdown,
  points: number,
  count = 1,
): ScoreBreakdown {
  const bucket = breakdown[key];

  return {
    ...breakdown,
    [key]: {
      points: bucket.points + points,
      count: bucket.count + count,
    },
  };
}

export function getScoreBreakdownLines(breakdown: ScoreBreakdown): ScoreBreakdownLine[] {
  return (Object.keys(breakdown) as Array<keyof ScoreBreakdown>)
    .map((key) => ({
      id: key,
      label: BREAKDOWN_LABELS[key],
      points: breakdown[key].points,
      count: breakdown[key].count,
    }))
    .filter((line) => line.points > 0);
}

export function getStreakBonus(streak: number): number {
  if (streak <= 1) return 0;
  return Math.min((streak - 1) * 5, 25);
}

export function calculateMaxPossibleScore(totalRegions: number): number {
  let total = totalRegions * (SCORING_RULES.correctAnswer + SCORING_RULES.firstTryBonus);

  for (let streak = 1; streak <= totalRegions; streak += 1) {
    total += getStreakBonus(streak);
  }

  total += SCORING_RULES.noSkipFinishBonus + SCORING_RULES.flawlessFinishBonus;
  return total;
}

export function getStreakState(streak: number): StreakState {
  if (streak >= 10) {
    return { key: 'legendary', label: 'Legendary', icon: '✦' };
  }

  if (streak >= 7) {
    return { key: 'on_fire', label: 'On Fire', icon: '🔥' };
  }

  if (streak >= 4) {
    return { key: 'hot', label: 'Hot', icon: '⚡' };
  }

  if (streak >= 2) {
    return { key: 'warm', label: 'Warm', icon: '✨' };
  }

  return { key: 'cold', label: 'Cold', icon: null };
}

interface RunGradeInput {
  score: number;
  maxPossibleScore: number;
  errors: number;
  skippedCount: number;
}

export interface RunGrade {
  letter: 'S' | 'A' | 'B' | 'C' | 'D';
  label: string;
}

export function getRunGrade(input: RunGradeInput): RunGrade {
  if (input.maxPossibleScore <= 0) {
    return { letter: 'D', label: 'Warming Up' };
  }

  const scoreRatio = input.score / input.maxPossibleScore;

  if (input.errors === 0 && input.skippedCount === 0 && scoreRatio >= 0.95) {
    return { letter: 'S', label: 'Cartographer' };
  }

  if (scoreRatio >= 0.82) {
    return { letter: 'A', label: 'Pathfinder' };
  }

  if (scoreRatio >= 0.68) {
    return { letter: 'B', label: 'Explorer' };
  }

  if (scoreRatio >= 0.52) {
    return { letter: 'C', label: 'Surveyor' };
  }

  return { letter: 'D', label: 'Warming Up' };
}
