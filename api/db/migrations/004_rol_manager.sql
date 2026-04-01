-- Migración 004: Agregar rol 'manager' al constraint de usuario
-- El rol 'manager' es para el director del Clúster (Pablo Díaz Azulay).
-- Tiene acceso a todo lo de 'directivo' + puede regenerar Informe IA y Radar sectorial.

-- Ampliar el constraint de rol para incluir 'manager'
ALTER TABLE usuario
  DROP CONSTRAINT IF EXISTS usuario_rol_check;

ALTER TABLE usuario
  ADD CONSTRAINT usuario_rol_check
  CHECK (rol IN ('admin', 'manager', 'directivo', 'vinculador', 'oferente', 'demandante'));

-- Verificar usuarios activos
-- SELECT id, email, nombre, rol, activo FROM usuario ORDER BY creado_en;
