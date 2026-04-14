# Módulo Proyectos en SINAP — Definición y preguntas pendientes

*Documento de trabajo — Sebastián y Pablo — abril 2026*

---

## Por qué existe este módulo

Hoy SINAP mapea **quién existe** en el ecosistema: actores, capacidades, necesidades. Pero no registra **qué está pasando** — los proyectos concretos de investigación, desarrollo o innovación que están en curso.

Un proyecto es algo que un científico, una startup o un grupo de actores está desarrollando: un biosensor, una variedad vegetal editada, una vacuna, un software de diagnóstico. Tiene vida propia, avanza en el tiempo, puede buscar financiamiento, socios o compradores — y en ese momento se convierte en o se vincula a una iniciativa.

El caso de uso que lo justifica: la Secretaría de Ciencia y Tecnología de la provincia tiene decenas de proyectos de biotech en distintos estadios. Cargarlos en SINAP convierte a la plataforma en el **primer mapa de proyectos de innovación del ecosistema biotech de Córdoba**. Eso tiene valor institucional que va más allá del Clúster.

---

## Qué es un proyecto en SINAP

Un proyecto es una entidad independiente que representa un desarrollo tecnológico en curso. Sus características principales:

- **Puede existir sin iniciativa** — un proyecto científico que todavía no busca vinculación activa
- **Puede existir sin ADIT asignado** — no todo proyecto pasa por un vinculador
- **Tiene TRL** (Technology Readiness Level, del 1 al 9) que evoluciona en el tiempo
- **Puede ser interinstitucional desde el origen** — un proyecto conjunto entre CONICET y UNC, por ejemplo, antes de que exista una iniciativa formal
- **Cuando necesita algo** (financiamiento, socio tecnológico, comprador piloto), se vincula a una iniciativa o genera una nueva

---

## Qué datos tendría un proyecto

| Campo | Descripción |
|---|---|
| Título | Nombre del proyecto |
| Descripción | Qué es y qué problema resuelve |
| Área temática | Las mismas categorías del ecosistema (salud humana, agroindustria, etc.) |
| TRL actual | Nivel del 1 al 9 — declarado por quien carga, actualizable |
| Estado | En desarrollo / pausado / concluido / comercializado |
| Actores que participan | Uno o varios, con su rol en el proyecto |
| Fecha de inicio | Cuándo comenzó |
| Origen de financiamiento actual | Si tiene financiamiento activo (PICT, FONARSEC, etc.) |
| Vínculo a iniciativas | Las iniciativas de SINAP que surgieron de o acompañan este proyecto |
| Cargado por | Quién lo registró en la plataforma |

---

## Actores en un proyecto

Un proyecto puede tener múltiples actores con roles distintos desde el origen, sin necesidad de una iniciativa:

| Rol | Ejemplo |
|---|---|
| Desarrollador principal | El laboratorio o startup que lidera el desarrollo |
| Co-investigador | Otra institución que aporta conocimiento o infraestructura |
| Institución de origen | La universidad o centro donde surge el proyecto |
| Financiador | El organismo que financia la etapa actual |

---

## El TRL en SINAP

El TRL (Technology Readiness Level) es una escala del 1 al 9 que mide la madurez de una tecnología:

| Rango | Fase | Actores típicos |
|---|---|---|
| TRL 1-3 | Investigación básica y prueba de concepto | Científicos, universidades |
| TRL 4-6 | Desarrollo y validación — "valle de la muerte" | Startups, spin-offs |
| TRL 7-9 | Prototipo real, escalado, comercialización | Empresas, inversores |

**Por qué importa para el financiamiento:** muchos instrumentos tienen TRL requerido. FONARSEC apunta a TRL 4-7. El PICT financia TRL 1-4. Un fondo de capital semilla busca TRL 3-5. Con este campo, SINAP puede cruzar automáticamente un proyecto con los instrumentos que le aplican.

**Sobre la validación del TRL:** el TRL lo declara quien carga el proyecto. No habrá un proceso de validación formal en la plataforma — se confía en la buena fe de quien carga. Para proyectos científicos esto no es un problema (un investigador del CONICET tiene incentivos para ser preciso). Para startups puede haber algo de sesgo, pero sin un proceso de auditoría externo no hay forma de evitarlo dentro de la plataforma.

---

## Carga masiva desde Excel

Para cargar proyectos provenientes de CONICET, la Secretaría de Ciencia y Tecnología u otras fuentes institucionales, se necesita importación desde planilla.

El flujo sería:
1. Se comparte una plantilla Excel con las columnas del proyecto
2. La institución (CONICET, Secretaría, etc.) completa la planilla
3. Se importa masivamente a SINAP con un script

Esto requiere acordar con cada institución el formato de sus datos y hacer una limpieza antes de importar.

---

## Relación con otros módulos

**Con iniciativas:** un proyecto puede dar origen a una iniciativa ("este proyecto en TRL 4 necesita un socio industrial para escalar") o una iniciativa existente puede vincularse a un proyecto ("la iniciativa de consorcio entre CEPROCOR y Mincor Biotech está desarrollando este proyecto").

**Con financiamiento:** el TRL del proyecto permite filtrar qué instrumentos aplican. El campo "financiamiento actual" permite saber si el proyecto ya tiene fondos o está buscando.

**Con el módulo ADIT:** un ADIT puede detectar un proyecto interesante, cargarlo en SINAP y abrir una iniciativa para acompañarlo. El proyecto queda registrado con el ADIT como creador.

---

## Preguntas pendientes de definición

**P1. ¿Qué pasa cuando el TRL cambia?**
¿Se actualiza el campo y se pierde el TRL anterior, o se registra el historial de TRL con fecha de cada cambio? El historial es más rico pero más complejo.

**P2. ¿Hay un proceso para que el propio científico o startup cargue su proyecto?**
¿O siempre lo carga el Clúster o el ADIT? Esto define si necesitamos un formulario de autogestión para actores externos.

**P3. ¿Los proyectos son públicos o privados?**
¿Cualquier usuario logueado puede ver todos los proyectos, o hay proyectos confidenciales que solo ve el Clúster y el ADIT?

**P4. ¿Cómo se acuerda la plantilla Excel con CONICET o la Secretaría?**
¿Quién lidera esa negociación — el Clúster directamente? ¿Hay un convenio de datos?

---

*Documento generado en sesión de trabajo SINAP — abril 2026*
*Estado: pendiente de definición antes de implementar*
