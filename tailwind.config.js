/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF3B3B',   /* grok red */
          light:   '#FF6B6B',
          dark:    '#CC2222',
        },
        accent: {
          DEFAULT: '#FF3B3B',
          light:   '#FF6B6B',
          dark:    '#CC2222',
        },
        bg: {
          light: '#F5F5F5',
          dark:  '#000000',     /* pure black */
        },
        surface: {
          light: '#FFFFFF',
          dark:  '#0D0D0D',     /* near-black card */
        },
        border: {
          light: '#E5E5E5',
          dark:  '#1A1A1A',     /* barely visible border */
        },
        text: {
          light: '#0A0A0A',
          dark:  '#FFFFFF',     /* pure white */
        },
        muted: {
          light: '#737373',
          dark:  '#666666',     /* mid gray */
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans:  ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal:    '500',
        medium:    '600',
        semibold:  '700',
        bold:      '800',
        extrabold: '900',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight:   '-0.02em',
        normal:  '0em',
        wide:    '0.04em',
        wider:   '0.10em',
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:       '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(255,59,59,0.12)',
        'card-dark':  '0 1px 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.9)',
        sidebar:    '2px 0 12px rgba(0,0,0,0.6)',
      },
      animation: {
        'bounce-dot': 'bounce 0.6s infinite alternate',
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
