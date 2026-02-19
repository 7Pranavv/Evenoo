import { createClient } from '@supabase/supabase-js';

function initSupabase() {
  const url = typeof window !== 'undefined'
    ? (window as any).__SUPABASE_URL__ || process.env.EXPO_PUBLIC_SUPABASE_URL
    : process.env.EXPO_PUBLIC_SUPABASE_URL;

  const key = typeof window !== 'undefined'
    ? (window as any).__SUPABASE_KEY__ || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Supabase init - URL:', url ? 'set' : 'MISSING', 'Key:', key ? 'set' : 'MISSING');

  if (!url || !key) {
    console.error('Supabase credentials missing - using dummy values');
    return createClient(url || 'https://dummy.supabase.co', key || 'dummy-key', {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    });
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
}

export const supabase = initSupabase();
