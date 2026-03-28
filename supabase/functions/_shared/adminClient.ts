import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.98.0';
import {
  type BlockedUsernameRule,
  DEFAULT_BLOCKED_USERNAME_RULES,
} from './usernameModeration.ts';

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

export async function loadBlockedUsernameRules(
  supabase: SupabaseClient,
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
