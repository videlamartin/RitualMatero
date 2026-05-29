'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import type { ProductVariant } from '@/types'
import { VARIANT_LABELS } from '@/types'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore()
  const total = getTotal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(44, 64, 46, 0.45)' }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col"
            style={{
              backgroundColor: '#FDFAF5',
              borderLeft: '1px solid #E0D9CC',
              boxShadow: '-4px 0 40px rgba(44, 64, 46, 0.15)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid #E0D9CC' }}
            >
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider" style={{ color: '#2C402E' }}>
                  Tu Carrito
                </h2>
                <p className="font-condensed text-xs uppercase tracking-wider mt-0.5" style={{ color: '#8A8A8A' }}>
                  {items.length} {items.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-sm transition-colors"
                style={{ color: '#8A8A8A' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#2C402E')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#8A8A8A')}
                aria-label="Cerrar carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  {/* Mate icon */}
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#E0D9CC' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 3h8l1 2H7L8 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 5c0 8 10 8 10 0" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 5v10M10 9h4M9 13c0 2 6 2 6 0" />
                  </svg>
                  <p className="font-condensed uppercase tracking-wider text-sm mb-1" style={{ color: '#5A5A5A' }}>
                    Tu carrito está vacío
                  </p>
                  <p className="font-body text-xs mb-6" style={{ color: '#8A8A8A' }}>
                    Explorá nuestra selección de mates y accesorios
                  </p>
                  <div className="flex flex-col gap-3 w-full max-w-[200px] mx-auto">
                    <Link
                      href="/catalogo"
                      onClick={closeCart}
                      className="btn-secondary w-full py-2 text-xs text-center"
                    >
                      Explorar tienda
                    </Link>
                    <Link
                      href="/seguimiento"
                      onClick={closeCart}
                      className="font-condensed text-xs uppercase tracking-wider text-center transition-colors"
                      style={{ color: '#8A8A8A' }}
                    >
                      Mis pedidos
                    </Link>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product_id}-${item.size}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22 }}
                      className="flex gap-4 pb-4"
                      style={{ borderBottom: '1px solid #E0D9CC' }}
                    >
                      {/* Image */}
                      <div
                        className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-sm"
                        style={{ backgroundColor: '#EDE8DC' }}
                      >
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-condensed text-sm uppercase tracking-wide leading-tight truncate" style={{ color: '#1A1A1A' }}>
                          {item.product_name}
                        </p>
                        <p className="font-condensed text-xs uppercase tracking-widest mt-1" style={{ color: '#8A8A8A' }}>
                          {VARIANT_LABELS[item.size as ProductVariant] ?? item.size}
                        </p>
                        <p className="font-display text-lg font-bold mt-1" style={{ color: '#2C402E' }}>
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.size as ProductVariant, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded-sm text-sm transition-colors"
                            style={{ borderColor: '#E0D9CC', color: '#5A5A5A' }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLButtonElement
                              el.style.borderColor = '#2C402E'
                              el.style.color = '#2C402E'
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLButtonElement
                              el.style.borderColor = '#E0D9CC'
                              el.style.color = '#5A5A5A'
                            }}
                            aria-label="Reducir cantidad"
                          >
                            −
                          </button>
                          <span className="font-condensed text-sm w-6 text-center" style={{ color: '#1A1A1A' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.size as ProductVariant, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                            className="w-6 h-6 flex items-center justify-center border rounded-sm text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ borderColor: '#E0D9CC', color: '#5A5A5A' }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLButtonElement
                              if (!el.disabled) {
                                el.style.borderColor = '#2C402E'
                                el.style.color = '#2C402E'
                              }
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLButtonElement
                              el.style.borderColor = '#E0D9CC'
                              el.style.color = '#5A5A5A'
                            }}
                            aria-label="Aumentar cantidad"
                            title={item.stock !== undefined && item.quantity >= item.stock ? 'Límite de stock alcanzado' : undefined}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.product_id, item.size as ProductVariant)}
                            className="ml-auto transition-colors"
                            style={{ color: '#C8BFB0' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#2C402E')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#C8BFB0')}
                            aria-label="Eliminar producto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 space-y-4" style={{ borderTop: '1px solid #E0D9CC' }}>
                <div className="flex justify-between items-baseline">
                  <span className="font-condensed text-sm uppercase tracking-wider" style={{ color: '#5A5A5A' }}>
                    Total
                  </span>
                  <span className="font-display text-3xl font-bold" style={{ color: '#2C402E' }}>
                    {formatPrice(total)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full py-4 text-sm"
                  id="cart-checkout-btn"
                >
                  Finalizar pedido
                </Link>

                <button
                  onClick={closeCart}
                  className="btn-secondary w-full py-3 text-xs"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
