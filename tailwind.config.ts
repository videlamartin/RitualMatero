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
          profundo: '#1C301D', // Aún más rico y oscuro
          musgo: '#3A5A3B',
          claro: '#6B8F6C',
          palido: '#E8F0E8',
        },
        cuero: {
          DEFAULT: '#9A8272',
          claro: '#C8B8AC',
          oscuro: '#6A5A4A',
        },
        bronce: {
          DEFAULT: '#B8860B', // Dorado Oscuro / Bronce (Accent)
          claro: '#DAA520',
          oscuro: '#8B6508',
        },
        hueso: {
          DEFAULT: '#FDFBF7', // Más crema luminoso
          oscuro: '#F3EFE6',
          claro: '#FFFFFF',
        },
        texto: {
          primario: '#1A1A1A',
          secundario: '#4A4A4A',
          suave: '#7A7A7A',
        },
        borde: {
          suave: '#EBE5D8',
          DEFAULT: '#D1C9B8',
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
        'pulse-ring': 'pulseRing 2s ease-out infinite',
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
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(28, 48, 29, 0.05)',
        'card-hover': '0 12px 30px -4px rgba(28, 48, 29, 0.12)',
        'drawer': '-4px 0 40px rgba(28, 48, 29, 0.15)',
        'premium': '0 10px 40px -10px rgba(184, 134, 11, 0.15)',
      },
      borderRadius: {
        'card': '10px',
      },
    },
  },
  plugins: [],
}
export default config
