import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { DEFAULT_FEED_PERIOD, DEFAULT_FEED_SORT, FEED_PAGE_SIZE, type FeedPeriod, type FeedSort } from './constants';
import { createSupabaseServerClient } from '../supabase/server';

import type { Database } from '@/types/database';

dayjs.extend(utc);

const POPULARITY_DECAY_DAYS = 10;

const computePopularityScore = (upvotes: number, downvotes: number, comments: number, createdAt: string) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const ageDays = Math.max((now - created) / (1000 * 60 * 60 * 24), 0);
  const baseScore = upvotes * 4 + comments * 3 - downvotes * 2;
  const score = baseScore * Math.exp(-ageDays / POPULARITY_DECAY_DAYS);
  return Number.isFinite(score) ? Number(score.toFixed(4)) : 0;
};

export type FeedFilters = {
  categorySlug?: string | null;
  tagSlug?: string | null;
  sort?: FeedSort | null;
  period?: FeedPeriod | null;
  page?: number | null;
};

export type FeedPost = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  popularityScore: number;
  category: {
    slug: string;
    label: string;
    icon: string | null;
  } | null;
  author: {
    username: string;
    avatarUrl: string | null;
    level: string;
  } | null;
  upvotes: number;
  downvotes: number;
  comments: number;
  tags: { slug: string; label: string }[];
};

type PostRow = Database['public']['Tables']['posts']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const sortColumnFor = (sort: FeedSort): keyof PostRow => {
  switch (sort) {
    case 'popular':
    case 'top-week':
    case 'top-month':
      return 'popularity_score';
    case 'recent':
    default:
      return 'created_at';
  }
};

const periodToDate = (period: FeedPeriod) => {
  switch (period) {
    case 'week':
      return dayjs().utc().subtract(7, 'day').toISOString();
    case 'month':
      return dayjs().utc().subtract(30, 'day').toISOString();
    case 'all':
    default:
      return null;
  }
};

export async function fetchFeedPosts(filters: FeedFilters = {}): Promise<{
  posts: FeedPost[];
  hasMore: boolean;
}> {
  const supabase = createSupabaseServerClient();
  const sort = filters.sort ?? DEFAULT_FEED_SORT;
  const period =
    filters.period ??
    (sort === 'recent' ? 'all' : sort === 'top-month' ? 'month' : DEFAULT_FEED_PERIOD);
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const offset = (page - 1) * FEED_PAGE_SIZE;
  const limit = FEED_PAGE_SIZE;
  const tagSlug = filters.tagSlug ?? null;

  const tagJoin = tagSlug ? 'post_tags!inner' : 'post_tags';
  const tagNested = tagSlug ? 'tags!inner' : 'tags';

  let query = supabase
    .from('posts')
    .select(
      `id, title, content, created_at, popularity_score,
       categories:categories (slug, label, icon),
       author:profiles!posts_author_id_fkey (username, avatar_url, level),
       tag_refs:${tagJoin} (${tagNested} (slug, label)),
       post_votes:post_votes (value),
       comments:comments (id)`,
      { count: 'exact' }
    )
    .order(sortColumnFor(sort) as string, { ascending: false, nullsFirst: true })
    .range(offset, offset + limit - 1);

  if (filters.categorySlug) {
    query.eq('categories.slug', filters.categorySlug);
  }

  if (tagSlug) {
    query.eq('tag_refs.tags.slug', tagSlug);
  }

  const startDate = periodToDate(period);
  if (startDate) {
    query.gte('created_at', startDate);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[fetchFeedPosts] Supabase error', error);
    return { posts: [], hasMore: false };
  }

  const posts: FeedPost[] = (data ?? []).map(post => {
    const rawTagRefs = Array.isArray(post.tag_refs) ? post.tag_refs : [];
    const tags: { slug: string; label: string }[] = [];
    rawTagRefs.forEach((entry: any) => {
      const tagValue = entry?.tags;
      if (Array.isArray(tagValue)) {
        tagValue.forEach(tag => {
          if (tag && typeof tag.slug === 'string' && typeof tag.label === 'string') {
            tags.push({ slug: tag.slug, label: tag.label });
          }
        });
      } else if (tagValue && typeof tagValue.slug === 'string' && typeof tagValue.label === 'string') {
        tags.push({ slug: tagValue.slug, label: tagValue.label });
      }
    });

    const voteRows = (post.post_votes as { value: number }[] | null) ?? [];
    const commentsRows = (post.comments as { id: string }[] | null) ?? [];
    const upvotes = voteRows.filter(vote => vote.value === 1).length;
    const downvotes = voteRows.filter(vote => vote.value === -1).length;

    const categoryValue = post.categories;
    let category: FeedPost['category'] = null;
    if (categoryValue) {
      if (Array.isArray(categoryValue)) {
        const first = categoryValue[0] as CategoryRow | undefined;
        if (first && typeof first.slug === 'string' && typeof first.label === 'string') {
          category = { slug: first.slug, label: first.label, icon: first.icon ?? null };
        }
      } else {
        const row = categoryValue as CategoryRow;
        if (row && typeof row.slug === 'string' && typeof row.label === 'string') {
          category = { slug: row.slug, label: row.label, icon: row.icon ?? null };
        }
      }
    }
    const authorRow = post.author as unknown as ProfileRow | null;
    const author = authorRow
      ? {
          username: authorRow.username,
          avatarUrl: authorRow.avatar_url,
          level: authorRow.level
        }
      : null;

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.created_at,
      popularityScore: computePopularityScore(upvotes, downvotes, commentsRows.length, post.created_at),
      category,
      author,
      upvotes,
      downvotes,
      comments: commentsRows.length,
      tags
    } satisfies FeedPost;
  });

  const hasMore = count !== null ? offset + limit < count : (data?.length ?? 0) === limit;

  return { posts, hasMore };
}

export async function fetchCategories() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('categories')
    .select('slug, label, icon')
    .order('label', { ascending: true });

  if (error) {
    console.error('[fetchCategories] Supabase error', error);
    return [];
  }

  return data ?? [];
}
