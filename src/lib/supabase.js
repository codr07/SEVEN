import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'seven-auth-v3-stable',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export default supabase;

/**
 * Wraps a Supabase query (or any thenable) in a timeout.
 * Supabase QueryBuilders are lazy — we must call .then() to start
 * execution before passing to Promise.race, otherwise the timeout
 * fires immediately because the query hasn't started yet.
 */
export const withTimeout = (queryOrPromise, ms = 10000, timeoutError = 'Request timed out') => {
  // Wrap in new Promise to force the thenable (Supabase QueryBuilder) to execute
  const dataPromise = new Promise((resolve, reject) => {
    Promise.resolve(queryOrPromise).then(resolve).catch(reject);
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(timeoutError)), ms)
  );

  return Promise.race([dataPromise, timeoutPromise]);
};
