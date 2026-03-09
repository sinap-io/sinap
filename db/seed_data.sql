-- ============================================================
-- SINAP — Datos representativos v1
-- Fuente: información pública de los laboratorios
-- ============================================================

-- ACTORES — 4 labs piloto
INSERT INTO actor (nombre, tipo, subtipo, mercado, website, certificaciones) VALUES
(
    'CEPROCOR',
    'laboratorio',
    'publico',
    'empresas, PyMEs, sector público, investigadores',
    'https://ceprocor.conicet.gov.ar',
    'ISO, ANMAT'
),
(
    'LACE Laboratorios',
    'laboratorio',
    'privado',
    'pacientes, profesionales bioquímicos, veterinarios',
    'https://www.lace.com.ar',
    'EMQN, PEEC, GENQA, ALAC'
),
(
    'Laboratorio de Hemoderivados UNC',
    'laboratorio',
    'academico',
    'sector público, hospitales, exportación',
    'https://www.hemoderivados.com.ar',
    'ANMAT, INCUCAI'
),
(
    'Fundación para el Progreso de la Medicina',
    'laboratorio',
    'privado',
    'sector salud Córdoba',
    NULL,
    NULL
);

-- CAPACIDADES — CEPROCOR (id=1)
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(1, 'alimentos_nutricion', 'control_calidad', 'Control de calidad fisicoquímico y microbiológico de alimentos', 'disponible'),
(1, 'medicamentos_farma', 'validacion_procesos', 'Biodisponibilidad y bioequivalencia — único centro de referencia del interior del país', 'disponible'),
(1, 'medicamentos_farma', 'manufactura', 'Planta piloto farmacéutica CEPROFARM para desarrollo y escalado', 'parcial'),
(1, 'ambiente', 'analisis_quimico', 'Análisis químico y microbiológico ambiental', 'disponible'),
(1, 'alimentos_nutricion', 'i_d_aplicada', 'I+D aplicada en biotecnología, nanotecnología farmacéutica y biología molecular', 'disponible'),
(1, 'medicamentos_farma', 'metrologia', 'Materiales de referencia certificados CEPROMAT — RMN 300 MHz', 'disponible');

-- CAPACIDADES — LACE (id=2)
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(2, 'salud_humana', 'diagnostico_clinico', 'Diagnóstico clínico de alta escala — 16.000 estudios diarios, 1.500 determinaciones', 'disponible'),
(2, 'salud_humana', 'analisis_microbiologico', 'Análisis microbiológico clínico y de control', 'disponible'),
(2, 'salud_humana', 'analisis_molecular', 'Análisis molecular — PCR, secuenciación, biología molecular clínica', 'disponible'),
(2, 'salud_animal', 'diagnostico_clinico', 'Bioquímica veterinaria — diagnóstico clínico animal', 'disponible');

-- CAPACIDADES — Hemoderivados UNC (id=3)
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(3, 'medicamentos_farma', 'manufactura', 'Manufactura farmacéutica a escala industrial — planta fraccionadora de plasma más grande de América Latina', 'disponible'),
(3, 'salud_humana', 'procesamiento_biologico', 'Procesamiento de tejidos biológicos — odontología y traumatología (UNC Biotecnia)', 'disponible'),
(3, 'medicamentos_farma', 'i_d_aplicada', 'I+D en hemoderivados y enfoques terapéuticos', 'parcial');

-- NECESIDADES — ejemplos representativos
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, visibilidad) VALUES
(2, 'medicamentos_farma', 'validacion_procesos', 'Validación de procesos de nuevos reactivos diagnósticos', 'normal', 'cluster'),
(3, 'alimentos_nutricion', 'control_calidad', 'Control de calidad de materias primas para producción farmacéutica', 'normal', 'cluster'),
(1, 'medicamentos_farma', 'manufactura', 'Escala productiva industrial para compuestos desarrollados en planta piloto', 'baja', 'cluster');

-- INSTRUMENTOS — financiamiento disponible
INSERT INTO instrumento (nombre, tipo, organismo, sectores_elegibles, status) VALUES
('ANR FONTAR', 'subsidio', 'ANPCYT — Agencia I+D+i', 'industria, biotecnología, tecnología', 'activo'),
('FONARSEC Biotecnología', 'subsidio', 'ANPCYT — Agencia I+D+i', 'biotecnología, salud, alimentos', 'activo'),
('Crédito BICE PyME', 'credito', 'BICE', 'todos los sectores productivos', 'activo'),
('Fondo Emprender Córdoba', 'subsidio', 'Agencia de Competitividad de Córdoba', 'empresas de base tecnológica', 'activo');
