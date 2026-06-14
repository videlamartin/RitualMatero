export type ProductCategory = 'mates' | 'bombillas' | 'termos' | 'yerbas' | 'accesorios' | 'combos'
export type ProductVariant = string
// Alias de compatibilidad para el código legacy que todavía usa ProductSize
export type ProductSize = ProductVariant
export type OrderStatus = 'pendiente' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'

export interface ProductSizeStock {
  id: string
  product_id: string
  size: ProductVariant
  stock: number
}

// Alias semántico más claro
export type ProductVariantStock = ProductSizeStock

export interface ProductMetadata {
  tipo?: string
  material?: string | string[]
  terminaciones?: string[]
  capacidad?: string
  marca?: string
  tipo_yerba?: string
  tipo_bombilla?: string
  categoria_accesorio?: string
  tipo_combo?: string
  [key: string]: any
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: ProductCategory
  images: string[]
  featured: boolean
  created_at: string
  product_sizes?: ProductSizeStock[]
  metadata?: ProductMetadata | null
}

export interface CartItem {
  product_id: string
  product_name: string
  product_image: string
  size: ProductVariant
  quantity: number
  unit_price: number
  stock?: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (product_id: string, size: ProductVariant) => void
  updateQuantity: (product_id: string, size: ProductVariant, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export interface CheckoutFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  notes?: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  total: number
  status: OrderStatus
  notes: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  size: ProductVariant
  quantity: number
  unit_price: number
}

export interface DashboardStats {
  orders_today: number
  revenue_today: number
  low_stock_count: number
  pending_orders: number
}

export const PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  mates: 'Mates',
  bombillas: 'Bombillas',
  termos: 'Termos',
  yerbas: 'Yerbas',
  accesorios: 'Accesorios',
  combos: 'Combos',
}

export const VARIANT_ORDER: string[] = ['natural', 'curado', '250g', '500g', '1kg', '500ml', '1l', '1.5l', 'unico']

export const VARIANT_LABELS: Record<string, string> = {
  natural: 'Natural',
  curado: 'Curado',
  '250g': '250g',
  '500g': '500g',
  '1kg': '1kg',
  '500ml': '500ml',
  '1l': '1L',
  '1.5l': '1.5L',
  unico: 'Único',
}

// Opciones predefinidas para metadatos según categoría
export const MATE_TYPES = ['Imperial', 'Torpedo', 'Camionero', 'Criollo', 'Uruguayo', 'Matero', 'Camionero Imperial'] as const
export const MATE_MATERIALS = ['Algarrobo', 'Calabaza', 'Madera', 'Vidrio'] as const
export const MATE_TERMINACIONES = [
  'Base de cuero',
  'Base de alpaca',
  'Fleje de alpaca',
  'Virola de alpaca',
  'Virola de acero',
  'Virola de acero inoxidable',
  'Sin virola',
  'Cuero croco'
] as const

export const TERMO_CAPACITIES = ['500 ml', '750 ml', '1 L', '1.2 L', '1.4 L', '1.9 L'] as const

export const YERBA_TYPES = ['Tradicional', 'Suave', 'Compuesta', 'Saborizada', 'Orgánica', 'Sin palo', 'Con palo'] as const

export const BOMBILLA_TYPES = ['Pico de loro', 'Desarmable', 'Resorte', 'Cuchara', 'Chata', 'Personalizada'] as const
export const BOMBILLA_MATERIALS = ['Acero inoxidable', 'Alpaca', 'Acero quirúrgico', 'Bronce'] as const

export const ACCESORIO_CATEGORIES = [
  'Materas',
  'Bolsos materos',
  'Despolvillador de yerba',
  'Portamates',
  'Yerberos y azucareros',
  'Fundas',
  'Bandejas materas'
] as const

export const COMBO_TYPES = [
  'Mate + Bombilla',
  'Mate + Bombilla + Termo',
  'Kit Matero',
  'Kit Premium',
  'Kit Regalo',
  'Combo Camionero',
  'Combo Imperial'
] as const


export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  preparando: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  enviado: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  entregado: 'bg-green-500/20 text-green-700 border-green-500/30',
  cancelado: 'bg-red-500/20 text-red-600 border-red-500/30',
}
