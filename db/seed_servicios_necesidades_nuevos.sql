-- Servicios y necesidades para los 19 actores nuevos
-- Basado en el Catálogo del Clúster de Biotecnología de Córdoba
-- Ejecutar con: \i db/seed_servicios_necesidades_nuevos.sql

-- ─── CAPACIDADES (SERVICIOS OFRECIDOS) ───────────────────────────────────────

-- Bio4 (id=10) — bioetanol, transformación de granos, energía renovable
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(10, 'agroindustria', 'manufactura', 'Producción de bioetanol y subproductos a partir de maíz: burlanda húmeda, jarabe y proteínas', 'disponible'),
(10, 'agroindustria', 'i_d_aplicada', 'Desarrollo de innovaciones tecnológicas para agregar valor a producción primaria', 'disponible');

-- Biogen (id=11) — biotecnologías reproductivas bovinas
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(11, 'salud_animal', 'consultoria_tecnica', 'Asesoramiento en programas de manejo reproductivo bovino', 'disponible'),
(11, 'salud_animal', 'i_d_aplicada', 'Implementación de biotecnologías reproductivas: IATF, transferencia embrionaria', 'disponible');

-- Biofeed Tech (id=12) — probióticos agroalimentarios
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(12, 'alimentos_nutricion', 'manufactura', 'Producción de probióticos para sanidad y productividad animal, humanos y ambiente', 'disponible'),
(12, 'alimentos_nutricion', 'i_d_aplicada', 'Desarrollo de soluciones biotecnológicas para industria agroalimentaria', 'disponible'),
(12, 'agroindustria', 'control_calidad', 'Control de calidad de productos probióticos para sector agropecuario', 'disponible');

-- CAISAL (id=13) — cámara de empresas proveedoras del sistema de salud
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(13, 'salud_humana', 'consultoria_tecnica', 'Articulación y vinculación entre empresas proveedoras del sistema de salud', 'disponible');

-- Hospital Privado (id=14) — investigación y asistencia médica
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(14, 'salud_humana', 'diagnostico_clinico', 'Diagnóstico clínico avanzado con más de 60 años de experiencia y tecnología de punta', 'disponible'),
(14, 'salud_humana', 'i_d_aplicada', 'Investigación aplicada en medicina clínica, docencia y ensayos clínicos', 'disponible');

-- InBiomed (id=15) — biomateriales para regeneración tisular
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(15, 'salud_humana', 'manufactura', 'Diseño y fabricación de biomateriales para regeneración tisular guiada (odontología, traumatología, dermatología)', 'disponible'),
(15, 'salud_humana', 'i_d_aplicada', 'Desarrollo de soluciones en regeneración tisular con aplicación clínica', 'disponible');

-- Leistung (id=16) — dispositivos médicos ventilación pulmonar
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(16, 'salud_humana', 'manufactura', 'Producción de dispositivos médicos para ventilación pulmonar: transporte crítico, anestesia, terapia intensiva', 'disponible'),
(16, 'salud_humana', 'control_calidad', 'Validación y control de calidad de dispositivos médicos con estándares de exportación a 20+ países', 'disponible');

-- Porta Hnos. (id=17) — alcoholes, proteínas, ingeniería industrial
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(17, 'agroindustria', 'manufactura', 'Producción de alcoholes, vinagres, proteínas de soja y arveja. Diseño y construcción de plantas industriales', 'disponible'),
(17, 'agroindustria', 'consultoria_tecnica', 'Soluciones de ingeniería industrial y escalado de procesos productivos', 'disponible');

-- Summabio (id=18) — consorcios microbianos AgriFood Tech
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(18, 'agroindustria', 'i_d_aplicada', 'Investigación y desarrollo de consorcios microbianos para producción agroalimentaria', 'disponible'),
(18, 'alimentos_nutricion', 'procesamiento_biologico', 'Exploración de biofábricas con consorcios microbianos sinérgicos para AgriFood Tech', 'disponible');

-- Buenas Maltas (id=19) — fermentos y biotecnología
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(19, 'alimentos_nutricion', 'procesamiento_biologico', 'Producción de fermentos biotecnológicos para bebidas, alimentos y aplicaciones sostenibles', 'disponible');

-- Zure Embryotech (id=20) — embriología clínica
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(20, 'salud_humana', 'i_d_aplicada', 'Desarrollo de tecnologías innovadoras para embriología clínica y reproducción asistida', 'disponible');

-- Life Si (id=21) — ingeniería de tejidos y bioimpresión 3D
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(21, 'salud_humana', 'manufactura', 'Fabricación de órganos y tejidos biológicos mediante bioimpresión 3D con células humanas', 'disponible'),
(21, 'salud_humana', 'i_d_aplicada', 'I+D en ingeniería de tejidos, ciencia de materiales y aplicaciones farmacéuticas', 'disponible');

-- NovoSens (id=22) — biosensores Lab-on-a-Chip
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(22, 'salud_humana', 'diagnostico_clinico', 'Soluciones Lab-on-a-Chip para medición de compuestos en salud humana y animal', 'disponible'),
(22, 'agroindustria', 'analisis_quimico', 'Equipos biosensores para medición de compuestos de interés agroindustrial', 'disponible');

-- Nanotransfer (id=23) — nanopartículas para terapia génica
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(23, 'salud_humana', 'i_d_aplicada', 'Diseño de agentes de transfección basados en nanopartículas para tratamiento de enfermedades genéticas', 'disponible');

