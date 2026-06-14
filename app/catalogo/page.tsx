import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/product/ProductGrid'
import type { Product } from '@/types'
import { CatalogoFilters } from './catalogo-filters'

interface CatalogoPageProps {
  searchParams: {
    q?: string
    categoria?: string
    variante?: string
    precioMin?: string
    precioMax?: string
    pagina?: string
    talle?: string // Legacy
    tipo?: string
    material?: string
    terminacion?: string
    capacidad?: string
    marca?: string
    tipo_yerba?: string
    tipo_bombilla?: string
    categoria_accesorio?: string
    tipo_combo?: string
  }
}

export const metadata: Metadata = {
  title: 'Tienda | Ritual Matero',
  description: 'Explorá toda la selección de Ritual Matero. Mates artesanales, yerbas premium, bombillas, accesorios y combos materos.',
}

const PAGE_SIZE = 12

async function getProducts(
  params: CatalogoPageProps['searchParams'],
  page: number = 1
): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = createClient()
    let selectQuery = '*, product_sizes(*)'
    
    // Si buscamos por variante estricta
    if (params.variante) {
      selectQuery = '*, product_sizes!inner(*)'
    }

    let query = supabase
      .from('products')
      .select(selectQuery, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    // Búsqueda inteligente
    if (params.q) {
      query = query.ilike('search_text', `%${params.q}%`)
    }

    // Categoría
    if (params.categoria && params.categoria !== 'all') {
      query = query.eq('category', params.categoria)
    }

    // Variante/Talle (filtra que tenga stock)
    if (params.variante) {
      query = query.eq('product_sizes.size', params.variante).gt('product_sizes.stock', 0)
    }

    // Rango de precio
    if (params.precioMin) query = query.gte('price', parseFloat(params.precioMin))
    if (params.precioMax) query = query.lte('price', parseFloat(params.precioMax))

    // ==========================================
    // Filtros por metadatos (JSONB)
    // ==========================================
    if (params.tipo) query = query.contains('metadata', { tipo: params.tipo })
    if (params.capacidad) query = query.contains('metadata', { capacidad: params.capacidad })
    if (params.marca) query = query.contains('metadata', { marca: params.marca })
    if (params.tipo_yerba) query = query.contains('metadata', { tipo_yerba: params.tipo_yerba })
    if (params.tipo_bombilla) query = query.contains('metadata', { tipo_bombilla: params.tipo_bombilla })
    if (params.categoria_accesorio) query = query.contains('metadata', { categoria_accesorio: params.categoria_accesorio })
    if (params.tipo_combo) query = query.contains('metadata', { tipo_combo: params.tipo_combo })

    // Manejo de multi-select para material (OR logic)
    if (params.material) {
      const materials = params.material.split(',')
      if (materials.length === 1) {
        // En algunos casos material es array (bombillas), en otros string (mates)
        // Para soportar ambos, usamos ilike sobre el json convertido a texto o chequeamos array vs string
        // Como PostgREST or() es delicado con comillas, buscaremos mediante textSearch o un approach más seguro:
        query = query.contains('metadata', { material: materials[0] })
      } else {
        const orConditions = materials.map(m => `metadata->>material.eq.${m}`).join(',')
        query = query.or(orConditions)
      }
    }

    // Manejo de multi-select para terminaciones (Array JSONB)
    if (params.terminacion) {
      const terms = params.terminacion.split(',')
      if (terms.length === 1) {
        query = query.contains('metadata', { terminaciones: [terms[0]] })
      } else {
        const orConditions = terms.map(t => `metadata.cs.{"terminaciones":["${t}"]}`).join(',')
        query = query.or(orConditions)
      }
    }

    const { data, count, error } = await query
    
    if (error) {
      console.error('Error fetching products:', error)
      return { products: [], total: 0 }
    }
    
    return { products: (data as unknown as Product[]) ?? [], total: count ?? 0 }
  } catch (err) {
    console.error('Unexpected error fetching products:', err)
    return { products: [], total: 0 }
  }
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const page = parseInt(searchParams.pagina ?? '1', 10)
  // Normalizar variante/talle
  const paramsToFetch = { ...searchParams, variante: searchParams.variante ?? searchParams.talle }
  
  const { products, total } = await getProducts(paramsToFetch, page)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const buildUrl = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...searchParams, pagina: undefined, ...params }
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ backgroundColor: '#B4A194' }} />
                <span className="font-condensed text-xs tracking-[0.4em] uppercase" style={{ color: '#B4A194' }}>
                  {searchParams.q ? 'Resultados de Búsqueda' : 'Selección completa'}
                </span>
              </div>
              <h1 className="font-display uppercase" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: '1.05', color: '#2C402E' }}>
                {searchParams.q ? `"${searchParams.q}"` : 'Tienda'}
              </h1>
            </div>
          </div>
        </div>

        {/* Filters and Grid */}
        <CatalogoFilters total={total} searchParams={searchParams}>
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
