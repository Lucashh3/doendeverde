import Image from 'next/image';
import { notFound } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BadgeCode, ProfileLevel } from '@/types/database';

type ProfilePageProps = {
  params: { username: string };
};

type BadgeRecord = {
  badge_code: BadgeCode;
  awarded_at: string | null;
  badges: Array<{
    name: string;
    description: string;
    icon: string | null;
  }>;
};

function avatarDisplay(avatarUrl: string | null) {
  if (!avatarUrl) {
    return { type: 'emoji', value: '🌿' as const };
  }

  if (avatarUrl.startsWith('emoji:')) {
    return { type: 'emoji', value: avatarUrl.split('emoji:')[1] || '🌿' } as const;
  }

  return { type: 'image', value: avatarUrl } as const;
}

function levelLabel(level: ProfileLevel) {
  switch (level) {
    case 'Iniciante':
      return 'Iniciante';
    case 'Entusiasta':
      return 'Entusiasta';
    case 'Grower Sênior':
      return 'Grower Sênior';
    case 'Cultivador Indoor':
      return 'Cultivador Indoor';
    default:
      return 'Explorador';
  }
}

export default async function PerfilPage({ params }: ProfilePageProps) {
  const supabase = createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'id, username, avatar_url, bio, level, xp, pseudonymous, share_activity, onboarding_completed, created_at'
    )
    .eq('username', params.username)
    .maybeSingle();

  if (error) {
    console.error('[PerfilPage] erro ao consultar perfil', error);
  }

  if (!profile) {
    notFound();
  }

  const { data: badgeRows } = await supabase
    .from('user_badges')
    .select('badge_code, awarded_at, badges(name, description, icon)')
    .eq('user_id', profile.id)
    .order('awarded_at', { ascending: false })
    .limit(12);

  const avatar = avatarDisplay(profile.avatar_url);
  const badges: BadgeRecord[] = (badgeRows ?? []).map(row => ({
    badge_code:
      typeof row.badge_code === 'string'
        ? (row.badge_code as BadgeCode)
        : ('primeira-colheita' as BadgeCode),
    awarded_at: row.awarded_at ?? null,
    badges: (row.badges ?? []).map(item => ({
      name: typeof item?.name === 'string' ? item.name : '',
      description: typeof item?.description === 'string' ? item.description : '',
      icon: item?.icon ?? null
    }))
  }));

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '4rem 1.5rem',
        display: 'grid',
        justifyContent: 'center'
      }}
    >
      <article
        style={{
          display: 'grid',
          gap: '2rem',
          padding: '3rem',
          borderRadius: '24px',
          border: '1px solid rgba(23, 62, 48, 0.7)',
          background: 'rgba(5, 28, 20, 0.85)',
          maxWidth: '960px'
        }}
      >
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(11,61,46,0.8) 0%, rgba(108,59,153,0.8) 100%)',
              border: '1px solid rgba(46, 204, 113, 0.4)',
              fontSize: avatar.type === 'emoji' ? '3.25rem' : 'inherit',
              color: '#F2E9E4',
              overflow: 'hidden'
            }}
          >
            {avatar.type === 'emoji' ? (
              <span aria-hidden>{avatar.value}</span>
            ) : (
              <Image src={avatar.value} alt={`Avatar de ${profile.username}`} width={120} height={120} />
            )}
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.5rem',
                margin: 0
              }}
            >
              @{profile.username}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #2ECC71 0%, #6C3B99 100%)',
                color: '#051C14',
                fontWeight: 600,
                width: 'fit-content'
              }}
            >
              {levelLabel(profile.level)}
            </span>
            <p style={{ margin: 0, maxWidth: 520, color: '#9AA0A6', lineHeight: 1.6 }}>
              {profile.bio ?? 'Ainda não preencheu uma bio. Que tal contar qual é a sua brisa?'}
            </p>
            <small style={{ color: '#9AA0A6' }}>
              Na comunidade desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </small>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem'
          }}
        >
          <div
            style={{
              borderRadius: '16px',
              padding: '1.5rem',
              background: 'rgba(11, 61, 46, 0.45)',
              border: '1px solid rgba(46, 204, 113, 0.25)'
            }}
          >
            <strong style={{ color: '#2ECC71', fontSize: '0.85rem', letterSpacing: '0.04em' }}>XP TOTAL</strong>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{profile.xp}</div>
            <p style={{ color: '#9AA0A6', margin: '0.5rem 0 0' }}>
              +5 por post, +2 por comentário, +1 por upvote recebido.
            </p>
          </div>
          <div
            style={{
              borderRadius: '16px',
              padding: '1.5rem',
              background: 'rgba(108, 59, 153, 0.3)',
              border: '1px solid rgba(108, 59, 153, 0.35)'
            }}
          >
            <strong style={{ color: '#F2E9E4', fontSize: '0.85rem', letterSpacing: '0.04em' }}>
              Compromisso
            </strong>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>
              {profile.share_activity ? 'Perfil Público' : 'Modo Anônimo'}
            </div>
            <p style={{ color: '#F2E9E4', margin: '0.5rem 0 0' }}>
              {profile.share_activity
                ? 'Seus posts e conquistas aparecem no feed e em rankings.'
                : 'Você controla quem vê suas atividades.'}
            </p>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '1rem' }}>
          <header>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.5rem',
                margin: 0
              }}
            >
              Badges recentes
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: '#9AA0A6' }}>
              Ganhe badges ao participar do hub e desbloqueie conquistas especiais.
            </p>
          </header>
          {badges.length === 0 ? (
            <p style={{ margin: 0, color: '#9AA0A6' }}>
              Nenhuma badge por enquanto. Participe do feed para conquistar sua primeira insígnia! 🌿
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
              }}
            >
              {badges.map(badge => (
                <li
                  key={`${badge.badge_code}-${badge.awarded_at}`}
                  style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(46, 204, 113, 0.2)',
                    background: 'rgba(11, 61, 46, 0.4)'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>
                    {badge.badges.length > 0 ? badge.badges[0].icon ?? '🏅' : '🏅'}
                  </div>
                  <strong style={{ display: 'block', marginTop: '0.5rem' }}>
                    {badge.badges.length > 0 ? badge.badges[0].name : badge.badge_code}
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', color: '#9AA0A6' }}>
                    {badge.badges.length > 0
                      ? badge.badges[0].description
                      : 'Conquista registrada no Doende Verde.'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </main>
  );
}
