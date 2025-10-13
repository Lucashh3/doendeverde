'use server';

import { revalidatePath } from 'next/cache';

import { logAuditEvent } from '@/lib/audit/log-event';
import { createSupabaseServerActionClient } from '@/lib/supabase/server';

export type OnboardingPayload = {
  username: string;
  avatarUrl?: string | null;
  persona: 'Cultivador' | 'Curioso' | 'Viajado' | 'Guardião';
  anonymousMode: boolean;
};

export type PrivacySettingsPayload = {
  pseudonymous: boolean;
  shareActivity: boolean;
  emailNotifications: boolean;
};

export async function completeOnboarding(payload: OnboardingPayload) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user },
    error: sessionError
  } = await supabase.auth.getUser();

  if (sessionError) {
    console.error('[completeOnboarding] Failed to fetch user session', sessionError);
    throw new Error('Não foi possível validar sua sessão. Faça login novamente.');
  }

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  const profileUpsert = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username: payload.username,
      avatar_url: payload.avatarUrl ?? null,
      pseudonymous: payload.anonymousMode,
      share_activity: !payload.anonymousMode,
      email_notifications: false,
      onboarding_completed: true,
      level: 'Iniciante',
      xp: 0
    },
    { onConflict: 'id' }
  );

  if (profileUpsert.error) {
    console.error('[completeOnboarding] Upsert error', profileUpsert.error);
    throw new Error('Erro ao salvar seu perfil. Tente novamente em instantes.');
  }

  await logAuditEvent(supabase, 'onboarding_completed', {
    persona: payload.persona,
    anonymousMode: payload.anonymousMode
  });

  revalidatePath('/perfil');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function updatePrivacySettings(payload: PrivacySettingsPayload) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user },
    error: sessionError
  } = await supabase.auth.getUser();

  if (sessionError) {
    console.error('[updatePrivacySettings] Failed to fetch user session', sessionError);
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  const update = await supabase
    .from('profiles')
    .update({
      pseudonymous: payload.pseudonymous,
      share_activity: payload.shareActivity,
      email_notifications: payload.emailNotifications
    })
    .eq('id', user.id);

  if (update.error) {
    console.error('[updatePrivacySettings] Update error', update.error);
    throw new Error('Não foi possível atualizar suas preferências. Tente novamente.');
  }

  await logAuditEvent(supabase, 'privacy_settings_updated', payload);

  revalidatePath('/configuracoes/privacidade');

  return { success: true };
}
