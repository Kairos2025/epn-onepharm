export const tokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0284c7', // Brand Primary Accessible Blue
      600: '#0369a1',
      700: '#075985',
      800: '#0c4a6e',
      900: '#082f49'
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    semantic: {
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0284c7'
    },
    categorical: [
      '#0284c7', // Sky Blue
      '#059669', // Emerald
      '#d97706', // Amber
      '#7c3aed', // Violet
      '#db2777', // Rose
      '#0891b2', // Cyan
      '#ea580c', // Orange
      '#4f46e5'  // Indigo
    ]
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    }
  },
  radius: {
    default: '6px',
    lg: '8px',
    full: '9999px'
  }
} as const;
