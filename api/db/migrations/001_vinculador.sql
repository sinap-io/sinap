-- =============================================================
-- Migración 001 — Módulo Vinculador Territorial
-- Fecha: 2026-03-19
-- Tablas: vinculador, caso_vinculacion, hito
-- =============================================================

CREATE TABLE IF NOT EXISTS vinculador (
    id         SERIAL PRIMARY KEY,
    nombre     TEXT        NOT NULL,
    email      TEXT        NOT NULL UNIQUE,
    activo     BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS caso_vinculacion (
    id                   SERIAL PRIMARY KEY,
    actor_demandante_id  INTEGER     NOT NULL REFERENCES actor(id),
    actor_oferente_id    INTEGER     REFERENCES actor(id),
    necesidad_id         INTEGER     NOT NULL REFERENCES necesidad(id),
    capacidad_id         INTEGER     REFERENCES capacidad(id),
    vinculador_id        INTEGER     NOT NULL REFERENCES vinculador(id),
    estado               TEXT        NOT NULL DEFAULT 'abierto'
                         CHECK (estado IN ('abierto','en_gestion','vinculado','cerrado','cancelado')),
    notas                TEXT,
    creado_en            TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hito (
    id            SERIAL PRIMARY KEY,
    caso_id       INTEGER     NOT NULL REFERENCES caso_vinculacion(id) ON DELETE CASCADE,
    tipo          TEXT        NOT NULL
                  CHECK (tipo IN (
                      'contacto_establecido',
                      'reunion_realizada',
                      'acuerdo_alcanzado',
                      'convenio_firmado',
                      'proyecto_iniciado',
                      'financiamiento_obtenido',
                      'otro'
                  )),
    descripcion   TEXT,
    fecha         DATE        NOT NULL DEFAULT CURRENT_DATE,
    evidencia_url TEXT,
    creado_en     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caso_vinculador  ON caso_vinculacion(vinculador_id);
CREATE INDEX IF NOT EXISTS idx_caso_demandante  ON caso_vinculacion(actor_demandante_id);
CREATE INDEX IF NOT EXISTS idx_caso_estado      ON caso_vinculacion(estado);
CREATE INDEX IF NOT EXISTS idx_hito_caso        ON hito(caso_id);
CREATE INDEX IF NOT EXISTS idx_hito_tipo        ON hito(tipo);
