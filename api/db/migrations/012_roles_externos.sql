-- Migración 012: renombrar roles externos y agregar fecha_vencimiento
-- oferente → socio, demandante → invitado, nuevo rol freemium
-- fecha_vencimiento para invitados con acceso temporal

-- 1. Agregar columna de vencimiento (nullable — solo relevante para invitado)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMPTZ;

-- 2. Renombrar datos existentes
UPDATE usuario SET rol = 'socio'    WHERE rol = 'oferente';
UPDATE usuario SET rol = 'invitado' WHERE rol = 'demandante';

-- 3. Actualizar constraint de rol (drop + recreate)
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_rol_check;
ALTER TABLE usuario ADD CONSTRAINT usuario_rol_check
  CHECK (rol IN ('admin', 'manager', 'directivo', 'vinculador', 'socio', 'freemium', 'invitado'));

-- 4. Actualizar default
ALTER TABLE usuario ALTER COLUMN rol SET DEFAULT 'invitado';
