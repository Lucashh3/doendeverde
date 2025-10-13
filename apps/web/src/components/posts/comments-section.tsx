import { CommentComposer } from './comment-composer';
import { CommentItem } from './comment-item';

import type { PostComment } from '@/lib/feed/fetch-post';

export type CommentNode = PostComment & { children: CommentNode[] };

const buildCommentTree = (comments: PostComment[]): CommentNode[] => {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach(comment => {
    map.set(comment.id, { ...comment, children: [] });
  });

  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

type CommentsSectionProps = {
  postId: string;
  comments: PostComment[];
  canComment: boolean;
  currentUserId?: string | null;
};

export function CommentsSection({ postId, comments, canComment, currentUserId }: CommentsSectionProps) {
  const tree = buildCommentTree(comments);

  return (
    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <header>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.5rem' }}>Comentários</h2>
        <p style={{ margin: 0, color: '#9AA0A6' }}>
          Respostas respeitosas são a essência da brisa. Aprenda, ensine e fortaleça a comunidade.
        </p>
      </header>

      {canComment ? (
        <CommentComposer postId={postId} />
      ) : (
        <p style={{ color: '#9AA0A6' }}>Faça login para participar da conversa.</p>
      )}

      {tree.length === 0 ? (
        <p style={{ color: '#9AA0A6' }}>
          Ninguém comentou ainda. Seja a primeira pessoa a compartilhar sua visão!
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
          {tree.map(node => (
            <CommentItem
              key={node.id}
              comment={node}
              postId={postId}
              allowReply={node.depth < 1}
              currentUserId={currentUserId ?? null}
            >
              {node.children.map(child => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  postId={postId}
                  allowReply={false}
                  currentUserId={currentUserId ?? null}
                />
              ))}
            </CommentItem>
          ))}
        </ul>
      )}
    </section>
  );
}
