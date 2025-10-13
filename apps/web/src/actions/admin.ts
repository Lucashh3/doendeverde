'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerActionClient } from '@/lib/supabase/server';

type ModerationStatus = 'active' | 'shadowbanned' | 'banned';
type FlagStatus = 'pending' | 'reviewed' | 'dismissed';

async function ensureAdmin() {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user },
    error: sessionError
  } = await supabase.auth.getUser();

  if (sessionError) {
    console.error('[ensureAdmin] session error', sessionError);
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  if (!user) {
    throw new Error('Acesso restrito a administradores.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[ensureAdmin] profile error', profileError);
    throw new Error('Não foi possível validar permissões.');
  }

  if (!profile?.is_admin) {
    throw new Error('Acesso restrito a administradores.');
  }

  return { supabase, user };
}

export async function setUserModerationStatus(userId: string, status: ModerationStatus, reason?: string) {
  const { supabase } = await ensureAdmin();

  const { error } = await supabase.rpc('admin_update_moderation_status', {
    target_user: userId,
    new_status: status,
    reason: reason ?? null
  });

  if (error) {
    console.error('[setUserModerationStatus] rpc error', error);
    throw new Error('Não foi possível atualizar o status do usuário.');
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function removePostAsAdmin(postId: string, reason?: string) {
  const { supabase } = await ensureAdmin();

  const { error } = await supabase.rpc('admin_remove_post', {
    target_post: postId,
    reason: reason ?? null
  });

  if (error) {
    console.error('[removePostAsAdmin] rpc error', error);
    throw new Error('Não foi possível remover o post.');
  }

  revalidatePath('/admin');
  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

export async function restorePostAsAdmin(postId: string, reason?: string) {
  const { supabase } = await ensureAdmin();

  const { error } = await supabase.rpc('admin_restore_post', {
    target_post: postId,
    reason: reason ?? null
  });

  if (error) {
    console.error('[restorePostAsAdmin] rpc error', error);
    throw new Error('Não foi possível restaurar o post.');
  }

  revalidatePath('/admin');
  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

export async function updatePostFlag(flagId: string, status: FlagStatus, notes?: string) {
  const { supabase, user } = await ensureAdmin();

  const { error } = await supabase
    .from('post_flags')
    .update({
      status,
      resolution_notes: notes ?? null,
      reviewed_at: new Date().toISOString(),
      reviewer_id: user.id
    })
    .eq('id', flagId);

  if (error) {
    console.error('[updatePostFlag] update error', error);
    throw new Error('Não foi possível atualizar o flag.');
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function resolveAlert(alertId: string) {
  const { supabase, user } = await ensureAdmin();

  const { error } = await supabase
    .from('moderation_alerts')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id
    })
    .eq('id', alertId);

  if (error) {
    console.error('[resolveAlert] update error', error);
    throw new Error('Não foi possível resolver o alerta.');
  }

  revalidatePath('/admin');
  return { success: true };
}
