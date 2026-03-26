-- =============================================================
-- Migración 002 — Módulo Iniciativas
-- Fecha: 2026-03-26
-- Reemplaza caso_vinculacion + hito con arquitectura flexible
-- =============================================================

-- Eliminar tablas anteriores (solo hay datos de seed, seguro)
DROP TABLE IF EXISTS hito             CASCADE;
DROP TABLE IF EXISTS caso_vinculacion CASCADE;

-- Atributo institucional en actor
ALTER TABLE actor
    ADD COLUMN IF NOT EXISTS rol_institucional TEXT
    CHECK (rol_institucional IN ('admin_cluster', 'comision_directiva'));

-- ── Tabla central ─────────────────────────────────────────────
CREATE TABLE iniciativa (
    id              SERIAL PRIMARY KEY,
    tipo            TEXT        NOT NULL
                    CHECK (tipo IN (
                        'oportunidad',   -- oportunidad de mercado detectada
                        'consorcio',     -- formación de grupo multi-actor
                        'demanda',       -- actor tiene una necesidad
                        'oferta',        -- actor tiene capacidad disponible
                        'instrumento',   -- instrumento financiero disponible
                        'gap'            -- gap detectado a resolver
                    )),
    titulo          TEXT        NOT NULL,
    descripcion     TEXT,
    estado          TEXT        NOT NULL DEFAULT 'abierta'
                    CHECK (estado IN (
                        'abierta',       -- recién abierta
                        'en_curso',      -- activa, siendo gestionada
                        'concretada',    -- vinculación lograda
                        'cerrada',       -- cerrada sin concretar
                        'cancelada'      -- cancelada
                    )),
    vinculador_id   INTEGER     REFERENCES vinculador(id),  -- opcional
    notas           TEXT,
    creado_en       TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Actores que participan ────────────────────────────────────
CREATE TABLE iniciativa_actor (
    iniciativa_id   INTEGER     NOT NULL REFERENCES iniciativa(id) ON DELETE CASCADE,
    actor_id        INTEGER     NOT NULL REFERENCES actor(id),
    rol             TEXT        NOT NULL
                    CHECK (rol IN (
                        'lider',         -- quien convocó / lidera
                        'demandante',    -- tiene la necesidad
                        'oferente',      -- aporta la capacidad
                        'miembro',       -- integrante de consorcio
                        'candidato',     -- siendo evaluado
                        'financiador'    -- aporta o gestiona financiamiento
                    )),
    creado_en       TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (iniciativa_id, actor_id, rol)
);

-- ── Relaciones con entidades existentes ───────────────────────
CREATE TABLE iniciativa_necesidad (
    iniciativa_id   INTEGER NOT NULL REFERENCES iniciativa(id) ON DELETE CASCADE,
    necesidad_id    INTEGER NOT NULL REFERENCES necesidad(id),
    PRIMARY KEY (iniciativa_id, necesidad_id)
);

CREATE TABLE iniciativa_capacidad (
    iniciativa_id   INTEGER NOT NULL REFERENCES iniciativa(id) ON DELETE CASCADE,
    capacidad_id    INTEGER NOT NULL REFERENCES capacidad(id),
    PRIMARY KEY (iniciativa_id, capacidad_id)
);

CREATE TABLE iniciativa_instrumento (
    iniciativa_id   INTEGER NOT NULL REFERENCES iniciativa(id) ON DELETE CASCADE,
    instrumento_id  INTEGER NOT NULL REFERENCES instrumento(id),
    PRIMARY KEY (iniciativa_id, instrumento_id)
);

-- ── Hitos de trazabilidad ─────────────────────────────────────
CREATE TABLE hito (
    id              SERIAL PRIMARY KEY,
    iniciativa_id   INTEGER     NOT NULL REFERENCES iniciativa(id) ON DELETE CASCADE,
    tipo            TEXT        NOT NULL
                    CHECK (tipo IN (
                        'contacto_establecido',
                        'reunion_realizada',
                        'acuerdo_alcanzado',
                        'convenio_firmado',
                        'proyecto_iniciado',
                        'financiamiento_obtenido',
                        'otro'
                    )),
    descripcion     TEXT,
    fecha           DATE        NOT NULL DEFAULT CURRENT_DATE,
    evidencia_url   TEXT,
    creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX idx_iniciativa_estado      ON iniciativa(estado);
CREATE INDEX idx_iniciativa_tipo        ON iniciativa(tipo);
CREATE INDEX idx_iniciativa_vinculador  ON iniciativa(vinculador_id);
CREATE INDEX idx_iactor_iniciativa      ON iniciativa_actor(iniciativa_id);
CREATE INDEX idx_iactor_actor          ON iniciativa_actor(actor_id);
CREATE INDEX idx_hito_iniciativa        ON hito(iniciativa_id);
