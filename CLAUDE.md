# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (16 abril 2026)

**Lo que funciona en producción (main / sinap-psi.vercel.app):**
- Backend FastAPI → Railway: `https://sinap-production.up.railway.app` ✅
- Frontend Next.js → Vercel: `https://sinap-psi.vercel.app` ✅
- Prototipo Streamlit (`app/`) — conectado a `sinap-production` — NO TOCAR
- Módulo Iniciativas completo ✅
- Rediseño visual (Open Sans + navy/teal) ✅
- Auth.js v5 con tabla `usuario` en Neon ✅
- Informe IA (`/informe`) ✅
- Roles en UI ✅ — rol `manager` en Nav y permisos
- Radar sectorial (`/radar`) ✅ — con Tavily + cron semanal automático
- Buscador IA dentro del detalle de iniciativa ✅ — panel colapsable "Buscar en el ecosistema"
- **Login de Pablo resuelto** ✅ — fix definitivo en producción
- **Rol de Pablo resuelto** ✅ — figura como "Manager" correctamente
- **Módulo Proyectos** ✅ — CRUD completo + actores + instrumentos + historial TRL + buscador IA
- **Módulo Vinculadores** ✅ — ex-ADIT, renombrado. Panel de actividad, detalle por vinculador, zona editable

**Branch activo:** `main` — todo mergeado y deployado.

**⚠️ Nota de auth en preview:**
- Login en preview NO funciona (URLs preview de Vercel no tienen las env vars de auth — AUTH_SECRET, DATABASE_URL). Solo funciona en sinap-psi.vercel.app (producción).

**Base de datos — fuente de verdad unificada (fix 2 abril 2026):**
- DB de producción: `ep-tiny-cell-acjfdkps` en Neon.tech ← **ESTA ES LA ÚNICA**
- `sinap/.env` actualizado para apuntar a esta DB ✅
- `web/.env.local` creado apuntando a esta DB ✅
- `api/scripts/crear_usuario.py` corregido para leer `sinap/.env` correctamente ✅
- Railway (FastAPI) también apunta a `ep-tiny-cell-acjfdkps` ✅ — confirmado en screenshot del dashboard
- Ver ARCHITECTURE.md → sección "Decisión técnica — 2 abril 2026" para el análisis completo.

**Sistema de autenticación — estado:**
- Auth.js v5 con email + contraseña ✅
- `proxy.ts` como middleware (Next.js 16) — usa `getToken` de `next-auth/jwt` directamente ✅
- `middleware.ts` eliminado (causaba conflicto con `proxy.ts` en Next.js 16) ✅
- Login usa `window.location.href = "/"` (no `router.push`) para evitar race condition con cookie store ✅
- Tabla `usuario` en Neon.tech (`ep-tiny-cell-acjfdkps`) ✅
- Usuarios: `sebabizzi@gmail.com` (admin) + `pdiazazulay@gmail.com` (manager) — contraseña: sinap2026 ✅
- Pendiente: crear usuarios para el resto del equipo

**Informe IA — estado:**
- Endpoint `GET /informe` en Railway ✅ (`?force=true` para forzar regeneración)
- Cache 24h en memoria (se pierde si Railway reinicia) ✅
- 5 secciones de análisis cruzado entre todos los módulos:
  1. Resumen (2 oraciones, lo más urgente)
  2. Oportunidades de negocios → corto plazo (matches actores no conectados) + mediano plazo (brechas sin cobertura)
  3. Estado de iniciativas (detecta iniciativas en_curso sin hitos en +30 días)
  4. Financiamiento (cruza necesidades activas con instrumentos disponibles)
  5. Esta semana (hitos de los últimos 7 días)
- Período: "Estado al [fecha]" ✅
- Visible para `admin`, `manager`, `directivo`, `vinculador` ✅
- Botón "↻ Actualizar" solo para `admin` y `manager` — el resto solo lee el caché ✅
- Botón "↓ Descargar PDF" disponible para todos los roles con acceso ✅

