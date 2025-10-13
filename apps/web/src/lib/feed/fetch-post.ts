import { createSupabaseServerClient } from '@/lib/supabase/server';


export type PostDetail = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  mediaUrl: string | null;
  mediaType: string | null;
  category: {
    slug: string;
    label: string;
    icon: string | null;
  } | null;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    level: string;
  } | null;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  tags: { slug: string; label: string }[];
  userVote: number | null;
};

export type PostComment = {
  id: string;
  postId: string;
  body: string;
  createdAt: string;
  depth: number;
  parentId: string | null;
  upvotes: number;
  downvotes: number;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    level: string;
  } | null;
  isDeleted: boolean;
};

type PostVoteRow = { value: number };
type CommentVoteRow = { value: number };

export async function fetchPostWithMetadata(postId: string, userId?: string | null) {
  const supabase = createSupabaseServerClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select(
      `id, title, content, created_at, media_url, media_type,
       categories:categories(slug, label, icon),
       author:profiles!posts_author_id_fkey(id, username, avatar_url, level),
       post_votes:post_votes (value, user_id),
       post_tags:post_tags (tag:tags(slug, label)),
       comments:comments (id)
      `
    )
    .eq('id', postId)
    .maybeSingle();

  if (error) {
    console.error('[fetchPostWithMetadata] error', error);
    return null;
  }

  if (!post) {
    return null;
  }

  const votes = (post.post_votes ?? []) as Array<PostVoteRow & { user_id: string }>;
  const upvotes = votes.filter(vote => vote.value === 1).length;
  const downvotes = votes.filter(vote => vote.value === -1).length;
  const userVote = userId ? votes.find(vote => vote.user_id === userId)?.value ?? null : null;

  const tags = (post.post_tags ?? []).flatMap(entry => {
    const value: any = entry?.tag;
    if (!value) return [] as { slug: string; label: string }[];
    if (Array.isArray(value)) {
      return value
        .map(tag => (tag && typeof tag.slug === 'string' && typeof tag.label === 'string' ? { slug: tag.slug, label: tag.label } : null))
        .filter((tag): tag is { slug: string; label: string } => Boolean(tag));
    }
    if (typeof value.slug === 'string' && typeof value.label === 'string') {
      return [{ slug: value.slug, label: value.label }];
    }
    return [] as { slug: string; label: string }[];
  });

  const categoryValue: any = post.categories;
  let category: PostDetail['category'] = null;
  if (categoryValue) {
    if (Array.isArray(categoryValue)) {
      const first = categoryValue[0];
      if (first && typeof first.slug === 'string' && typeof first.label === 'string') {
        category = { slug: first.slug, label: first.label, icon: first.icon ?? null };
      }
    } else if (typeof categoryValue.slug === 'string' && typeof categoryValue.label === 'string') {
      category = { slug: categoryValue.slug, label: categoryValue.label, icon: categoryValue.icon ?? null };
    }
  }

  const authorValue: any = post.author;
  const author: PostDetail['author'] = authorValue && typeof authorValue.username === 'string'
    ? {
        id: authorValue.id ? String(authorValue.id) : '',
        username: authorValue.username,
        avatarUrl: authorValue.avatar_url ?? null,
        level: typeof authorValue.level === 'string' ? authorValue.level : 'Iniciante'
      }
    : null;

  const detail: PostDetail = {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.created_at,
    mediaUrl: post.media_url,
    mediaType: post.media_type,
    category,
    author,
    upvotes,
    downvotes,
    commentsCount: (post.comments ?? []).length,
    tags: tags.map(tag => ({ slug: tag.slug, label: tag.label })),
    userVote
  };

  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select(
      `id, post_id, body, created_at, depth, parent_comment_id, is_deleted,
       author:profiles!comments_author_id_fkey(id, username, avatar_url, level),
       comment_votes:comment_votes (value)`
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error('[fetchPostWithMetadata] comments error', commentsError);
  }

  const comments: PostComment[] = (commentsData ?? []).map(comment => {
    const votes = (comment.comment_votes ?? []) as CommentVoteRow[];
    const upvotes = votes.filter(vote => vote.value === 1).length;
    const downvotes = votes.filter(vote => vote.value === -1).length;
    return {
      id: comment.id,
      postId: comment.post_id,
      body: comment.body,
      createdAt: comment.created_at,
      depth: comment.depth,
      parentId: comment.parent_comment_id,
      upvotes,
      downvotes,
      author: comment.author as unknown as PostComment['author'],
      isDeleted: comment.is_deleted ?? false
    };
  });

  return { post: detail, comments };
}
