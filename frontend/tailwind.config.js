/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        backdrop: {
          start:  '#0F172A',
          mid:    '#1E293B',
          end:    '#020617',
        },
        surface: {
          base:   'rgba(30,41,59,0.50)',
          raised: 'rgba(15,23,42,0.95)',
          inset:  'rgba(0,0,0,0.30)',
        },
        brand: {
          DEFAULT: '#818CF8',
          light:   '#C7D2FE',
          dark:    '#6366F1',
          muted:   'rgba(99,102,241,0.15)',
        },
        txt: {
          primary:   '#F1F5F9',
          secondary: '#CBD5E1',
          tertiary:  '#94A3B8',
          muted:     '#64748B',
          faint:     '#334155',
        },
        status: {
          green:  '#4ADE80',
          yellow: '#FACC15',
          red:    '#F87171',
          blue:   '#60A5FA',
          orange: '#FB923C',
          purple: '#C084FC',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.20)',
        cardHover: '0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.10)',
        elevated: '0 25px 50px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.03)',
        glow:  '0 0 20px rgba(99,102,241,0.20)',
        glowSm: '0 0 12px rgba(99,102,241,0.15)',
      },
      backdropBlur: {
        sm:    '8px',
        card:  '16px',
        modal: '40px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.35s ease-out',
        'float':     'float 6s ease-in-out infinite',
        'shimmer':   'shimmer 2.5s linear infinite',
        'glassIn':   'glassIn 0.4s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glassIn: {
          '0%':   { opacity: '0', transform: 'scale(0.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}