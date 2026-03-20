# SINAP — Arquitectura y decisiones técnicas

> Documento vivo. Captura el estado del proyecto, las decisiones de diseño y el razonamiento detrás de cada una. Actualizar al cerrar cada sprint.
>
> Última actualización: 20 marzo 2026

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

**Backend (`api/`):** FastAPI conectado a `sinap-production` en Neon.tech. 6 routers operativos, probados localmente.

**Frontend (`web/`):** Next.js 16.2 conectado al backend FastAPI. 9 rutas compiladas y funcionales.

### Bases de datos en Neon.tech

| Base | Uso | Conexión |
|---|---|---|
| `sinap-prototype` | Prototipo Streamlit | Variable `DATABASE_URL` en `app/` |
| `sinap-production` | Backend + Frontend | Variable `DATABASE_URL` en `api/.env` |

**Importante:** Las dos bases son independientes. Tocar `sinap-prototype` rompe el prototipo que se usa para validación.

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

### Tablas del Módulo Vinculador (migración 001)

Agregadas en `api/db/migrations/001_vinculador.sql`. Ya aplicadas en `sinap-production`.

**`vinculador`** — El operador humano que gestiona los procesos de vinculación. Separado de `actor` deliberadamente: no es un actor del ecosistema, es un rol interno de la plataforma. Cuando se agregue autenticación, esta tabla se conecta con la de usuarios.

**`caso_vinculacion`** — El corazón del Módulo Vinculador. Registra cada proceso de vincular una necesidad de un actor con la capacidad de otro.
- `actor_demandante_id`: quien tiene la necesidad
- `actor_oferente_id`: quien puede satisfacerla — **nullable** porque un caso se puede abrir antes de identificar el match
- `necesidad_id` y `capacidad_id`: referencias específicas — `capacidad_id` también es nullable por la misma razón
- `estado`: abierto → en_gestion → vinculado → cerrado | cancelado (permite métricas de conversión)

**`hito`** — Trazabilidad de resultados dentro de un caso.
- 7 tipos ordenados de menor a mayor impacto: `contacto_establecido → reunion_realizada → acuerdo_alcanzado → convenio_firmado → proyecto_iniciado → financiamiento_obtenido → otro`
- `fecha` es `DATE` (no `TIMESTAMPTZ`) porque es una fecha de evento del mundo real, no un timestamp de sistema
- `evidencia_url` permite linkar el PDF del convenio, acta, o cualquier registro externo

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

**Pendiente (Módulo Vinculador):**
- `GET/POST /vinculadores`
- `GET/POST /casos`
- `PATCH /casos/{id}`
- `GET /casos/{id}`
- `POST /casos/{id}/hitos`

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

**Pendiente (Módulo Vinculador):**
- `/vinculador` — Panel con cartera de casos
- `/vinculador/casos/[id]` — Detalle con timeline de hitos
- `/vinculador/casos/nuevo` — Formulario de apertura de caso

---

## Cómo correr el proyecto localmente

### Requisitos
- Python 3.11+
- Node.js 20+
- Variables de entorno configuradas

### Backend (FastAPI)
```bash
# Desde el root del repo
cd sinap
python -m uvicorn api.main:app --port 8000 --reload
# Docs disponibles en http://localhost:8000/docs
```

Variables requeridas en `api/.env`:
```
DATABASE_URL=postgresql+asyncpg://...  # sinap-production en Neon
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (Next.js)
```bash
cd web
npm run dev
# Disponible en http://localhost:3001 (si 3000 está ocupado)
```

Variables requeridas en `web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
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

### 1. Deploy (en curso)
- **FastAPI → Railway** (soporte Python nativo, free tier suficiente para empezar)
- **Next.js → Vercel** (deploy nativo, integración con GitHub, free tier)
- Variables de entorno a configurar en cada plataforma: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_URL`
- El deploy desbloquea mostrar la plataforma a stakeholders del cluster
- **Estado:** Crear cuenta en Railway con Login via GitHub → conectar repo → configurar variables de entorno → deploy

### 2. Módulo Vinculador — Backend
Tablas ya creadas en `sinap-production` (migración 001). Faltan los routers:
- `POST /vinculadores` — crear operador
- `GET/POST /casos` — listar y abrir casos
- `PATCH /casos/{id}` — actualizar estado (en_gestion, vinculado, cerrado)
- `POST /casos/{id}/hitos` — agregar hito con tipo, fecha, evidencia_url
- `GET /casos/{id}` — detalle con timeline de hitos

### 3. Módulo Vinculador — Frontend
- `/vinculador` — Panel: cartera de casos activos por estado, métricas de impacto (casos abiertos, vinculaciones logradas, hitos del mes)
- `/vinculador/casos/[id]` — Detalle con timeline visual de hitos
- `/vinculador/casos/nuevo` — Formulario: seleccionar actor demandante, necesidad, asignar vinculador

### 4. Capacidades de IA (versión final, ver BACKLOG.md)
- Matching automático proactivo (sin búsqueda manual)
- Recomendación de financiamiento por perfil de actor
- Procesamiento de documentos (actor sube ficha técnica, IA pre-carga su perfil)
- Análisis de tendencias y alertas estratégicas

---

## Repositorio

- **GitHub:** `sebasbizzi/sinap-prototype`
- **Branch de desarrollo:** `claude/distracted-lamarr`
- **PR pendiente de merge a main**

---

*SINAP — Clúster de Biotecnología de Córdoba, Argentina*
