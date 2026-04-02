# SINAP — Arquitectura y decisiones técnicas

> Documento vivo. Captura el estado del proyecto, las decisiones de diseño y el razonamiento detrás de cada una. Actualizar al cerrar cada sprint.
>
> Última actualización: 2 abril 2026

---

## Qué es SINAP

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina. Desarrollada para el Clúster de Biotecnología de Córdoba.

**Problema que resuelve:** Los actores del ecosistema (laboratorios, empresas, startups, universidades, centros de investigación) no se conocen entre sí con suficiente detalle para colaborar eficientemente. Hay servicios disponibles que no se demandan porque no se saben disponibles, y hay necesidades que no se satisfacen porque quien puede satisfacerlas no sabe que existe esa demanda.

**Solución:** Una plataforma que mapea actores, servicios, necesidades y financiamiento, con una capa de IA que cruza esa información y detecta gaps automáticamente.

---

## Estado actual del proyecto (marzo 2026)

### Lo que existe y funciona

```
sinap/
├── app/          ← Prototipo Streamlit (Python) — EN PRODUCCIÓN, NO TOCAR
├── db/           ← Scripts SQL originales del prototipo
├── api/          ← Backend FastAPI (nuevo, producción)
└── web/          ← Frontend Next.js (nuevo, producción)
```

**Prototipo (`app/`):** Streamlit conectado a `sinap-prototype` en Neon.tech. Funciona y se usa para validación con stakeholders. Se mantiene intacto en paralelo con la versión productiva.

**Backend (`api/`):** FastAPI conectado a `sinap-production` en Neon.tech. 8 routers operativos en Railway producción (incluye `/informe`).

**Frontend (`web/`):** Next.js 16.2 conectado al backend FastAPI. 12 rutas compiladas y funcionales en producción.

### Bases de datos en Neon.tech

| Base | Endpoint | Uso | Quién la usa |
|---|---|---|---|
| `sinap-prototype` | `ep-wandering-violet-ac450yzt` | Prototipo Streamlit | `app/` — NO TOCAR |
| `sinap-production` | `ep-tiny-cell-acjfdkps` | Backend + Frontend | Railway, Vercel, scripts locales |

**Importante:** Las dos bases son completamente independientes. Tocar `sinap-prototype` rompe el prototipo que se usa para validación con stakeholders.

---

### ⚠️ Decisión técnica — 2 abril 2026: unificación de fuente de verdad de la DB

**Problema detectado:** Durante semanas coexistieron DOS bases de datos distintas para `sinap-production`:

- `ep-tiny-cell-acjfdkps` → configurada en Vercel (creada automáticamente por la integración Neon+Vercel al momento de conectar el proyecto)
- `ep-wandering-violet-ac450yzt` → configurada en el `.env` local (creada manualmente en una sesión de setup temprana)

**Consecuencia:** Todo lo que se corría localmente (migraciones, scripts de usuarios, seeds de datos) afectaba a una base que Vercel y Railway ignoraban completamente. El síntoma visible fue que el rol de Pablo Díaz Azulay (`pdiazazulay@gmail.com`) no se actualizaba a `manager` en la plataforma, aunque los scripts locales confirmaban el cambio correctamente.

**Diagnóstico:** Se compararon las dos bases y se confirmó que `ep-tiny-cell-acjfdkps` (Vercel) era la correcta y completa — con 14 tablas, incluyendo todo el módulo de iniciativas. La base local tenía solo 10 tablas y era una versión desactualizada.

**Solución aplicada:**
1. Se actualizó `sinap/.env` para que `DATABASE_URL` apunte a `ep-tiny-cell-acjfdkps`
2. Se creó `web/.env.local` apuntando a la misma base (para que auth funcione en desarrollo local)
3. Se corrigió `api/scripts/crear_usuario.py`: buscaba el `.env` en `api/.env` (que no existe), ahora lo busca correctamente en `sinap/.env`
4. Se aplicó la migración 004 (`rol_manager`) directamente en `ep-tiny-cell-acjfdkps`
5. Se actualizó el rol de Pablo a `manager` en `ep-tiny-cell-acjfdkps`

**Regla a seguir de ahora en adelante:**
- La única base de datos de producción es `ep-tiny-cell-acjfdkps`
- Todo script, migración o seed debe correr con el `DATABASE_URL` de esa base
- Para verificar a qué base apunta el entorno local: `grep DATABASE_URL sinap/.env` → debe mostrar `ep-tiny-cell`
- Railway también debe apuntar a `ep-tiny-cell`. **Verificar en Railway dashboard → Variables** si hay dudas.

