-- =============================================================
-- SINAP — Schema de producción (sinap-production en Neon.tech)
-- =============================================================
-- Ejecutar una sola vez sobre la base nueva.
-- El prototipo (sinap-prototype) NO se toca.
-- =============================================================

-- ── actor ─────────────────────────────────────────────────────
-- Diferencias respecto al prototipo:
--   website  → sitio_web
--   subtipo  → removido (era texto libre, poco útil)
--   mercado  → etapa (más semántico: "spinoff", "consolidada", etc.)
--   +certificaciones (array de texto: ISO, ANMAT, BPM, etc.)

CREATE TABLE IF NOT EXISTS actor (
    id               SERIAL PRIMARY KEY,
    nombre           TEXT        NOT NULL,
    tipo             TEXT        NOT NULL CHECK (tipo IN ('laboratorio','empresa','startup','universidad','investigacion')),
    etapa            TEXT,                              -- spinoff | seed | growth | consolidada | publica
    sitio_web        TEXT,
    descripcion      TEXT,
    certificaciones  TEXT[]      DEFAULT '{}',
    creado_en        TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en   TIMESTAMPTZ DEFAULT NOW()
);

-- ── capacidad (servicios ofrecidos) ───────────────────────────
CREATE TABLE IF NOT EXISTS capacidad (
    id                    SERIAL PRIMARY KEY,
    actor_id              INTEGER     NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
    area_tematica         TEXT        NOT NULL,         -- salud_humana | medicamentos_farma | ...
    tipo_servicio         TEXT        NOT NULL,         -- diagnostico_clinico | analisis_quimico | ...
    descripcion           TEXT,
    descripcion_extendida TEXT,
    disponibilidad        TEXT        NOT NULL DEFAULT 'disponible'
                          CHECK (disponibilidad IN ('disponible','parcial','no_disponible')),
    creado_en             TIMESTAMPTZ DEFAULT NOW()
);

-- ── necesidad (demanda declarada) ─────────────────────────────
CREATE TABLE IF NOT EXISTS necesidad (
    id                    SERIAL PRIMARY KEY,
    actor_id              INTEGER     NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
    area_tematica         TEXT        NOT NULL,
    tipo_servicio         TEXT        NOT NULL,
    descripcion           TEXT,
    descripcion_extendida TEXT,
    urgencia              TEXT        NOT NULL DEFAULT 'normal'
                          CHECK (urgencia IN ('critica','alta','normal','baja')),
    status                TEXT        NOT NULL DEFAULT 'activa'
                          CHECK (status IN ('activa','resuelta','cancelada')),
    creado_en             TIMESTAMPTZ DEFAULT NOW()
);

-- ── instrumento (financiamiento) ──────────────────────────────
CREATE TABLE IF NOT EXISTS instrumento (
    id                    SERIAL PRIMARY KEY,
    nombre                TEXT        NOT NULL,
    tipo                  TEXT        NOT NULL CHECK (tipo IN ('subsidio','credito','capital','concurso')),
    organismo             TEXT        NOT NULL,
    sectores_elegibles    TEXT,
    status                TEXT        NOT NULL DEFAULT 'activo'
                          CHECK (status IN ('activo','proximamente','cerrado')),
    url                   TEXT,
    monto_maximo          TEXT,
    cobertura_porcentaje  NUMERIC(5,2),
    plazo_ejecucion       TEXT,
    contrapartida         TEXT,
    gastos_elegibles      TEXT,
    descripcion_extendida TEXT,
    creado_en             TIMESTAMPTZ DEFAULT NOW()
);

-- ── busqueda (log de consultas IA) ────────────────────────────
CREATE TABLE IF NOT EXISTS busqueda (
    id         SERIAL PRIMARY KEY,
    consulta   TEXT        NOT NULL,
    creado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- ── gap (gaps detectados por IA o manualmente) ────────────────
CREATE TABLE IF NOT EXISTS gap (
    id          SERIAL PRIMARY KEY,
    descripcion TEXT        NOT NULL,
    origen      TEXT        NOT NULL DEFAULT 'busqueda_ia'
                CHECK (origen IN ('busqueda_ia','declarado','analisis')),
    status      TEXT        NOT NULL DEFAULT 'detectado'
                CHECK (status IN ('detectado','confirmado','resuelto')),
    creado_en   TIMESTAMPTZ DEFAULT NOW()
);

-- ── vinculador (operador humano del módulo) ───────────────────
-- El Vinculador es la persona que gestiona los procesos de
-- vinculación. Separado de actor porque no es un actor del
-- ecosistema, es un rol interno de la plataforma.
CREATE TABLE IF NOT EXISTS vinculador (
    id         SERIAL PRIMARY KEY,
    nombre     TEXT        NOT NULL,
    email      TEXT        NOT NULL UNIQUE,
    activo     BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- ── caso_vinculacion (proceso de vinculación) ─────────────────
-- Registra cada intento de vincular una necesidad de un actor
-- con la capacidad de otro. actor_oferente_id y capacidad_id
-- pueden ser NULL al abrir el caso (aún no hay match definido).
CREATE TABLE IF NOT EXISTS caso_vinculacion (
    id                   SERIAL PRIMARY KEY,
    actor_demandante_id  INTEGER     NOT NULL REFERENCES actor(id),
    actor_oferente_id    INTEGER     REFERENCES actor(id),          -- NULL hasta que se identifica
    necesidad_id         INTEGER     NOT NULL REFERENCES necesidad(id),
    capacidad_id         INTEGER     REFERENCES capacidad(id),      -- NULL hasta que se matchea
    vinculador_id        INTEGER     NOT NULL REFERENCES vinculador(id),
    estado               TEXT        NOT NULL DEFAULT 'abierto'
                         CHECK (estado IN ('abierto','en_gestion','vinculado','cerrado','cancelado')),
    notas                TEXT,
    creado_en            TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- ── hito (trazabilidad de resultados por caso) ────────────────
-- Cada evento concreto que ocurre dentro de un caso.
-- fecha es DATE (no TIMESTAMPTZ) porque es una fecha de evento,
-- no un timestamp de sistema.
-- evidencia_url permite adjuntar un link al documento firmado,
-- acta, o registro externo.
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

-- ── Índices de performance ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_capacidad_actor      ON capacidad(actor_id);
CREATE INDEX IF NOT EXISTS idx_capacidad_tipo       ON capacidad(tipo_servicio);
CREATE INDEX IF NOT EXISTS idx_necesidad_actor      ON necesidad(actor_id);
CREATE INDEX IF NOT EXISTS idx_necesidad_status     ON necesidad(status);
CREATE INDEX IF NOT EXISTS idx_instrumento_status   ON instrumento(status);
CREATE INDEX IF NOT EXISTS idx_busqueda_fecha       ON busqueda(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_actor_tipo           ON actor(tipo);
-- vinculador
CREATE INDEX IF NOT EXISTS idx_caso_vinculador      ON caso_vinculacion(vinculador_id);
CREATE INDEX IF NOT EXISTS idx_caso_demandante      ON caso_vinculacion(actor_demandante_id);
CREATE INDEX IF NOT EXISTS idx_caso_estado          ON caso_vinculacion(estado);
CREATE INDEX IF NOT EXISTS idx_hito_caso            ON hito(caso_id);
CREATE INDEX IF NOT EXISTS idx_hito_tipo            ON hito(tipo);
