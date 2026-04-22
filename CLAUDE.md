# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (24 abril 2026)

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
- **Renombrado Servicios→Ofertas / Necesidades→Demandas** ✅ — en Nav, home, actores, iniciativas (solo UI, rutas y DB sin cambios)
- **Informe IA incluye proyectos** ✅ — datos de proyectos activos en contexto del prompt + sección "## Proyectos" + métrica "Proyectos" en header
- **Asistente del Ecosistema** (`/asistente`) ✅ — chat conversacional en lenguaje natural contra todos los datos del ecosistema, con descarga PDF
- **Panel admin de usuarios** (`/admin/usuarios`) ✅ — gestión sin terminal, visible para admin y manager
- **Modelo de roles externos rediseñado** ✅ — socio / freemium / invitado (ver sección abajo)
- **Filtros persistentes en URL** ✅ — useSearchParams en iniciativas, proyectos y actores. Suspense boundaries en las 3 páginas. Fix: duplicate `const rol` y `redirect` import faltante en proyectos.

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
- Cache 24h **persistida en DB** (tabla `cache_ia`) — sobrevive reinicios de Railway ✅
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
- Cache 7 días **persistida en DB** (tabla `cache_ia`) — sobrevive reinicios de Railway ✅
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
- `rodrigoasili@gmail.com` (directivo) / `cluster2026` ✅
- `anduagami@gmail.com` (directivo) / `cluster2026` ✅ — Iván Anduaga
- `asbasso84@gmail.com` (directivo) / `cluster2026` ✅ — Andrés Basso (email corregido a minúsculas, duplicado eliminado)
- Script `api/scripts/crear_usuario.py` para crear usuarios desde CLI ✅
- Panel `/admin/usuarios` para gestión visual (admin + manager) ✅

**Modelo de roles externos (migración 012 — 22 abril 2026):**
- `socio` (ex `oferente`) — acceso completo a toda la plataforma
- `freemium` (nuevo) — acceso básico: Inicio, Actores, Ofertas, Demandas. El resto aparece en el Nav con candado gris y tooltip "Para acceder debés ser socio". Redirige desde rutas bloqueadas.
- `invitado` (ex `demandante`) — ve todos los módulos de datos en modo lectura, no puede crear nada. Solo ve listados de Iniciativas y Proyectos (no el detalle). Tiene `fecha_vencimiento` (default 7 días al crear).
- Auth: login rechazado si `invitado` tiene `fecha_vencimiento` vencida
- ⚠️ El label final de `freemium` está pendiente — por ahora muestra "Acceso básico"
- Archivos locales (PDFs, Excel) eliminados del repo con `git rm --cached` ✅ — `.gitignore` actualizado

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

