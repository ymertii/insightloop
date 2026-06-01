import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '../utils/supabase/client';

export { isSupabaseConfigured };

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient() : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
}
