'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProductCategory, ProductVariant, CATEGORY_LABELS, VARIANT_LABELS } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'TODOS' },
  { value: 'mates', label: 'MATES' },
  { value: 'bombillas', label: 'BOMBILLAS' },
  { value: 'termos', label: 'TERMOS' },
  { value: 'yerbas', label: 'YERBAS' },
  { value: 'accesorios', label: 'ACCESORIOS' },
  { value: 'combos', label: 'COMBOS' },
]

const CATEGORY_VARIANTS: Partial<Record<ProductCategory, ProductVariant[]>> = {
  mates: ['natural', 'curado'],
  yerbas: ['250g', '500g', '1kg'],
  termos: ['500ml', '1l', '1.5l'],
}

export function CatalogoFilters({ total, children }: { total: number, children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('categoria') || 'all'
  const currentVariant = searchParams.get('variante') || ''
  const currentMinPrice = searchParams.get('precioMin') || ''
  const currentMaxPrice = searchParams.get('precioMax') || ''

  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setMinPrice(searchParams.get('precioMin') || '')
    setMaxPrice(searchParams.get('precioMax') || '')
  }, [searchParams])

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    params.delete('pagina')
    router.push(`/catalogo?${params.toString()}`)
  }

  const applyPrice = () => {
    updateFilters({ precioMin: minPrice, precioMax: maxPrice })
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false)
    }
  }

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    router.push('/catalogo')
    setIsMobileOpen(false)
  }

  const handleCategoryClick = (val: string) => {
    updateFilters({ categoria: val, variante: null })
  }

  const hasActiveFilters = currentCategory !== 'all' || currentVariant !== '' || currentMinPrice !== '' || currentMaxPrice !== ''

  const availableVariants = currentCategory !== 'all' ? CATEGORY_VARIANTS[currentCategory as ProductCategory] : undefined

  return (
    <div className="w-full">
      {/* Categories (Horizontal Scroll Mobile / Desktop) */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-3 min-w-max">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`px-5 py-2 rounded-full font-condensed text-sm tracking-wider uppercase transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#2C402E] text-white border border-[#2C402E]'
                    : 'bg-white text-[#2C402E] border border-[#2C402E] hover:bg-[#F7F2E6]'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Info & Mobile Toggle */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <p className="font-condensed text-sm uppercase tracking-wider text-[#8A8A8A]">
          Mostrando {total} {total === 1 ? 'producto' : 'productos'}
        </p>
        <button
          className="lg:hidden btn-secondary text-xs px-4 py-2"
          onClick={() => setIsMobileOpen(true)}
        >
          Ver filtros
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Desktop Sidebar & Mobile Drawer wrapper */}
        <div
          className={`fixed inset-0 z-50 lg:static lg:z-auto lg:block lg:w-56 flex-shrink-0 transition-opacity ${
            isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'
          }`}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 lg:hidden" 
            onClick={() => setIsMobileOpen(false)} 
          />

          {/* Content */}
          <div className={`absolute right-0 top-0 bottom-0 w-80 bg-[#F7F2E6] lg:bg-transparent p-6 lg:p-0 lg:static lg:w-full transition-transform duration-300 overflow-y-auto lg:overflow-visible ${
            isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}>
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <h2 className="font-display text-2xl text-[#2C402E] uppercase">Filtros</h2>
              <button onClick={() => setIsMobileOpen(false)} className="text-[#5A5A5A]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Variant Filter (Conditional) */}
              <AnimatePresence>
                {availableVariants && availableVariants.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <h3 className="font-condensed text-xs uppercase tracking-[0.3em] mb-4 text-[#4A6D4B]">
                      Variante
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateFilters({ variante: null })}
                        className={`px-3 py-1.5 rounded-sm font-condensed text-xs tracking-wider uppercase border transition-colors ${
                          !currentVariant
                            ? 'bg-[#2C402E]/10 border-[#2C402E] text-[#2C402E]'
                            : 'bg-white border-[#E0D9CC] text-[#5A5A5A] hover:border-[#2C402E]'
                        }`}
                      >
                        TODAS
                      </button>
                      {availableVariants.map((v) => (
                        <button
                          key={v}
                          onClick={() => updateFilters({ variante: v })}
                          className={`px-3 py-1.5 rounded-sm font-condensed text-xs tracking-wider uppercase border transition-colors ${
                            currentVariant === v
                              ? 'bg-[#2C402E]/10 border-[#2C402E] text-[#2C402E]'
                              : 'bg-white border-[#E0D9CC] text-[#5A5A5A] hover:border-[#2C402E]'
                          }`}
                        >
                          {VARIANT_LABELS[v]}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Price Filter */}
              <div>
                <h3 className="font-condensed text-xs uppercase tracking-[0.3em] mb-4 text-[#4A6D4B]">
                  Precio (ARS)
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0D9CC] rounded-sm text-sm focus:outline-none focus:border-[#2C402E]"
                  />
                  <span className="text-[#8A8A8A]">-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0D9CC] rounded-sm text-sm focus:outline-none focus:border-[#2C402E]"
                  />
                </div>
                <button
                  onClick={applyPrice}
                  className="w-full py-2 bg-[#2C402E] text-white font-condensed text-xs tracking-wider uppercase rounded-sm hover:bg-[#4A6D4B] transition-colors"
                >
                  Aplicar
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 border border-[#2C402E] text-[#2C402E] font-condensed text-xs tracking-wider uppercase rounded-sm hover:bg-[#2C402E]/10 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
              
              {/* Mobile apply button */}
              <div className="pt-4 mt-8 border-t border-[#E0D9CC] lg:hidden">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full py-3 bg-[#4A6D4B] text-white font-condensed text-sm tracking-wider uppercase rounded-sm"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Main Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
