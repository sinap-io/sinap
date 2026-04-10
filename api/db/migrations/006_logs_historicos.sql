-- =============================================================
-- Migración 006 — Logs históricos: foto vs. película
-- Fecha: 2026-04-10
--
-- Agrega tres tablas de historial que no pueden reconstruirse
-- retroactivamente si no se registran desde el principio:
--   1. iniciativa_estado_log  — cuándo cambió el estado y quién
--   2. actor_etapa_log        — cuándo una startup avanzó de etapa
--   3. proyecto_trl_log       — evolución del TRL de un proyecto
--
-- También agrega creado_por a iniciativa y hito (atribución ADIT)
-- =============================================================

-- ── Atribución ADIT en tablas existentes ─────────────────────
-- creado_por: qué usuario (ADIT) registró cada iniciativa/hito
-- Es nullable para no romper datos existentes
ALTER TABLE iniciativa
    ADD COLUMN IF NOT EXISTS creado_por INTEGER REFERENCES usuario(id) ON DELETE SET NULL;

ALTER TABLE hito
    ADD COLUMN IF NOT EXISTS creado_por INTEGER REFERENCES usuario(id) ON DELETE SET NULL;

-- ── 1. Historial de estados de iniciativa ─────────────────────
-- Se inserta automáticamente cada vez que cambia el estado.
-- estado_antes es NULL solo en la primera transición (desde creación).
CREATE TABLE IF NOT EXISTS iniciativa_estado_log (
    id             SERIAL PRIMARY KEY,
    iniciativa_id  INTEGER     NOT NULL REFERENCES iniciativa(id) ON DELETE CASCADE,
    estado_antes   TEXT,
    estado_despues TEXT        NOT NULL,
    cambiado_por   INTEGER     REFERENCES usuario(id) ON DELETE SET NULL,
    creado_en      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ini_estado_log_iniciativa
    ON iniciativa_estado_log(iniciativa_id);
CREATE INDEX IF NOT EXISTS idx_ini_estado_log_fecha
    ON iniciativa_estado_log(creado_en DESC);

-- ── 2. Historial de etapa del actor ──────────────────────────
-- Registra cuándo una startup (u otro actor) avanza de etapa.
-- Ejemplo: seed → growth → consolidada
CREATE TABLE IF NOT EXISTS actor_etapa_log (
    id            SERIAL PRIMARY KEY,
    actor_id      INTEGER     NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
    etapa_antes   TEXT,
    etapa_despues TEXT        NOT NULL,
    cambiado_por  INTEGER     REFERENCES usuario(id) ON DELETE SET NULL,
    creado_en     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actor_etapa_log_actor
    ON actor_etapa_log(actor_id);

-- ── 3. Historial de TRL del proyecto ─────────────────────────
-- La tabla proyecto aún no existe — se creará en migración 007.
-- proyecto_id no tiene FK por ahora; se agrega cuando exista la tabla.
-- trl entre 1 y 9 según estándar internacional.
CREATE TABLE IF NOT EXISTS proyecto_trl_log (
    id            SERIAL PRIMARY KEY,
    proyecto_id   INTEGER     NOT NULL,   -- FK → proyecto(id) se agrega en migración 007
    trl_antes     INTEGER     CHECK (trl_antes     BETWEEN 1 AND 9),
    trl_despues   INTEGER     NOT NULL CHECK (trl_despues BETWEEN 1 AND 9),
    cambiado_por  INTEGER     REFERENCES usuario(id) ON DELETE SET NULL,
    creado_en     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyecto_trl_log_proyecto
    ON proyecto_trl_log(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_trl_log_fecha
    ON proyecto_trl_log(creado_en DESC);
