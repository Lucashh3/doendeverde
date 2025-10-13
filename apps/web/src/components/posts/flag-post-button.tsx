'use client';

import { useState, useTransition } from 'react';

import { flagPost } from '@/actions/posts';
import { tokens } from '@doendeverde/ui';

type FlagPostButtonProps = {
  postId: string;
};

export function FlagPostButton({ postId }: FlagPostButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await flagPost(postId, reason);
        setMessage('Obrigado! Nosso time vai revisar esse conteúdo em breve.');
        setReason('');
        setOpen(false);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : 'Não foi possível enviar sua sinalização agora.'
        );
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          border: 'none',
          borderRadius: tokens.radii.pill,
          padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
          background: 'rgba(231, 76, 60, 0.25)',
          color: '#ffb3b3',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Sinalizar post
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: tokens.spacing.sm,
        borderRadius: tokens.radii.md,
        border: `1px solid rgba(231, 76, 60, 0.35)`,
        background: 'rgba(231, 76, 60, 0.15)',
        padding: tokens.spacing.md,
        maxWidth: '480px'
      }}
    >
      <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <span style={{ fontWeight: 600, color: '#ffb3b3' }}>Conte o que está rolando</span>
        <textarea
          value={reason}
          onChange={event => setReason(event.target.value)}
          rows={3}
          minLength={8}
          placeholder="Conte rapidamente por que esse conteúdo precisa de atenção da moderação."
          style={{
            borderRadius: tokens.radii.md,
            border: `1px solid rgba(231, 76, 60, 0.4)`,
            background: 'rgba(17, 94, 72, 0.2)',
            color: tokens.colors.surface,
            padding: tokens.spacing.sm,
            resize: 'vertical'
          }}
        />
      </label>
      <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            border: 'none',
            borderRadius: tokens.radii.pill,
            padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
            background: 'rgba(231, 76, 60, 0.85)',
            color: '#0B1C14',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isPending ? 'Enviando...' : 'Enviar sinalização'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason('');
          }}
          style={{
            border: 'none',
            borderRadius: tokens.radii.pill,
            padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
            background: 'transparent',
            color: '#ffb3b3',
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
      </div>
      {message ? (
        <p style={{ margin: 0, color: '#ffb3b3', fontSize: '0.9rem' }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
