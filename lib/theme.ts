export const COLORS = {
  // Brand
  brandRed: '#FF1E2D',
  brandOrange: '#FF5A1F',
  brandAmber: '#FFB300',
  gradient: ['#FF1E2D', '#FF5A1F', '#FFB300'] as const,

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  // Light theme
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    cardShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  },

  // Dark theme
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    border: '#334155',
    cardShadow: {},
  },
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;
