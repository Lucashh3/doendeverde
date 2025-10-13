import { cookies } from 'next/headers';
import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient
} from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/types/database';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

export const createSupabaseServerClient = () =>
  createServerComponentClient<Database>(
    { cookies },
    { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY }
  );

export const createSupabaseServerActionClient = () =>
  createServerActionClient<Database>(
    { cookies },
    { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY }
  );

export const createSupabaseRouteClient = () =>
  createRouteHandlerClient<Database>(
    { cookies },
    { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY }
  );
