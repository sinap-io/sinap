-- =============================================================
-- Migración 005 — Tipos de actor redefinidos
-- Fecha: 2026-04-03
-- Cambios:
--   - Eliminar tipo 'laboratorio' → convierte existentes a 'empresa'
--   - Renombrar 'investigacion' → 'investigador'
--   - Agregar 'gobierno' como nuevo tipo
-- =============================================================

-- 1. Eliminar el CHECK constraint existente
ALTER TABLE actor DROP CONSTRAINT IF EXISTS actor_tipo_check;

-- 2. Migrar datos
UPDATE actor SET tipo = 'empresa'      WHERE tipo = 'laboratorio';
UPDATE actor SET tipo = 'investigador' WHERE tipo = 'investigacion';

-- 3. Agregar nuevo CHECK constraint con los tipos correctos
ALTER TABLE actor
    ADD CONSTRAINT actor_tipo_check
    CHECK (tipo IN ('empresa', 'startup', 'universidad', 'investigador', 'gobierno'));
