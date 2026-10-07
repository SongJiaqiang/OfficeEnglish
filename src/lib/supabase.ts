import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or publishable key is not configured.');
  }

  return createClient(url, key);
}