**Pendiente verificar:** Railway (FastAPI backend) — confirmar que su `DATABASE_URL` también apunta a `ep-tiny-cell-acjfdkps`. Si apuntara a una tercera base, el backend estaría leyendo datos distintos al frontend.

---

## Arquitectura de producción

```
Usuario → Next.js (Vercel) → FastAPI (Railway) → PostgreSQL (Neon.tech)
                                    ↓
                            Anthropic API (Claude)
```

### Por qué FastAPI y no alternativas

Se evaluaron tres opciones:

**Next.js full-stack (Route Handlers):** Elimina un servicio pero requeriría reescribir en TypeScript toda la lógica de Python — integración con Claude, queries SQL, parsing de respuestas. Trabajo innecesario cuando esa lógica ya existía en el prototipo.

**Django REST Framework:** Más "batteries included" pero más pesado. Para una API con 6-10 routers y sin ORM complejo, el overhead no justifica la adopción.

**FastAPI (elegido):** Mismo lenguaje que el prototipo (Python), permite mover la lógica existente casi línea por línea, async nativo (compatible con asyncpg + Neon), documentación automática en `/docs`. La integración con Anthropic SDK ya existía en el prototipo.

### Por qué Next.js y no otras opciones

Next.js App Router con Server Components es la arquitectura más apropiada para este caso porque:
- Las páginas de listado (actores, servicios, necesidades) se pueden prerenderizar estáticamente
- Los datos se fetchan server-side (no expone la URL del backend al browser)
- Server Actions para el formulario de búsqueda IA (el backend no es accesible desde el browser en producción)

---

## Schema de base de datos

### Tablas del ecosistema

**`actor`** — Nodo central. Laboratorios, empresas, startups, universidades e instituciones de investigación.
- `tipo`: laboratorio | empresa | startup | universidad | investigacion
- `etapa`: spinoff | seed | growth | consolidada | publica
- `certificaciones`: array de texto (ISO 17025, ANMAT, BPM, etc.)
- Diferencias con el prototipo: `website → sitio_web`, `subtipo` removido (era texto libre sin valor), `mercado → etapa` (más semántico), `+certificaciones`

**`capacidad`** — Servicios ofrecidos por un actor. Muchos por actor.
- `disponibilidad`: disponible | parcial | no_disponible
- El campo `descripcion_extendida` existe pero el prototipo lo populaba con texto libre; en producción se usa para descripción técnica detallada.

**`necesidad`** — Demanda declarada por un actor. Muchos por actor.
- `urgencia`: critica | alta | normal | baja — determina el orden de visualización
- `status`: activa | resuelta | cancelada

**`instrumento`** — Financiamiento disponible (subsidios, créditos, concursos).
- `status`: activo | proximamente | cerrado
- Incluye campos de condiciones: `contrapartida`, `gastos_elegibles`, `cobertura_porcentaje`

**`busqueda`** — Log de todas las consultas IA. Fuente de inteligencia sobre demanda real no declarada formalmente. Aparece en la pantalla de Gaps como "señales de demanda".

**`gap`** — Gaps detectados automáticamente por Claude durante búsquedas, o declarados manualmente. Cada búsqueda que detecta cobertura parcial o nula inserta registros aquí.

### Tablas del Módulo Iniciativas (migraciones 001 + 002)

Migración 001 (`api/db/migrations/001_vinculador.sql`) — ya aplicada en `sinap-production`:

**`vinculador`** — El operador humano que gestiona los procesos de vinculación. Separado de `actor` deliberadamente: no es un actor del ecosistema, es un rol interno de la plataforma. Cuando se agregue autenticación, esta tabla se conecta con la de usuarios.

Migración 002 (`api/db/migrations/002_iniciativas.sql`) — ya aplicada en `sinap-production`:

**`iniciativa`** — Corazón del módulo. Cualquier proceso de articulación entre actores.
- `tipo`: vinculacion | oportunidad | consorcio | demanda | oferta | instrumento | gap
- `estado`: abierta → en_curso → concretada | cerrada
- `vinculador_id`: nullable — el gestor humano es opcional
- `notas`: texto libre para contexto interno

**`iniciativa_actor`** — Actores participantes de cada iniciativa con su rol.
- `rol`: lider | demandante | oferente | miembro | candidato | financiador
- Un actor puede tener roles distintos en distintas iniciativas

