'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { FEED_PERIODS, FEED_SORT_OPTIONS, DEFAULT_FEED_SORT } from '@/lib/feed/constants';
import type { FeedPeriod, FeedSort } from '@/lib/feed/constants';
import { useTagSuggestions } from '@/hooks/use-tag-suggestions';
import { slugifyTag } from '@/lib/utils/slugify';
import { tokens } from '@doendeverde/ui';

export type FeedCategory = {
  slug: string;
  label: string;
  icon: string | null;
};

type FeedFiltersProps = {
  categories: FeedCategory[];
};

const buildQueryString = (params: URLSearchParams, updates: Record<string, string | null>) => {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  });
  return next.toString();
};

export function FeedFilters({ categories }: FeedFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('categoria');
  const currentTag = searchParams.get('tag');
  const currentSort = (searchParams.get('ordenar') ?? DEFAULT_FEED_SORT) as FeedSort;
  const currentPeriod = (searchParams.get('periodo') ?? 'week') as FeedPeriod;
  const [tagInput, setTagInput] = useState('');
  const [tagFocused, setTagFocused] = useState(false);
  const { suggestions } = useTagSuggestions(tagInput, { enabled: tagFocused });

  const handleChange = (updates: Record<string, string | null>) => {
    const query = buildQueryString(searchParams, { page: null, ...updates });
    router.replace(`${pathname}?${query}`);
  };

  const handleTagSelect = (slug: string) => {
    handleChange({ tag: slug });
    setTagInput('');
    setTagFocused(false);
  };

  return (
    <section
      aria-label="Filtros do feed"
      style={{
        display: 'grid',
        gap: tokens.spacing.md,
        padding: tokens.spacing.lg,
        borderRadius: tokens.radii.lg,
        border: `1px solid ${tokens.colors.border}`,
        background: 'rgba(11, 61, 46, 0.35)'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: tokens.spacing.sm
        }}
      >
        <button
          type="button"
          onClick={() => handleChange({ categoria: null })}
          style={{
            padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
            borderRadius: tokens.radii.pill,
            border: 'none',
            cursor: 'pointer',
            background:
              currentCategory === null
                ? tokens.gradients.cta
                : 'rgba(17, 94, 72, 0.45)',
            color: tokens.colors.surface
          }}
        >
          Todas
        </button>
        {categories.map(category => {
          const isActive = currentCategory === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => handleChange({ categoria: category.slug })}
              style={{
                padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                borderRadius: tokens.radii.pill,
                border: isActive ? `1px solid ${tokens.colors.primaryAccent}` : 'none',
                background: isActive ? tokens.gradients.cta : 'rgba(17, 94, 72, 0.45)',
                color: tokens.colors.surface,
                cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: tokens.spacing.xs }}>{category.icon ?? '🌿'}</span>
              {category.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gap: tokens.spacing.md
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing.md
          }}
        >
          <label style={{ flex: '1 1 220px', position: 'relative' }}>
            <span style={{ display: 'block', fontSize: tokens.typography.size.sm, color: tokens.colors.muted }}>
              Filtrar por tag
            </span>
            <input
              value={tagInput}
              onChange={event => {
                setTagInput(event.target.value);
                setTagFocused(true);
              }}
              onFocus={() => setTagFocused(true)}
              onBlur={() => {
                setTimeout(() => setTagFocused(false), 150);
              }}
              placeholder={currentTag ? `Atual: #${currentTag.replace(/-/g, ' ')}` : 'Digite para buscar tags'}
              style={{
                marginTop: tokens.spacing.xs,
                width: '100%',
                padding: tokens.spacing.sm,
                borderRadius: tokens.radii.md,
                border: `1px solid ${tokens.colors.border}`,
                background: 'rgba(17, 94, 72, 0.45)',
                color: tokens.colors.surface
              }}
              onKeyDown={event => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                const value = event.currentTarget.value.trim();
                if (!value) {
                  handleChange({ tag: null });
                  return;
                }
                const slugFromSuggestion = suggestions.find(
                  item => item.label.toLowerCase() === value.toLowerCase()
                )?.slug;
                handleTagSelect(slugFromSuggestion ?? slugifyTag(value));
              }}
            />
            {tagFocused && suggestions.length > 0 ? (
              <ul
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'rgba(5, 28, 20, 0.95)',
                  borderRadius: tokens.radii.md,
                  border: `1px solid ${tokens.colors.border}`,
                  listStyle: 'none',
                  margin: 0,
                  padding: tokens.spacing.xs,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'grid',
                  gap: tokens.spacing.xs,
                  zIndex: 15
                }}
              >
                {suggestions.map(suggestion => (
                  <li key={suggestion.slug}>
                    <button
                      type="button"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => handleTagSelect(suggestion.slug)}
                      style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: tokens.radii.md,
                        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                        background: 'rgba(17, 94, 72, 0.45)',
                        color: tokens.colors.surface,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span>#{suggestion.label}</span>
                      <small style={{ color: tokens.colors.muted }}>{suggestion.usage_count ?? 0} posts</small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </label>

          {currentTag ? (
            <button
              type="button"
              onClick={() => {
                setTagInput('');
                handleChange({ tag: null });
              }}
              style={{
                alignSelf: 'flex-end',
                border: 'none',
                borderRadius: tokens.radii.pill,
                padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                background: tokens.gradients.badge,
                color: tokens.colors.surface,
                cursor: 'pointer'
              }}
            >
              Remover #{currentTag.replace(/-/g, ' ')}
            </button>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing.md,
            alignItems: 'center'
          }}
        >
          <label>
            <span style={{ display: 'block', fontSize: tokens.typography.size.sm, color: tokens.colors.muted }}>
              Ordenar por
            </span>
            <select
              value={currentSort}
              onChange={event => handleChange({ ordenar: event.target.value })}
              style={{
                marginTop: tokens.spacing.xs,
                padding: tokens.spacing.sm,
                borderRadius: tokens.radii.md,
                border: `1px solid ${tokens.colors.border}`,
                background: 'rgba(17, 94, 72, 0.45)',
                color: tokens.colors.surface
              }}
            >
              {FEED_SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span style={{ display: 'block', fontSize: tokens.typography.size.sm, color: tokens.colors.muted }}>
              Período
            </span>
            <select
              value={currentPeriod}
              onChange={event => handleChange({ periodo: event.target.value })}
              style={{
                marginTop: tokens.spacing.xs,
                padding: tokens.spacing.sm,
                borderRadius: tokens.radii.md,
                border: `1px solid ${tokens.colors.border}`,
                background: 'rgba(17, 94, 72, 0.45)',
                color: tokens.colors.surface
              }}
            >
              {FEED_PERIODS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
