'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createComment, type CreateCommentPayload } from '@/actions/posts';
import { useGamificationToasts } from '@/components/gamification/gamification-toast-provider';
import { tokens } from '@doendeverde/ui';

type CommentComposerProps = {
  postId: string;
  parentId?: string | null;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export function CommentComposer({ postId, parentId = null, onSubmitted, onCancel }: CommentComposerProps) {
  const router = useRouter();
  const notifyGamification = useGamificationToasts();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload: CreateCommentPayload = {
      postId,
      body,
      parentId
    };

    startTransition(async () => {
      try {
        const result = await createComment(payload);
        notifyGamification(result.gamification);
        setBody('');
        router.refresh();
        onSubmitted?.();
      } catch (submissionError) {
        console.error('[CommentComposer] create comment error', submissionError);
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : 'Não foi possível enviar seu comentário agora.'
        );
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: tokens.spacing.sm,
        borderRadius: tokens.radii.md,
        border: `1px solid ${tokens.colors.border}`,
        background: 'rgba(11, 61, 46, 0.3)',
        padding: tokens.spacing.md
      }}
    >
      <textarea
        value={body}
        onChange={event => setBody(event.target.value)}
        placeholder={parentId ? 'Responda ao comentário...' : 'Compartilhe sua visão...'}
        required
        minLength={3}
        rows={parentId ? 3 : 4}
        style={{
          padding: tokens.spacing.sm,
          borderRadius: tokens.radii.md,
          border: `1px solid ${tokens.colors.border}`,
          background: 'rgba(5, 28, 20, 0.6)',
          color: tokens.colors.surface,
          resize: 'vertical'
        }}
      />
      {error ? (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: tokens.spacing.xs,
            borderRadius: tokens.radii.md,
            border: `1px solid ${tokens.colors.secondary}`,
            background: 'rgba(165, 99, 54, 0.2)'
          }}
        >
          {error}
        </p>
      ) : null}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.sm }}>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            style={{
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radii.pill,
              background: 'transparent',
              color: tokens.colors.surface,
              padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
              cursor: pending ? 'wait' : 'pointer'
            }}
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          style={{
            border: 'none',
            borderRadius: tokens.radii.pill,
            background: tokens.gradients.cta,
            color: tokens.colors.surface,
            padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
            fontWeight: 600,
            cursor: pending ? 'wait' : 'pointer'
          }}
        >
          {pending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
}
