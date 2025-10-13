const FALLBACK_SUPABASE_URL = 'https://okcssrvjseaoansuxtvw.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY3NzcnZqc2Vhb2Fuc3V4dHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTgxMjUsImV4cCI6MjA3NTM3NDEyNX0.Ox91bV_dO-o_1a0suB6behj84KOJL0cC8HzOdLwY_Ts';

const resolvedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || FALLBACK_SUPABASE_URL;
const resolvedAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || FALLBACK_SUPABASE_ANON_KEY;

export const SUPABASE_URL = resolvedUrl;
export const SUPABASE_ANON_KEY = resolvedAnonKey;
