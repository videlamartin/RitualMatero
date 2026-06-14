-- ==============================================================================
-- MIGRACIÓN DE CATÁLOGO 01: METADATA, VARIANTES LIBRES Y BÚSQUEDA INTELIGENTE
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ==============================================================================

-- 1. Agregar columna de metadata a la tabla de productos si no existe
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

-- 5. Crear columna para la Búsqueda Inteligente (Full Text Search + Fuzzy)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS search_text text;

-- Llenar la columna para los registros existentes
UPDATE products SET search_text = lower(
    coalesce(name, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(category::text, '') || ' ' || 
    coalesce(metadata->>'tipo', '') || ' ' || 
    coalesce(metadata->>'material', '') || ' ' || 
    coalesce(metadata->>'terminaciones', '') || ' ' || 
    coalesce(metadata->>'marca', '') || ' ' || 
    coalesce(metadata->>'capacidad', '') || ' ' ||
    coalesce(metadata->>'tipo_yerba', '') || ' ' ||
    coalesce(metadata->>'tipo_bombilla', '') || ' ' ||
    coalesce(metadata->>'categoria_accesorio', '') || ' ' ||
    coalesce(metadata->>'tipo_combo', '')
);

-- Crear función de trigger para mantener actualizado el search_text automáticamente
CREATE OR REPLACE FUNCTION update_search_text_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text := lower(
    coalesce(NEW.name, '') || ' ' || 
    coalesce(NEW.description, '') || ' ' || 
    coalesce(NEW.category::text, '') || ' ' || 
    coalesce(NEW.metadata->>'tipo', '') || ' ' || 
    coalesce(NEW.metadata->>'material', '') || ' ' || 
    coalesce(NEW.metadata->>'terminaciones', '') || ' ' || 
    coalesce(NEW.metadata->>'marca', '') || ' ' || 
    coalesce(NEW.metadata->>'capacidad', '') || ' ' ||
    coalesce(NEW.metadata->>'tipo_yerba', '') || ' ' ||
    coalesce(NEW.metadata->>'tipo_bombilla', '') || ' ' ||
    coalesce(NEW.metadata->>'categoria_accesorio', '') || ' ' ||
    coalesce(NEW.metadata->>'tipo_combo', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trg_update_search_text ON products;
CREATE TRIGGER trg_update_search_text
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_search_text_trigger();

-- 6. Habilitar extensión pg_trgm (útil para ILIKE '%termino%')
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 7. Crear índices para búsquedas ultra-rápidas
-- Índice GIN para búsquedas de texto parcial
CREATE INDEX IF NOT EXISTS idx_products_search_text ON products USING GIN (search_text gin_trgm_ops);

-- Índice GIN sobre el metadata para filtros veloces
CREATE INDEX IF NOT EXISTS idx_products_metadata ON products USING GIN (metadata);

-- (Opcional) Limpiar el ENUM viejo que ya no se usa
DROP TYPE IF EXISTS product_variant CASCADE;
