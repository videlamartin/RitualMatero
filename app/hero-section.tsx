'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { getWhatsAppUrl } from '@/lib/utils'

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(150deg, #F7F2E6 0%, #EDE8DC 40%, #E8F0E8 100%)',
      }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px',
        }}
      />

      {/* Organic green glow blobs */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,109,75,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-1/3 left-1/6 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(180,161,148,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Large watermark text */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-display uppercase"
          style={{
            fontSize: 'clamp(8rem, 20vw, 22rem)',
            lineHeight: '1',
            writingMode: 'vertical-rl',
            color: 'rgba(44, 64, 46, 0.04)',
            letterSpacing: '-0.02em',
          }}
        >
          MATE
        </span>
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-px" style={{ backgroundColor: '#B4A194' }} />
            <span
              className="font-condensed text-xs tracking-[0.4em] uppercase"
              style={{ color: '#B4A194' }}
            >
              Mates · Yerbas · Accesorios Artesanales
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="font-display uppercase leading-none mb-6"
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 7rem)',
              lineHeight: '1.05',
              color: 'var(--verde-profundo)',
            }}
          >
            El mate es un<br />
            <span className="text-bronce italic pr-2">ritual</span>,<br />
            no una rutina.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="font-body text-lg mb-10 max-w-lg leading-relaxed"
            style={{ color: '#5A5A5A' }}
          >
            Mates, yerbas y accesorios para quienes saben disfrutar el momento.
            Productos seleccionados. Envíos a todo el país.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/catalogo"
              className="btn-primary px-10 py-4 text-sm"
              id="hero-cta-btn"
            >
              Explorar tienda
            </Link>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-10 py-4 text-sm"
            >
              Consultar por WhatsApp
            </a>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            {['Transferencia o Efectivo', 'Envíos a todo el país', 'Atención personalizada'].map((item) => (
              <span
                key={item}
                className="font-condensed text-xs uppercase tracking-wider px-4 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(44, 64, 46, 0.08)',
                  color: '#4A6D4B',
                  border: '1px solid rgba(44, 64, 46, 0.15)',
                }}
              >
                ✓ {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Vertical label — right side */}
        <div
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <span
            className="font-condensed text-xs uppercase tracking-[0.5em]"
            style={{
              writingMode: 'vertical-rl',
              color: '#C8BFB0',
            }}
          >
            Ritual Matero · Argentina
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <button
          onClick={() => {
            const el = document.getElementById('categories')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group focus:outline-none"
          aria-label="Ver categorías"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <svg
              className="w-6 h-6 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: '#C8BFB0' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
      </motion.div>
    </section>
  )
}
