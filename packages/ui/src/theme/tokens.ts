export const colors = {
  primary: '#0B3D2E',
  primaryAccent: '#2ECC71',
  secondary: '#A56336',
  highlight: '#6C3B99',
  surface: '#F2E9E4',
  muted: '#9AA0A6',
  background: {
    dark: '#051C14',
    light: '#FAF7F3'
  },
  border: '#173E30',
  shadow: 'rgba(0, 0, 0, 0.15)'
};

export const typography = {
  fontFamily: {
    display: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace"
  },
  size: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px'
  },
  lineHeight: {
    tight: 1.1,
    base: 1.4,
    relaxed: 1.6
  }
};

export const radii = {
  sm: '6px',
  md: '8px',
  lg: '16px',
  pill: '999px'
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px'
};

export const shadows = {
  soft: `0 12px 30px ${colors.shadow}`,
  inset: `inset 0 1px 0 rgba(255, 255, 255, 0.05)`
};

export const gradients = {
  cta: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.highlight} 100%)`,
  badge: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.highlight} 100%)`
};

export const tokens = {
  colors,
  typography,
  radii,
  spacing,
  shadows,
  gradients
};
