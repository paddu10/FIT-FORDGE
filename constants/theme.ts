export const theme = {
  colors: {
    // Background hierarchy
    background: '#08090C', // Deep charcoal / near black
    surface: '#161921',    // Slightly elevated
    elevated: '#1E2430',   // More elevated (cards, modals)
    
    // Accents
    accent: '#ccff00',     // Electric lime / neon green
    accentHover: '#b3e600',
    accentMuted: 'rgba(204, 255, 0, 0.15)',
    
    // Status
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    
    // Typography
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#64748B',
    
    // Borders
    border: '#2D3748',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      hero: 42,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
      black: '900' as const,
    }
  }
};
