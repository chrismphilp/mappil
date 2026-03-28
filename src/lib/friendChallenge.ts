import { getSupabase } from './supabase';
import { invokeSupabaseFunction } from './supabaseFunctions';
import { isMissingSupabaseColumnError } from './supabaseSchemaCompat';
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

const FRIEND_CHALLENGE_MODERATED_COLUMNS = [
  'created_by_display_username',
  'username_redacted',
] as const;

const FRIEND_CHALLENGE_SELECT = `
      id,
      created_at,
      created_by_username,
      created_by_display_username,
      username_redacted,
      seed,
      difficulty,
      continent,
      game_mode
    `;

const LEGACY_FRIEND_CHALLENGE_SELECT = `
      id,
      created_at,
      created_by_username,
      seed,
      difficulty,
      continent,
      game_mode
    `;

type LegacyFriendChallengeRow = Omit<
  FriendChallenge,
  'created_by_display_username' | 'username_redacted'
>;

function normalizeFriendChallenge(
  challenge: FriendChallenge | LegacyFriendChallengeRow,
): FriendChallenge {
  return {
    ...challenge,
    created_by_display_username:
      'created_by_display_username' in challenge
        ? (challenge.created_by_display_username ?? challenge.created_by_username)
        : challenge.created_by_username,
    username_redacted:
      'username_redacted' in challenge
        ? (challenge.username_redacted ?? false)
        : false,
  };
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
  const primaryResult = await supabase
    .from('friend_challenges')
    .select(FRIEND_CHALLENGE_SELECT)
    .eq('id', id)
    .single();

  if (!primaryResult.error && primaryResult.data) {
    return normalizeFriendChallenge(primaryResult.data as FriendChallenge);
  }

  if (
    !isMissingSupabaseColumnError(
      primaryResult.error,
      FRIEND_CHALLENGE_MODERATED_COLUMNS,
    )
  ) {
    return null;
  }

  const fallbackResult = await supabase
    .from('friend_challenges')
    .select(LEGACY_FRIEND_CHALLENGE_SELECT)
    .eq('id', id)
    .single();

  if (fallbackResult.error || !fallbackResult.data) {
    return null;
  }

  return normalizeFriendChallenge(
    fallbackResult.data as LegacyFriendChallengeRow,
  );
}

export function getFriendChallengeDisplayName(challenge: FriendChallenge): string {
  return getSafeDisplayUsername({
    displayUsername: challenge.created_by_display_username,
    rawUsername: challenge.created_by_username,
    isRedacted: challenge.username_redacted,
  });
}
