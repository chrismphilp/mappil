import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  hasSupabaseConfig,
  supabaseAnonKey,
  SUPABASE_UNAVAILABLE_MESSAGE,
  supabaseUrl,
} from './supabaseConfig';

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
