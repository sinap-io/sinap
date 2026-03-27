-- =============================================================
-- Migración 003 — Estados + Referente en iniciativa_actor
-- Fecha: 2026-03-27
-- =============================================================

-- 1. Reemplazar 'cancelada' por 'postergada' en la tabla iniciativa
--    Primero migrar datos existentes, luego cambiar el CHECK constraint

UPDATE iniciativa SET estado = 'cerrada' WHERE estado = 'cancelada';

ALTER TABLE iniciativa DROP CONSTRAINT IF EXISTS iniciativa_estado_check;
ALTER TABLE iniciativa ADD CONSTRAINT iniciativa_estado_check
    CHECK (estado IN (
        'abierta',      -- recién abierta
        'en_curso',     -- activa, siendo gestionada
        'concretada',   -- objetivo logrado
        'cerrada',      -- cerrada (sin concretar o proceso terminado)
        'postergada'    -- suspendida temporalmente, puede retomarse
    ));

-- 2. Agregar campo referente a iniciativa_actor
--    Persona específica dentro del actor que participa en la iniciativa

ALTER TABLE iniciativa_actor
    ADD COLUMN IF NOT EXISTS referente TEXT;