**`iniciativa_necesidad`**, **`iniciativa_capacidad`**, **`iniciativa_instrumento`** — Vínculos con el ecosistema existente. Permiten cruzar iniciativas con los datos ya registrados.

**`hito`** — Resultados concretos y fechados de una iniciativa.
- 7 tipos: `contacto_establecido → reunion_realizada → acuerdo_alcanzado → convenio_firmado → proyecto_iniciado → financiamiento_obtenido → otro`
- `fecha` es `DATE` (no `TIMESTAMPTZ`) — es una fecha de evento real, no un timestamp de sistema
- `evidencia_url` permite linkar el PDF del convenio, acta o registro externo

---

## Decisiones de implementación

### Filtrado client-side vs server-side

Las pantallas de listado (actores, servicios, necesidades, instrumentos) usan filtrado **client-side**: el Server Component de Next.js fetchea todos los datos, los pasa a un Client Component, y los filtros operan en memoria en el browser.

**Por qué:** Con 10-100 actores en el ecosistema cordobés, filtrar en memoria es instantáneo y evita un round-trip al servidor con cada keystroke. Si el ecosistema crece a cientos de actores, se migra a `searchParams` en la URL + fetch server-side.

### AsyncAnthropic en el backend

El router `/search` usa `AsyncAnthropic` (cliente async de Anthropic) en lugar del cliente síncrono. Esto es importante porque FastAPI corre en un event loop async — una llamada síncrona bloquearía el proceso entero durante los 10-20 segundos que tarda Claude en responder, impidiendo atender otras requests simultáneas.

### Server Action para /search en el frontend

La búsqueda IA usa un Server Action de Next.js en lugar de un fetch directo desde el browser. Razón: la URL del FastAPI backend (`localhost:8000` en desarrollo, URL interna en producción) no debe ser accesible desde el browser del usuario — el Server Action actúa como proxy seguro que corre en el servidor de Next.js.

### GAPS_JSON parsing

Claude devuelve un bloque estructurado delimitado por `GAPS_JSON ... END_JSON` dentro de su respuesta en texto libre. Este patrón (en lugar de function calling o JSON mode) fue elegido en el prototipo porque:
1. Permite que Claude produzca texto natural y datos estructurados en el mismo mensaje
2. Es robusto — si el parseo falla, el texto visible igual llega al usuario
3. Compatible con la versión de la API usada en el prototipo

En producción se podría migrar a `tool_use` de Anthropic para mayor confiabilidad del JSON.

---

## Routers del backend (FastAPI)

| Endpoint | Descripción |
|---|---|
| `GET /health` | Verificación de estado |
| `GET /actors` | Lista con filtros: `search`, `tipo` |
| `GET /actors/{id}` | Detalle con servicios y necesidades |
| `GET /services` | Capacidades con filtros: `search`, `area_tematica`, `tipo_servicio`, `disponibilidad` |
| `GET /needs` | Necesidades con filtros: `search`, `urgencia`, `status` (default: activa) |
| `GET /instruments` | Instrumentos con filtros: `search`, `tipo`, `status` |
| `GET /gaps` | Cruce necesidades × capacidades. Param: `solo_sin_oferta` (bool) |
| `GET /gaps/summary` | Métricas agregadas: total_gaps, total_parcial, total_demanda |
| `GET /gaps/search-log` | Últimas consultas IA (señal de demanda no declarada) |
| `POST /search` | Búsqueda IA: Claude analiza la consulta contra el ecosistema |

**Módulo Iniciativas + Informe IA (en main desde 30/03/2026):**

| Endpoint | Descripción |
|---|---|
| `GET /iniciativas` | Lista con filtros: `tipo`, `estado`, `vinculador_id` |
| `POST /iniciativas` | Crear iniciativa |
| `GET /iniciativas/{id}` | Detalle con actores, hitos y vínculos |
| `PATCH /iniciativas/{id}/estado` | Cambiar estado |
| `POST /iniciativas/{id}/actores` | Agregar actor con rol |
| `DELETE /iniciativas/{id}/actores/{actor_id}` | Quitar actor |
| `POST /iniciativas/{id}/hitos` | Agregar hito |
| `GET /vinculador/operadores` | Lista de vinculadores disponibles |
| `GET /informe` | Informe analítico con Claude — análisis cruzado entre módulos |

---