**Radar sectorial — estado:**
- Endpoint `GET /radar?tema=X&force=true` ✅
- 2 temas: `biosensores` + `biotech_general` (los 5 anteriores eliminados — enfoque más rico) ✅
- Cache 7 días en memoria (se limpia si Railway reinicia) ✅
- Búsqueda web real con **Tavily** integrado ✅ — TAVILY_API_KEY en Railway
- Botón "↻ Regenerar" visible solo para `admin` y `manager` ✅
- Botón "↓ Descargar PDF" disponible para todos los roles con acceso (`window.print()`) ✅
- **Cron automático:** GitHub Actions llama al backend todos los lunes a las 9:00 AM Argentina (12:00 UTC) ✅
  - Workflow: `.github/workflows/radar-refresh.yml`
  - Se puede ejecutar manualmente desde GitHub → Actions → "Radar — refresh semanal automático"
- Prompt: 5 secciones, sin límite de palabras, contenido extenso ✅

**Buscador en iniciativas — estado:**
- Panel colapsable en detalle de iniciativa ✅
- 3 botones rápidos: ¿Quién puede aportar? / ¿Quién demanda esto? / ¿Qué financiamiento aplica? ✅
- Timeout extendido a 55s ✅

**Roles en UI — estado:**
- Nav filtra "Informe IA" y "Radar sectorial" según rol ✅
- Footer del nav muestra nombre legible del rol ✅ (`manager` → "Manager")
- `/iniciativas/nueva` redirige a oferente/demandante ✅

**Usuarios — estado:**
- `sebabizzi@gmail.com` (admin) / `sinap2026` ✅
- `pdiazazulay@gmail.com` (manager) / `sinap2026` ✅
- Script `api/scripts/crear_usuario.py` para crear usuarios desde CLI ✅

**Datos ficticios verosímiles — estado (3 abril 2026):**
- Script `api/scripts/seed_data.py` ✅ — carga 23 actores, 36 capacidades, 17 necesidades, 12 instrumentos, 4 iniciativas, 11 hitos
- Actores clasificados con tipos nuevos: empresa, startup, universidad, investigador, gobierno
- Vinculador: Sebastián Bizzi (`sebabizzi@gmail.com`) — Pablo NO es vinculador (es manager)
- Script es re-ejecutable sin borrar usuarios (fix CASCADE)

**Tipos de actor — migración 005 aplicada (3 abril 2026):**
- `laboratorio` eliminado → convertidos a `empresa`
- `investigacion` renombrado a `investigador`
- `gobierno` agregado (CEPROCOR, INTI Córdoba)

**Módulo Iniciativas — mejoras (3 abril 2026):**
- Edición inline de título y descripción ✅ — botón "✏ Editar" en el header, disponible para admin/manager/directivo/vinculador
- Vinculador visible en sección "Actores participantes" ✅ — con badge teal "Vinculador"

**Logs históricos — migración 006 aplicada (10 abril 2026):**
- `iniciativa_estado_log` ✅ — registra cada cambio de estado con fecha (automático en PATCH)
- `actor_etapa_log` ✅ — registra evolución de etapa de actores
- `proyecto_trl_log` ✅ — preparada para cuando exista tabla `proyecto`
- `creado_por` agregado a `iniciativa` y `hito` — listo para atribución ADIT

**Edición de etapa de actores (10 abril 2026):**
- PATCH `/actors/{id}` en API ✅ — actualiza etapa y escribe en `actor_etapa_log`
- `ActorHeader.tsx` ✅ — selector de etapa inline con botón "✏ Cambiar etapa"
- Server action `editarEtapaActor` ✅
- Visible solo para admin/manager/directivo/vinculador

**Documentos de definición pendiente (10 abril 2026):**
- `Módulo ADIT — definición y preguntas pendientes.md` ✅ — enviado a Pablo
- `Módulo Proyectos — definición y preguntas pendientes.md` ✅
- `TRL - Niveles de Preparación Tecnológica.md` ✅ — referencia

