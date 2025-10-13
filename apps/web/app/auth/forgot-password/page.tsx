import { redirect } from 'next/navigation';

import { ForgotPasswordCard } from '@/components/auth/forgot-password-card';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ForgotPasswordPage() {
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
      <ForgotPasswordCard />
    </main>
  );
}