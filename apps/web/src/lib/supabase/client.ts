'use client';

import { createBrowserSupabaseClient, type SupabaseClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/types/database';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

let client: SupabaseClient<Database> | null = null;

export const getSupabaseBrowserClient = () => {
  if (!client) {
    client = createBrowserSupabaseClient<Database>({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY
    });
  }

  return client;
};