**Decisiones de producto pendientes (esperando respuesta de Pablo):**
- Modelo de cobro del ADIT: quién valida el monto, qué define resultado positivo, comisión fija o variable
- Zona geográfica: lista fija de regiones o texto libre
- Perfil del actor: ¿reemplaza o complementa al tipo actual?
- Roles en iniciativas: adoptar los 6 propuestos por Pablo
- Áreas temáticas: adoptar las de Pablo (salud humana, agroindustria, biomateriales, bioinformática, medio ambiente)
- Módulo Proyectos: quién carga, historial de TRL, carga masiva desde Excel

**Filtros de iniciativas (14 abril 2026):**
- Filtro por actor participante (dropdown) ✅
- Filtro por vinculador (dropdown) ✅
- actor_ids en IniciativaList (ARRAY_AGG en SQL) ✅
- Botón "Limpiar filtros" ✅

**Bug DELETE en iniciativas — resuelto (14 abril 2026):**
- Reemplazado `db.execute` + comparación string por `db.fetchval` + `RETURNING 1` ✅

**Módulo Proyectos (14–15 abril 2026):**
- Migración 007 aplicada ✅ — tablas zona, proyecto, proyecto_actor, proyecto_instrumento
- Migración 008 aplicada ✅ — vincula vinculadores con usuarios por email, cambiado_por en trl_log
- Migración 009 aplicada ✅ — apoyos_buscados TEXT[], estado simplificado, tabla proyecto_hito
- Migración 010 aplicada ✅ — campo prioridad INTEGER (1–4)
- API completa: CRUD + actores + instrumentos + zonas + hitos ✅
- Frontend: /proyectos (lista + filtros), /proyectos/nuevo, /proyectos/[id] (detalle editable) ✅
- TRL auto-logueado en proyecto_trl_log en cada cambio ✅
- UX: sección "¿Qué necesita para avanzar?", tags con borde punteado cuando inactivos ✅
- UX: badge de prioridad editable en header del proyecto ✅
- UX: rol de actor como dropdown (12 opciones predefinidas) ✅
- UX: descripciones cortas bajo cada badge en evolución TRL ✅
- Fix: transición independiente para tags de apoyos (no bloquea el resto del componente) ✅

**Módulo Vinculadores (14–15 abril 2026):**
- Renombrado de ADIT → Vinculadores en toda la app (Nav, rutas, títulos) ✅
- Solo muestra vinculadores activos (solo_activos=true) — Pablo no aparece ✅
- Sin métricas globales engañosas ✅
- API /adit: lista, detalle con actividad completa ✅
- Frontend /vinculadores y /vinculadores/[id] ✅

**Decisiones de producto tomadas (14 abril 2026 — Sebastián):**
- ADIT = vinculador (sinónimos en SINAP). Mismo rol, mismas capacidades.
- Zonas geográficas: tabla `zona` editable por admin/manager. Arranca solo con "Gran Córdoba".
- SINAP registra actividades del ADIT pero NO calcula compensación (se hace en planilla externa).
- Actividades que registra SINAP: iniciativas creadas + hitos creados + proyectos creados + actores vinculados + cambios de TRL logueados (todo vía `creado_por` / `cambiado_por`).
- Módulo Proyectos: sin actor dueño único (interinstitucional desde el arranque, join table `proyecto_actor`).
- Proyectos pueden estar vinculados a una iniciativa (FK opcional `iniciativa_id`).
- Crean proyectos: admin, manager, directivo, vinculador (agregar actor-self-load es 1 línea de código después).
- TRL actualizable por cualquiera con acceso (dato objetivo, no editorial).
- Campos mínimos de proyecto: título, descripción, TRL (1-9), área temática, estado, actores, instrumentos, búsqueda IA contextual.

**Fixes y mejoras (16 abril 2026):**
- Tags de apoyos: useEffect para sincronizar estado local con servidor post-revalidación ✅
- Tags de apoyos: opacity-60 durante carga (sin deshabilitar) ✅
- keep-alive: GitHub Actions pingea /health cada 10 min → Railway no duerme ✅
- revalidatePath optimizado: eliminado "/proyectos" innecesario de acciones del detalle ✅
- Vinculadores: actividad cuenta por vinculador_id (no creado_por) ✅
- Iniciativas: eliminado nombre de vinculador debajo del título en la lista ✅

