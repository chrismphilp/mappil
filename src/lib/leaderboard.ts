import { getSupabase } from './supabase';

export const LEADERBOARD_LIMIT = 20;
const RAW_FETCH_LIMIT = 500;

export interface ScoreEntry {
  id: string;
  created_at: string;
  player_id?: string | null;
  username: string;
  score: number;
  errors: number;
  best_streak: number;
  total_regions: number;
  duration_secs: number;
  challenge_id?: string | null;
  challenge_source?: string | null;
  is_daily_challenge?: boolean | null;
  rank?: number;
  isCurrentPlayer?: boolean;
}

export interface LeaderboardResult {
  entries: ScoreEntry[];
  playerEntry: ScoreEntry | null;
  playerGap: LeaderboardGap | null;
  totalPlayers: number;
}

export interface LeaderboardGap {
  aboveEntry: ScoreEntry;
  scoreDelta: number;
  errorsDelta: number;
  durationDelta: number;
  streakDelta: number;
}

export interface SubmitScoreParams {
  player_id?: string;
  username: string;
  score: number;
  errors: number;
  best_streak: number;
  total_regions: number;
  difficulty: string;
  continent: string;
  game_mode: string;
  duration_secs: number;
  challenge_id?: string;
  challenge_source: string;
  ruleset_key: string;
  seed?: string;
  is_daily_challenge?: boolean;
}

function sortEntries(left: ScoreEntry, right: ScoreEntry): number {
  return (
    right.score - left.score ||
    left.errors - right.errors ||
    left.duration_secs - right.duration_secs ||
    right.best_streak - left.best_streak ||
    left.created_at.localeCompare(right.created_at)
  );
}

function collapseBestAttempts(entries: ScoreEntry[]): ScoreEntry[] {
  const bestByPlayer = new Map<string, ScoreEntry>();

  for (const entry of entries) {
    const identity = entry.player_id || `legacy:${entry.username.trim().toLowerCase()}`;

    if (!bestByPlayer.has(identity)) {
      bestByPlayer.set(identity, entry);
    }
  }

  return Array.from(bestByPlayer.values()).sort(sortEntries);
}

function buildLeaderboardGap(
  currentEntry: ScoreEntry,
  aboveEntry: ScoreEntry,
): LeaderboardGap {
  return {
    aboveEntry,
    scoreDelta: Math.max(0, aboveEntry.score - currentEntry.score),
    errorsDelta: Math.max(0, currentEntry.errors - aboveEntry.errors),
    durationDelta: Math.max(0, currentEntry.duration_secs - aboveEntry.duration_secs),
    streakDelta: Math.max(0, aboveEntry.best_streak - currentEntry.best_streak),
  };
}

export async function submitScore(params: SubmitScoreParams): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('scores').insert(params);
  if (error) throw new Error(error.message);
}

export async function fetchLeaderboard(
  difficulty?: string,
  continent?: string,
  gameMode?: string,
  challengeId?: string,
  currentPlayerId?: string,
): Promise<LeaderboardResult> {
  const supabase = getSupabase();
  let query = supabase.from('scores').select(`
      id,
      created_at,
      player_id,
      username,
      score,
      errors,
      best_streak,
      total_regions,
      duration_secs,
      challenge_id,
      challenge_source,
      is_daily_challenge
    `);

  if (challengeId) {
    query = query.eq('challenge_id', challengeId);
  } else {
    query = query.or('challenge_source.eq.free_play,and(challenge_source.is.null,challenge_id.is.null)');
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (continent) {
      query = query.eq('continent', continent);
    }
    if (gameMode) {
      query = query.eq('game_mode', gameMode);
    }
  }

  query = query
    .order('score', { ascending: false })
    .order('errors', { ascending: true })
    .order('duration_secs', { ascending: true })
    .order('best_streak', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(RAW_FETCH_LIMIT);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rankedEntries = collapseBestAttempts((data ?? []) as ScoreEntry[]).map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isCurrentPlayer: currentPlayerId ? entry.player_id === currentPlayerId : false,
  }));

  const playerIndex = currentPlayerId
    ? rankedEntries.findIndex((entry) => entry.player_id === currentPlayerId)
    : -1;
  const playerEntry = playerIndex >= 0 ? rankedEntries[playerIndex] : null;
  const playerGap =
    playerIndex > 0
      ? buildLeaderboardGap(rankedEntries[playerIndex], rankedEntries[playerIndex - 1])
      : null;

  return {
    entries: rankedEntries.slice(0, LEADERBOARD_LIMIT),
    playerEntry,
    playerGap,
    totalPlayers: rankedEntries.length,
  };
}
