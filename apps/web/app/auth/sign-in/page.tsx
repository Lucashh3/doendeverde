import { redirect } from 'next/navigation';

import { SignInCard } from '@/components/auth/sign-in-card';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function SignInPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/onboarding');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem'
      }}
    >
      <SignInCard />
    </main>
  );
}
