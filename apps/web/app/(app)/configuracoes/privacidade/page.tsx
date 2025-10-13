import { redirect } from 'next/navigation';

import { PrivacySettingsForm } from '@/components/settings/privacy-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function PrivacySettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, pseudonymous, share_activity, email_notifications')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem 1.5rem'
      }}
    >
      <PrivacySettingsForm
        username={profile.username}
        defaultValues={{
          pseudonymous: profile.pseudonymous,
          shareActivity: profile.share_activity,
          emailNotifications: profile.email_notifications
        }}
      />
    </main>
  );
}
