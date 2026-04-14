-- =============================================================
-- Migración 009 — Hitos de proyecto + apoyos buscados (multi)
-- Fecha: 2026-04-14
--
-- 1. apoyos_buscados TEXT[] - reemplaza el estado de busqueda
-- 2. Simplifica estado: activo / pausado / finalizado
-- 3. proyecto_hito - timeline de eventos del proyecto
-- =============================================================

-- ── 1. Nuevo campo apoyos_buscados ───────────────────────────
ALTER TABLE proyecto ADD COLUMN IF NOT EXISTS apoyos_buscados TEXT[] DEFAULT '{}';

-- ── 2. Eliminar constraint viejo PRIMERO ──────────────────────
ALTER TABLE proyecto DROP CONSTRAINT IF EXISTS proyecto_estado_check;

-- ── 3. Migrar datos (ya sin constraint) ───────────────────────
UPDATE proyecto SET apoyos_buscados = ARRAY['financiamiento']
    WHERE estado = 'buscando_financiamiento';
UPDATE proyecto SET apoyos_buscados = ARRAY['socio_tecnologico']
    WHERE estado = 'buscando_socio';
UPDATE proyecto SET estado = 'activo'
    WHERE estado IN ('en_desarrollo', 'buscando_financiamiento', 'buscando_socio');

-- ── 4. Agregar nuevo constraint simplificado ──────────────────
ALTER TABLE proyecto ADD CONSTRAINT proyecto_estado_check
    CHECK (estado IN ('activo', 'pausado', 'finalizado'));

-- ── 3. Tabla proyecto_hito ────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyecto_hito (
    id            SERIAL PRIMARY KEY,
    proyecto_id   INTEGER NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    tipo          TEXT    NOT NULL,
    descripcion   TEXT,
    fecha         DATE    NOT NULL,
    evidencia_url TEXT,
    creado_por    INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    creado_en     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyecto_hito_proyecto
    ON proyecto_hito(proyecto_id);
