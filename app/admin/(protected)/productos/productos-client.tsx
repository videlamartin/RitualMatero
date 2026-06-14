'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { deleteProduct, upsertProduct } from '../../actions'
import { formatPrice } from '@/lib/utils'
import { 
  CATEGORY_LABELS,
  MATE_TYPES,
  MATE_MATERIALS,
  MATE_TERMINACIONES,
  TERMO_CAPACITIES,
  YERBA_TYPES,
  BOMBILLA_TYPES,
  BOMBILLA_MATERIALS,
  ACCESORIO_CATEGORIES,
  COMBO_TYPES,
} from '@/types'
import type { Product, ProductCategory, ProductMetadata } from '@/types'

interface ProductosClientProps {
  initialProducts: Product[]
}

export function ProductosClient({ initialProducts }: ProductosClientProps) {
  const products = initialProducts
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const productToEdit = products.find(p => p.id === editId)
      if (productToEdit) {
        setEditProduct(productToEdit)
        setShowModal(true)
      }
    }
  }, [searchParams, products])

  const handleCloseModal = () => {
    setShowModal(false)
    setEditProduct(null)
    const params = new URLSearchParams(searchParams.toString())
    if (params.has('edit')) {
      params.delete('edit')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteProduct(id)
      setDeleteConfirm(null)
    } catch (err) {
      console.error(err)
      alert('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalStock = (product: Product) =>
    (product.product_sizes ?? []).reduce((s, ps) => s + ps.stock, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-verde-profundo uppercase tracking-wider">Productos</h1>
          <p className="font-condensed text-xs text-texto-secundario uppercase tracking-wider mt-1">
            {products.length} productos en total
          </p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true) }}
          className="btn-primary px-4 lg:px-6 py-2 lg:py-3 text-xs"
          id="new-product-btn"
        >
          + Nuevo
        </button>
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="lg:hidden space-y-3">
        {products.length === 0 ? (
          <div className="admin-card py-10 text-center font-condensed text-xs text-texto-suave uppercase">
            No hay productos. Creá el primero.
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="admin-card space-y-3">
              {/* Nombre + categoría */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {product.images?.[0] && (
                    <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 border border-borde-suave bg-hueso-oscuro">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-condensed text-sm text-verde-profundo uppercase tracking-wide">{product.name}</p>
                    <span className="badge badge-category mt-1">{CATEGORY_LABELS[product.category]}</span>
                  </div>
                </div>
                {product.featured && (
                  <span className="font-condensed text-xs text-red-primary flex-shrink-0">★ Destacado</span>
                )}
              </div>
              {/* Precio + stock */}
              <div className="flex items-center justify-between pt-2 border-t border-borde-suave">
                <span className="font-display text-lg text-verde-profundo">{formatPrice(product.price)}</span>
                <span className={`font-condensed text-sm ${totalStock(product) < 5 ? 'text-bronce' : 'text-verde-musgo'}`}>
                  {totalStock(product)} uds.
                </span>
              </div>
              {/* Acciones */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setEditProduct(product); setShowModal(true) }}
                  className="flex-1 font-condensed text-xs text-texto-secundario hover:text-verde-profundo uppercase tracking-wider py-2 border border-borde-suave hover:border-verde-claro transition-colors rounded-sm"
                >
                  Editar
                </button>
                {deleteConfirm === product.id ? (
                  <div className="flex gap-1 flex-1">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn-danger text-[10px] px-2 py-1 flex-1"
                      disabled={isDeleting}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="font-condensed text-[10px] text-texto-secundario hover:text-verde-profundo uppercase tracking-wider px-2 py-1 border border-borde-suave flex-1 rounded-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="btn-danger text-xs px-3 py-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── DESKTOP: Table ── */}
      <div className="hidden lg:block admin-card overflow-x-auto shadow-card">
        <table className="w-full" aria-label="Lista de productos">
          <thead>
            <tr className="border-b border-borde-suave">
              {['', 'Nombre', 'Categoría', 'Precio', 'Stock total', 'Destacado', 'Acciones'].map((h) => (
                <th key={h || 'img'} className={`pb-3 text-left font-condensed text-xs text-texto-secundario uppercase tracking-wider pr-4 ${h === '' ? 'w-14' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center font-condensed text-xs text-texto-suave uppercase">
                  No hay productos. Creá el primero.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="admin-table-row">
                  <td className="py-3 pr-2 w-14">
                    {product.images?.[0] ? (
                      <div className="w-10 h-10 rounded-sm overflow-hidden border border-borde-suave bg-hueso-oscuro">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-sm border border-dashed border-borde-suave bg-hueso-oscuro flex items-center justify-center">
                        <svg className="w-4 h-4 text-texto-suave" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-condensed text-sm text-verde-profundo uppercase tracking-wide">{product.name}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="badge badge-category">{CATEGORY_LABELS[product.category]}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-display text-base text-verde-profundo">{formatPrice(product.price)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`font-condensed text-sm ${totalStock(product) < 5 ? 'text-bronce' : 'text-verde-musgo'}`}>
                      {totalStock(product)} unidades
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`font-condensed text-xs uppercase ${product.featured ? 'text-red-primary' : 'text-texto-suave'}`}>
                      {product.featured ? '★ Sí' : 'No'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditProduct(product); setShowModal(true) }}
                        className="font-condensed text-xs text-texto-secundario hover:text-verde-profundo uppercase tracking-wider transition-colors px-3 py-1.5 border border-borde-suave hover:border-verde-claro rounded-sm"
                      >
                        Editar
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn-danger text-[10px] px-2 py-1"
                            disabled={isDeleting}
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="font-condensed text-[10px] text-texto-secundario hover:text-verde-profundo uppercase tracking-wider px-2 py-1 border border-borde-suave rounded-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="btn-danger text-xs px-3 py-1.5"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
        />
      )}
    </div>
  )
}

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onSuccess: () => void
}

function ProductModal({ product, onClose, onSuccess }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    category: product?.category ?? 'mates' as ProductCategory,
    featured: product?.featured ?? false,
  })

  // Metadata
  const [metadata, setMetadata] = useState<ProductMetadata>(product?.metadata ?? {})

  // Image upload state
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images ?? [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [hasSizes, setHasSizes] = useState<boolean>(() => {
    if (product) {
      return !product.product_sizes?.some(ps => ps.size === 'unico')
    }
    return false // Por defecto sin variantes (antes era true)
  })

  // Stock sizes list (custom strings)
  const [sizesList, setSizesList] = useState<{ size: string; stock: number }[]>(() => {
    if (product?.product_sizes && product.product_sizes.length > 0) {
      const isJustUnico = product.product_sizes.length === 1 && product.product_sizes[0].size === 'unico'
      if (!isJustUnico) {
        return product.product_sizes.map(ps => ({ size: ps.size, stock: ps.stock }))
      }
    }
    return []
  })
  
  const [newSizeName, setNewSizeName] = useState('')
  const [stockUnico, setStockUnico] = useState(() => {
    if (product?.product_sizes?.length === 1 && product.product_sizes[0].size === 'unico') {
      return product.product_sizes[0].stock
    }
    return 0
  })

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    for (const f of fileArray) {
      if (!allowed.includes(f.type)) {
        setUploadError(`Archivo no permitido: ${f.name}. Solo PNG, JPG y WebP.`)
        return
      }
      if (f.size > maxSize) {
        setUploadError(`${f.name} excede los 5MB permitidos.`)
        return
      }
    }

    if (imageUrls.length + fileArray.length > 5) {
      setUploadError('Máximo 5 imágenes por producto.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      fileArray.forEach(f => formData.append('files', f))

      const res = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Error al subir imagen')
      }

      setImageUrls(prev => [...prev, ...json.urls])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setIsUploading(false)
    }
  }, [imageUrls.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [handleUpload])

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    setImageUrls(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return arr
    })
  }

  const handleMetadataMulti = (key: keyof ProductMetadata, option: string) => {
    setMetadata(prev => {
      const current = prev[key]
      let arr = Array.isArray(current) ? [...current] : []
      if (arr.includes(option)) {
        arr = arr.filter(o => o !== option)
      } else {
        arr.push(option)
      }
      return { ...prev, [key]: arr }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (hasSizes && sizesList.length === 0) {
      setError('Debés agregar al menos una variante si marcás que tiene variantes.')
      setIsLoading(false)
      return
    }

    try {
      const data = {
        id: product?.id,
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        category: form.category,
        featured: form.featured,
        images: imageUrls,
        metadata,
        sizes: hasSizes 
          ? sizesList
          : [{ size: 'unico', stock: stockUnico }]
      }

      await upsertProduct(data)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-verde-profundo/80 backdrop-blur-sm">
      <div className="bg-white border border-borde-suave w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-card shadow-premium">
        <div className="flex items-center justify-between px-6 py-5 border-b border-borde-suave sticky top-0 bg-white z-10">
          <h2 className="font-display text-2xl text-verde-profundo uppercase tracking-wider">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-texto-suave hover:text-verde-profundo transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4 border-b border-borde-suave pb-6">
            <h3 className="font-condensed tracking-wider text-[#4A6D4B] uppercase">Información General</h3>
            <div>
              <label className="label-field">Nombre *</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label-field">Descripción</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Precio ARS *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label-field">Categoría *</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── METADATA DINAMICA SEGUN CATEGORIA ── */}
          <div className="space-y-4 border-b border-borde-suave pb-6 bg-[#F7F2E6]/50 -mx-6 px-6 pt-4">
            <h3 className="font-condensed tracking-wider text-[#4A6D4B] uppercase">Atributos (Metadatos)</h3>
            
            {form.category === 'mates' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tipo de Mate</label>
                  <select className="input-field" value={metadata.tipo || ''} onChange={(e) => setMetadata({ ...metadata, tipo: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {MATE_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Material principal</label>
                  <select className="input-field" value={metadata.material?.[0] || (typeof metadata.material === 'string' ? metadata.material : '')} onChange={(e) => setMetadata({ ...metadata, material: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {MATE_MATERIALS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label-field mb-2 block">Terminaciones (Multiselección)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {MATE_TERMINACIONES.map(opt => {
                      const isActive = metadata.terminaciones?.includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={isActive || false} onChange={() => handleMetadataMulti('terminaciones', opt)} className="accent-verde-musgo" />
                          <span className="font-body text-sm text-verde-profundo">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {form.category === 'termos' && (
              <div>
                <label className="label-field">Capacidad</label>
                <select className="input-field" value={metadata.capacidad || ''} onChange={(e) => setMetadata({ ...metadata, capacidad: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {TERMO_CAPACITIES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}

            {form.category === 'yerbas' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Marca</label>
                  <input type="text" className="input-field" value={metadata.marca || ''} onChange={(e) => setMetadata({ ...metadata, marca: e.target.value })} placeholder="Ej: Canarias" />
                </div>
                <div>
                  <label className="label-field">Tipo de Yerba</label>
                  <select className="input-field" value={metadata.tipo_yerba || ''} onChange={(e) => setMetadata({ ...metadata, tipo_yerba: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {YERBA_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            )}

            {form.category === 'bombillas' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tipo</label>
                  <select className="input-field" value={metadata.tipo_bombilla || ''} onChange={(e) => setMetadata({ ...metadata, tipo_bombilla: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {BOMBILLA_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label-field mb-2 block">Materiales</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOMBILLA_MATERIALS.map(opt => {
                      const isActive = Array.isArray(metadata.material) ? metadata.material.includes(opt) : metadata.material === opt;
                      return (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={isActive || false} onChange={() => handleMetadataMulti('material', opt)} className="accent-verde-musgo" />
                          <span className="font-body text-sm text-verde-profundo">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {form.category === 'accesorios' && (
              <div>
                <label className="label-field">Categoría de accesorio</label>
                <select className="input-field" value={metadata.categoria_accesorio || ''} onChange={(e) => setMetadata({ ...metadata, categoria_accesorio: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {ACCESORIO_CATEGORIES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}

            {form.category === 'combos' && (
              <div>
                <label className="label-field">Tipo de Combo</label>
                <select className="input-field" value={metadata.tipo_combo || ''} onChange={(e) => setMetadata({ ...metadata, tipo_combo: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {COMBO_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* ── IMAGE UPLOAD ── */}
          <div className="space-y-4 border-b border-borde-suave pb-6">
            <label className="label-field">Imágenes del producto</label>
            {/* Preview grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {imageUrls.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative group aspect-square rounded-sm overflow-hidden border border-borde-suave bg-hueso-oscuro">
                    <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-verde-profundo/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {i > 0 && (
                        <button type="button" onClick={() => moveImage(i, i - 1)} className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-verde-profundo hover:bg-white transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(i)} className="w-6 h-6 bg-red-500/90 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      {i < imageUrls.length - 1 && (
                        <button type="button" onClick={() => moveImage(i, i + 1)} className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-verde-profundo hover:bg-white transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      )}
                    </div>
                    {i === 0 && <span className="absolute top-1 left-1 bg-verde-profundo/80 text-white font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">Principal</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            {imageUrls.length < 5 && (
              <div
                className={`relative border-2 border-dashed rounded-sm p-6 text-center transition-all cursor-pointer ${isDragOver ? 'border-verde-musgo bg-verde-musgo/5' : 'border-borde-suave hover:border-verde-claro hover:bg-hueso-oscuro/50'} ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(e) => { if (e.target.files) handleUpload(e.target.files); e.target.value = '' }} />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-6 h-6 animate-spin text-verde-musgo" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    <p className="font-condensed text-xs text-verde-musgo uppercase tracking-wider">Subiendo...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-texto-suave" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="font-condensed text-xs text-texto-secundario uppercase tracking-wider">Arrastrá imágenes aquí o <span className="text-verde-musgo underline">seleccioná archivos</span></p>
                    <p className="font-condensed text-[10px] text-texto-suave uppercase tracking-wider">PNG, JPG o WebP · máx 5MB · hasta {5 - imageUrls.length} más</p>
                  </div>
                )}
              </div>
            )}
            {uploadError && <p className="mt-2 font-condensed text-xs text-red-500">{uploadError}</p>}
          </div>

          {/* ── VARIANTES Y STOCK ── */}
          <div className="space-y-4 pb-4">
            <h3 className="font-condensed tracking-wider text-[#4A6D4B] uppercase">Inventario y Variantes</h3>
            
            <div className="flex items-center gap-3 mb-4 mt-2">
              <input
                type="checkbox"
                id="hasSizes"
                className="w-4 h-4 accent-verde-musgo bg-transparent border border-borde-suave"
                checked={hasSizes}
                onChange={(e) => setHasSizes(e.target.checked)}
              />
              <label htmlFor="hasSizes" className="font-condensed text-sm text-texto-secundario uppercase tracking-widest cursor-pointer select-none">
                El producto tiene múltiples variantes (colores, tamaños, etc.)
              </label>
            </div>

            <div>
              {hasSizes ? (
                <>
                  <label className="label-field mb-2 block">Variantes y Stock</label>
                  <div className="flex flex-col gap-3">
                    {sizesList.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-hueso border border-borde-suave px-3 py-2 rounded-sm w-full">
                        <input
                          type="text"
                          placeholder="Nombre (ej: Rojo, 1L)"
                          className="w-1/2 bg-transparent border-b border-borde-suave text-verde-profundo font-condensed focus:outline-none"
                          value={s.size}
                          onChange={(e) => {
                            const newSizes = [...sizesList];
                            newSizes[idx].size = e.target.value;
                            setSizesList(newSizes);
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="Stock"
                          className="w-1/4 bg-transparent border-b border-borde-suave text-verde-profundo font-condensed text-center focus:outline-none"
                          value={s.stock}
                          onChange={(e) => {
                            const newSizes = [...sizesList];
                            newSizes[idx].stock = parseInt(e.target.value) || 0;
                            setSizesList(newSizes);
                          }}
                        />
                        <button type="button" onClick={() => setSizesList(sizesList.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Nueva variante..."
                        className="input-field flex-1"
                        value={newSizeName}
                        onChange={e => setNewSizeName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newSizeName.trim() && !sizesList.some(s => s.size === newSizeName.trim())) {
                              setSizesList([...sizesList, { size: newSizeName.trim(), stock: 0 }]);
                              setNewSizeName('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-secondary px-4 py-2 text-xs h-full"
                        onClick={() => {
                          if (newSizeName.trim() && !sizesList.some(s => s.size === newSizeName.trim())) {
                            setSizesList([...sizesList, { size: newSizeName.trim(), stock: 0 }]);
                            setNewSizeName('');
                          }
                        }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label className="label-field mb-2 block">Stock disponible (Variante única)</label>
                  <div className="flex items-center gap-2 bg-hueso border border-borde-suave px-3 py-2 w-full sm:w-1/2 rounded-sm">
                    <span className="font-display text-sm text-verde-profundo w-12 uppercase">Único</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-transparent border-b border-borde-suave text-verde-profundo font-condensed text-center focus:outline-none"
                      value={stockUnico}
                      onChange={(e) => setStockUnico(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="featured-check"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-verde-musgo"
              />
              <label htmlFor="featured-check" className="font-condensed text-sm text-texto-secundario uppercase tracking-wider">
                Producto destacado en página principal
              </label>
            </div>
          </div>

          {error && (
            <p className="font-condensed text-xs text-red-400 text-center py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-borde-suave">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 text-xs">
              {isLoading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-6 py-3 text-xs">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
