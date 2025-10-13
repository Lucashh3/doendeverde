import { notFound } from 'next/navigation';

import { CommentsSection } from '@/components/posts/comments-section';
import { FlagPostButton } from '@/components/posts/flag-post-button';
import { PostVotePanel } from '@/components/posts/post-vote-panel';
import { fetchPostWithMetadata } from '@/lib/feed/fetch-post';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(iso));

type PostDetailPageProps = {
  params: { id: string };
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const result = await fetchPostWithMetadata(params.id, session?.user.id);

  if (!result) {
    notFound();
  }

  const { post, comments } = result;

  return (
    <main style={{ display: 'grid', gap: '2rem', maxWidth: '960px' }}>
      <article
        style={{
          borderRadius: '32px',
          border: '1px solid rgba(23, 62, 48, 0.7)',
          background: 'rgba(5, 28, 20, 0.85)',
          padding: '3rem',
          display: 'grid',
          gap: '1.5rem'
        }}
      >
        <header style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                background: 'rgba(17, 94, 72, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span aria-hidden>{post.category?.icon ?? '🌿'}</span>
              {post.category?.label ?? 'Categoria livre'}
            </span>
            <time style={{ color: '#9AA0A6' }} dateTime={post.createdAt}>
              {formatDate(post.createdAt)}
            </time>
          </div>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '2.75rem',
              margin: 0
            }}
          >
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', color: '#9AA0A6', alignItems: 'center' }}>
            <span>@{post.author?.username ?? 'anon'}</span>
            <span>•</span>
            <span>{post.author?.level ?? 'Iniciante'}</span>
          </div>
        </header>

        <PostVotePanel
          postId={post.id}
          initialUpvotes={post.upvotes}
          initialDownvotes={post.downvotes}
          initialUserVote={(post.userVote as 1 | -1 | null) ?? null}
        />

        {post.mediaUrl ? (
          <figure style={{ margin: 0 }}>
            <img
              src={post.mediaUrl}
              alt={`Mídia do post ${post.title}`}
              style={{ borderRadius: '24px', objectFit: 'cover', width: '100%', height: 'auto' }}
            />
          </figure>
        ) : null}

        <div style={{ display: 'grid', gap: '1rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
          {post.content?.split('\n').map((paragraph, index) => (
            <p key={index} style={{ margin: 0 }}>
              {paragraph}
            </p>
          ))}
        </div>

        {post.tags.length > 0 ? (
          <footer style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {post.tags.map(tag => (
              <span
                key={tag.slug}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: 'rgba(108, 59, 153, 0.35)',
                  border: '1px solid rgba(108, 59, 153, 0.45)',
                  fontSize: '0.9rem'
                }}
              >
                #{tag.label}
              </span>
            ))}
          </footer>
        ) : null}
        {session ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FlagPostButton postId={post.id} />
          </div>
        ) : null}
      </article>

      <CommentsSection
        postId={post.id}
        comments={comments}
        canComment={Boolean(session)}
        currentUserId={session?.user.id ?? null}
      />
    </main>
  );
}
