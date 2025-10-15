'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createPost, type CreatePostPayload } from '@/actions/posts';
import { useGamificationToasts } from '@/components/gamification/gamification-toast-provider';
import type { FeedCategory } from '@/components/feed/feed-filters';
import { useTagSuggestions, type TagSuggestion } from '@/hooks/use-tag-suggestions';
import { tokens } from '@doendeverde/ui';

const MAX_TAGS = 5;

type PostComposerFormProps = {
  categories: FeedCategory[];
};

export function PostComposerForm({ categories }: PostComposerFormProps) {
  const router = useRouter();
  const notifyGamification = useGamificationToasts();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]?.slug ?? 'experiencias');

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagInputFocused, setTagInputFocused] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaMeta, setMediaMeta] = useState<CreatePostPayload['media']>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { suggestions, isLoading: suggestionsLoading } = useTagSuggestions(tagInput, {
    enabled: tagInputFocused && tags.length < MAX_TAGS
  });

  const addTag = (value: string) => {
    const tag = value.trim();
    if (!tag) return;

    const exists = tags.some(existing => existing.toLowerCase() === tag.toLowerCase());
    if (exists || tags.length >= MAX_TAGS) {
      return;
    }

    setTags(prev => [...prev, tag]);
    setTagInput('');
    setTagInputFocused(false);
  };

  const handleSuggestionSelect = (suggestion: TagSuggestion) => {
    addTag(suggestion.label);
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();

    if (suggestions.length > 0 && (tagInput.trim() === '' || suggestions[0].label.toLowerCase().startsWith(tagInput.toLowerCase()))) {
      addTag(suggestions[0].label);
      return;
    }

    addTag(tagInput);
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(item => item !== tag));
  };

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setMediaPreview(null);
      setMediaMeta(null);
      return;
    }

    const preview = URL.createObjectURL(file);
    setMediaPreview(preview);
    setMediaMeta({ name: file.name, type: file.type, size: file.size });
  };

  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload: CreatePostPayload = {
      title,
      content,
      categorySlug: category,
      tags,
      media: mediaMeta
    };

    startTransition(async () => {
      try {
        const result = await createPost(payload);
        notifyGamification(result.gamification);
        router.replace(`/posts/${result.postId}`);
        router.refresh();
      } catch (submissionError) {
        console.error('[PostComposerForm] create post error', submissionError);
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : 'Não foi possível publicar agora. Tente novamente.'
        );
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: tokens.spacing.lg,
        padding: tokens.spacing.xl,
        borderRadius: '24px',
        border: `1px solid ${tokens.colors.border}`,
        background: 'rgba(5, 28, 20, 0.85)'
      }}
    >
      <header style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <h1
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontFamily.display,
            fontSize: tokens.typography.size.xl
          }}
        >
          Compartilhe sua brisa
        </h1>
        <p style={{ margin: 0, color: tokens.colors.muted }}>
          Poste relatos, dicas de cultivo ou memes. Ganhe +5 XP por post publicado.
        </p>
      </header>

      <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <span>Título</span>
        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          required
          minLength={8}
          placeholder="Como você descreve essa experiência?"
          style={{
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            border: `1px solid ${tokens.colors.border}`,
            background: 'rgba(11, 61, 46, 0.35)',
            color: tokens.colors.surface
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <span>Categoria</span>
        <select
          value={category}
          onChange={event => setCategory(event.target.value)}
          required
          style={{
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            border: `1px solid ${tokens.colors.border}`,
            background: 'rgba(11, 61, 46, 0.35)',
            color: tokens.colors.surface
          }}
        >
          {categories.map(item => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <span>Conteúdo</span>
        <textarea
          value={content}
          onChange={event => setContent(event.target.value)}
          required
          minLength={32}
          rows={8}
          placeholder="Compartilhe detalhes, aprenda com a comunidade, ajude quem está chegando agora."
          style={{
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            border: `1px solid ${tokens.colors.border}`,
            background: 'rgba(11, 61, 46, 0.35)',
            color: tokens.colors.surface,
            resize: 'vertical'
          }}
        />
      </label>

      <section style={{ display: 'grid', gap: tokens.spacing.sm }}>
        <span>Tags (até {MAX_TAGS})</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              style={{
                border: 'none',
                borderRadius: tokens.radii.pill,
                padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                background: tokens.gradients.badge,
                color: tokens.colors.surface,
                cursor: 'pointer'
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', display: 'grid', gap: tokens.spacing.xs }}>
          <input
            placeholder={
              tags.length >= MAX_TAGS
                ? 'Limite máximo atingido'
                : suggestionsLoading
                  ? 'Buscando sugestões...'
                  : 'Digite para procurar tags'
            }
            value={tagInput}
            onChange={event => {
              setTagInput(event.target.value);
              setTagInputFocused(true);
            }}
            onFocus={() => setTagInputFocused(true)}
            onBlur={() => {
              setTimeout(() => setTagInputFocused(false), 120);
            }}
            onKeyDown={handleTagKeyDown}
            disabled={tags.length >= MAX_TAGS}
            style={{
              padding: tokens.spacing.sm,
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.border}`,
              background: 'rgba(11, 61, 46, 0.35)',
              color: tokens.colors.surface
            }}
          />
          {tagInputFocused && suggestions.length > 0 && tags.length < MAX_TAGS ? (
            <ul
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                maxHeight: '220px',
                overflowY: 'auto',
                background: 'rgba(5, 28, 20, 0.95)',
                borderRadius: tokens.radii.md,
                border: `1px solid ${tokens.colors.border}`,
                listStyle: 'none',
                margin: 0,
                padding: tokens.spacing.xs,
                display: 'grid',
                gap: tokens.spacing.xs,
                zIndex: 10
              }}
            >
              {suggestions.map(suggestion => {
                const alreadyAdded = tags.some(tag => tag.toLowerCase() === suggestion.label.toLowerCase());
                return (
                  <li key={suggestion.slug}>
                    <button
                      type="button"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      disabled={alreadyAdded}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: alreadyAdded ? 'rgba(41, 87, 72, 0.4)' : 'rgba(17, 94, 72, 0.45)',
                        borderRadius: tokens.radii.md,
                        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: tokens.colors.surface,
                        cursor: alreadyAdded ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span>#{suggestion.label}</span>
                      <small style={{ color: tokens.colors.muted }}>
                        {suggestion.usage_count ?? 0} usos
                      </small>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </section>

      <section style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <span>Mídia (opcional)</span>
        <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
        {mediaPreview ? (
          <div
            style={{
              marginTop: tokens.spacing.sm,
              borderRadius: tokens.radii.md,
              overflow: 'hidden',
              maxWidth: '420px'
            }}
          >
            <img src={mediaPreview} alt="Pré-visualização" style={{ width: '100%', display: 'block' }} />
            <p style={{ color: tokens.colors.muted, margin: 0 }}>
              Upload real será configurado com Supabase Storage. Pré-visualização disponível apenas localmente.
            </p>
          </div>
        ) : (
          <p style={{ color: tokens.colors.muted, margin: 0 }}>
            Em breve: upload direto para o Supabase Storage (free tier).
          </p>
        )}
      </section>

      {error ? (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            border: `1px solid ${tokens.colors.secondary}`,
            background: 'rgba(165, 99, 54, 0.2)'
          }}
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        style={{
          border: 'none',
          borderRadius: tokens.radii.pill,
          background: tokens.gradients.cta,
          color: tokens.colors.surface,
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          fontWeight: 600,
          cursor: pending ? 'wait' : 'pointer'
        }}
      >
        {pending ? 'Publicando...' : 'Publicar no Doende Verde'}
      </button>
    </form>
  );
}
