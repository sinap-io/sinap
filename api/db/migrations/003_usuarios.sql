-- Migración 003: Sistema de autenticación básico
-- Tabla de usuarios de la plataforma SINAP

CREATE TABLE IF NOT EXISTS usuario (
    id          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT,                          -- hash bcrypt, nullable si usa OAuth futuro
    nombre      TEXT NOT NULL,
    rol         TEXT NOT NULL DEFAULT 'demandante'
                CHECK (rol IN ('admin', 'directivo', 'vinculador', 'oferente', 'demandante')),
    actor_id    INTEGER REFERENCES actor(id),  -- actor vinculado (opcional)
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
