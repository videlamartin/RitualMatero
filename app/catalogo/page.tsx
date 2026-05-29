import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/product/ProductGrid'
import type { Product } from '@/types'
import { CatalogoFilters } from './catalogo-filters'

interface CatalogoPageProps {
  searchParams: {
    categoria?: string
    variante?: string
    precioMin?: string
    precioMax?: string
    pagina?: string
    talle?: string // Legacy
  }
}

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explorá toda la selección de Ritual Matero. Mates artesanales, yerbas premium, bombillas, accesorios y combos materos.',
}

const PAGE_SIZE = 12

async function getProducts(
  category?: string,
  variant?: string,
  precioMin?: string,
  precioMax?: string,
  page: number = 1
): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = createClient()
    let selectQuery = '*, product_sizes(*)'
    if (variant) {
      selectQuery = '*, product_sizes!inner(*)'
    }

    let query = supabase
      .from('products')
      .select(selectQuery, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (variant) {
      query = query.eq('product_sizes.size', variant).gt('product_sizes.stock', 0)
    }

    if (precioMin) {
      query = query.gte('price', parseFloat(precioMin))
    }
    
    if (precioMax) {
      query = query.lte('price', parseFloat(precioMax))
    }

    const { data, count, error } = await query
    if (error) return { products: [], total: 0 }
    return { products: (data as unknown as Product[]) ?? [], total: count ?? 0 }
  } catch {
    return { products: [], total: 0 }
  }
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const category = searchParams.categoria
  const variant = searchParams.variante ?? searchParams.talle
  const precioMin = searchParams.precioMin
  const precioMax = searchParams.precioMax
  const page = parseInt(searchParams.pagina ?? '1', 10)

  const { products, total } = await getProducts(category, variant, precioMin, precioMax, page)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const buildUrl = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { 
      categoria: category, 
      variante: variant, 
      precioMin: precioMin,
      precioMax: precioMax,
      pagina: undefined, 
      ...params 
    }
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'all') sp.set(k, v)
    })
    const s = sp.toString()
    return `/catalogo${s ? `?${s}` : ''}`
  }

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: '#F7F2E6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{ backgroundColor: '#B4A194' }} />
            <span className="font-condensed text-xs tracking-[0.4em] uppercase" style={{ color: '#B4A194' }}>
              Selección completa
            </span>
          </div>
          <h1 className="font-display uppercase" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: '1.05', color: '#2C402E' }}>
            Tienda
          </h1>
        </div>

        {/* The filters component wraps the layout to place the sidebar correctly */}
        <CatalogoFilters total={total}>
          {products.length > 0 ? (
            <>
              <ProductGrid products={products} columns={3} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ pagina: String(page - 1) })}
                      className="btn-secondary px-4 py-2 text-xs"
                    >
                      ← Anterior
                    </Link>
                  )}
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Link
                      key={i}
                      href={buildUrl({ pagina: String(i + 1) })}
                      className="w-8 h-8 flex items-center justify-center font-condensed text-xs border rounded-sm transition-all duration-200"
                      style={
                        page === i + 1
                          ? { borderColor: '#2C402E', backgroundColor: '#2C402E', color: 'white' }
                          : { borderColor: '#E0D9CC', color: '#5A5A5A' }
                      }
                    >
                      {i + 1}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ pagina: String(page + 1) })}
                      className="btn-secondary px-4 py-2 text-xs"
                    >
                      Siguiente →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="font-condensed uppercase tracking-wider mb-6" style={{ color: '#8A8A8A' }}>
                No hay productos que coincidan con tu búsqueda
              </p>
              <Link href="/catalogo" className="btn-secondary px-8 py-3 text-xs">
                Ver toda la tienda
              </Link>
            </div>
          )}
        </CatalogoFilters>
      </div>
    </div>
  )
}
