/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep:  '#0c0a08',
          dark:  '#111009',
          card:  '#181410',
          hover: '#1e1a15',
        },
        gold: {
          DEFAULT: '#c4a35a',
          dim:     '#876c35',
          faint:   '#2e2010',
          light:   '#d4b87a',
        },
        cream: {
          DEFAULT: '#e6d9c0',
          dim:     '#a8977e',
          faint:   '#4a3f30',
        },
        ink: {
          primary:   '#ddd0b4',
          secondary: '#8a7a60',
          muted:     '#4e4232',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '1.04' }],
        'heading':  ['clamp(2rem, 4vw, 3.2rem)', { lineHeight: '1.15' }],
        'story':    ['1.18rem', { lineHeight: '2.05' }],
      },
      animation: {
        'float-up':    'floatUp 14s linear infinite',
        'fade-in':     'fadeIn 0.6s ease both',
        'fade-in-up':  'fadeInUp 0.8s ease both',
        'expand-w':    'expandW 1.4s ease both',
        'pulse-line':  'pulseLine 2.2s ease-in-out infinite',
      },
      keyframes: {
        floatUp: {
          '0%':   { transform: 'translateY(105vh)', opacity: '0' },
          '8%':   { opacity: '0.4' },
          '92%':  { opacity: '0.15' },
          '100%': { transform: 'translateY(-120px) translateX(25px)', opacity: '0' },
        },
        fadeIn:    { from: { opacity: '0' },                              to: { opacity: '1' } },
        fadeInUp:  { from: { opacity: '0', transform: 'translateY(28px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        expandW:   { from: { transform: 'scaleX(0)' },                    to: { transform: 'scaleX(1)' } },
        pulseLine: { '0%,100%': { opacity: '0.25' }, '50%': { opacity: '1' } },
      },
      maxWidth: {
        reading: '760px',
        site:    '1300px',
      },
      borderColor: {
        gold: 'rgba(196,163,90,0.12)',
        'gold-hover': 'rgba(196,163,90,0.28)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
