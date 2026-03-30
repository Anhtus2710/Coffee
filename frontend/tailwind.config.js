/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf6ee',
          100: '#fae8cc',
          200: '#f5cf95',
          300: '#f0b55a',
          400: '#eb9d2e',
          500: '#d4821a',
          600: '#b06514',
          700: '#8a4c13',
          800: '#6e3c15',
          900: '#5a3215',
        },
        surface: {
          900: '#0d0b08',
          800: '#161310',
          700: '#1f1a14',
          600: '#2a231b',
          500: '#352c21',
          400: '#4a3d2e',
          300: '#6b5a44',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212, 130, 26, 0.15)',
        'glow-lg': '0 0 40px rgba(212, 130, 26, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
