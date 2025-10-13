import { createSupabaseServerClient } from '@/lib/supabase/server';

type LevelThreshold = {
  level: string;
  min_xp: number;
  description: string | null;
};

type Badge = {
  code: string;
  name: string;
  description: string;
  icon: string | null;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(iso));

export default async function ConquistasPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <main
        style={{
          padding: '3rem',
          borderRadius: '32px',
          border: '1px solid rgba(23, 62, 48, 0.7)',
          background: 'rgba(5, 28, 20, 0.9)',
          color: '#F2E9E4',
          maxWidth: '900px'
        }}
      >
        <h1 style={{ marginTop: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.75rem' }}>
          Conquistas da comunidade
        </h1>
        <p style={{ color: '#9AA0A6', fontSize: '1.05rem' }}>
          Faça login para acompanhar seu progresso, níveis e badges desbloqueadas. Você já está a um clique de fazer parte
          do Hall da Brisa!
        </p>
      </main>
    );
  }

  const userId = session.user.id;

  const [profileResult, levelsResult, badgesResult, userBadgesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, display_name, xp, level')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('level_thresholds').select('level, min_xp, description'),
    supabase.from('badges').select('code, name, description, icon'),
    supabase.from('user_badges').select('badge_code, awarded_at').eq('user_id', userId)
  ]);

  if (profileResult.error) {
    console.error('[ConquistasPage] profile query error', profileResult.error);
  }
  if (levelsResult.error) {
    console.error('[ConquistasPage] levels query error', levelsResult.error);
  }
  if (badgesResult.error) {
    console.error('[ConquistasPage] badges query error', badgesResult.error);
  }
  if (userBadgesResult.error) {
    console.error('[ConquistasPage] user badges query error', userBadgesResult.error);
  }

  const profile = profileResult.data;
  const levelThresholds = ((levelsResult.data ?? []) as LevelThreshold[]).sort(
    (a, b) => a.min_xp - b.min_xp
  );
  const badges = ((badgesResult.data ?? []) as Badge[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const userBadges = userBadgesResult.data ?? [];

  if (!profile) {
    return (
      <main
        style={{
          padding: '3rem',
          borderRadius: '32px',
          border: '1px solid rgba(23, 62, 48, 0.7)',
          background: 'rgba(5, 28, 20, 0.9)',
          color: '#F2E9E4',
          maxWidth: '900px'
        }}
      >
        <h1 style={{ marginTop: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.75rem' }}>
          Complete seu perfil
        </h1>
        <p style={{ color: '#9AA0A6', fontSize: '1.05rem' }}>
          Ainda não encontramos seu perfil completo. Finalize o onboarding para começar a acumular XP e desbloquear
          conquistas exclusivas.
        </p>
      </main>
    );
  }

  const currentLevelThreshold =
    levelThresholds.find(level => level.level === profile.level) ?? levelThresholds[0] ?? null;
  const nextLevelThreshold =
    levelThresholds.find(level => level.min_xp > profile.xp) ?? levelThresholds[levelThresholds.length - 1] ?? null;

  const currentLevelBase = currentLevelThreshold?.min_xp ?? 0;
  const nextLevelTargetMin = nextLevelThreshold?.min_xp ?? currentLevelBase;
  const progressDenominator = Math.max(nextLevelTargetMin - currentLevelBase, 1);
  const progressNumerator = Math.max(profile.xp - currentLevelBase, 0);
  const progressPct = Math.min(1, progressNumerator / progressDenominator);

  const xpToNextLevel =
    nextLevelTargetMin > profile.xp ? nextLevelTargetMin - profile.xp : null;

  const earnedBadgeMap = new Map(userBadges.map(item => [item.badge_code, item.awarded_at]));

  const decoratedBadges = badges.map(badge => ({
    badge,
    earned: earnedBadgeMap.has(badge.code),
    awardedAt: earnedBadgeMap.get(badge.code) ?? null
  }));

  const earnedCount = decoratedBadges.filter(item => item.earned).length;

  return (
    <main
      style={{
        display: 'grid',
        gap: '2.5rem',
        padding: '3rem',
        borderRadius: '32px',
        border: '1px solid rgba(23, 62, 48, 0.7)',
        background: 'rgba(5, 28, 20, 0.9)',
        color: '#F2E9E4',
        maxWidth: '960px'
      }}
    >
      <header style={{ display: 'grid', gap: '0.75rem' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '3rem'
          }}
        >
          Suas conquistas
        </h1>
        <p style={{ margin: 0, color: '#9AA0A6', fontSize: '1.05rem' }}>
          {profile.display_name ?? profile.username ?? 'Você'} está no nível{' '}
          <strong style={{ color: '#F2E9E4' }}>{profile.level}</strong> com{' '}
          <strong style={{ color: '#F2E9E4' }}>{profile.xp} XP</strong>. Continue participando para desbloquear todos os
          badges e entrar para o Hall da Brisa.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gap: '1.5rem',
          padding: '2rem',
          borderRadius: '28px',
          border: '1px solid rgba(108, 59, 153, 0.45)',
          background: 'linear-gradient(135deg, rgba(19, 141, 94, 0.35), rgba(108, 59, 153, 0.25))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Progresso de nível</h2>
            <p style={{ margin: 0, color: '#E0E6E9' }}>
              {xpToNextLevel === null
                ? 'Você atingiu o nível máximo disponível — continue inspirando a comunidade!'
                : `Faltam apenas ${xpToNextLevel} XP para chegar ao nível ${nextLevelThreshold?.level ?? profile.level}.`}
            </p>
          </div>
          <span
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(201, 255, 216, 0.4)',
              background: 'rgba(19, 141, 94, 0.3)',
              fontWeight: 600
            }}
          >
            {Math.round(progressPct * 100)}% do nível atual
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '12px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${Math.round(progressPct * 100)}%`,
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, rgba(54, 190, 145, 1), rgba(108, 59, 153, 1))',
              transition: 'width 0.6s ease'
            }}
          />
        </div>

        {currentLevelThreshold?.description ? (
          <p style={{ margin: 0, color: '#D6F0E2', fontSize: '0.95rem' }}>
            {currentLevelThreshold.description}
          </p>
        ) : null}
      </section>

      <section style={{ display: 'grid', gap: '1.25rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Badges disponíveis</h2>
          <span style={{ color: '#9AA0A6' }}>
            {earnedCount}/{decoratedBadges.length} desbloqueadas
          </span>
        </header>
        <div
          style={{
            display: 'grid',
            gap: '1.25rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
          }}
        >
          {decoratedBadges.map(({ badge, earned, awardedAt }) => (
            <article
              key={badge.code}
              style={{
                borderRadius: '24px',
                border: earned ? '1px solid rgba(201, 255, 216, 0.4)' : '1px solid rgba(40, 86, 68, 0.6)',
                background: earned ? 'rgba(19, 141, 94, 0.25)' : 'rgba(11, 61, 46, 0.35)',
                padding: '1.5rem',
                display: 'grid',
                gap: '0.75rem',
                color: earned ? '#F2E9E4' : '#9AA0A6'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{badge.icon ?? '🏅'}</span>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <strong style={{ fontSize: '1.25rem', color: earned ? '#F2E9E4' : '#D6D6D6' }}>
                  {badge.name}
                </strong>
                <p style={{ margin: 0 }}>{badge.description}</p>
              </div>
              <span
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: earned ? 'rgba(201, 255, 216, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  border: earned ? '1px solid rgba(201, 255, 216, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: earned ? '#DEFBE6' : '#A4B0A8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {earned ? `Conquistado em ${awardedAt ? formatDate(awardedAt) : 'data desconhecida'}` : 'Ainda não conquistado'}
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
