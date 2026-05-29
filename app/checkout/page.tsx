'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { checkoutSchema, type CheckoutSchema } from '@/lib/validations'
import { formatPrice } from '@/lib/utils'
import { PROVINCES, VARIANT_LABELS } from '@/types'
import type { ProductVariant } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const total = getTotal()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
  })

  const errorCount = Object.keys(errors).length

  const scrollToFirstError = () => {
    const firstErrorKey = Object.keys(errors)[0]
    if (firstErrorKey) {
      const el = document.getElementById(firstErrorKey)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
    }
  }

  const onSubmit = async (data: CheckoutSchema) => {
    if (items.length === 0) return
    setIsLoading(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Error al procesar el pedido')
      }

      clearCart()
      router.push(`/confirmacion/${json.orderId}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" style={{ backgroundColor: '#F7F2E6' }}>
        <div className="text-center">
          <p className="font-condensed uppercase tracking-wider mb-6" style={{ color: '#8A8A8A' }}>
            Tu carrito está vacío
          </p>
          <a href="/catalogo" className="btn-primary px-8 py-3">Explorar tienda</a>
        </div>
      </div>
    )
  }

  const sectionTitle = {
    fontFamily: 'var(--font-montserrat)',
    fontWeight: 600,
    fontSize: '0.65rem',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    color: '#4A6D4B',
  }

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: '#F7F2E6' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{ backgroundColor: '#B4A194' }} />
            <span className="font-condensed text-xs tracking-[0.4em] uppercase" style={{ color: '#B4A194' }}>
              Finalizar pedido
            </span>
          </div>
          <h1
            className="font-display uppercase"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: '1.05', color: '#2C402E' }}
          >
            Tu pedido
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* FORM — left */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">
            {/* Personal */}
            <div className="space-y-4 p-6 rounded-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0D9CC' }}>
              <h2 style={sectionTitle}>Datos personales</h2>

              <div>
                <label className="label-field" htmlFor="customer_name">Nombre completo *</label>
                <input
                  id="customer_name"
                  type="text"
                  autoComplete="name"
                  {...register('customer_name')}
                  className={`input-field ${errors.customer_name ? 'input-error' : ''}`}
                  placeholder="Juan García"
                />
                {errors.customer_name && (
                  <p className="mt-1 font-condensed text-xs" style={{ color: '#ef4444' }}>{errors.customer_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field" htmlFor="customer_email">Email *</label>
                  <input
                    id="customer_email"
                    type="email"
                    autoComplete="email"
                    {...register('customer_email')}
                    className={`input-field ${errors.customer_email ? 'input-error' : ''}`}
                    placeholder="juan@email.com"
                  />
                  {errors.customer_email && (
                    <p className="mt-1 font-condensed text-xs" style={{ color: '#ef4444' }}>{errors.customer_email.message}</p>
                  )}
                </div>

                <div>
                  <label className="label-field" htmlFor="customer_phone">Teléfono / WhatsApp *</label>
                  <input
                    id="customer_phone"
                    type="tel"
                    autoComplete="tel"
                    {...register('customer_phone')}
                    className={`input-field ${errors.customer_phone ? 'input-error' : ''}`}
                    placeholder="+54 9 11 1234-5678"
                  />
                  {errors.customer_phone && (
                    <p className="mt-1 font-condensed text-xs" style={{ color: '#ef4444' }}>{errors.customer_phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="space-y-4 p-6 rounded-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0D9CC' }}>
              <h2 style={sectionTitle}>Dirección de envío</h2>

              <div>
                <label className="label-field" htmlFor="shipping_address">Dirección *</label>
                <input
                  id="shipping_address"
                  type="text"
                  autoComplete="street-address"
                  {...register('shipping_address')}
                  className={`input-field ${errors.shipping_address ? 'input-error' : ''}`}
                  placeholder="Av. San Martín 1234, Piso 3, Depto B"
                />
                {errors.shipping_address && (
                  <p className="mt-1 font-condensed text-xs" style={{ color: '#ef4444' }}>{errors.shipping_address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field" htmlFor="shipping_city">Ciudad *</label>
                  <input
                    id="shipping_city"
                    type="text"
                    autoComplete="address-level2"
                    {...register('shipping_city')}
                    className={`input-field ${errors.shipping_city ? 'input-error' : ''}`}
                    placeholder="Buenos Aires"
                  />
                  {errors.shipping_city && (
                    <p className="mt-1 font-condensed text-xs" style={{ color: '#ef4444' }}>{errors.shipping_city.message}</p>
                  )}
                </div>

                <div>
                  <label className="label-field" htmlFor="shipping_province">Provincia *</label>
                  <select
                    id="shipping_province"
                    {...register('shipping_province')}
                    className={`input-field ${errors.shipping_province ? 'input-error' : ''}`}
                  >
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.shipping_province && (
                    <p className="mt-1 font-condensed text-xs" style={{ color: '#ef4444' }}>{errors.shipping_province.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="p-6 rounded-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0D9CC' }}>
              <label className="label-field" htmlFor="notes">Notas adicionales (opcional)</label>
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                className="input-field resize-none"
                placeholder="Horario preferido de entrega, referencias para el domicilio, etc."
              />
            </div>

            {/* Payment method */}
            <div className="p-6 rounded-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0D9CC' }}>
              <h2 style={{ ...sectionTitle, marginBottom: '1rem' }}>Método de pago</h2>
              <div
                className="flex items-start gap-4 p-4 rounded-sm"
                style={{ border: '1px solid rgba(44,64,46,0.3)', backgroundColor: 'rgba(44,64,46,0.04)' }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: '#2C402E' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2C402E' }} />
                </div>
                <div>
                  <p className="font-condensed text-sm uppercase tracking-wider" style={{ color: '#2C402E' }}>
                    Pago al recibir / Transferencia
                  </p>
                  <p className="font-body text-xs mt-0.5 leading-relaxed" style={{ color: '#5A5A5A' }}>
                    Abonás en efectivo o por transferencia bancaria. Coordinamos todos los detalles por WhatsApp antes del envío.
                  </p>
                </div>
              </div>
            </div>

            {/* Validation errors summary */}
            {errorCount > 0 && (
              <div
                className="p-4 rounded-sm cursor-pointer"
                style={{ border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)' }}
                onClick={scrollToFirstError}
              >
                <p className="font-condensed text-sm flex items-center gap-2" style={{ color: '#ef4444' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Hay {errorCount} {errorCount === 1 ? 'campo obligatorio sin completar' : 'campos obligatorios sin completar'}. Tocá aquí para ir al primero.
                </p>
              </div>
            )}

            {/* Server error */}
            {submitError && (
              <div
                className="p-4 rounded-sm"
                style={{ border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)' }}
              >
                <p className="font-condensed text-sm" style={{ color: '#ef4444' }}>{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-4"
              id="checkout-submit-btn"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando pedido...
                </span>
              ) : (
                `Confirmar pedido · ${formatPrice(total)}`
              )}
            </button>
          </form>

          {/* ORDER SUMMARY — right */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="rounded-card p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0D9CC', boxShadow: '0 2px 16px rgba(44,64,46,0.08)' }}>
                <h2 style={{ ...sectionTitle, marginBottom: '1.5rem' }}>Resumen del pedido</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product_id}-${item.size}`} className="flex gap-3">
                      <div
                        className="relative w-14 h-16 flex-shrink-0 overflow-hidden rounded-sm"
                        style={{ backgroundColor: '#EDE8DC' }}
                      >
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-condensed text-xs uppercase tracking-wide leading-tight truncate" style={{ color: '#1A1A1A' }}>
                          {item.product_name}
                        </p>
                        <p className="font-condensed text-xs uppercase mt-0.5" style={{ color: '#8A8A8A' }}>
                          {VARIANT_LABELS[item.size as ProductVariant] ?? item.size} × {item.quantity}
                        </p>
                        <p className="font-display text-base font-bold mt-1" style={{ color: '#2C402E' }}>
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4" style={{ borderTop: '1px solid #E0D9CC' }}>
                  <div className="flex justify-between">
                    <span className="font-condensed text-xs uppercase tracking-wider" style={{ color: '#8A8A8A' }}>Subtotal</span>
                    <span className="font-condensed text-sm" style={{ color: '#1A1A1A' }}>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-condensed text-xs uppercase tracking-wider" style={{ color: '#8A8A8A' }}>Envío</span>
                    <span className="font-condensed text-xs uppercase" style={{ color: '#4A6D4B' }}>A coordinar</span>
                  </div>
                  <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #E0D9CC' }}>
                    <span className="font-condensed text-sm uppercase tracking-wider" style={{ color: '#1A1A1A' }}>Total</span>
                    <span className="font-display text-2xl font-bold" style={{ color: '#2C402E' }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <div
                  className="mt-6 p-4 rounded-sm"
                  style={{ backgroundColor: 'rgba(44,64,46,0.06)', border: '1px solid rgba(44,64,46,0.15)' }}
                >
                  <p className="font-condensed text-xs uppercase tracking-wider leading-relaxed" style={{ color: '#4A6D4B' }}>
                    🧉 Nos comunicaremos por WhatsApp para coordinar la entrega y el pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
