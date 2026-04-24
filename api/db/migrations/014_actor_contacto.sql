-- =============================================================
-- Migración 014 — Contactos por Actor
-- Fecha: 2026-04-24
--
-- Permite registrar múltiples personas de contacto por actor.
-- Reemplaza el campo libre "referente" en iniciativa_actor
-- como fuente de contactos. Relación: actor → N contactos.
-- =============================================================

CREATE TABLE IF NOT EXISTS actor_contacto (
    id           SERIAL PRIMARY KEY,
    actor_id     INTEGER     NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
    nombre       TEXT        NOT NULL,
    cargo        TEXT,
    email        TEXT,
    telefono     TEXT,
    es_principal BOOLEAN     NOT NULL DEFAULT FALSE,
    creado_en    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actor_contacto_actor_id ON actor_contacto(actor_id);
