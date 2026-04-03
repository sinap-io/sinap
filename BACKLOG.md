# Sinap — Backlog

Ideas y funcionalidades identificadas para versiones futuras.

---

## 🔴 Revisar mañana (issues del 31/03)

### Login en preview no funciona
Las URLs de preview de Vercel no tienen las variables de entorno de auth configuradas (AUTH_SECRET, DATABASE_URL, NEXTAUTH_URL). El login solo funciona en producción (sinap-psi.vercel.app).
**Solución**: configurar env vars en Vercel para entornos preview, o aceptar que el testing de auth siempre se hace en producción.

### Verificar buscador IA en iniciativas en producción
El timeout se extendió a 55s en preview (`claude/distracted-lamarr`). Ese cambio todavía no está en `main`. Mergear y confirmar que funciona sin error 502.

### Errores de build en Vercel por pre-rendering
Problema raíz: Next.js intenta pre-renderizar páginas en build time y falla si Railway no responde. Fix aplicado: `export const dynamic = "force-dynamic"` en todas las páginas con fetch a la API. Confirmar que no hay más páginas afectadas.

---

## Tipos de actor — correcciones pendientes
Acordado con Sebastián — revisar y corregir los tipos de actor:

- **Eliminar** `laboratorio` como tipo separado — un laboratorio es una empresa (con laboratorio)
- **Agregar** `gobierno` — organismos públicos del ecosistema
- **Renombrar** `investigacion` → `investigador` — el actor es la persona/grupo, no la actividad

**Requiere:** migración DB (UPDATE en tabla actor + CHECK constraint) + actualizar labels en frontend (`labels.ts`, formularios de alta de actor).

---

## Informe IA

### Informe semanal con actividad real de la semana
Hoy el informe muestra el estado actual del ecosistema (snapshot al día de emisión). Para que refleje genuinamente "lo que pasó esta semana" hay que poder filtrar por fecha de creación en cada tabla.

**Requiere:**
- Agregar `created_at TIMESTAMPTZ DEFAULT now()` a las tablas: `actor`, `necesidad`, `iniciativa`, `capacidad`, `instrumento`
- Migración de base de datos (004)
- Actualizar queries en `api/routers/informe.py` para filtrar por `created_at >= NOW() - INTERVAL '7 days'`
- Cambiar label del período de "Estado al [fecha]" a "Semana del X al Y"

**Valor:** el informe pasa de foto estática a reporte de actividad real — útil para reuniones semanales del equipo.

---

## v2 — Próxima versión

### Matching IA: necesidades ↔ financiamiento
Un actor describe su necesidad y la IA identifica instrumentos de financiamiento relevantes (ANR, FONARSEC, BICE, fondos provinciales) con justificación y próximos pasos.
- Mismo patrón técnico que el matching de capacidades
- Potencial de alertas proactivas: "hay una convocatoria nueva que aplica a tu perfil"

### Sistema de usuarios y roles
- Admin Clúster: gestión completa
- Actor miembro: carga y edita su propio perfil
- Visitante: búsqueda limitada

### Modelo de acceso lado demanda
- Freemium / socio básico Clúster / prueba gratuita X días
- A definir post-discovery sessions

---

## v3 — Futuro

### Alertas proactivas de financiamiento
Notificaciones automáticas cuando aparece una convocatoria que aplica al perfil de un actor.

### Módulo de talento científico
Perfiles de investigadores y graduados recomendados por facultades para necesidades puntuales de empresas.

### Gaps automáticos
Detección automática de necesidades sin oferta disponible → oportunidades de mercado para el Clúster.

### Búsqueda con IA — seguimiento conversacional ante gaps
- Cuando la IA detecta cobertura baja o nula, iniciar una pregunta de seguimiento en lenguaje libre
- Ejemplos: etapa del proyecto (investigación/prototipo/escala), si tienen equipamiento propio, si buscan servicio puntual o colaboración I+D
- Objetivo: refinar el match con más contexto y documentar mejor el gap en la tabla `gap`
- Prerequisito: más actores y servicios cargados en la red para que el matching sea útil

### Decisión de arquitectura — versión producción
- Stack definido: FastAPI (backend) + Next.js (frontend)
- Migrar desde Streamlit cuando el prototipo esté validado con stakeholders
- La BD en Neon PostgreSQL no cambia, toda la lógica es transferible
- Prerequisito: reuniones de validación con CEPROCOR y LACE

---

## Vista de iniciativas por actor o tema

Filtro estructurado sobre la lista de iniciativas que permita responder preguntas rápidas sin generar un informe IA completo:

- ¿En qué iniciativas está CEPROCOR?
- ¿Qué tiene abierto el vinculador Sebastián?
- ¿Qué iniciativas hay sobre biosensores / agua / diagnóstico?

**Propuesta de implementación:**
- Extender la página `/iniciativas` con filtros: por actor participante (dropdown), por vinculador, por texto libre (busca en título y descripción)
- No requiere IA — es búsqueda SQL sobre las tablas existentes (`iniciativa`, `iniciativa_actor`, `actor`)
- El endpoint `GET /iniciativas` ya devuelve la lista; agregar query params `actor_id` y `q` al backend

**Valor:** el vinculador puede arrancar el día viendo sus iniciativas activas; el Clúster puede ver de un vistazo qué actores están más involucrados.

---

## Módulo Iniciativas — mejoras pendientes

### Búsqueda contextual dentro de una iniciativa
Panel de búsqueda IA dentro de la pantalla de detalle de iniciativa. Botones rápidos para buscar actores, demandantes, investigadores e instrumentos relevantes. Resultados con botón directo para sumar a la iniciativa.

**Requiere:** nuevo componente frontend (panel de búsqueda) + conectar con endpoint `/search` existente. No requiere cambios de backend.

### Estados de participación de actores en iniciativas
Hoy `iniciativa_actor` solo tiene `rol`. Agregar campo `estado` para reflejar el pipeline de vinculación:

`potencial → contactado → confirmado`

- **Potencial**: identificado, no contactado aún
- **Contactado**: vínculo iniciado
- **Confirmado**: efectivamente parte de la iniciativa

**Requiere:** migración DB (campo `estado` en `iniciativa_actor`) + actualizar frontend para mostrar y editar el estado.

### Simplificación de roles de actores en iniciativas
Acordado con Pablo — revisar los roles actuales (lider, demandante, oferente, miembro, candidato, financiador) y simplificar a 3:

- **Líder**: conduce la iniciativa
- **Integrante**: participa activamente
- **Colaborador**: participación esporádica

**Requiere:** migración DB para actualizar CHECK constraint + actualizar labels en frontend.

---

*Actualizado: 3 abril 2026*