**Revisión pre-demo (16 abril 2026 — tarde):**
- Rutas /adit/* convertidas a redirects (→ /vinculadores y /vinculadores/[id]) ✅
- Variable CSS `--text-primary` corregida a `--text` en login, radar e informe (no existía) ✅
- Rol `manager` agregado a CAN_MANAGE en /iniciativas list (faltaba, inconsistente con /nueva) ✅
- Página 404 personalizada en español (`web/app/not-found.tsx`) ✅
- TypeScript type check: sin errores ✅
- `actors/page.tsx`: try/catch → muestra lista vacía si la API está caída ✅
- `iniciativas/[id]/page.tsx`: fetch de actores aislado → la iniciativa se muestra aunque falle ✅
- Nav responsive: top bar + drawer hamburger en mobile (< md), sidebar fija en desktop ✅
- `layout.tsx`: `pt-14 md:pt-0` + padding responsive para mobile ✅

**Cambios pre-demo (20 abril 2026):**
- Renombrado "Servicios"→"Ofertas" y "Necesidades"→"Demandas" en toda la UI ✅
  - Nav.tsx, page.tsx (home), services/page.tsx, needs/page.tsx, ActorsClient.tsx, actors/[id]/page.tsx, IniciativaDetailClient.tsx
  - Rutas `/services` y `/needs` sin cambiar. DB sin cambiar. Solo labels visuales.
- Informe IA: proyectos integrados al prompt ✅ — SQL query de proyectos activos, sección "## Proyectos", métrica en header
- Informe IA: métrica header cambiada — "Actores" reemplazado por "Proyectos" (6 métricas totales) ✅
- Fix TypeScript: `total_proyectos: number` agregado a `InformeData` interface ✅ (causaba build failure en Vercel)
- Logo PNG de Sinap en Nav (reemplaza SVG genérico) + favicon del browser ✅
- Demo realizada con el Clúster ✅
- 3 usuarios directivos creados: Rodrigo Asili, Iván (apellido pendiente), Andrés Basso ✅

**Asistente del Ecosistema (21 abril 2026):**
- Nuevo router `api/routers/asistente.py` — POST `/asistente` ✅
  - Recibe array de mensajes (historial multi-turno)
  - System prompt con contexto completo del ecosistema: actores, capacidades, necesidades, instrumentos, iniciativas, proyectos
  - Llama a `claude-sonnet-4-6` con historial limitado a últimos 20 mensajes
  - Regla: listar **TODAS** las entidades con conexión — no filtrar por relevancia percibida
  - Regla: no terminar respuestas con preguntas de seguimiento ("¿Querés profundizar?")
- Nuevas rutas `web/app/asistente/`: `page.tsx`, `actions.ts`, `AsistenteChat.tsx`, `loading.tsx` ✅
  - Dos arrays de estado: `displayed` (muestra welcome + conversación entera) y `history` (solo mensajes reales → API)
  - Burbujas de chat con ReactMarkdown (ya instalado en web/)
  - Scroll automático al último mensaje
- Nav: link "Asistente IA" con ícono Sparkles, visible para admin/manager/directivo/vinculador/oferente ✅
- PDF descargable via `window.print()` con CSS `@media print` ✅
  - Sección `.sinap-print` muestra solo primera consulta del usuario + última respuesta del asistente
  - "Consulta" = primer mensaje del usuario (no el último)
  - Sin preguntas de seguimiento al final

**Post-demo (20 abril 2026 — noche):**
- **Fix Server Actions** ✅ — 20 funciones de mutación en 4 archivos (iniciativas, proyectos, actores, vinculadores) verifican rol antes de ejecutar
- **Loading skeletons** ✅ — `loading.tsx` con skeleton animado en 6 rutas: iniciativas, proyectos, actores, vinculadores, informe, radar

**21 abril 2026 — fixes de confiabilidad:**
- **Cache persistida en DB** ✅ — Informe y Radar ya no pierden cache al reiniciar Railway
  - Tabla `cache_ia` (migración 011, aplicada en Neon) — upsert por tipo, TTL en horas
  - Informe: TTL 24h, clave `"informe"` / Radar: TTL 168h (7 días), clave `"radar_{tema}"`
- **Fix Gaps page** ✅ — try/catch en `gaps/page.tsx` → muestra página vacía en lugar de crash si API está caída
- **Fix Railway startCommand** ✅ — ver sección "Lecciones aprendidas" abajo
  - Commit definitivo: `railway.toml` → `startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"` (sin `cd api`)
- **Usuarios directivos creados** ✅:
  - `rodrigoasili@gmail.com` / cluster2026 / Rodrigo Asili / directivo
  - `anduagami@gmail.com` / cluster2026 / Iván / directivo
  - `Asbasso84@gmail.com` / cluster2026 / Andrés Basso / directivo
  - ⚠️ Email de Andrés tiene mayúscula inicial. Si el login falla, probar en minúscula y corregir en DB.

**Scope definido para el 1/5/2026 (lanzamiento con datos reales):**
1. ✅ Fix Server Actions
2. ✅ Loading feedback
3. ✅ Cache persistida en DB (Informe + Radar sobreviven reinicios)
4. ✅ Asistente del Ecosistema (`/asistente`) — chat conversacional + PDF
5. ✅ Panel admin de usuarios (`/admin/usuarios`)
6. ✅ Modelo de roles externos (socio / freemium / invitado)
7. ✅ Dominio sinap.io — comprado en Porkbun, DNS en Cloudflare, agregado en Vercel. Pendiente: propagación de nameservers (1-2hs) → Vercel pasa a "Valid Configuration" solo.
8. ✅ Filtros persistentes en URL (useSearchParams) — iniciativas, proyectos, actores

**Post 1/5:**
- Matching semántico por entidad (B1)
- Carga masiva CSV + matching en batch (B2) — pedido Pablo
- Panel de gráficos / evolución temporal
- JWT middleware en FastAPI

**Lo que está pendiente de desarrollo (ver BACKLOG.md para detalle completo):**
- Crear usuarios para el resto del equipo (vinculadores, oferentes)
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

1. ~~**Fix Server Actions**~~ ✅ — completado
2. ~~**Loading skeletons**~~ ✅ — completado
3. ~~**Cache persistida en DB**~~ ✅ — completado
4. ~~**Asistente del Ecosistema**~~ ✅ — completado
5. ~~**Panel admin de usuarios**~~ ✅ — completado
6. ~~**Modelo de roles externos**~~ ✅ — completado
7. ~~**Limpiar archivos locales del repo**~~ ✅ — `git rm --cached` + `.gitignore` actualizado
8. **Registrar dominio** sinap.io en Cloudflare
9. **Definir label final de freemium** — "Acceso básico" es provisorio
10. ~~**Filtros persistentes en URL**~~ ✅ — useSearchParams en iniciativas, proyectos, actores
11. **Datos reales** — borrar ficticios y cargar datos reales del Clúster el 1/5/2026

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

## Lecciones aprendidas — errores que no deben repetirse

### 1. Railway + nixpacks: el startCommand corre desde el subdirectorio del proyecto (21/04/2026)

**Qué pasó:** Railway rompió con `ModuleNotFoundError: No module named 'api'`. El backend estuvo caído varias horas.

**Causa raíz:** Nixpacks detecta `requirements.txt` en `api/` y **ejecuta todos los comandos desde `api/`**, no desde la raíz del repo. El startCommand original era `uvicorn api.main:app` (desde raíz), que funcionaba porque `api` era un namespace package. Cuando nixpacks cambió de comportamiento, el proceso arrancaba desde `api/` y Python no encontraba ningún paquete llamado `api`.

**Fix incorrecto intentado:** `cd api && uvicorn main:app` — esto intentaba hacer `cd` a `api/api/` (que no existe) y abortaba antes de iniciar Python. Railway reintentaba en loop, mostrando siempre el error de la build anterior en los logs (confundía el diagnóstico).

**Fix correcto:** `uvicorn main:app --host 0.0.0.0 --port $PORT` — sin `cd`, porque nixpacks ya ejecuta desde `api/`.

**Regla:** Si se toca `railway.toml`, verificar siempre que el `startCommand` no asuma que el cwd es la raíz del repo. Nixpacks corre desde donde encuentra `requirements.txt`.

**Regla de diagnóstico:** Si Railway muestra un error Python en los logs pero el fix ya está pusheado, puede ser que Railway esté mostrando logs de una build anterior. Hay que mirar el timestamp del log, no solo el mensaje.

---

### 2. Los crashes de Railway se diagnostican por el tipo de error, no solo el mensaje (21/04/2026)

- `ModuleNotFoundError: No module named 'X'` → problema de Python path / cwd, no de código
- `ImportError` → dependencia faltante o import circular
- El proceso sale con código 1 sin error Python → el shell command falló antes de que Python arrancara (ej: `cd` a directorio inexistente)
- Error en lifespan → pool de DB que no conecta al arrancar (ya mitigado con try/catch)

---

### 3. Los cambios del frontend (Next.js/Vercel) no pueden causar crashes de Railway (21/04/2026)

Server Actions (`web/app/*/actions.ts`) son TypeScript que corre en Vercel. No tocan Railway en absoluto. Si Railway cae al mismo tiempo que se hace un cambio en el frontend, la causa es otra (startCommand, variable de entorno, import de Python).

---

### 4. La cache en memoria se pierde en cada restart de Railway (resuelto 21/04/2026)

Railway reinicia el proceso ante cualquier deploy, crash o mantenimiento. Si el Informe o el Radar están en memoria, se generan de cero (30-60 segundos de espera para el usuario + costos de API). La solución es persistir en la tabla `cache_ia` de Neon.

---

## Workflow de desarrollo — cómo no romper main

**Regla central: `main` = producción = nunca roto.** Todo desarrollo nuevo va en una rama.

### Flujo estándar

```
git checkout -b feature/nombre-descriptivo
# ... trabajar, commitear ...
# Testear localmente antes de mergear
git checkout main && git merge feature/nombre-descriptivo
git push origin main
# Monitorear logs de Railway 1-2 minutos post-deploy
```

### Cuándo es seguro mergear a main

- Se testeó localmente (backend corriendo + frontend corriendo)
- No hay migraciones de DB pendientes sin aplicar
- El cambio no toca `railway.toml` ni variables de entorno (esos cambios son los más riesgosos)

### Migraciones de DB — protocolo

1. Aplicar la migración en Neon **antes** de deployar el código que la usa
2. Siempre usar `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
3. Nunca usar `DROP TABLE` ni `ALTER TABLE ... DROP COLUMN` sin aviso explícito
4. Después de aplicar: verificar en Neon console que la tabla/columna existe

