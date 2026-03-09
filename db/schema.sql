-- ============================================================
-- SINAP — Schema v1
-- Plataforma de intermediación del ecosistema biotech Córdoba
-- ============================================================

-- ACTOR — cualquier organización del ecosistema
CREATE TABLE actor (
    id              SERIAL PRIMARY KEY,
    cluster_id      VARCHAR(50) NOT NULL DEFAULT 'cba_biotech',
    nombre          VARCHAR(200) NOT NULL,
    tipo            VARCHAR(50) NOT NULL,  -- laboratorio, empresa, universidad, gobierno, fondo
    subtipo         VARCHAR(100),          -- privado, publico, academico, startup, etc.
    etapa           VARCHAR(50),           -- idea, early, growth, maduro
    mercado         VARCHAR(100),
    exporta         BOOLEAN DEFAULT FALSE,
    busca_inversion BOOLEAN DEFAULT FALSE,
    certificaciones TEXT,
    website         VARCHAR(200),
    status          VARCHAR(20) DEFAULT 'activo',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTACTO — personas dentro de cada actor
CREATE TABLE contacto (
    id              SERIAL PRIMARY KEY,
    actor_id        INTEGER REFERENCES actor(id),
    nombre          VARCHAR(200) NOT NULL,
    rol             VARCHAR(100),
    email           VARCHAR(200),
    telefono        VARCHAR(50),
    es_decisor      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CAPACIDAD — lo que un actor ofrece
CREATE TABLE capacidad (
    id              SERIAL PRIMARY KEY,
    actor_id        INTEGER REFERENCES actor(id),
    area_tematica   VARCHAR(100) NOT NULL,  -- salud_humana, medicamentos_farma, alimentos_nutricion, ambiente, agroindustria, salud_animal, otro
    tipo_servicio   VARCHAR(100) NOT NULL,  -- diagnostico_clinico, analisis_quimico, analisis_molecular, control_calidad, validacion_procesos, manufactura, i_d_aplicada, metrologia, consultoria_tecnica, otro
    descripcion     TEXT,
    precio_desde    NUMERIC(12,2),
    moneda          VARCHAR(10) DEFAULT 'ARS',
    disponibilidad  VARCHAR(50) DEFAULT 'disponible',  -- disponible, parcial, no_disponible
    capacidad_ociosa BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'activo',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NECESIDAD — lo que un actor demanda
CREATE TABLE necesidad (
    id              SERIAL PRIMARY KEY,
    actor_id        INTEGER REFERENCES actor(id),
    area_tematica   VARCHAR(100) NOT NULL,
    tipo_servicio   VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    urgencia        VARCHAR(20) DEFAULT 'normal',  -- baja, normal, alta, critica
    presupuesto_max NUMERIC(12,2),
    moneda          VARCHAR(10) DEFAULT 'ARS',
    visibilidad     VARCHAR(20) DEFAULT 'cluster',  -- privado, cluster, publico
    status          VARCHAR(20) DEFAULT 'activa',   -- activa, en_proceso, resuelta, cancelada
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MATCH — conexión entre necesidad y capacidad
CREATE TABLE match (
    id              SERIAL PRIMARY KEY,
    necesidad_id    INTEGER REFERENCES necesidad(id),
    capacidad_id    INTEGER REFERENCES capacidad(id),
    score           NUMERIC(4,2),  -- 0 a 10
    metodo          VARCHAR(50) DEFAULT 'manual',  -- manual, semantico, exacto
    participacion_cluster BOOLEAN DEFAULT TRUE,
    valor_transaccion NUMERIC(12,2),
    moneda          VARCHAR(10) DEFAULT 'ARS',
    status          VARCHAR(20) DEFAULT 'propuesto',  -- propuesto, aceptado, en_curso, completado, cancelado
    notas           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GAP — necesidades sin match disponible
CREATE TABLE gap (
    id              SERIAL PRIMARY KEY,
    necesidad_id    INTEGER REFERENCES necesidad(id),
    area_tematica   VARCHAR(100) NOT NULL,
    tipo_servicio   VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    frecuencia      INTEGER DEFAULT 1,  -- cuántas veces se detectó esta necesidad sin oferta
    potencial_mercado VARCHAR(20),      -- bajo, medio, alto
    status          VARCHAR(20) DEFAULT 'abierto',  -- abierto, en_analisis, oportunidad_identificada
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSTRUMENTO — catálogo de financiamiento disponible
CREATE TABLE instrumento (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    tipo            VARCHAR(100),   -- subsidio, credito, capital, concurso
    organismo       VARCHAR(200),
    monto_max       NUMERIC(15,2),
    moneda          VARCHAR(10) DEFAULT 'ARS',
    sectores_elegibles TEXT,
    etapas_elegibles   TEXT,
    fecha_apertura  DATE,
    fecha_cierre    DATE,
    url             VARCHAR(300),
    status          VARCHAR(20) DEFAULT 'activo',  -- activo, cerrado, proximamente
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACTOR_INSTRUMENTO — interés de un actor en un instrumento
CREATE TABLE actor_instrumento (
    id              SERIAL PRIMARY KEY,
    actor_id        INTEGER REFERENCES actor(id),
    instrumento_id  INTEGER REFERENCES instrumento(id),
    modo            VARCHAR(20) DEFAULT 'self_service',  -- self_service, asistido
    status          VARCHAR(50) DEFAULT 'interesado',    -- interesado, en_proceso, presentado, aprobado, rechazado
    notas_cluster   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
