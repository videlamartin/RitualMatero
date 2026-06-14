'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LowStockItem {
  id: string
  size: string
  stock: number
  product_id: string
  products: { name: string } | null
}

interface LowStockAlertsProps {
  items: LowStockItem[]
}

function StockBar({ stock, max = 3 }: { stock: number; max?: number }) {
  const pct = Math.min((stock / max) * 100, 100)
  const colorClass =
    stock === 0 ? 'stock-bar-critical' : stock === 1 ? 'stock-bar-warning' : 'stock-bar-ok'

  return (
    <div className="stock-bar w-16">
      <div
        className={`stock-bar-fill ${colorClass}`}
        style={{ width: `${Math.max(pct, 8)}%` }}
      />
    </div>
  )
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visibleItems = items.filter((item) => !dismissed.has(item.id))

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  if (items.length === 0) return null

  return (
    <div
      id="low-stock"
      className="admin-card mt-6 scroll-mt-24"
      style={{
        borderColor: 'rgba(239, 68, 68, 0.2)',
        background: 'linear-gradient(135deg, #FEF2F2 0%, #FEFEFE 100%)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-condensed text-sm text-red-600 uppercase tracking-[0.3em]">
            Alertas de Stock Bajo
          </h2>
        </div>
        {dismissed.size > 0 && (
          <button
            onClick={() => setDismissed(new Set())}
            className="font-condensed text-[10px] text-texto-suave hover:text-verde-profundo uppercase tracking-wider transition-colors"
          >
            Mostrar ocultos ({dismissed.size})
          </button>
        )}
      </div>
      <div className="space-y-3">
        {visibleItems.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-red-200 bg-white/50 rounded-sm">
            <p className="font-condensed text-xs text-texto-suave uppercase tracking-wider">
              Todas las alertas de stock han sido ocultadas
            </p>
            <button
              onClick={() => setDismissed(new Set())}
              className="mt-3 font-condensed text-xs text-red-500 hover:text-red-700 uppercase tracking-[0.2em] transition-colors underline"
            >
              Mostrar todas las alertas ({dismissed.size})
            </button>
          </div>
        ) : (
          visibleItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-red-100 pb-3 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="font-condensed text-sm text-verde-profundo uppercase tracking-wide truncate">
                  {item.products?.name || 'Producto Desconocido'}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-condensed text-xs text-red-500">Variante: {item.size}</p>
                  <StockBar stock={item.stock} />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href={`/admin/productos?edit=${item.product_id}`}
                  className="font-display text-2xl text-red-500 bg-red-500/10 px-4 py-1.5 rounded-lg hover:bg-red-500/20 transition-all hover:scale-105 cursor-pointer border border-red-500/10"
                  title="Editar stock del producto"
                >
                  {item.stock}
                </Link>
                <button
                  onClick={() => handleDismiss(item.id)}
                  className="p-1.5 text-texto-suave hover:text-red-500 transition-colors rounded hover:bg-red-50"
                  title="Ocultar alerta"
                  aria-label={`Ocultar alerta de ${item.products?.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.5 6.5m3.378 3.378l4.242 4.242M6.5 6.5L3 3m3.5 3.5l11 11M17.5 17.5L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
