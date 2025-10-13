'use client';

import { useState, useTransition } from 'react';

import { removePostAsAdmin, restorePostAsAdmin, updatePostFlag } from '@/actions/admin';

type FlagRecord = {
  id: string;
  post_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  resolution_notes: string | null;
  posts: {
    id: string;
    title: string;
    is_deleted: boolean;
    created_at: string;
    author: {
      id: string;
      username: string;
      moderation_status: string;
    } | null;
  } | null;
  reporter: {
    id: string;
    username: string;
    level: string;
  } | null;
  reviewer: {
    id: string;
    username: string;
  } | null;
};

type AdminFlagListProps = {
  flags: FlagRecord[];
};

export function AdminFlagList({ flags }: AdminFlagListProps) {
  if (flags.length === 0) {
    return (
      <p style={{ color: '#9AA0A6', margin: 0 }}>
        Nenhum flag recebido. A comunidade está tranquila por enquanto. 🌿
      </p>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {flags.map(flag => (
        <FlagCard key={flag.id} flag={flag} />
      ))}
    </div>
  );
}

function FlagCard({ flag }: { flag: FlagRecord }) {
  const [notes, setNotes] = useState(flag.resolution_notes ?? '');
  const [isPending, startTransition] = useTransition();

  const handleFlagUpdate = (status: 'reviewed' | 'dismissed') => {
    startTransition(async () => {
      await updatePostFlag(flag.id, status, notes);
    });
  };

  const handleRemovePost = () => {
    startTransition(async () => {
      await removePostAsAdmin(flag.post_id, notes || flag.reason || undefined);
      await updatePostFlag(flag.id, 'reviewed', notes || 'Post removido pela moderação.');
    });
  };

  const handleRestorePost = () => {
    startTransition(async () => {
      await restorePostAsAdmin(flag.post_id, 'Conteúdo restaurado após revisão');
      await updatePostFlag(flag.id, 'reviewed', notes || 'Post restaurado.');
    });
  };

  const post = flag.posts;
  const author = post?.author;
  const reporter = flag.reporter;

  return (
    <article
      style={{
        borderRadius: '18px',
        border: '1px solid rgba(108, 59, 153, 0.35)',
        background: 'rgba(5, 28, 20, 0.8)',
        padding: '1.5rem',
        display: 'grid',
        gap: '1rem'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#F2E9E4' }}>
            {post?.title ?? 'Post removido'}
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', color: '#9AA0A6', fontSize: '0.9rem' }}>
            <span>Autor: @{author?.username ?? 'desconhecido'} ({author?.moderation_status ?? 'n/a'})</span>
            <span>Flag por: @{reporter?.username ?? 'anônimo'}</span>
            <span>Criado em: {new Date(flag.created_at).toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <StatusBadge status={flag.status} />
      </header>

      {flag.reason ? (
        <p style={{ margin: 0, color: '#E8DAFF' }}>
          <strong>Motivo:</strong> {flag.reason}
        </p>
      ) : null}

      <textarea
        value={notes}
        onChange={event => setNotes(event.target.value)}
        placeholder="Notas internas / resolução"
        rows={3}
        style={{
          width: '100%',
          resize: 'vertical',
          borderRadius: '12px',
          border: '1px solid rgba(108, 59, 153, 0.45)',
          background: 'rgba(17, 94, 72, 0.35)',
          color: '#F2E9E4',
          padding: '0.75rem'
        }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handleRemovePost}
          disabled={isPending}
          style={buttonStyle('#ff6b6b')}
        >
          Remover post
        </button>
        <button
          type="button"
          onClick={() => handleFlagUpdate('reviewed')}
          disabled={isPending}
          style={buttonStyle('#2ecc71')}
        >
          Marcar como revisado
        </button>
        <button
          type="button"
          onClick={() => handleFlagUpdate('dismissed')}
          disabled={isPending}
          style={buttonStyle('#f1c40f')}
        >
          Dispensa
        </button>
        {post?.is_deleted ? (
          <button
            type="button"
            onClick={handleRestorePost}
            disabled={isPending}
            style={buttonStyle('#8e44ad')}
          >
            Restaurar post
          </button>
        ) : null}
      </div>

      {flag.reviewer ? (
        <footer style={{ fontSize: '0.85rem', color: '#9AA0A6' }}>
          Revisado por @{flag.reviewer.username}{' '}
          {flag.reviewed_at ? `em ${new Date(flag.reviewed_at).toLocaleString('pt-BR')}` : ''}
        </footer>
      ) : null}
    </article>
  );
}

const buttonStyle = (background: string): React.CSSProperties => ({
  border: 'none',
  borderRadius: '999px',
  padding: '0.5rem 1.25rem',
  color: '#0B1C14',
  fontWeight: 600,
  background,
  cursor: 'pointer'
});

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(241, 196, 15, 0.2)', text: '#f1c40f' },
    reviewed: { bg: 'rgba(46, 204, 113, 0.25)', text: '#2ecc71' },
    dismissed: { bg: 'rgba(108, 59, 153, 0.25)', text: '#b482f7' }
  };
  const color = colors[status] ?? colors.pending;

  return (
    <span
      style={{
        padding: '0.4rem 1rem',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: 600,
        background: color.bg,
        color: color.text,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}
    >
      {status}
    </span>
  );
}
