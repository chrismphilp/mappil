import { getSupabase } from './supabase';
import { ContinentFilter, Difficulty, GameMode } from '../types/game.types';

export interface FriendChallenge {
  id: string;
  created_at: string;
  created_by_username: string;
  seed: string;
  difficulty: Difficulty;
  continent: ContinentFilter;
  game_mode: GameMode;
}

function generateShortId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createFriendChallenge(
  username: string,
  difficulty: Difficulty,
  continent: ContinentFilter,
  gameMode: GameMode
): Promise<string> {
  const supabase = getSupabase();
  const id = `friend:${generateShortId()}`;
  const seed = generateShortId(); // Just a random seed for the game

  const { error } = await supabase.from('friend_challenges').insert({
    id,
    created_by_username: username,
    seed,
    difficulty,
    continent,
    game_mode: gameMode,
  });

  if (error) {
    throw new Error(error.message);
  }

  return id;
}

export async function getFriendChallenge(id: string): Promise<FriendChallenge | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('friend_challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as FriendChallenge;
}
