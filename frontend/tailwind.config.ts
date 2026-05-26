import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        'surface-elevated': '#1a1a1a',
        border: '#2a2a2a',
        'border-strong': '#3a3a3a',
        'text-primary': '#ededed',
        'text-secondary': '#a1a1a1',
        'text-muted': '#555555',
        accent: '#7c3aed',
        'accent-hover': '#6d28d9',
        'accent-subtle': '#1e1030',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        btn: '6px',
        card: '10px',
        modal: '14px',
        pill: '999px',
      },
    },
  },
  plugins: [forms],
} satisfies Config
