/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#070b14',
          900: '#0a0f1c',
          850: '#0d1425',
          800: '#111827',
          750: '#141c2f',
          700: '#1a2338',
        },
        line: {
          DEFAULT: '#1f2a44',
          soft: '#16203a',
        },
        ink: {
          hi: '#e6edf7',
          DEFAULT: '#c3ccdb',
          dim: '#8794ab',
          faint: '#5b6780',
        },
        accent: {
          DEFAULT: '#22d3ee',
          soft: '#0e7490',
          dim: '#164e63',
        },
        risk: {
          normal: '#10b981',
          watch: '#f59e0b',
          warning: '#f97316',
          critical: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};