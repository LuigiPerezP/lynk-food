-- Migración: menu_items.categoria (TEXT) → categoria_id (UUID FK)
--
-- EJECUTAR EN ORDEN:
--   Paso 1-3 primero → revisar huérfanos → luego pasos 4-5

-- ============================================================
-- PASO 1: Agregar nueva columna FK
-- ============================================================
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id);

-- ============================================================
-- PASO 2: Poblar categoria_id haciendo JOIN por nombre y restaurante
-- ============================================================
UPDATE menu_items mi
SET categoria_id = c.id
FROM categorias c
WHERE mi.categoria = c.nombre
  AND mi.restaurante_id = c.restaurante_id;

-- ============================================================
-- PASO 3: Ver huérfanos — platos sin categoria_id (no hicieron match)
-- Revisar estos resultados ANTES de continuar con el paso 4
-- ============================================================
SELECT id, nombre, categoria
FROM menu_items
WHERE categoria_id IS NULL;

-- ============================================================
-- ÍNDICE para queries rápidas (se puede correr ya)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_categoria_id ON menu_items(categoria_id);

-- ============================================================
-- PASO 4 y 5: Correr SÓLO después de verificar que no hay huérfanos
-- (o de mover/eliminar los huérfanos manualmente)
-- ============================================================
-- ALTER TABLE menu_items DROP COLUMN categoria;
-- ALTER TABLE menu_items ALTER COLUMN categoria_id SET NOT NULL;
