-- =============================================================
-- Migracion 010 - Prioridad en proyectos
-- Fecha: 2026-04-15
--
-- prioridad INTEGER: 1=Estrategica, 2=Alta, 3=Media, 4=Baja
-- NULL = sin priorizar (default)
-- =============================================================

ALTER TABLE proyecto
    ADD COLUMN IF NOT EXISTS prioridad INTEGER
    CHECK (prioridad BETWEEN 1 AND 4);
