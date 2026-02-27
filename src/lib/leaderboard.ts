import { supabase } from './supabase';

export interface ScoreEntry {
  id: string;
  username: string;
  score: number;
  errors: number;
  best_streak: number;
  total_regions: number;
  difficulty: string;
  continent: string;
  game_mode: string;
  duration_secs: number;
  created_at: string;
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
}

export async function submitScore(params: SubmitScoreParams): Promise<void> {
  const { error } = await supabase.from('scores').insert(params);
  if (error) throw new Error(error.message);
}

export async function fetchLeaderboard(
  difficulty?: string,
  continent?: string,
  gameMode?: string,
): Promise<ScoreEntry[]> {
  let query = supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .order('errors', { ascending: true })
    .order('duration_secs', { ascending: true })
    .limit(20);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  if (continent) {
    query = query.eq('continent', continent);
  }
  if (gameMode) {
    query = query.eq('game_mode', gameMode);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as ScoreEntry[];
}
