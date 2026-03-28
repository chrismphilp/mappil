import { getSupabase } from './supabase';
import { invokeSupabaseFunction } from './supabaseFunctions';
import { getSafeDisplayUsername } from './usernameModeration';
import { ContinentFilter, Difficulty, GameMode } from '../types/game.types';

export interface FriendChallenge {
  id: string;
  created_at: string;
  created_by_username: string;
  created_by_display_username?: string | null;
  username_redacted?: boolean | null;
  seed: string;
  difficulty: Difficulty;
  continent: ContinentFilter;
  game_mode: GameMode;
}

interface CreateFriendChallengeResponse {
  id: string;
}

export async function createFriendChallenge(
  username: string,
  difficulty: Difficulty,
  continent: ContinentFilter,
  gameMode: GameMode
): Promise<string> {
  const response = await invokeSupabaseFunction<
    CreateFriendChallengeResponse,
    {
      username: string;
      difficulty: Difficulty;
      continent: ContinentFilter;
      game_mode: GameMode;
    }
  >(
    'create-friend-challenge',
    {
      username,
      difficulty,
      continent,
      game_mode: gameMode,
    },
    'Failed to create challenge link.',
  );

  return response.id;
}

export async function getFriendChallenge(id: string): Promise<FriendChallenge | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('friend_challenges')
    .select(`
      id,
      created_at,
      created_by_username,
      created_by_display_username,
      username_redacted,
      seed,
      difficulty,
      continent,
      game_mode
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as FriendChallenge;
}

export function getFriendChallengeDisplayName(challenge: FriendChallenge): string {
  return getSafeDisplayUsername({
    displayUsername: challenge.created_by_display_username,
    rawUsername: challenge.created_by_username,
    isRedacted: challenge.username_redacted,
  });
}
