-- Agregar campo rol a actor
ALTER TABLE actor ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'oferente';

-- Laboratorios, investigacion y universidades = oferente (ya tienen el default)
UPDATE actor SET rol = 'oferente' 
WHERE tipo IN ('laboratorio', 'investigacion', 'universidad');

-- Empresas y startups = demandante
UPDATE actor SET rol = 'demandante' 
WHERE tipo IN ('empresa', 'startup');

-- Excepcion: CEPROCOR, LACE, Hemoderivados son empresas/labs que tambien ofrecen servicios
UPDATE actor SET rol = 'oferente' 
WHERE nombre IN ('CEPROCOR', 'LACE', 'Hemoderivados UNC');

-- Fix Biofeed Tech: marcar todos sus servicios como no disponibles (produce, no presta servicios)
UPDATE capacidad SET disponibilidad = 'no_disponible'
WHERE actor_id = (SELECT id FROM actor WHERE nombre ILIKE '%biofeed%');

-- Verificar resultado
SELECT nombre, tipo, rol FROM actor ORDER BY rol, tipo, nombre;
