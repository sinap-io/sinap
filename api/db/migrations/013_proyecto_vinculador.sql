-- =============================================================
-- Migración 013 — Vinculador en Proyecto
-- Fecha: 2026-04-24
--
-- Agrega vinculador_id a la tabla proyecto (FK opcional a vinculador)
-- =============================================================

ALTER TABLE proyecto
    ADD COLUMN IF NOT EXISTS vinculador_id INTEGER REFERENCES vinculador(id) ON DELETE SET NULL;