-- Beef Up (id=24) — factores de crecimiento para cultivos celulares
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(24, 'alimentos_nutricion', 'i_d_aplicada', 'Desarrollo de factores de crecimiento para cultivos celulares con foco en cultivated seafood', 'disponible');

-- Embryoxite (id=25) — diagnóstico no invasivo embriones con IA
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(25, 'salud_humana', 'diagnostico_clinico', 'Diagnóstico no invasivo para embriones preimplantacionales mediante IA, metabolómica e imágenes', 'disponible');

-- Calfix (id=26) — biomineralización para hormigón
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(26, 'ambiente', 'i_d_aplicada', 'Biotecnología de mineralización inducida biológicamente (MIB) para sellado de fisuras en hormigón', 'disponible'),
(26, 'ambiente', 'manufactura', 'Producción de selladores biotecnológicos y aditivos self-healing para estructuras de hormigón', 'disponible');

-- UNRC (id=27) — biotecnología agropecuaria, ambiental e industrial
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(27, 'agroindustria', 'i_d_aplicada', 'Investigación en biotecnología agropecuaria, ambiental e industrial desde facultades científicas', 'disponible'),
(27, 'ambiente', 'consultoria_tecnica', 'Vinculación tecnológica y formación en biotecnología aplicada', 'disponible');

-- UCC (id=28) — investigación interdisciplinaria en biotecnología
INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad) VALUES
(28, 'salud_humana', 'i_d_aplicada', 'Investigación interdisciplinaria en biotecnología con foco en formación y desarrollo tecnológico', 'disponible');


-- ─── NECESIDADES (DEMANDA) ────────────────────────────────────────────────────

-- Bio4 necesita análisis y control de calidad de subproductos
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(10, 'agroindustria', 'analisis_quimico', 'Análisis de calidad de bioetanol y subproductos (burlanda, jarabe) para cumplimiento normativo', 'normal', 'activa'),
(10, 'agroindustria', 'validacion_procesos', 'Validación de procesos de fermentación y transformación de maíz a escala industrial', 'normal', 'activa');

-- Biofeed Tech necesita análisis microbiológicos y validación
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(12, 'alimentos_nutricion', 'analisis_microbiologico', 'Caracterización y control de cepas probióticas para certificación de productos', 'alta', 'activa'),
(12, 'alimentos_nutricion', 'validacion_procesos', 'Validación de procesos de producción de probióticos para escala industrial', 'alta', 'activa');

-- Hospital Privado necesita servicios de diagnóstico molecular
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(14, 'salud_humana', 'analisis_molecular', 'Servicios de diagnóstico molecular avanzado para investigación clínica y ensayos', 'normal', 'activa');

-- InBiomed necesita análisis y validación de biomateriales
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(15, 'salud_humana', 'analisis_quimico', 'Caracterización química y física de biomateriales para regeneración tisular', 'alta', 'activa'),
(15, 'salud_humana', 'validacion_procesos', 'Validación de procesos de fabricación de biomateriales bajo normas ISO/FDA', 'alta', 'activa');

-- Leistung necesita validación y metrología de dispositivos
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(16, 'salud_humana', 'metrologia', 'Calibración y metrología de dispositivos médicos para certificación de exportación', 'alta', 'activa'),
(16, 'salud_humana', 'control_calidad', 'Ensayos de control de calidad para ventiladores y dispositivos de terapia intensiva', 'alta', 'activa');

-- Summabio necesita análisis microbiológico de consorcios
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(18, 'agroindustria', 'analisis_microbiologico', 'Caracterización de consorcios microbianos para validar eficacia en campo', 'normal', 'activa'),
(18, 'alimentos_nutricion', 'i_d_aplicada', 'Colaboración en I+D para optimización de biofábricas microbianas', 'normal', 'activa');

-- Calfix necesita análisis microbiológico y químico
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(26, 'ambiente', 'analisis_microbiologico', 'Caracterización de cepas bacterianas productoras de calcita (identificación, pureza, viabilidad)', 'alta', 'activa'),
(26, 'ambiente', 'analisis_quimico', 'Verificación de producción de carbonato de calcio y análisis mineralógico', 'alta', 'activa'),
(26, 'ambiente', 'validacion_procesos', 'Validación del proceso de mineralización para escalado industrial', 'alta', 'activa');

-- NovoSens necesita I+D aplicada y validación clínica
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(22, 'salud_humana', 'validacion_procesos', 'Validación clínica de biosensores Lab-on-a-Chip para certificación médica', 'alta', 'activa');

-- Nanotransfer necesita análisis molecular y procesamiento biológico
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(23, 'salud_humana', 'analisis_molecular', 'Análisis de eficiencia de transfección y caracterización de nanopartículas', 'alta', 'activa'),
(23, 'salud_humana', 'procesamiento_biologico', 'Servicios de cultivo celular para pruebas de transfección génica', 'alta', 'activa');

-- Beef Up necesita procesamiento biológico para cultivos celulares
INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia, status) VALUES
(24, 'alimentos_nutricion', 'procesamiento_biologico', 'Infraestructura de cultivos celulares y biorreactores para desarrollo de factores de crecimiento', 'alta', 'activa');

-- Verificar resultados
SELECT 'Capacidades nuevas:' AS info, COUNT(*) FROM capacidad WHERE actor_id >= 10;
SELECT 'Necesidades nuevas:' AS info, COUNT(*) FROM necesidad WHERE actor_id >= 10;
