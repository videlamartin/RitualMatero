import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'featured' | 'category' | 'status' | 'red'
}

export function Badge({ children, className, variant = 'category' }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        (variant === 'featured' || variant === 'red') && 'badge-featured',
        variant === 'category' && 'badge-category',
        className
      )}
    >
      {children}
    </span>
  )
}

export function CategoryBadge({ category }: { category: ProductCategory }) {
  return (
    <Badge variant="category">
      {CATEGORY_LABELS[category]}
    </Badge>
  )
}