**Lo que está pendiente de desarrollo (ver BACKLOG.md para detalle completo):**
- Seguridad: middleware JWT en FastAPI (para que creado_por se pueble automáticamente del token)
- Login con Google (OAuth)
- Datos reales del Clúster (cuando estén disponibles)
- Dominio sinap.io en Cloudflare

---

## Roles del sistema

| Rol | Quiénes | Qué pueden hacer |
|---|---|---|
| `admin` | Cluster Manager + Sebastián | Todo: gestionar usuarios, roles, configuración |
| `directivo` | Miembros del Consejo Directivo | Crear y gestionar iniciativas, ver todo |
| `vinculador` | Operadores del Clúster | Gestionar iniciativas asignadas, ver todo |
| `oferente` | Actores con membresía | Ver todo, editar su perfil de actor |
| `demandante` | Actores sin membresía | Ver catálogo y buscar con IA |

**Registro:** solo por invitación del Clúster. El rol lo asigna el admin internamente.

---

## Modelo de negocio

**Oferente:** cualquier tipo de actor que ofrece servicios. Paga membresía. Perfil editable.
**Demandante:** actor que busca servicios. Acceso free. Solo lectura.
**Acceso sin login:** no hay — toda la plataforma requiere autenticación.

---

## Próximo paso concreto

⚠️ **Datos reales diferidos** — no se cargan hasta que el desarrollo esté completo y el Clúster los tenga disponibles (puede llevar semanas). Los datos ficticios de prueba son suficientes para demos.

En orden de prioridad:

1. **Limpieza técnica** — eliminar console.log de debug en proxy.ts y auth.ts
2. **Seguridad API** — middleware JWT en FastAPI (creado_por automático del token)
3. **Crear usuarios** para el resto del equipo (vinculadores, oferentes)
4. **Registrar dominio** sinap.io en Cloudflare
5. **Datos reales** — cuando el Clúster los tenga disponibles

---

## Paleta y diseño

- Fuente: Open Sans (igual al Clúster Biotecnología)
- Sidebar: blanco `#ffffff` con borde `#e2e8f0`
- Acento principal: teal `#0d9488`
- Texto principal: navy `#1e3a5f`
- Fondo: blanco `#ffffff`
- Cards: blancas con borde superior teal + sombra al hover
- Hero: tipografía libre sobre blanco (sin card), métricas en teal centradas como bloque

**Sistema de colores semánticos:**
- Urgencia crítica: rojo `#dc2626`
- Urgencia alta: violeta `#a855f7`
- Urgencia normal: azul `#2563eb`
- Urgencia baja: gris `#94a3b8`
- Startup (tipo actor): gris slate `#64748b`
- Regla: el color comunica información, no decora. En home todas las cards son teal.

**Referencias visuales:** Clúster Biotecnología Córdoba + Bousoño Vargas

**Copy del hero:**
- Título: "Plataforma de Inteligencia Territorial"
- Subtítulo: "Registra la actividad del Clúster de Biotecnología de Córdoba. / Actores, capacidades, oportunidades e iniciativas en curso."
- Nombre: sinap.io — aprobado por Pablo ✅

---

## Flujo de trabajo

- **Para cerrar sesión:** el usuario dice "cerramos" → actualizar CLAUDE.md + ARCHITECTURE.md + PROYECTO.md → commit
- **Para iniciar sesión:** el usuario dice "continuamos" → Claude ya leyó este archivo, arrancar directamente

---

## Cuentas del proyecto

| Servicio | Cuenta | Estado |
|---|---|---|
| Gmail | sinap.io.dev@gmail.com | ✅ Creado |
| GitHub | sinap-io/sinap | ✅ Organización creada, repo transferido y renombrado |
| Neon.tech | sinap-production `ep-tiny-cell-acjfdkps` (21 tablas + migraciones 001–008) | ✅ Operativo |
| Railway | sinap-production.up.railway.app | ✅ Operativo (FastAPI) |
| Vercel | sinap-psi.vercel.app | ✅ Operativo (Next.js) |
| Cloudflare / sinap.io | — | ⏳ Registrar dominio |
