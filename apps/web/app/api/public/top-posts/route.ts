import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/server';

const MAX_ITEMS = 25;
const POPULARITY_DECAY_DAYS = 10;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://doendeverde.app';

const computePopularityScore = (upvotes: number, downvotes: number, comments: number, createdAt: string) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const ageDays = Math.max((now - created) / (1000 * 60 * 60 * 24), 0);
  const baseScore = upvotes * 4 + comments * 3 - downvotes * 2;
  const score = baseScore * Math.exp(-ageDays / POPULARITY_DECAY_DAYS);
  return Number.isFinite(score) ? Number(score.toFixed(4)) : 0;
};

const buildPostUrl = (id: string) => `${BASE_URL.replace(/\/$/, '')}/posts/${id}`;

const periodToDate = (period: string) => {
  const now = new Date();
  if (period === 'month') {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  if (period === 'all') {
    return null;
  }
  // week default
  now.setDate(now.getDate() - 7);
  return now.toISOString();
};

const toRss = (posts: TopPost[]) => {
  const items = posts
    .map(post => {
      const description = post.excerpt
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `
      <item>
        <title>${post.title}</title>
        <link>${post.url}</link>
        <guid isPermaLink="true">${post.url}</guid>
        <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
        <description>${description}</description>
      </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Doende Verde — Posts mais votados</title>
      <link>${BASE_URL}</link>
      <description>Top posts da semana na comunidade Doende Verde.</description>
      <language>pt-BR</language>
      ${items}
    </channel>
  </rss>`;
};

type TopPost = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  popularityScore: number;
  upvotes: number;
  downvotes: number;
  voteBalance: number;
  tags: { slug: string; label: string }[];
  url: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();
  const periodParam = (url.searchParams.get('period') ?? 'week').toLowerCase();
  const period = ['week', 'month', 'all'].includes(periodParam) ? periodParam : 'week';
  const supabase = createSupabaseRouteClient();
  let query = supabase
    .from('posts')
    .select(
      `id, title, content, created_at, popularity_score,
       post_votes:post_votes (value),
       comments:comments (id),
       tag_refs:post_tags (tags:tags (slug, label))`
    )
    .eq('is_deleted', false)
    .order('popularity_score', { ascending: false, nullsFirst: true })
    .order('created_at', { ascending: false })
    .limit(MAX_ITEMS);

  const startDate = periodToDate(period);
  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[GET /api/public/top-posts] Supabase error', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar os posts destacados.' },
      { status: 500, headers: { 'Cache-Control': 'public, max-age=60' } }
    );
  }

  const posts: TopPost[] =
    (data ?? []).map(post => {
      const votes = (post.post_votes as { value: number }[] | null) ?? [];
      const comments = (post.comments as { id: string }[] | null) ?? [];
      const upvotes = votes.filter(vote => vote.value === 1).length;
      const downvotes = votes.filter(vote => vote.value === -1).length;
      const voteBalance = upvotes - downvotes;
      const tagRefs = (post.tag_refs as Array<{ tags: { slug: string; label: string } | { slug: string; label: string }[] | null }> | null) ?? [];
      const tags: { slug: string; label: string }[] = [];
      tagRefs.forEach(tagRef => {
        if (!tagRef?.tags) return;
        if (Array.isArray(tagRef.tags)) {
          tagRef.tags.forEach(tag => {
            if (tag && typeof tag.slug === 'string' && typeof tag.label === 'string') {
              tags.push({ slug: tag.slug, label: tag.label });
            }
          });
        } else if (typeof tagRef.tags.slug === 'string' && typeof tagRef.tags.label === 'string') {
          tags.push({ slug: tagRef.tags.slug, label: tagRef.tags.label });
        }
      });

      const popularity =
        post.popularity_score && Number.isFinite(post.popularity_score)
          ? Number(post.popularity_score)
          : computePopularityScore(upvotes, downvotes, comments.length, post.created_at);

      return {
        id: post.id,
        title: post.title,
        excerpt: (post.content ?? '').slice(0, 240),
        createdAt: post.created_at,
        popularityScore: popularity,
        upvotes,
        downvotes,
        voteBalance,
        tags,
        url: buildPostUrl(post.id)
      };
    }) ?? [];

  if (format === 'rss' || format === 'xml') {
    const rss = toRss(posts);
    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      posts,
      period
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=120'
      }
    }
  );
}
