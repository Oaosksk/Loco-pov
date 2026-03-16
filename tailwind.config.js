/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111111',   /* near-black — replaces all green */
          light:   '#2A2A2A',
          dark:    '#000000',
        },
        accent: {
          DEFAULT: '#E07B2A',   /* warm orange — kept */
          light:   '#f0913e',
          dark:    '#c96a1e',
        },
        bg: {
          light: '#EDEBE5',     /* warm paper white — from reference */
          dark:  '#000000',     /* pitch black */
        },
        surface: {
          light: '#FFFFFF',
          dark:  '#0A0A0A',     /* near-black cards */
        },
        border: {
          light: '#DDD9D2',     /* soft warm gray */
          dark:  '#1C1C1C',     /* barely-visible dark border */
        },
        text: {
          light: '#111111',     /* near-black — maximum contrast */
          dark:  '#FFFFFF',     /* pure white */
        },
        muted: {
          light: '#888580',     /* warm mid-gray */
          dark:  '#9A9A9A',     /* readable in pitch black */
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
        'card-hover': '0 4px 24px rgba(0,0,0,0.10)',
        'card-dark':  '0 1px 0 rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.8)',
        sidebar:    '2px 0 12px rgba(0,0,0,0.15)',
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
