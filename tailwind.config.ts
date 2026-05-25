import type { Config } from 'tailwindcss'

const config: Config = {
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
        gold:  { DEFAULT: '#c4a35a', dim: '#876c35', faint: '#2e2010' },
        cream: { DEFAULT: '#e6d9c0', dim: '#a8977e' },
        ink: {
          primary:   '#ddd0b4',
          secondary: '#8a7a60',
          muted:     '#4e4232',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-manrope)',   'system-ui', 'sans-serif'],
      },
      fontSize: {
        'reading': ['1.175rem', { lineHeight: '2.05' }],
      },
      maxWidth: {
        'reading': '760px',
        'site':    '1300px',
      },
      borderColor: { DEFAULT: 'rgba(196,163,90,0.1)' },
      animation: {
        'fade-in':   'fadeIn 0.6s ease both',
        'fade-up':   'fadeUp 0.7s ease both',
        'float-up':  'floatUp 14s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                          to: { opacity: '1' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        floatUp: {
          '0%':   { transform: 'translateY(105vh)', opacity: '0' },
          '8%':   { opacity: '0.45' },
          '92%':  { opacity: '0.15' },
          '100%': { transform: 'translateY(-120px) translateX(25px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