## Rutas del frontend (Next.js)

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Server (static) | Dashboard: 5 métricas + 6 nav cards |
| `/actors` | Server + Client | Grid con filtros client-side, breakdown por tipo |
| `/actors/[id]` | Server (dynamic) | Detalle: servicios y necesidades del actor |
| `/services` | Server + Client | Catálogo con 3 filtros, top áreas |
| `/needs` | Server + Client | Necesidades por urgencia |
| `/gaps` | Server + Client | Análisis de cobertura, métricas, toggle |
| `/instruments` | Server + Client | Financiamiento con montos y links |
| `/search` | Server + Client | Búsqueda IA: form, spinner, respuesta estructurada |

**Módulo Iniciativas + Informe IA (en main desde 30/03/2026):**

| Ruta | Tipo | Descripción |
|---|---|---|
| `/iniciativas` | Server (dynamic) | Panel con métricas y lista filtrable |
| `/iniciativas/nueva` | Server (dynamic) | Formulario tipo-first — protegido por rol |
| `/iniciativas/[id]` | Server (dynamic) | Detalle: actores, vínculos, hitos timeline |
| `/informe` | Server (dynamic) | Informe IA semanal — solo admin/directivo/vinculador |
| `/login` | Server | Login con Auth.js v5 |

Las rutas `/vinculador/*` redirigen a `/iniciativas/*` (código legacy, no eliminar aún).

---

## Cómo correr el proyecto localmente

### Requisitos
- Python 3.11+
- Node.js 20+
- Variables de entorno configuradas (ver abajo)

### Variables de entorno — estructura correcta

```
sinap/
├── .env                  ← DATABASE_URL + ANTHROPIC_API_KEY (usado por scripts Python)
├── api/
│   └── .env              ← DATABASE_URL (asyncpg) + ANTHROPIC_API_KEY + ALLOWED_ORIGINS
└── web/
    └── .env.local        ← DATABASE_URL + AUTH_SECRET + NEXT_PUBLIC_API_URL
```

**⚠️ Todos los `DATABASE_URL` deben apuntar a `ep-tiny-cell-acjfdkps` (sinap-production).**
Para regenerar `web/.env.local` desde Vercel: `cd web && npx vercel env pull .env.local --environment development`

### Backend (FastAPI)
```bash
# Desde el root del repo
python -m uvicorn api.main:app --port 8000 --reload
# Docs disponibles en http://localhost:8000/docs
```

Variables requeridas en `api/.env` (Railway las inyecta automáticamente en producción):
```
DATABASE_URL=postgresql+asyncpg://neondb_owner:...@ep-tiny-cell-acjfdkps.sa-east-1.aws.neon.tech/neondb
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:3000,https://sinap-psi.vercel.app
```

### Frontend (Next.js)
```bash
cd web
npm run dev
# Disponible en http://localhost:3001 (si 3000 está ocupado)
```

`web/.env.local` ya existe con las variables correctas (Vercel las inyecta en producción).
Contiene: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_API_URL`.

### Scripts de gestión de usuarios
```bash
# Desde la raíz del repo — crea o actualiza usuarios en la DB de producción
python api/scripts/crear_usuario.py email@ejemplo.com contraseña "Nombre Apellido" rol
# Roles: admin | manager | directivo | vinculador | oferente | demandante
# Lee DATABASE_URL desde sinap/.env automáticamente
```

### Prototipo Streamlit (solo lectura, no modificar)
```bash
cd app
streamlit run app.py
# Usa sinap-prototype en Neon, independiente de sinap-production
```

### Cargar datos de prueba
```bash
# Desde el root del repo — inserta 10 actores, 21 servicios, 11 necesidades, 5 instrumentos
python -m api.db.seed
```

---

## Próximos pasos en orden de prioridad

### 1. Deploy ✅ COMPLETADO
- **FastAPI → Railway:** `https://sinap-production.up.railway.app` — operativo
- **Next.js → Vercel:** `https://sinap-psi.vercel.app` — operativo
- Conector Vercel MCP instalado en Claude para gestión directa de deploys
- Branch activo `claude/distracted-lamarr` en preview; pendiente merge a main
- **Pendiente:** Registrar dominio sinap.io en Cloudflare y configurar DNS

### 2. Módulo Iniciativas ✅ EN PRODUCCIÓN

- DB: migración 002 + 003 aplicadas en sinap-production ✅
  - Migración 003: campo `referente` en `iniciativa_actor`, estado `postergada` reemplaza `cancelada`
