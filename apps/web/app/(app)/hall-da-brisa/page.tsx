import { createSupabaseServerClient } from '@/lib/supabase/server';

type LeaderboardEntry = {
  user_id: string;
  username: string | null;
  xp_gain: number;
  rank: number;
};

const MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉'
};

export const revalidate = 60;

export default async function HallDaBrisaPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('leaderboard_weekly')
    .select('user_id, username, xp_gain, rank')
    .order('rank', { ascending: true })
    .limit(20);

  if (error) {
    console.error('[HallDaBrisaPage] leaderboard query error', error);
  }

  const entries: LeaderboardEntry[] = data ?? [];

  return (
    <main
      style={{
        display: 'grid',
        gap: '2rem',
        padding: '3rem',
        borderRadius: '32px',
        border: '1px solid rgba(23, 62, 48, 0.7)',
        background: 'rgba(5, 28, 20, 0.9)',
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
          Hall da Brisa
        </h1>
        <p style={{ margin: 0, color: '#9AA0A6', fontSize: '1.05rem' }}>
          Top membros que mais conquistaram XP nos últimos 7 dias. Continue compartilhando boas vibrações — o ranking
          é atualizado continuamente.
        </p>
      </header>

      {entries.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            borderRadius: '24px',
            border: '1px dashed rgba(90, 120, 110, 0.5)',
            textAlign: 'center',
            color: '#9AA0A6'
          }}
        >
          Ainda não temos dados suficientes para montar o Hall da Brisa. Assim que a galera começar a gerar XP, o
          ranking aparece aqui automaticamente.
        </div>
      ) : (
        <ol
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: '1rem'
          }}
        >
          {entries.map(entry => {
            const medal = MEDALS[entry.rank];

            return (
              <li
                key={entry.user_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem 2rem',
                  borderRadius: '24px',
                  background:
                    entry.rank <= 3
                      ? 'linear-gradient(135deg, rgba(19, 141, 94, 0.6), rgba(108, 59, 153, 0.35))'
                      : 'rgba(11, 61, 46, 0.45)',
                  border:
                    entry.rank <= 3 ? '1px solid rgba(201, 255, 216, 0.3)' : '1px solid rgba(32, 88, 67, 0.6)',
                  boxShadow: entry.rank <= 3 ? '0 18px 55px rgba(8, 30, 25, 0.45)' : 'none',
                  gap: '1.5rem',
                  color: '#F2E9E4'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '2rem', width: '2.5rem', textAlign: 'center' }}>
                    {medal ?? `#${entry.rank}`}
                  </span>
                  <div style={{ display: 'grid', gap: '0.25rem' }}>
                    <strong style={{ fontSize: '1.2rem' }}>{entry.username ?? 'Usuário misterioso'}</strong>
                    <span style={{ color: 'rgba(242, 233, 228, 0.65)' }}>+{entry.xp_gain} XP na semana</span>
                  </div>
                </div>
                <span
                  style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(201, 255, 216, 0.35)',
                    background: 'rgba(19, 141, 94, 0.3)',
                    fontWeight: 600
                  }}
                >
                  {entry.rank === 1 ? 'Guardião da Brisa' : entry.rank === 2 ? 'Cultivador Estelar' : entry.rank === 3 ? 'Brisa de Ouro' : 'Brisado em Destaque'}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <footer style={{ color: '#9AA0A6', fontSize: '0.9rem' }}>
        Os rankings consideram apenas XP obtido nesta semana e resetam automaticamente toda segunda-feira. Poste, comente
        e receba votos positivos para subir.
      </footer>
    </main>
  );
}
