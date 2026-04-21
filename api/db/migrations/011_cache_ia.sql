-- Migración 011: Cache persistente para Informe IA y Radar sectorial
-- Reemplaza el cache en memoria (que se pierde al reiniciar Railway)
-- por almacenamiento en DB (sobrevive reinicios indefinidamente).
--
-- tipo: 'informe' | 'radar_biosensores' | 'radar_biotech_general'
-- contenido: respuesta completa serializada como JSONB
-- ttl_horas: tiempo de vida en horas (informe=24, radar=168)

CREATE TABLE IF NOT EXISTS cache_ia (
    id          SERIAL PRIMARY KEY,
    tipo        TEXT        NOT NULL,
    contenido   JSONB       NOT NULL,
    generado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ttl_horas   INTEGER     NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS cache_ia_tipo_idx ON cache_ia (tipo);
