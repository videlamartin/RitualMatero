import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          profundo: '#2C402E',
          musgo: '#4A6D4B',
          claro: '#6B8F6C',
          palido: '#E8F0E8',
        },
        cuero: {
          DEFAULT: '#B4A194',
          claro: '#C8B8AC',
          oscuro: '#8A7A6E',
        },
        hueso: {
          DEFAULT: '#F7F2E6',
          oscuro: '#EDE8DC',
          claro: '#FDFAF5',
        },
        texto: {
          primario: '#1A1A1A',
          secundario: '#5A5A5A',
          suave: '#8A8A8A',
        },
        borde: {
          suave: '#E0D9CC',
          DEFAULT: '#C8BFB0',
        },
        black: {
          900: '#0A0A0A',
          800: '#111111',
          700: '#1C1C1C',
        },
        gray: {
          muted: '#888888',
          accent: '#A0A0A0',
        },
        red: {
          primary: '#CC0000',
        }
      },
      fontFamily: {
        display: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        body: ['var(--font-lora)', 'Lora', 'Georgia', 'serif'],
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(3.5rem, 10vw, 8rem)', { lineHeight: '1.0' }],
        'hero-sm': ['clamp(2.5rem, 7vw, 5rem)', { lineHeight: '1.05' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(44, 64, 46, 0.08)',
        'card-hover': '0 8px 32px 0 rgba(44, 64, 46, 0.16)',
        'drawer': '-4px 0 40px rgba(44, 64, 46, 0.15)',
      },
      borderRadius: {
        'card': '10px',
      },
    },
  },
  plugins: [],
}
export default config
