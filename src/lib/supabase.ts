import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.REACT_APP_SUPABASE_URL ??
  '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.REACT_APP_SUPABASE_ANON_KEY ??
  '';

export const SUPABASE_UNAVAILABLE_MESSAGE =
  'Online features are unavailable until the Supabase URL and anon key are configured.';

export const hasSupabaseConfig =
  supabaseUrl.trim().length > 0 && supabaseAnonKey.trim().length > 0;

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!hasSupabaseConfig) {
    throw new Error(SUPABASE_UNAVAILABLE_MESSAGE);
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}
