'use client';

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, type Session } from '@supabase/auth-helpers-react';
import { useState } from 'react';

import { GamificationToastProvider } from '@/components/gamification/gamification-toast-provider';
import type { Database } from '@/types/database';

type ProvidersProps = {
  children: React.ReactNode;
  initialSession: Session | null;
};

export function Providers({ children, initialSession }: ProvidersProps) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      <GamificationToastProvider>{children}</GamificationToastProvider>
    </SessionContextProvider>
  );
}
