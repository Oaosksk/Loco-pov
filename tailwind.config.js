/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // No darkMode class needed — we lock everything to dark values
  theme: {
    extend: {
      colors: {
        // All variants set to the SAME dark values
        // so bg-bg-light === bg-bg-dark === #0D1117 always
        primary: '#E6EDF3',
        bg: {
          light: '#0D1117',
          dark:  '#0D1117',
        },
        surface: {
          light: '#161B22',
          dark:  '#161B22',
        },
        border: {
          light: '#21262D',
          dark:  '#21262D',
        },
        text: {
          light: '#E6EDF3',
          dark:  '#E6EDF3',
        },
        muted: {
          light: '#8B949E',
          dark:  '#8B949E',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:    '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:      '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
        'card-dark': '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0, transform: 'translateY(4px)' },  to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
