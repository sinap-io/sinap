-- =============================================================
-- Migración 008 — Módulo ADIT (Actividad del Vinculador)
-- Fecha: 2026-04-14
--
-- 1. cambiado_por en proyecto_trl_log (para auditoría de TRL)
-- 2. Vincular vinculadores a usuarios por email
-- 3. Asignar zona Gran Córdoba a vinculadores sin zona
-- =============================================================

-- ── 1. cambiado_por en proyecto_trl_log ───────────────────────
ALTER TABLE proyecto_trl_log
    ADD COLUMN IF NOT EXISTS cambiado_por INTEGER REFERENCES usuario(id) ON DELETE SET NULL;

-- ── 2. Vincular vinculadores a usuarios por email ─────────────
UPDATE vinculador v
SET usuario_id = u.id
FROM usuario u
WHERE lower(v.email) = lower(u.email)
  AND v.usuario_id IS NULL;

-- ── 3. Zona por defecto (Gran Córdoba = id 1) ─────────────────
UPDATE vinculador SET zona_id = 1 WHERE zona_id IS NULL AND activo = TRUE;
