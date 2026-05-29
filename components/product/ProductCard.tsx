'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { CategoryBadge } from '@/components/ui/Badge'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const primaryImage = product.images[0] ?? `https://picsum.photos/seed/mate${product.id}/800/1000`
  const secondaryImage = product.images[1] ?? product.images[0] ?? primaryImage

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link
        href={`/producto/${product.id}`}
        className="card-product flex flex-col group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Ver ${product.name}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: '#EDE8DC' }}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ${hovered ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <Image
            src={secondaryImage}
            alt={`${product.name} - vista alternativa`}
            fill
            className={`object-cover transition-all duration-700 absolute inset-0 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 left-3">
              <span className="badge badge-featured text-[10px]">Destacado</span>
            </div>
          )}

          {/* Quick view overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-0 left-0 right-0 py-4 px-4 flex items-end"
            style={{ background: 'linear-gradient(to top, rgba(44,64,46,0.85) 0%, transparent 100%)' }}
          >
            <span className="font-condensed text-xs text-white uppercase tracking-widest">
              Ver producto →
            </span>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-2 bg-white">
          <CategoryBadge category={product.category} />
          <h3
            className="font-condensed text-sm uppercase tracking-wide leading-tight line-clamp-2 transition-colors duration-200"
            style={{ color: hovered ? '#4A6D4B' : '#1A1A1A' }}
          >
            {product.name}
          </h3>
          <p className="font-display text-xl font-bold" style={{ color: '#2C402E' }}>
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </motion.article>
  )
}