### Si algo se rompe en main

1. Identificar si es frontend (Vercel) o backend (Railway) — son independientes
2. Para Railway: mirar logs de deploy, buscar el tipo de error (ver lección 2)
3. Hotfix directo a main si es crítico en producción — sin pasar por rama
4. Documentar en CLAUDE.md qué pasó y por qué (ver sección de lecciones aprendidas)

---

## Flujo de trabajo

- **Para cerrar sesión:** el usuario dice "cerramos" → actualizar CLAUDE.md + ARCHITECTURE.md + PROYECTO.md → commit
- **Para iniciar sesión:** el usuario dice "continuamos" → Claude ya leyó este archivo, arrancar directamente
- **Convención demo:** mensajes que empiezan con `demo:` → responder en 1-2 líneas máximo, directo, sin explicaciones. Para leer y repetir rápido.

---

## Cuentas del proyecto

| Servicio | Cuenta | Estado |
|---|---|---|
| Gmail | sinap.io.dev@gmail.com | ✅ Creado |
| GitHub | sinap-io/sinap | ✅ Organización creada, repo transferido y renombrado |
| Neon.tech | sinap-production `ep-tiny-cell-acjfdkps` (21+ tablas + migraciones 001–010) | ✅ Operativo |
| Railway | sinap-production.up.railway.app | ✅ Operativo (FastAPI) |
| Vercel | sinap-psi.vercel.app | ✅ Operativo (Next.js) |
| Cloudflare / sinap.io | — | ⏳ Registrar dominio |
