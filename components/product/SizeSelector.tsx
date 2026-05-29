'use client'

import type { ProductSizeStock, ProductVariant } from '@/types'
import { VARIANT_ORDER, VARIANT_LABELS } from '@/types'
import { getStockLabel } from '@/lib/utils'

interface VariantSelectorProps {
  sizes: ProductSizeStock[]
  selectedSize: ProductVariant | null
  onSelect: (size: ProductVariant) => void
}

export function SizeSelector({ sizes, selectedSize, onSelect }: VariantSelectorProps) {
  const sizeMap = new Map(sizes.map((s) => [s.size, s.stock]))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="label-field">Variante</span>
        {selectedSize && (
          <span className="font-condensed text-xs uppercase tracking-widest" style={{ color: '#4A6D4B' }}>
            {VARIANT_LABELS[selectedSize] ?? selectedSize} seleccionado
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {VARIANT_ORDER.filter((size) => sizeMap.has(size)).map((size) => {
          const stock = sizeMap.get(size) ?? 0
          const outOfStock = stock === 0
          const stockInfo = getStockLabel(stock)
          const isSelected = selectedSize === size
          const label = VARIANT_LABELS[size] ?? size

          return (
            <button
              key={size}
              onClick={() => !outOfStock && onSelect(size)}
              disabled={outOfStock}
              className={`relative px-4 py-2.5 font-condensed text-sm uppercase tracking-widest border rounded-sm transition-all duration-200 ${
                outOfStock
                  ? 'cursor-not-allowed line-through'
                  : ''
              }`}
              style={
                outOfStock
                  ? { borderColor: '#E0D9CC', color: '#C8BFB0' }
                  : isSelected
                  ? { borderColor: '#2C402E', backgroundColor: '#2C402E', color: 'white' }
                  : { borderColor: '#C8BFB0', color: '#1A1A1A' }
              }
              onMouseEnter={(e) => {
                if (!outOfStock && !isSelected) {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#4A6D4B'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#2C402E'
                }
              }}
              onMouseLeave={(e) => {
                if (!outOfStock && !isSelected) {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#C8BFB0'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#1A1A1A'
                }
              }}
              aria-label={`Variante ${label}${outOfStock ? ' - sin stock' : stock < 4 ? ` - últimos ${stock}` : ''}`}
              aria-pressed={isSelected}
            >
              {label}
              {stockInfo && !outOfStock && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-[9px] px-1 font-bold uppercase rounded-sm"
                  style={{ color: '#B4A194', backgroundColor: 'white', border: '1px solid #B4A194' }}
                >
                  {stock}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedSize && (() => {
        const stock = sizeMap.get(selectedSize) ?? 0
        const stockInfo = getStockLabel(stock)
        if (stockInfo && stock > 0) {
          return (
            <p className="mt-2 font-condensed text-xs uppercase tracking-wider" style={{ color: '#B4A194' }}>
              ⚠ {stockInfo.label} disponibles
            </p>
          )
        }
        return null
      })()}
    </div>
  )
}
