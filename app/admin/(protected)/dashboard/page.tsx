import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/types'
import { LowStockAlerts } from '@/components/admin/LowStockAlerts'
import type { Order, DashboardStats } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard Admin' }

async function getDashboardData(): Promise<{ stats: DashboardStats; recentOrders: Order[]; lowStockItems: any[] }> {
  try {
    const supabase = createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [ordersToday, pendingOrders, lowStockProducts, recentOrders] = await Promise.all([
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', today.toISOString())
        .neq('status', 'cancelado'),
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'pendiente'),
      supabase
        .from('product_sizes')
        .select('id, size, stock, product_id, products(name)')
        .lt('stock', 3)
        .order('stock', { ascending: true }),
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const orders = ordersToday.data ?? []
    const revenueToday = orders.reduce((sum, o) => sum + (o.total ?? 0), 0)

    const lowStockItems = lowStockProducts.data ?? []

    return {
      stats: {
        orders_today: orders.length,
        revenue_today: revenueToday,
        low_stock_count: lowStockItems.length,
        pending_orders: pendingOrders.count ?? 0,
      },
      recentOrders: (recentOrders.data as Order[]) ?? [],
      lowStockItems,
    }
  } catch {
    return {
      stats: { orders_today: 0, revenue_today: 0, low_stock_count: 0, pending_orders: 0 },
      recentOrders: [],
      lowStockItems: [],
    }
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default async function AdminDashboard() {
  const { stats, recentOrders, lowStockItems } = await getDashboardData()

  const METRICS = [
    {
      label: 'Órdenes hoy',
      value: stats.orders_today,
      cardClass: 'metric-card-blue',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      href: '/admin/ordenes',
    },
    {
      label: 'Facturado hoy',
      value: formatPrice(stats.revenue_today),
      cardClass: 'metric-card-green',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/admin/ordenes',
    },
    {
      label: 'Órdenes pendientes',
      value: stats.pending_orders,
      cardClass: 'metric-card-amber',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/admin/ordenes?filter=pendiente',
      showPulse: stats.pending_orders > 0,
    },
    {
      label: 'Stock bajo',
      value: stats.low_stock_count,
      cardClass: 'metric-card-red',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      valueColor: 'text-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      href: '#low-stock',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl lg:text-4xl text-verde-profundo uppercase tracking-wider">Dashboard</h1>
        <p className="font-condensed text-xs text-texto-secundario uppercase tracking-wider mt-1">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {METRICS.map((metric) => {
          const isAnchor = metric.href.startsWith('#')
          const className = `metric-card ${metric.cardClass} block`
          const content = (
            <>
              <div className="flex items-start justify-between mb-4 relative">
                <div className={`metric-icon ${metric.iconBg} ${metric.iconColor}`}>
                  {metric.icon}
                </div>
                {'showPulse' in metric && metric.showPulse && (
                  <div className="pulse-dot bg-amber-500" style={{ position: 'absolute', top: 2, right: 2 }}>
                    <span className="absolute inset-0 rounded-full bg-amber-500 animate-pulse-ring" />
                  </div>
                )}
              </div>
              <p className={`font-display text-2xl lg:text-3xl ${metric.valueColor}`}>{metric.value}</p>
              <p className="font-condensed text-[10px] text-texto-secundario uppercase tracking-[0.15em] mt-1">{metric.label}</p>
            </>
          )
          return isAnchor ? (
            <a key={metric.label} href={metric.href} className={className}>{content}</a>
          ) : (
            <Link key={metric.label} href={metric.href} className={className}>{content}</Link>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="admin-card shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-condensed text-sm text-verde-musgo uppercase tracking-[0.3em]">
            Últimas órdenes
          </h2>
          <a href="/admin/ordenes" className="font-condensed text-xs text-texto-suave hover:text-verde-profundo uppercase tracking-wider transition-colors flex items-center gap-1.5 group">
            Ver todas
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Mobile: cards */}
        <div className="lg:hidden space-y-3">
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center font-condensed text-xs text-texto-suave uppercase">Sin órdenes aún</p>
          ) : (
            recentOrders.map((order) => (
              <Link href={`/admin/ordenes?view=${order.id}`} key={order.id} className="border border-borde-suave p-3 space-y-2 block hover:bg-hueso transition-colors rounded-sm">
                <div className="flex items-center justify-between">
                  <span className="font-condensed text-xs text-texto-secundario">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="font-condensed text-xs text-texto-suave">
                    {new Date(order.created_at).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="avatar-initials text-[10px] w-6 h-6">{getInitials(order.customer_name)}</span>
                    <span className="font-condensed text-sm text-verde-profundo">{order.customer_name}</span>
                  </div>
                  <span className="font-display text-base text-verde-profundo">{formatPrice(order.total)}</span>
                </div>
                <span className={`badge border ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full" aria-label="Últimas órdenes">
            <thead>
              <tr className="border-b border-borde-suave">
                {['ID', 'Cliente', 'Total', 'Estado', 'Fecha'].map((h) => (
                  <th key={h} className="pb-3 text-left font-condensed text-xs text-texto-secundario uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-condensed text-xs text-texto-suave uppercase">
                    Sin órdenes aún
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="admin-table-row group">
                    <td className="py-0 pr-4">
                      <Link href={`/admin/ordenes?view=${order.id}`} className="block py-3">
                        <span className="font-condensed text-xs text-texto-secundario">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </Link>
                    </td>
                    <td className="py-0 pr-4">
                      <Link href={`/admin/ordenes?view=${order.id}`} className="block py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="avatar-initials">{getInitials(order.customer_name)}</span>
                          <div>
                            <p className="font-condensed text-sm text-verde-profundo">{order.customer_name}</p>
                            <p className="font-condensed text-xs text-texto-suave">{order.customer_phone}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-0 pr-4">
                      <Link href={`/admin/ordenes?view=${order.id}`} className="block py-3">
                        <span className="font-display text-base text-verde-profundo">{formatPrice(order.total)}</span>
                      </Link>
                    </td>
                    <td className="py-0 pr-4">
                      <Link href={`/admin/ordenes?view=${order.id}`} className="block py-3">
                        <span className={`badge border ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </Link>
                    </td>
                    <td className="py-0">
                      <Link href={`/admin/ordenes?view=${order.id}`} className="block py-3">
                        <span className="font-condensed text-xs text-texto-suave">
                          {new Date(order.created_at).toLocaleDateString('es-AR')}
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Warning Section */}
      {lowStockItems.length > 0 && (
        <LowStockAlerts items={lowStockItems} />
      )}
    </div>
  )
}
