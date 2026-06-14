'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import brandLogo from '@/app/img/logo.jpg'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { CartIcon } from '@/components/cart/CartIcon'

const NAV_LINKS = [
  { href: '/catalogo', label: 'Tienda' },
  { href: '/catalogo?categoria=mates', label: 'Mates' },
  { href: '/catalogo?categoria=termos', label: 'Termos' },
  { href: '/catalogo?categoria=yerbas', label: 'Yerbas' },
  { href: '/seguimiento', label: 'Mis Pedidos' },
]

// SVG logo: ícono de mate + texto "RITUAL MATERO"
function MateLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="Ritual Matero - Inicio">
      <Image
        src={brandLogo}
        alt="Ritual Matero Logo"
        width={40}
        height={40}
        className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105 rounded-full"
      />

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span
          className="font-display text-xl uppercase tracking-wider transition-colors duration-200"
          style={{ color: '#2C402E' }}
        >
          RITUAL MATERO
        </span>
        <span
          className="font-condensed text-[9px] uppercase tracking-[0.4em] -mt-0.5"
          style={{ color: '#4A6D4B' }}
        >
          Mates · Termos · Bombillas · Accesorios
        </span>
      </div>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 ${scrolled ? 'backdrop-blur-md' : ''
        }`}
      style={{
        backgroundColor: scrolled ? 'rgba(247, 242, 230, 0.96)' : 'rgba(247, 242, 230, 0.85)',
        borderBottom: scrolled ? '1px solid #E0D9CC' : '1px solid transparent',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <MateLogo />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-6 lg:gap-10">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/catalogo' && pathname.startsWith(link.href.split('?')[0]) && link.href.includes('?') && typeof window !== 'undefined')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-condensed text-sm uppercase tracking-widest transition-colors duration-200"
                  style={{ color: '#5A5A5A' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#2C402E')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#5A5A5A')}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Actions & Search */}
          <div className="flex-1 flex justify-end items-center gap-3 sm:gap-5">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <input
                type="text"
                placeholder="Buscar mates, termos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-3 pr-10 py-1.5 bg-transparent border-b border-[#B4A194] focus:outline-none focus:border-[#2C402E] font-condensed tracking-wider text-sm text-[#2C402E] placeholder-[#8A8A8A] transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#2C402E]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <button
              onClick={openCart}
              className="relative p-2 transition-colors"
              style={{ color: '#5A5A5A' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#2C402E')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#5A5A5A')}
              aria-label={`Carrito (${itemCount} items)`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#2C402E' }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 transition-colors"
              style={{ color: '#5A5A5A' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
              aria-expanded={menuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(247, 242, 230, 0.98)',
              borderBottom: '1px solid #E0D9CC',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4 mt-2">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-transparent border-b border-[#B4A194] focus:outline-none focus:border-[#2C402E] font-condensed tracking-wider text-sm text-[#2C402E] placeholder-[#8A8A8A]"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A5A5A]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-condensed text-sm uppercase tracking-widest py-4 transition-colors flex items-center justify-between"
                  style={{ color: '#5A5A5A', borderBottom: '1px solid #E0D9CC' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#2C402E')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#5A5A5A')}
                >
                  <span>{link.label}</span>
                  <svg className="w-4 h-4 text-[#B4A194]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