- API: router `/iniciativas` completo en Railway ✅
- Frontend: 3 rutas en producción (`/iniciativas`, `/iniciativas/nueva`, `/iniciativas/[id]`) ✅
- Estados: abierta / en_curso / concretada / cerrada / postergada
- Actores: campo `referente` opcional (persona específica dentro del actor)
- Notas: editables desde el detalle

**Deuda técnica registrada:** el campo `referente` en `iniciativa_actor` es provisional. A futuro se reemplazará por una tabla `persona` vinculada a `actor`, cuando se implemente el sistema de login.

### 3. Sistema de autenticación ✅ EN PRODUCCIÓN (main, PR #22 mergeado 30/03/2026)

**Stack:** Auth.js v5 + bcryptjs + PostgreSQL (pool directo, sin ORM)

**Tabla `usuario`** (migración 003, aplicada en sinap-production):
- `email` (unique), `password` (hash bcrypt), `nombre`, `rol`, `actor_id` (FK opcional), `activo`

**Roles definidos:**

| Rol | Quiénes | Acceso |
|---|---|---|
| `admin` | Cluster Manager + Sebastián | Total — gestión de usuarios y configuración |
| `directivo` | Miembros del Consejo Directivo | Crear/gestionar iniciativas, ver todo |
| `vinculador` | Operadores del Clúster | Gestionar iniciativas asignadas, ver todo |
| `oferente` | Actores con membresía | Ver todo, editar perfil propio |
| `demandante` | Actores sin membresía | Ver catálogo, buscar con IA |

**Archivos clave:**
- `web/auth.ts` — CredentialsProvider con pg directo + callbacks JWT/session
- `web/auth.config.ts` — config edge-safe (sin pg), para el proxy
- `web/proxy.ts` — protección de rutas (Next.js 16.2.0: `proxy.ts` reemplaza `middleware.ts`)
- `web/app/login/page.tsx` — pantalla de login con diseño SINAP
- `web/app/api/auth/[...nextauth]/route.ts` — handler de Auth.js

**Variables de entorno requeridas en Vercel:**
- `AUTH_SECRET` — secreto para firmar JWTs
- `DATABASE_URL` — conexión a Neon.tech (para el pool de pg en auth.ts)

**Nota importante:** `proxy.ts` usa `getToken()` con `cookieName: "__Secure-authjs.session-token"` (Auth.js v5 cambió el nombre de cookie respecto a v4).

**Registro:** solo por invitación. El Clúster crea usuarios manualmente vía script o panel admin (a implementar).

### 4. Vista marketplace diferenciada
- Oferente: ve su perfil propio + puede editar capacidades + acceso completo a búsqueda IA
- Demandante: vista del catálogo en modo lectura + acceso a búsqueda IA
- La distinción NO es por tipo de actor, sino por el rol que eligió al registrarse

### 5. Capacidades de IA (versión final, ver BACKLOG.md)
- Matching automático proactivo (sin búsqueda manual)
- Recomendación de financiamiento por perfil de actor
- Procesamiento de documentos (actor sube ficha técnica, IA pre-carga su perfil)
- Análisis de tendencias y alertas estratégicas

---

## Cuentas e infraestructura

| Servicio | Cuenta | Estado |
|---|---|---|
| Gmail del proyecto | sinap.io.dev@gmail.com | ✅ Creado |
| GitHub | sinap-io/sinap | ✅ Organización creada, repo transferido y renombrado |
| Cloudflare / sinap.io | sinap.io.dev@gmail.com | ⏳ Registrar dominio |
| Railway (FastAPI) | cuenta Google (sebabizzi) | ✅ sinap-production.up.railway.app |
| Vercel (Next.js) | cuenta Google (sebabizzi) | ✅ sinap-psi.vercel.app |
| Neon.tech | Migrar a org | ⏳ Pendiente |
| Anthropic API | — | ✅ Operativo (key en api/.env) |

**Principio:** Todo bajo la identidad sinap-io, no bajo cuentas personales. Esto permite delegar el mantenimiento sin transferir accesos personales.

## Repositorio

- **GitHub:** `sinap-io/sinap` (github.com/sinap-io/sinap)
- **Branch de desarrollo:** `claude/distracted-lamarr`
- **PR #22 mergeado a main el 30/03/2026** — auth + informe IA + roles en UI

---

*SINAP — Clúster de Biotecnología de Córdoba, Argentina*
