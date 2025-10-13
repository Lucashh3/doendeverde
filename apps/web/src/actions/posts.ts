'use server';

import { revalidatePath } from 'next/cache';

import { logAuditEvent } from '@/lib/audit/log-event';
import {
  diffGamificationSnapshots,
  fetchGamificationSnapshot,
  type GamificationDiff
} from '@/lib/gamification/snapshot';
import { createSupabaseServerActionClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logging/logger';
import { reportError } from '@/lib/telemetry/error-reporter';
import { slugifyTag } from '@/lib/utils/slugify';

export type CreatePostPayload = {
  title: string;
  content: string;
  categorySlug: string;
  tags: string[];
  media?: {
    name: string;
    type: string;
    size: number;
  } | null;
};

export async function createPost(
  payload: CreatePostPayload
): Promise<{ success: true; postId: string; gamification?: GamificationDiff }> {
  const log = createLogger('actions:createPost');
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user },
    error: sessionError
  } = await supabase.auth.getUser();

  if (sessionError) {
    log.error('Failed to fetch session', { error: sessionError });
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  const beforeGamification = await fetchGamificationSnapshot(supabase, user.id);

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', payload.categorySlug)
    .maybeSingle();

  if (categoryError || !category) {
    log.warn('Category not found', { categorySlug: payload.categorySlug, error: categoryError });
    throw new Error('Categoria selecionada não existe. Atualize a página e tente novamente.');
  }

  const { data: postRows, error: insertError } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      category_id: category.id,
      title: payload.title,
      content: payload.content,
      media_url: null,
      media_type: payload.media?.type ?? null
    })
    .select('id')
    .single();

  if (insertError || !postRows) {
    log.error('Post insert failed', { error: insertError });
    await reportError({
      error: insertError ?? new Error('post insert returned null'),
      context: { scope: 'createPost', userId: user.id }
    });
    throw new Error('Não foi possível publicar agora. Tente novamente mais tarde.');
  }

  const tagSlugs = payload.tags
    .map(tag => tag.trim())
    .filter(Boolean)
    .map(slugifyTag);

  if (tagSlugs.length > 0) {
    const uniqueTags = Array.from(new Set(tagSlugs));
    const { data: tagRecords, error: tagError } = await supabase
      .from('tags')
      .upsert(uniqueTags.map(slug => ({ slug, label: slug.replace(/-/g, ' ') })))
      .select('id, slug');

    if (tagError) {
      log.warn('Tag upsert failed', { error: tagError, tags: uniqueTags });
      await reportError({
        error: tagError,
        context: { scope: 'createPost', userId: user.id, step: 'tag_upsert' }
      });
    } else if (tagRecords) {
      const tagMap = new Map(tagRecords.map(tag => [tag.slug, tag.id]));
      const postTagsPayload = uniqueTags
        .map(slug => tagMap.get(slug))
        .filter(Boolean)
        .map(tagId => ({ post_id: postRows.id, tag_id: tagId as number }));

      if (postTagsPayload.length > 0) {
        const { error: postTagsError } = await supabase.from('post_tags').insert(postTagsPayload);
        if (postTagsError) {
          log.warn('Failed to link tags to post', { error: postTagsError, postId: postRows.id });
          await reportError({
            error: postTagsError,
            context: { scope: 'createPost', userId: user.id, step: 'post_tags_insert' }
          });
        }
      }
    }
  }

  const afterGamification = await fetchGamificationSnapshot(supabase, user.id);
  const gamificationDiff = diffGamificationSnapshots(beforeGamification, afterGamification);

  await logAuditEvent(supabase, 'post_created', {
    postId: postRows.id,
    category: payload.categorySlug,
    tags: tagSlugs,
    media: payload.media?.type ?? null
  });

  revalidatePath('/');
  revalidatePath(`/posts/${postRows.id}`);

  return {
    success: true,
    postId: postRows.id,
    gamification: gamificationDiff
  };
}

export async function voteOnPost(postId: string, value: 1 | -1) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Você precisa estar logado para votar.');
  }

  const { data: existingVote } = await supabase
    .from('post_votes')
    .select('value')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  let newValue: 1 | -1 | null = value;

  if (existingVote?.value === value) {
    const { error: deleteError } = await supabase
      .from('post_votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[voteOnPost] delete error', deleteError);
      throw new Error('Não foi possível atualizar seu voto.');
    }

    newValue = null;
  } else if (existingVote) {
    const { error: updateError } = await supabase
      .from('post_votes')
      .update({ value })
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[voteOnPost] update error', updateError);
      throw new Error('Não foi possível registrar seu voto.');
    }
  } else {
    const { error: insertError } = await supabase.from('post_votes').insert({
      post_id: postId,
      user_id: user.id,
      value
    });

    if (insertError) {
      console.error('[voteOnPost] insert error', insertError);
      throw new Error('Não foi possível registrar seu voto.');
    }
  }

  await logAuditEvent(supabase, 'post_voted', {
    postId,
    value: newValue
  });

  revalidatePath('/');
  revalidatePath(`/posts/${postId}`);

  return { success: true, value: newValue };
}

