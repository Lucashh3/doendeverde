import { redirect } from 'next/navigation';

import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { OnboardingPayload } from '@/actions/profiles';

function generateSuggestedUsername(email?: string | null, fullName?: string | null) {
  if (fullName) {
    const sanitized = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);
    if (sanitized) {
      return `${sanitized}_${Math.floor(Math.random() * 999) + 1}`;
    }
  }

  if (email) {
    const handle = email.split('@')[0]?.replace(/[^a-z0-9]/gi, '').slice(0, 10);
    if (handle) {
      return `verde_${handle}`;
    }
  }

  return `brisado_${Math.floor(Math.random() * 9999)}`;
}

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .maybeSingle();

  if (existingProfile?.username) {
    redirect(`/perfil/${existingProfile.username}`);
  }

  const metadata = session.user.user_metadata as Record<string, string | null | undefined>;
  const suggestedUsername = generateSuggestedUsername(session.user.email, metadata?.full_name);
  const defaultPersona: OnboardingPayload['persona'] =
    (metadata?.onboardingPersona as OnboardingPayload['persona']) ?? 'Curioso';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem'
      }}
    >
      <OnboardingForm suggestedUsername={suggestedUsername} defaultPersona={defaultPersona} />
    </main>
  );
}
