import { redirect } from 'next/navigation';

import { AdminAlertsList } from '@/components/admin/admin-alerts-list';
import { AdminFlagList } from '@/components/admin/admin-flag-list';
import { AdminUserList } from '@/components/admin/admin-user-list';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const revalidate = 15;

type FlagRecord = {
  id: string;
  post_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  resolution_notes: string | null;
  posts: {
    id: string;
    title: string;
    is_deleted: boolean;
    created_at: string;
    author: {
      id: string;
      username: string;
      moderation_status: string;
    } | null;
  } | null;
  reporter: {
    id: string;
    username: string;
    level: string;
  } | null;
  reviewer: {
    id: string;
    username: string;
  } | null;
};

type AlertRecord = {
  id: string;
  alert_type: string;
  severity: string;
  metadata: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
  user: {
    id: string;
    username: string;
  } | null;
  resolver: {
    id: string;
    username: string;
  } | null;
};

type UserRecord = {
  id: string;
  username: string;
  display_name: string | null;
  moderation_status: string;
  is_admin: boolean;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect('/');
  }

  const [{ data: flagsData }, { data: alertsData }, { data: usersData }] = await Promise.all([
    supabase
      .from('post_flags')
      .select(
        `
        id,
        post_id,
        reason,
        status,
        created_at,
        reviewed_at,
        resolution_notes,
        posts:post_id (
          id,
          title,
          is_deleted,
          created_at,
          author:profiles!posts_author_id_fkey (
            id,
            username,
            moderation_status
          )
        ),
        reporter:profiles!post_flags_reporter_id_fkey (
          id,
          username,
          level
        ),
        reviewer:profiles!post_flags_reviewer_id_fkey (
          id,
          username
        )
      `
      )
      .order('status', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('moderation_alerts')
      .select(
        `
        id,
        alert_type,
        severity,
        metadata,
        created_at,
        resolved_at,
        user:profiles!moderation_alerts_user_id_fkey (
          id,
          username
        ),
        resolver:profiles!moderation_alerts_resolved_by_fkey (
          id,
          username
        )
      `
      )
      .order('resolved_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('profiles')
      .select('id, username, display_name, moderation_status, is_admin, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
  ]);

  const flags = (flagsData ?? []) as unknown as FlagRecord[];
  const alerts = (alertsData ?? []) as unknown as AlertRecord[];
  const users = (usersData ?? []) as unknown as UserRecord[];

  return (
    <main style={{ display: 'grid', gap: '2rem' }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.75rem' }}>
          Painel de Moderação
        </h1>
        <p style={{ marginTop: '0.5rem', color: '#9AA0A6' }}>
          Revise flags da comunidade, aplique ações rápidas e monitore alertas automatizados de comportamento suspeito.
        </p>
      </header>

      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Flags enviados pela comunidade</h2>
        <AdminFlagList flags={flags} />
      </section>

      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Alertas automáticos</h2>
        <AdminAlertsList alerts={alerts} />
      </section>

      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Usuários</h2>
        <AdminUserList users={users} />
      </section>
    </main>
  );
}
