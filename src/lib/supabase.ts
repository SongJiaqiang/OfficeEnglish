import { createClient, SupabaseClient } from '@supabase/supabase-js';

function readSupabaseConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  // Prefer the new publishable key; accept the legacy anon key name too.
  const key =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

  if (!url?.trim() || !key?.trim()) {
    return null;
  }

  return { url: url.trim(), key: key.trim() };
}

export function isSupabaseConfigured(): boolean {
  return readSupabaseConfig() !== null;
}

export function createSupabaseClient(): SupabaseClient {
  const config = readSupabaseConfig();

  if (!config) {
    throw new Error('Supabase URL or publishable key is not configured.');
  }

  return createClient(config.url, config.key);
}
