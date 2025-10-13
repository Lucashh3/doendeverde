'use client';

import { useOptimistic, useTransition } from 'react';

import { voteOnPost } from '@/actions/posts';
import { tokens } from '@doendeverde/ui';

type VoteState = {
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
};

type PostVotePanelProps = {
  postId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: 1 | -1 | null;
};

export function PostVotePanel({
  postId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote
}: PostVotePanelProps) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic<VoteState, 1 | -1>(
    {
      upvotes: initialUpvotes,
      downvotes: initialDownvotes,
      userVote: initialUserVote
    },
    (currentState, nextVote) => {
      let { upvotes, downvotes, userVote } = currentState;

      if (userVote === nextVote) {
        userVote = null;
        if (nextVote === 1) {
          upvotes -= 1;
        } else {
          downvotes -= 1;
        }
      } else {
        if (nextVote === 1) {
          upvotes += 1;
          if (userVote === -1) downvotes -= 1;
        } else {
          downvotes += 1;
          if (userVote === 1) upvotes -= 1;
        }
        userVote = nextVote;
      }

      return { upvotes: Math.max(upvotes, 0), downvotes: Math.max(downvotes, 0), userVote };
    }
  );

  const handleVote = (value: 1 | -1) => {
    setOptimistic(value);

    startTransition(async () => {
      try {
        await voteOnPost(postId, value);
      } catch (error) {
        console.error('[PostVotePanel] vote error', error);
      }
    });
  };

  const score = state.upvotes - state.downvotes;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing.md,
        borderRadius: tokens.radii.md,
        border: `1px solid ${tokens.colors.border}`,
        background: 'rgba(11, 61, 46, 0.3)',
        padding: tokens.spacing.md
      }}
    >
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={pending}
        style={{
          border: 'none',
          borderRadius: tokens.radii.md,
          padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
          background: state.userVote === 1 ? tokens.gradients.cta : 'rgba(46, 204, 113, 0.15)',
          color: tokens.colors.surface,
          cursor: pending ? 'wait' : 'pointer'
        }}
      >
        ▲ {state.upvotes}
      </button>
      <div style={{ fontWeight: 700, fontSize: tokens.typography.size.lg }}>{score}</div>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={pending}
        style={{
          border: 'none',
          borderRadius: tokens.radii.md,
          padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
          background: state.userVote === -1 ? 'rgba(108, 59, 153, 0.6)' : 'rgba(108, 59, 153, 0.25)',
          color: tokens.colors.surface,
          cursor: pending ? 'wait' : 'pointer'
        }}
      >
        ▼ {state.downvotes}
      </button>
    </div>
  );
}