export type CreateCommentPayload = {
  postId: string;
  body: string;
  parentId?: string | null;
};

export async function createComment(
  payload: CreateCommentPayload
): Promise<{ success: true; commentId: string; gamification?: GamificationDiff }> {
  const log = createLogger('actions:createComment');
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Faça login para comentar.');
  }

  let depth = 0;

  const beforeGamification = await fetchGamificationSnapshot(supabase, user.id);

  if (payload.parentId) {
    const { data: parent, error: parentError } = await supabase
      .from('comments')
      .select('depth')
      .eq('id', payload.parentId)
      .maybeSingle();

    if (parentError) {
      log.error('Failed to fetch parent comment', { parentId: payload.parentId, error: parentError });
      throw new Error('Não foi possível responder agora.');
    }

    if (!parent) {
      throw new Error('Comentário original não encontrado.');
    }

    if (parent.depth >= 1) {
      throw new Error('Apenas uma resposta é permitida por comentário.');
    }

    depth = parent.depth + 1;
  }

  const { data: insertedComment, error: commentError } = await supabase
    .from('comments')
    .insert({
      post_id: payload.postId,
      author_id: user.id,
      body: payload.body,
      parent_comment_id: payload.parentId ?? null,
      depth
    })
    .select('id')
    .single();

  if (commentError || !insertedComment) {
    log.error('Comment insert failed', { error: commentError });
    await reportError({
      error: commentError ?? new Error('comment insert returned null'),
      context: { scope: 'createComment', userId: user.id }
    });
    throw new Error('Não foi possível enviar seu comentário agora.');
  }

  const afterGamification = await fetchGamificationSnapshot(supabase, user.id);
  const gamificationDiff = diffGamificationSnapshots(beforeGamification, afterGamification);

  await logAuditEvent(supabase, 'comment_created', {
    postId: payload.postId,
    commentId: insertedComment.id,
    parentId: payload.parentId ?? null
  });

  revalidatePath(`/posts/${payload.postId}`);

  return {
    success: true,
    commentId: insertedComment.id,
    gamification: gamificationDiff
  };
}

export async function updateComment(commentId: string, body: string) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Faça login para editar seu comentário.');
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, post_id')
    .eq('id', commentId)
    .maybeSingle();

  if (!comment || comment.author_id !== user.id) {
    throw new Error('Você só pode editar seus próprios comentários.');
  }

  const { error } = await supabase
    .from('comments')
    .update({ body })
    .eq('id', commentId);

  if (error) {
    console.error('[updateComment] update error', error);
    throw new Error('Não foi possível salvar a edição agora.');
  }

  await logAuditEvent(supabase, 'comment_updated', {
    commentId,
    postId: comment.post_id
  });

  revalidatePath(`/posts/${comment.post_id}`);

  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Faça login para excluir seu comentário.');
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, post_id')
    .eq('id', commentId)
    .maybeSingle();

  if (!comment || comment.author_id !== user.id) {
    throw new Error('Você só pode excluir seus próprios comentários.');
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true, body: '[comentário removido pelo autor]' })
    .eq('id', commentId);

  if (error) {
    console.error('[deleteComment] update error', error);
    await reportError({
      error,
      context: { scope: 'deleteComment', commentId }
    });
    throw new Error('Não foi possível remover seu comentário agora.');
  }

  await logAuditEvent(supabase, 'comment_deleted', {
    commentId,
    postId: comment.post_id
  });

  revalidatePath(`/posts/${comment.post_id}`);

  return { success: true };
}

export async function flagPost(postId: string, reason: string) {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user },
    error: sessionError
  } = await supabase.auth.getUser();

  if (sessionError) {
    console.error('[flagPost] session error', sessionError);
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!user) {
    throw new Error('Você precisa estar logado para sinalizar um post.');
  }

  const trimmedReason = reason.trim();

  if (trimmedReason.length < 8) {
    throw new Error('Descreva rapidamente o motivo (mínimo de 8 caracteres).');
  }

  const { error } = await supabase
    .from('post_flags')
    .upsert(
      {
        post_id: postId,
        reporter_id: user.id,
        reason: trimmedReason,
        status: 'pending'
      },
      {
        onConflict: 'post_id,reporter_id'
      }
    );

  if (error) {
    console.error('[flagPost] insert error', error);
    await reportError({
      error,
      context: { scope: 'flagPost', postId, userId: user.id }
    });
    throw new Error('Não foi possível enviar sua sinalização agora.');
  }

  revalidatePath('/admin');
  return { success: true };
}
