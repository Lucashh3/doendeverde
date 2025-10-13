import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

export type GamificationSnapshot = {
  xp: number;
  level: string;
  badges: string[];
};

export type GamificationDiff = {
  xpDelta: number;
  previousLevel: string;
  newLevel: string;
  leveledUp: boolean;
  newBadges: string[];
  badgesCount: number;
  currentXp: number;
};

export async function fetchGamificationSnapshot(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<GamificationSnapshot> {
  const profilePromise = supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .maybeSingle();

  const badgesPromise = supabase
    .from('user_badges')
    .select('badge_code')
    .eq('user_id', userId);

  const [profileResult, badgesResult] = await Promise.all([profilePromise, badgesPromise]);

  if (profileResult.error) {
    console.warn('[fetchGamificationSnapshot] profile query error', profileResult.error);
  }

  if (badgesResult.error) {
    console.warn('[fetchGamificationSnapshot] badge query error', badgesResult.error);
  }

  const profileData = (profileResult.data ?? null) as { xp?: number | null; level?: string | null } | null;
  const badgeData = (badgesResult.data ?? []) as Array<{ badge_code?: string | null }>;

  return {
    xp: profileData?.xp ?? 0,
    level: profileData?.level ?? 'Iniciante',
    badges: badgeData
      .map(item => (typeof item?.badge_code === 'string' ? item.badge_code : null))
      .filter((code): code is string => Boolean(code))
  };
}

export function diffGamificationSnapshots(
  before: GamificationSnapshot,
  after: GamificationSnapshot
): GamificationDiff {
  const newBadges = after.badges.filter(code => !before.badges.includes(code));

  return {
    xpDelta: after.xp - before.xp,
    previousLevel: before.level,
    newLevel: after.level,
    leveledUp: before.level !== after.level,
    newBadges,
    badgesCount: after.badges.length,
    currentXp: after.xp
  };
}
