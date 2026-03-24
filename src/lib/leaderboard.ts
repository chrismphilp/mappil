import { supabase } from './supabase';

export const LEADERBOARD_LIMIT = 20;

export interface ScoreEntry {
  id: string;
  username: string;
  score: number;
  errors: number;
  total_regions: number;
  duration_secs: number;
  challenge_id?: string;
  is_daily_challenge?: boolean;
}

export interface SubmitScoreParams {
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
  seed?: string;
  is_daily_challenge?: boolean;
}

export async function submitScore(params: SubmitScoreParams): Promise<void> {
  const { error } = await supabase.from('scores').insert(params);
  if (error) throw new Error(error.message);
}

export async function fetchLeaderboard(
  difficulty?: string,
  continent?: string,
  gameMode?: string,
  challengeId?: string,
): Promise<ScoreEntry[]> {
  let query = supabase.from('scores').select(`
      id,
      username,
      score,
      errors,
      total_regions,
      duration_secs,
      challenge_id,
      is_daily_challenge
    `);

  if (challengeId) {
    query = query.eq('challenge_id', challengeId);
  } else {
    query = query.or('is_daily_challenge.eq.false,is_daily_challenge.is.null');
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
    .limit(LEADERBOARD_LIMIT);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as ScoreEntry[];
}
