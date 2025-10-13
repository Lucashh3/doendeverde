import Link from 'next/link';

import type { FeedPost } from '@/lib/feed/fetch-feed';

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));

type FeedListProps = {
  posts: FeedPost[];
};

export function FeedList({ posts }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div
        style={{
          padding: '3rem',
          borderRadius: '24px',
          border: '1px dashed rgba(46, 204, 113, 0.35)',
          background: 'rgba(11, 61, 46, 0.25)',
          textAlign: 'center'
        }}
      >
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.5rem' }}>Sem posts ainda</h2>
        <p style={{ color: '#9AA0A6', margin: 0 }}>
          Seja o primeiro a compartilhar uma brisa nessa categoria!
        </p>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1.5rem' }}>
      {posts.map(post => {
        const voteBalance = post.upvotes - post.downvotes;
        const popularity = Math.round(post.popularityScore);
        return (
          <li
            key={post.id}
            style={{
              borderRadius: '24px',
              border: '1px solid rgba(23, 62, 48, 0.7)',
              background: 'rgba(5, 28, 20, 0.8)',
              padding: '2rem',
              display: 'grid',
              gap: '1rem'
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      background: 'rgba(17, 94, 72, 0.6)',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span aria-hidden>{post.category?.icon ?? '🌿'}</span>
                    {post.category?.label ?? 'Sem categoria'}
                  </span>
                  <span style={{ color: '#9AA0A6', fontSize: '0.85rem' }}>{formatDate(post.createdAt)}</span>
                </div>
                <Link
                  href={`/posts/${post.id}`}
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#F2E9E4'
                  }}
                >
                  {post.title}
                </Link>
                {post.content ? (
                  <p style={{ margin: 0, color: '#C8D1CC', lineHeight: 1.6 }}>{post.content.slice(0, 200)}...</p>
                ) : null}
              </div>
              <div
                style={{
                  borderRadius: '16px',
                  border: '1px solid rgba(46, 204, 113, 0.35)',
                  padding: '0.75rem 1rem',
                  textAlign: 'right',
                  minWidth: '120px'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2ECC71' }}>
                  {Number.isFinite(popularity) ? popularity : voteBalance}
                </div>
                <small style={{ display: 'block', color: '#9AA0A6' }}>
                  {Number.isFinite(popularity) ? 'popularidade' : 'saldo votos'}
                </small>
              </div>
            </header>

            {post.tags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {post.tags.map(tag => (
                  <span
                    key={tag.slug}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      background: 'rgba(108, 59, 153, 0.3)',
                      border: '1px solid rgba(108, 59, 153, 0.45)',
                      fontSize: '0.85rem',
                      color: '#E8DAFF'
                    }}
                  >
                    #{tag.label}
                  </span>
                ))}
              </div>
            ) : null}

            <footer style={{ display: 'flex', justifyContent: 'space-between', color: '#9AA0A6' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link href={`/perfil/${post.author?.username ?? ''}`} style={{ color: '#9AA0A6' }}>
                  @{post.author?.username ?? 'anon'}
                </Link>
                <span>{post.author?.level ?? 'Iniciante'}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontWeight: 600 }}>
                <span>▲ {post.upvotes}</span>
                <span>▼ {post.downvotes}</span>
                <span>💬 {post.comments}</span>
                <span>⚡ {voteBalance}</span>
              </div>
            </footer>
          </li>
        );
      })}
    </ul>
  );
}
