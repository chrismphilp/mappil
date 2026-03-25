import { LeaderboardGap, ScoreEntry } from '../../lib/leaderboard';
import {
  ChallengeType,
  ContinentFilter,
  Difficulty,
  GameMode,
} from '../../types/game.types';

export type LeaderboardTone = 'free' | 'daily' | 'friend';

export function formatDuration(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getLeaderboardTone(
  challengeType?: ChallengeType,
  isDailyChallenge?: boolean,
): LeaderboardTone {
  if (isDailyChallenge || challengeType === ChallengeType.DAILY) {
    return 'daily';
  }

  if (challengeType === ChallengeType.FRIEND) {
    return 'friend';
  }

  return 'free';
}

export function getLeaderboardTitle(
  challengeType?: ChallengeType,
  isDailyChallenge?: boolean,
): string {
  if (isDailyChallenge || challengeType === ChallengeType.DAILY) {
    return 'Daily Leaderboard';
  }

  if (challengeType === ChallengeType.FRIEND) {
    return 'Challenge Leaderboard';
  }

  return 'Leaderboard';
}

export function getLeaderboardBadgeLabel(
  tone: LeaderboardTone,
  continent: ContinentFilter,
): string {
  if (tone === 'daily') {
    return 'Daily Sprint';
  }

  if (tone === 'friend') {
    return 'Friend Showdown';
  }

  if (continent === ContinentFilter.WORLD) {
    return 'World Ladder';
  }

  return `${continent} Ladder`;
}

export function getRulesetLabel(
  difficulty: string,
  continent: string,
  gameMode: string,
): string {
  return `${gameMode} • ${difficulty} • ${continent}`;
}

export function getLeaderboardSubtitle(args: {
  tone: LeaderboardTone;
  difficulty: string;
  continent: string;
  gameMode: string;
}): string {
  const rulesetLabel = getRulesetLabel(
    args.difficulty,
    args.continent,
    args.gameMode,
  );

  if (args.tone === 'daily') {
    return `Today's seeded run for ${rulesetLabel}.`;
  }

  if (args.tone === 'friend') {
    return `Best attempts on this shared challenge for ${rulesetLabel}.`;
  }

  return `Best attempts on the ${rulesetLabel} ladder.`;
}

export function getLeaderboardContextLabel(
  tone: LeaderboardTone,
  difficulty: string,
  continent: string,
  gameMode: string,
): string {
  if (tone === 'daily') {
    return `Daily Seed • ${getRulesetLabel(difficulty, continent, gameMode)}`;
  }

  if (tone === 'friend') {
    return `Friend Challenge • ${getRulesetLabel(difficulty, continent, gameMode)}`;
  }

  return getRulesetLabel(difficulty, continent, gameMode);
}

export function getPlayerStandingLabel(rank: number, totalPlayers: number): string {
  if (rank === 1) {
    return 'Board leader';
  }

  if (rank <= 3) {
    return 'On the podium';
  }

  if (rank <= 10) {
    return 'Top 10';
  }

  if (totalPlayers <= 1) {
    return 'Ranked';
  }

  const percentile = Math.max(1, Math.round((rank / totalPlayers) * 100));
  return `Top ${percentile}%`;
}

export function getPlayerGapMessage(gap: LeaderboardGap | null): string | null {
  if (!gap) {
    return null;
  }

  if (gap.scoreDelta > 0) {
    return `${gap.scoreDelta} more point${gap.scoreDelta === 1 ? '' : 's'} passes ${gap.aboveEntry.username}.`;
  }

  if (gap.errorsDelta > 0) {
    return `Tie on score. ${gap.errorsDelta} fewer error${gap.errorsDelta === 1 ? '' : 's'} passes ${gap.aboveEntry.username}.`;
  }

  if (gap.durationDelta > 0) {
    return `Tie on score and errors. ${gap.durationDelta}s faster passes ${gap.aboveEntry.username}.`;
  }

  if (gap.streakDelta > 0) {
    return `${gap.streakDelta} more streak passes ${gap.aboveEntry.username} on the final tiebreak.`;
  }

  return `You are right behind ${gap.aboveEntry.username}.`;
}

export function getEntryBadges(entry: ScoreEntry): string[] {
  const badges: string[] = [];

  if (entry.errors <= 1) {
    badges.push('Clean');
  }

  if (entry.best_streak >= 5) {
    badges.push('Hot Streak');
  }

  if (entry.duration_secs <= 45) {
    badges.push('Fast');
  }

  return badges.slice(0, 2);
}

export function getRankTier(rank: number): 'podium' | 'top10' | 'field' {
  if (rank <= 3) {
    return 'podium';
  }

  if (rank <= 10) {
    return 'top10';
  }

  return 'field';
}

export const FREE_PLAY_FILTERS = {
  gameModes: [GameMode.QUICK, GameMode.FULL],
  difficulties: [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD],
  continents: [
    ContinentFilter.WORLD,
    ContinentFilter.AFRICA,
    ContinentFilter.ASIA,
    ContinentFilter.EUROPE,
    ContinentFilter.NORTH_AMERICA,
    ContinentFilter.SOUTH_AMERICA,
    ContinentFilter.OCEANIA,
  ],
};
