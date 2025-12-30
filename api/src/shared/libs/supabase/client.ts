import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/shared/config/env';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client with service role key
 * Used for server-side operations that need admin access
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}
