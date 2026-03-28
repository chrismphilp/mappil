import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_BLOCKED_USERNAME_RULES,
  REDACTED_USERNAME_FALLBACK,
  type BlockedUsernameRule,
  validateUsername,
} from '../src/lib/usernameModeration';

const BATCH_SIZE = 500;

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function getSupabaseAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    '';
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is required.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function loadBlockedRules(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
): Promise<readonly BlockedUsernameRule[]> {
  const { data, error } = await supabase
    .from('blocked_usernames')
    .select('term, match_type')
    .eq('severity', 'block')
    .order('term', { ascending: true });

  if (error || !data) {
    return DEFAULT_BLOCKED_USERNAME_RULES;
  }

  const rules = data
    .map((row) => {
      if (typeof row.term !== 'string') {
        return null;
      }

      if (row.match_type !== 'exact' && row.match_type !== 'substring') {
        return null;
      }

      return {
        term: row.term,
        matchType: row.match_type,
      } satisfies BlockedUsernameRule;
    })
    .filter((rule): rule is BlockedUsernameRule => rule !== null);

  return rules.length > 0 ? rules : DEFAULT_BLOCKED_USERNAME_RULES;
}

function getBackfillValues(
  username: string,
  blockedRules: readonly BlockedUsernameRule[],
): { displayUsername: string; usernameRedacted: boolean } {
  const validation = validateUsername(username, {
    blockedTerms: blockedRules,
  });

  if (validation.ok) {
    return {
      displayUsername: validation.normalized,
      usernameRedacted: false,
    };
  }

  return {
    displayUsername: REDACTED_USERNAME_FALLBACK,
    usernameRedacted: true,
  };
}

async function backfillScores(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  blockedRules: readonly BlockedUsernameRule[],
): Promise<number> {
  let offset = 0;
  let updatedCount = 0;

  while (true) {
    const { data, error } = await supabase
      .from('scores')
      .select('id, username, display_username, username_redacted')
      .order('created_at', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      throw new Error(`Failed to load score rows: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return updatedCount;
    }

    const updates = data
      .map((row) => {
        const nextValues = getBackfillValues(row.username, blockedRules);
        const currentDisplayUsername =
          typeof row.display_username === 'string' ? row.display_username : '';
        const currentRedacted = row.username_redacted === true;

        if (
          currentDisplayUsername === nextValues.displayUsername &&
          currentRedacted === nextValues.usernameRedacted
        ) {
          return null;
        }

        return {
          id: row.id,
          display_username: nextValues.displayUsername,
          username_redacted: nextValues.usernameRedacted,
        };
      })
      .filter(
        (
          row,
        ): row is {
          id: string;
          display_username: string;
          username_redacted: boolean;
        } => row !== null,
      );

    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('scores')
          .update({
            display_username: update.display_username,
            username_redacted: update.username_redacted,
          })
          .eq('id', update.id);

        if (updateError) {
          throw new Error(`Failed to backfill score rows: ${updateError.message}`);
        }
      }

      updatedCount += updates.length;
    }

    offset += data.length;
  }
}

async function backfillFriendChallenges(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  blockedRules: readonly BlockedUsernameRule[],
): Promise<number> {
  let offset = 0;
  let updatedCount = 0;

  while (true) {
    const { data, error } = await supabase
      .from('friend_challenges')
      .select('id, created_by_username, created_by_display_username, username_redacted')
      .order('created_at', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      throw new Error(`Failed to load friend challenge rows: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return updatedCount;
    }

    const updates = data
      .map((row) => {
        const nextValues = getBackfillValues(row.created_by_username, blockedRules);
        const currentDisplayUsername =
          typeof row.created_by_display_username === 'string'
            ? row.created_by_display_username
            : '';
        const currentRedacted = row.username_redacted === true;

        if (
          currentDisplayUsername === nextValues.displayUsername &&
          currentRedacted === nextValues.usernameRedacted
        ) {
          return null;
        }

        return {
          id: row.id,
          created_by_display_username: nextValues.displayUsername,
          username_redacted: nextValues.usernameRedacted,
        };
      })
      .filter(
        (
          row,
        ): row is {
          id: string;
          created_by_display_username: string;
          username_redacted: boolean;
        } => row !== null,
      );

    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('friend_challenges')
          .update({
            created_by_display_username: update.created_by_display_username,
            username_redacted: update.username_redacted,
          })
          .eq('id', update.id);

        if (updateError) {
          throw new Error(`Failed to backfill friend challenge rows: ${updateError.message}`);
        }
      }

      updatedCount += updates.length;
    }

    offset += data.length;
  }
}

async function main() {
  const supabase = getSupabaseAdminClient();
  const blockedRules = await loadBlockedRules(supabase);
  const updatedScores = await backfillScores(supabase, blockedRules);
  const updatedChallenges = await backfillFriendChallenges(supabase, blockedRules);

  console.log(
    `Backfill complete. Updated ${updatedScores} score rows and ${updatedChallenges} friend challenge rows.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
