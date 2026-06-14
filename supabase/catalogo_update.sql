-- ==============================================================================
-- MIGRACIÓN DE CATÁLOGO: METADATA DINÁMICA Y VARIANTES LIBRES
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ==============================================================================

-- 1. Agregar columna de metadata a la tabla de productos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 2. Eliminar la restricción del ENUM para los tamaños de variantes (product_sizes)
-- Esto permite que cualquier texto sea usado como nombre de variante (ej: "Rojo", "1 Litro", etc)
ALTER TABLE product_sizes 
ALTER COLUMN size TYPE text USING size::text;

-- 3. Eliminar la restricción del ENUM en los items de orden
ALTER TABLE order_items 
ALTER COLUMN size TYPE text USING size::text;

-- 4. Actualizar la función decrement_stock para usar TEXT en vez del ENUM
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id uuid,
  p_size text,
  p_quantity integer
) RETURNS void AS $$
BEGIN
  UPDATE product_sizes
  SET stock = stock - p_quantity
  WHERE product_id = p_product_id
    AND size = p_size
    AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto % variante %', p_product_id, p_size;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear índice para búsquedas ultra-rápidas sobre el metadata (GIN index)
CREATE INDEX IF NOT EXISTS idx_products_metadata ON products USING GIN (metadata);

-- (Opcional) Limpiar el ENUM viejo que ya no se usa
-- DROP TYPE IF EXISTS product_variant CASCADE;
