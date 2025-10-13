'use client';

import { tokens } from '@doendeverde/ui';

type CategoryStatsProps = {
  totalCategories: number;
  totalPosts: number;
  mostActiveCategory?: string;
};

export function CategoryStats({
  totalCategories,
  totalPosts,
  mostActiveCategory
}: CategoryStatsProps) {
  const stats = [
    {
      label: 'Categorias',
      value: totalCategories,
      icon: '📂',
      color: '#3b82f6'
    },
    {
      label: 'Posts Categorizados',
      value: totalPosts,
      icon: '📝',
      color: '#22c55e'
    },
    {
      label: 'Categoria Mais Ativa',
      value: mostActiveCategory || 'N/A',
      icon: '🔥',
      color: '#f59e0b'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: tokens.spacing.lg,
        marginBottom: '3rem'
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: 'rgba(11, 61, 46, 0.35)',
            borderRadius: tokens.radii.lg,
            padding: tokens.spacing.lg,
            textAlign: 'center',
            border: `1px solid ${stat.color}30`
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              marginBottom: tokens.spacing.sm
            }}
          >
            {stat.icon}
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: tokens.colors.surface,
              marginBottom: tokens.spacing.xs
            }}
          >
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          <div
            style={{
              color: tokens.colors.muted,
              fontSize: tokens.typography.size.sm
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}