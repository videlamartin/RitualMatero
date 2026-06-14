'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { updateOrderStatus, deleteOrder } from '../../actions'
import { formatPrice, getCustomerWhatsAppUrl } from '@/lib/utils'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/types'
import type { Order, OrderStatus, OrderItem } from '@/types'

interface OrdenesClientProps {
  initialOrders: Order[]
}

export function OrdenesClient({ initialOrders }: OrdenesClientProps) {
  const allOrders = initialOrders
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>(() => {
    const filter = searchParams.get('filter')
    return filter ? (filter as OrderStatus) : undefined
  })
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId) {
      const order = allOrders.find((o) => o.id === viewId)
      if (order) {
        setSelectedOrderId(viewId)
        setOrderDetail(order)
      }
    }
  }, [searchParams, allOrders])

  // Filtrar localmente (sin re-fetch) ya que tenemos todos los datos
  const orders = filterStatus
    ? allOrders.filter((o) => o.status === filterStatus)
    : allOrders

  // Abrir detalle: buscar en el array local (ya tiene order_items cargados desde el server)
  const openDetail = (id: string) => {
    const order = allOrders.find((o) => o.id === id) ?? null
    setSelectedOrderId(id)
    setOrderDetail(order)
  }

  const handleCloseModal = () => {
    setSelectedOrderId(null)
    setOrderDetail(null)
    const params = new URLSearchParams(searchParams.toString())
    if (params.has('view')) {
      params.delete('view')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }
  }

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdating(true)
    try {
      await updateOrderStatus(orderId, status)
      // La prop initialOrders se actualizará sola gracias a revalidatePath,
      // solo actualizamos el detalle que tenemos abierto en memoria
      setOrderDetail((prev) => prev ? { ...prev, status } : prev)
    } catch (err) {
      console.error(err)
      alert('Error al actualizar el estado')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    setIsUpdating(true)
    try {
      await deleteOrder(orderId)
      setSelectedOrderId(null)
      setOrderDetail(null)
      const params = new URLSearchParams(searchParams.toString())
      if (params.has('view')) {
        params.delete('view')
        const query = params.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
      }
    } catch (err) {
      console.error(err)
      alert('Error al eliminar la orden')
    } finally {
      setIsUpdating(false)
    }
  }

  const statuses: (OrderStatus | undefined)[] = [
    undefined, 'pendiente', 'preparando', 'enviado', 'entregado', 'cancelado',
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl lg:text-4xl text-verde-profundo uppercase tracking-wider">Órdenes</h1>
        <p className="font-condensed text-xs text-texto-secundario uppercase tracking-wider mt-1">
          {orders.length} {filterStatus ? `${filterStatus}s` : 'órdenes en total'}
        </p>
      </div>

      {/* Status filters — scrolleable en mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map((s) => (
          <button
            key={s ?? 'all'}
            onClick={() => setFilterStatus(s)}
            className={`font-condensed text-xs uppercase tracking-wider px-4 py-2 border transition-colors flex-shrink-0 rounded-sm ${
              filterStatus === s
                ? 'border-verde-musgo text-verde-musgo bg-verde-musgo/10'
                : 'border-borde-suave text-texto-suave hover:border-verde-claro hover:text-verde-profundo'
            }`}
          >
            {s ? ORDER_STATUS_LABELS[s] : 'Todas'}
          </button>
        ))}
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="lg:hidden space-y-3">
        {orders.length === 0 ? (
          <div className="admin-card py-10 text-center font-condensed text-xs text-texto-suave uppercase">
            Sin órdenes
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="admin-card space-y-4 p-4 shadow-sm border border-borde-suave">
              {/* Header: ID + fecha */}
              <div className="flex items-center justify-between pb-2 border-b border-borde-suave">
                <span className="font-condensed text-sm text-verde-profundo font-bold tracking-wider">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="font-condensed text-xs text-texto-suave">
                  {new Date(order.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
              {/* Cliente + total */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-condensed text-base text-verde-profundo">{order.customer_name}</p>
                  <p className="font-condensed text-xs text-texto-suave mt-0.5">{order.customer_phone}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-display text-xl text-verde-profundo mb-1">{formatPrice(order.total)}</span>
                  <span className={`badge border ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openDetail(order.id)}
                  className="flex-1 font-condensed text-sm text-texto-secundario hover:text-verde-profundo uppercase tracking-wider py-2.5 border border-borde-suave hover:border-verde-claro transition-colors rounded-sm bg-white"
                >
                  Ver Detalle
                </button>
                <a
                  href={getCustomerWhatsAppUrl(order.customer_phone, order.id.slice(0, 8).toUpperCase())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-condensed text-sm text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/10 uppercase tracking-wider px-4 py-2.5 transition-colors rounded-sm flex items-center justify-center bg-white"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── DESKTOP: Table ── */}
      <div className="hidden lg:block admin-card overflow-x-auto shadow-card">
        <table className="w-full" aria-label="Lista de órdenes">
          <thead>
            <tr className="border-b border-borde-suave">
              {['ID', 'Cliente', 'Total', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                <th key={h} className="pb-3 text-left font-condensed text-xs text-texto-secundario uppercase tracking-wider pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center font-condensed text-xs text-texto-suave uppercase">
                  Sin órdenes
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="admin-table-row">
                  <td className="py-3 pr-4">
                    <span className="font-condensed text-xs text-texto-secundario">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-condensed text-sm text-verde-profundo">{order.customer_name}</p>
                    <p className="font-condensed text-xs text-texto-suave">{order.customer_phone}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-display text-base text-verde-profundo">{formatPrice(order.total)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge border ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-condensed text-xs text-texto-suave">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetail(order.id)}
                        className="font-condensed text-xs text-texto-secundario hover:text-verde-profundo uppercase tracking-wider px-3 py-1.5 border border-borde-suave hover:border-verde-claro transition-colors rounded-sm"
                      >
                        Ver
                      </button>
                      <a
                        href={getCustomerWhatsAppUrl(order.customer_phone, order.id.slice(0, 8).toUpperCase())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-condensed text-xs text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/10 uppercase tracking-wider px-3 py-1.5 transition-colors"
                      >
                        WA
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order detail modal */}
      {selectedOrderId && (
        <OrderDetailModal
          order={orderDetail}
          isLoading={false}
          onClose={handleCloseModal}
          onStatusChange={(status) => updateStatus(selectedOrderId, status)}
          isUpdating={isUpdating}
          onDelete={() => handleDeleteOrder(selectedOrderId)}
        />
      )}
    </div>
  )
}

interface OrderDetailModalProps {
  order: Order | null
  isLoading: boolean
  onClose: () => void
  onStatusChange: (status: OrderStatus) => void
  isUpdating: boolean
  onDelete: () => Promise<void>
}

function OrderDetailModal({ order, isLoading, onClose, onStatusChange, isUpdating, onDelete }: OrderDetailModalProps) {
  const STATUSES: OrderStatus[] = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado']
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-verde-profundo/80 backdrop-blur-sm">
      <div className="bg-white border border-borde-suave w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-card shadow-premium">
        <div className="flex items-center justify-between px-6 py-5 border-b border-borde-suave">
          <div>
            <h2 className="font-display text-2xl text-verde-profundo uppercase tracking-wider">
              {order ? `Orden #${order.id.slice(0, 8).toUpperCase()}` : 'Cargando...'}
            </h2>
            {order && (
              <p className="font-condensed text-xs text-texto-secundario uppercase tracking-wider mt-0.5">
                {new Date(order.created_at).toLocaleString('es-AR')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-texto-suave hover:text-verde-profundo transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading || !order ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 shimmer-bg w-full" />
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Customer */}
            <div>
              <h3 className="font-condensed text-xs text-verde-musgo uppercase tracking-[0.3em] mb-3">Cliente</h3>
              <div className="space-y-1.5">
                <p className="font-condensed text-sm text-verde-profundo">{order.customer_name}</p>
                <p className="font-condensed text-xs text-texto-suave">{order.customer_email}</p>
                <p className="font-condensed text-xs text-texto-suave">{order.customer_phone}</p>
                <p className="font-condensed text-xs text-texto-suave">
                  {order.shipping_address}, {order.shipping_city}, {order.shipping_province}
                </p>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <h3 className="font-condensed text-xs text-verde-musgo uppercase tracking-[0.3em] mb-2">Nota del cliente</h3>
                <div className="bg-hueso border border-borde-suave p-3 rounded-sm">
                  <p className="font-condensed text-xs text-texto-secundario whitespace-pre-wrap italic">"{order.notes}"</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="font-condensed text-xs text-verde-musgo uppercase tracking-[0.3em] mb-3">Productos</h3>
              <div className="space-y-2">
                {order.order_items?.map((item: OrderItem) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="font-condensed text-sm text-verde-profundo">{item.product_name}</span>
                      <span className="font-condensed text-xs text-texto-suave ml-2">Var. {item.size} × {item.quantity}</span>
                    </div>
                    <span className="font-display text-base text-verde-profundo">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 border-t border-borde-suave mt-3">
                <span className="font-condensed text-sm text-texto-secundario uppercase">Total</span>
                <span className="font-display text-xl text-verde-profundo">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Status change */}
            <div>
              <h3 className="font-condensed text-xs text-verde-musgo uppercase tracking-[0.3em] mb-3">
                Cambiar estado
              </h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    disabled={isUpdating || order.status === s}
                    className={`badge border text-xs py-2 px-4 transition-all flex-1 text-center justify-center ${
                      order.status === s
                        ? ORDER_STATUS_COLORS[s] + ' font-bold shadow-sm'
                        : 'border-borde-suave text-texto-suave hover:border-verde-claro hover:text-verde-profundo bg-hueso/30'
                    } disabled:cursor-not-allowed`}
                  >
                    {ORDER_STATUS_LABELS[s]}
                    {order.status === s && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-8 sm:pb-0 border-t border-borde-suave sticky bottom-0 bg-white">
              <a
                href={getCustomerWhatsAppUrl(order.customer_phone, order.id.slice(0, 8).toUpperCase())}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp py-3.5 text-sm text-center flex-1 rounded-sm"
              >
                Abrir WhatsApp
              </a>

              {confirmDelete ? (
                <div className="flex gap-2 items-center flex-1 justify-end bg-red-50 border border-red-200 p-1.5 rounded-sm">
                  <span className="font-condensed text-xs text-red-500 uppercase tracking-wider pl-2 flex-1">¿Seguro?</span>
                  <button
                    onClick={onDelete}
                    disabled={isUpdating}
                    className="bg-red-500 hover:bg-red-600 text-white font-condensed text-xs uppercase tracking-wider px-4 py-3 transition-colors rounded-sm"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={isUpdating}
                    className="bg-white border border-borde-suave text-texto-secundario hover:text-verde-profundo font-condensed text-xs uppercase tracking-wider px-4 py-3 transition-colors rounded-sm"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={isUpdating}
                  className="btn-secondary text-red-500 border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 py-3.5 text-sm flex-1 uppercase tracking-wider bg-white"
                >
                  Eliminar Orden
                </button>
              )}

              <button onClick={onClose} className="btn-secondary px-6 py-3.5 text-sm bg-white hidden sm:block">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
