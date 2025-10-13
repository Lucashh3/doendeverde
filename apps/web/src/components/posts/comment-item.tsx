'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { deleteComment, updateComment } from '@/actions/posts';
import type { PostComment } from '@/lib/feed/fetch-post';
import { tokens } from '@doendeverde/ui';

import { CommentComposer } from './comment-composer';

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));

type CommentItemProps = {
  comment: PostComment;
  postId: string;
  allowReply: boolean;
  currentUserId: string | null;
  children?: React.ReactNode;
};

export function CommentItem({ comment, postId, allowReply, currentUserId, children }: CommentItemProps) {
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, startUpdate] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const isOwnComment = currentUserId != null && comment.author?.id === currentUserId;
  const isDeleted = comment.isDeleted;

  const handleUpdate = () => {
    setError(null);
    startUpdate(async () => {
      try {
        await updateComment(comment.id, editBody);
        setIsEditing(false);
        router.refresh();
      } catch (updateError) {
        console.error('[CommentItem] update error', updateError);
        setError(
          updateError instanceof Error
            ? updateError.message
            : 'Não foi possível editar seu comentário agora.'
        );
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startDelete(async () => {
      try {
        await deleteComment(comment.id);
        router.refresh();
      } catch (deleteError) {
        console.error('[CommentItem] delete error', deleteError);
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : 'Não foi possível remover seu comentário agora.'
        );
      }
    });
  };

  return (
    <li
      style={{
        listStyle: 'none',
        borderRadius: tokens.radii.md,
        border: `1px solid ${tokens.colors.border}`,
        background: 'rgba(5, 28, 20, 0.65)',
        padding: tokens.spacing.md,
        display: 'grid',
        gap: tokens.spacing.sm
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: tokens.spacing.sm, alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>@{comment.author?.username ?? 'anon'}</span>
          <span style={{ color: tokens.colors.muted }}>{comment.author?.level ?? 'Iniciante'}</span>
        </div>
        <time dateTime={comment.createdAt} style={{ color: tokens.colors.muted, fontSize: '0.85rem' }}>
          {formatDateTime(comment.createdAt)}
        </time>
      </header>
      {isEditing ? (
        <textarea
          value={editBody}
          onChange={event => setEditBody(event.target.value)}
          rows={3}
          style={{
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            border: `1px solid ${tokens.colors.border}`,
            background: 'rgba(5, 28, 20, 0.6)',
            color: tokens.colors.surface
          }}
        />
      ) : (
        <p style={{ margin: 0, lineHeight: 1.6, color: tokens.colors.surface }}>
          {isDeleted ? 'Comentário removido pelo autor.' : comment.body}
        </p>
      )}
      <footer style={{ display: 'flex', gap: tokens.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: tokens.colors.muted }}>▲ {comment.upvotes}</span>
        <span style={{ color: tokens.colors.muted }}>▼ {comment.downvotes}</span>
        {allowReply && !isDeleted ? (
          <button
            type="button"
            onClick={() => setShowReply(value => !value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: tokens.colors.primaryAccent,
              cursor: 'pointer'
            }}
          >
            {showReply ? 'Cancelar' : 'Responder'}
          </button>
        ) : null}
        {isOwnComment && !isDeleted ? (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(value => !value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: tokens.colors.surface,
                cursor: 'pointer'
              }}
            >
              {isEditing ? 'Cancelar edição' : 'Editar'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                border: 'none',
                background: 'transparent',
                color: tokens.colors.secondary,
                cursor: isDeleting ? 'wait' : 'pointer'
              }}
            >
              Remover
            </button>
          </>
        ) : null}
        {isEditing ? (
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            style={{
              border: 'none',
              background: 'transparent',
              color: tokens.colors.primaryAccent,
              cursor: isUpdating ? 'wait' : 'pointer'
            }}
          >
            Salvar edição
          </button>
        ) : null}
      </footer>
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
      {showReply && !isDeleted ? (
        <div style={{ marginTop: tokens.spacing.sm }}>
          <CommentComposer
            postId={postId}
            parentId={comment.id}
            onSubmitted={() => setShowReply(false)}
            onCancel={() => setShowReply(false)}
          />
        </div>
      ) : null}
      {children ? (
        <ul style={{ margin: 0, padding: 0, display: 'grid', gap: tokens.spacing.sm }}>{children}</ul>
      ) : null}
    </li>
  );
}
