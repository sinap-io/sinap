-- =============================================================
-- Migración 007 — Módulo Proyectos + Zonas geográficas (ADIT)
-- Fecha: 2026-04-14
--
-- 1. zona              — zonas geográficas editables por admin/manager
-- 2. proyecto          — entidad independiente de desarrollo tecnológico
-- 3. proyecto_actor    — actores participantes (interinstitucional)
-- 4. proyecto_instrumento — instrumentos de financiamiento aplicables
-- 5. vinculador (ext)  — agrega zona_id y usuario_id
-- 6. proyecto_trl_log  — agrega FK a proyecto (preparada en migración 006)
-- =============================================================

-- ── 1. Zonas geográficas ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS zona (
    id         SERIAL PRIMARY KEY,
    nombre     TEXT        NOT NULL UNIQUE,
    activa     BOOLEAN     DEFAULT TRUE,
    creado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- Zona inicial: Gran Córdoba
INSERT INTO zona (nombre) VALUES ('Gran Córdoba')
ON CONFLICT (nombre) DO NOTHING;

-- ── 2. Extender vinculador (ADIT) ─────────────────────────────
ALTER TABLE vinculador
    ADD COLUMN IF NOT EXISTS zona_id    INTEGER REFERENCES zona(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL;

-- ── 3. Tabla proyecto ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyecto (
    id              SERIAL PRIMARY KEY,
    titulo          TEXT        NOT NULL,
    descripcion     TEXT,
    trl             INTEGER     CHECK (trl BETWEEN 1 AND 9),
    area_tematica   TEXT,
    estado          TEXT        CHECK (estado IN (
                        'en_desarrollo',
                        'buscando_financiamiento',
                        'buscando_socio',
                        'finalizado'
                    )) DEFAULT 'en_desarrollo',
    iniciativa_id   INTEGER     REFERENCES iniciativa(id) ON DELETE SET NULL,
    creado_por      INTEGER     REFERENCES usuario(id) ON DELETE SET NULL,
    creado_en       TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyecto_estado
    ON proyecto(estado);
CREATE INDEX IF NOT EXISTS idx_proyecto_trl
    ON proyecto(trl);
CREATE INDEX IF NOT EXISTS idx_proyecto_iniciativa
    ON proyecto(iniciativa_id);

-- ── 4. Actores del proyecto ───────────────────────────────────
CREATE TABLE IF NOT EXISTS proyecto_actor (
    proyecto_id  INTEGER NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    actor_id     INTEGER NOT NULL REFERENCES actor(id)    ON DELETE CASCADE,
    rol          TEXT,
    PRIMARY KEY (proyecto_id, actor_id)
);

-- ── 5. Instrumentos del proyecto ─────────────────────────────
CREATE TABLE IF NOT EXISTS proyecto_instrumento (
    proyecto_id    INTEGER NOT NULL REFERENCES proyecto(id)     ON DELETE CASCADE,
    instrumento_id INTEGER NOT NULL REFERENCES instrumento(id)  ON DELETE CASCADE,
    PRIMARY KEY (proyecto_id, instrumento_id)
);

-- ── 6. FK faltante en proyecto_trl_log ───────────────────────
-- La tabla fue creada en migración 006 sin FK (proyecto no existía).
-- Ahora que existe, agregamos la restricción.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_proyecto_trl_log_proyecto'
    ) THEN
        ALTER TABLE proyecto_trl_log
            ADD CONSTRAINT fk_proyecto_trl_log_proyecto
            FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE;
    END IF;
END $$;
