import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const term = url.searchParams.get('q') ?? '';
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 20) : 8;

  const supabase = createSupabaseRouteClient();

  const { data, error } = await supabase.rpc('search_tags', {
    term: term.trim() === '' ? null : term.trim(),
    limit_count: limit
  });

  if (error) {
    console.error('[GET /api/tags/search] Supabase RPC error', error);
    return NextResponse.json({ tags: [], error: 'Não foi possível buscar tags agora.' }, { status: 500 });
  }

  return NextResponse.json({ tags: data ?? [] });
}
