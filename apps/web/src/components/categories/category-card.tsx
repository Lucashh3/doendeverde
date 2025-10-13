'use client';

import { tokens } from '@doendeverde/ui';

export type CategoryInfo = {
  slug: string;
  label: string;
  description?: string;
  icon: string;
  postCount?: number;
  color?: string;
  isPopular?: boolean;
};

type CategoryCardProps = {
  category: CategoryInfo;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
};

export function CategoryCard({
  category,
  onClick,
  variant = 'default'
}: CategoryCardProps) {
  const baseStyles: React.CSSProperties = {
    borderRadius: tokens.radii.lg,
    border: `1px solid ${tokens.colors.border}`,
    background: 'rgba(11, 61, 46, 0.35)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const variantStyles = {
    default: {
      padding: tokens.spacing.lg,
      minHeight: '120px'
    },
    compact: {
      padding: tokens.spacing.md,
      minHeight: '80px'
    },
    featured: {
      padding: tokens.spacing.xl,
      minHeight: '140px',
      background: `linear-gradient(135deg, ${category.color || tokens.colors.primary}15, rgba(11, 61, 46, 0.35))`
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      style={{
        ...baseStyles,
        ...variantStyles[variant]
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Ver categoria ${category.label}` : undefined}
    >
      {category.isPopular && (
        <div
          style={{
            position: 'absolute',
            top: tokens.spacing.sm,
            right: tokens.spacing.sm,
            background: tokens.gradients.cta,
            color: tokens.colors.surface,
            padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
            borderRadius: tokens.radii.pill,
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          🔥 Popular
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing.md }}>
        <div
          style={{
            fontSize: variant === 'compact' ? '1.5rem' : '2rem',
            lineHeight: 1,
            opacity: 0.9
          }}
        >
          {category.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: variant === 'compact' ? tokens.typography.size.md : tokens.typography.size.lg,
              fontWeight: 600,
              color: tokens.colors.surface,
              marginBottom: tokens.spacing.xs
            }}
          >
            {category.label}
          </h3>

          {variant !== 'compact' && category.description && (
            <p
              style={{
                margin: 0,
                color: tokens.colors.muted,
                fontSize: tokens.typography.size.sm,
                lineHeight: 1.4,
                marginBottom: tokens.spacing.sm
              }}
            >
              {category.description}
            </p>
          )}

          {category.postCount !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.xs,
                color: tokens.colors.muted,
                fontSize: tokens.typography.size.sm
              }}
            >
              <span>{category.postCount} posts</span>
              {category.color && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: category.color
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {onClick && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'transparent',
            borderRadius: tokens.radii.lg
          }}
          onMouseEnter={(e) => {
            e.currentTarget.parentElement!.style.transform = 'translateY(-2px)';
            e.currentTarget.parentElement!.style.boxShadow = `0 4px 12px ${category.color || tokens.colors.primary}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.parentElement!.style.transform = 'translateY(0)';
            e.currentTarget.parentElement!.style.boxShadow = 'none';
          }}
        />
      )}
    </article>
  );
}