# SINAP — Backlog y Plan de Trabajo

*Actualizado: 14 abril 2026*

---

## ✅ Resuelto (no releer)

- Tipos de actor actualizados (empresa/startup/universidad/investigador/gobierno) — migración 005
- Logs históricos (iniciativa_estado_log, actor_etapa_log, proyecto_trl_log preparado) — migración 006
- Edición inline de título/descripción en iniciativas
- Edición inline de etapa en actores
- Filtros de iniciativas por actor, vinculador y texto libre
- Login de Pablo resuelto, rol manager en UI
- Fuente única de datos (Neon `ep-tiny-cell-acjfdkps`)
- Radar con Tavily + cron automático GitHub Actions

---

## 🔴 Inmediato — correcciones pendientes

### Bug: DELETE en iniciativa_actor no detecta 404

**Archivo:** `api/routers/iniciativas.py`, línea ~232

```python
if result == "DELETE 0":   # ← esta comparación NUNCA es True
```

**Fix correcto:**
```python
result = await db.fetchval("""
    DELETE FROM iniciativa_actor
    WHERE iniciativa_id = $1 AND actor_id = $2 AND rol = $3
    RETURNING 1
""", iid, actor_id, rol)
if not result:
    raise HTTPException(404, "Relación no encontrada")
```

**Esfuerzo:** 15 min.

---

### Poblar `creado_por` en endpoints

Los campos `creado_por` existen en `iniciativa` e `hito` (migración 006) pero ningún endpoint los usa.
Necesarios para calcular actividad del ADIT.

**Dónde hacerlo:**
- `POST /iniciativas` → insertar `creado_por` con el `usuario_id` del JWT
- `POST /iniciativas/{id}/hitos` → ídem
- `POST /proyectos` (cuando exista) → ídem desde el inicio

**Problema:** la API FastAPI no valida JWT hoy. Mientras no haya middleware de auth,
`creado_por` puede recibirse como body param o dejarse NULL por ahora.
**Decisión:** dejar NULL hasta que se implemente el middleware JWT (Fase 4).

**Esfuerzo:** 1h (incluyendo el middleware básico).

---

## 🟡 Fase 2 — Módulo Proyectos

### Contexto y decisiones tomadas (14 abril 2026)

Un proyecto es un desarrollo tecnológico en curso (biosensor, vacuna, software de diagnóstico, variedad vegetal).
Puede existir sin iniciativa, puede surgir de una iniciativa, y avanza en TRL con el tiempo.

**Decisiones:**
- Sin actor dueño único → tabla `proyecto_actor` con roles (interinstitucional desde el origen)
- Vinculado opcionalmente a una iniciativa (FK `iniciativa_id` nullable)
- Crean proyectos: admin, manager, directivo, vinculador
  *(agregar actor self-load después es 1 línea de cambio)*
- TRL (1-9) actualizable por cualquiera con acceso — es dato objetivo, no editorial
- Campos: título, descripción, TRL actual, área temática, estado, actores, instrumentos de financiamiento
- Búsqueda IA contextual (como en iniciativas — panel colapsable)
- Zonas geográficas en tabla propia `zona`, editable por admin/manager

### Migración 007

```sql
-- Tabla de zonas geográficas (editable por admin/manager)
CREATE TABLE zona (
    id         SERIAL PRIMARY KEY,
    nombre     TEXT NOT NULL UNIQUE,
    activa     BOOLEAN DEFAULT TRUE,
    creado_en  TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO zona (nombre) VALUES ('Gran Córdoba');

-- Extender vinculador con zona y vínculo a usuario
ALTER TABLE vinculador
    ADD COLUMN IF NOT EXISTS zona_id    INTEGER REFERENCES zona(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL;

-- Tabla principal de proyectos
CREATE TABLE proyecto (
    id              SERIAL PRIMARY KEY,
    titulo          TEXT NOT NULL,
    descripcion     TEXT,
    trl             INTEGER CHECK (trl BETWEEN 1 AND 9),
    area_tematica   TEXT,
    estado          TEXT CHECK (estado IN (
                        'en_desarrollo', 'buscando_financiamiento',
                        'buscando_socio', 'finalizado')),
    iniciativa_id   INTEGER REFERENCES iniciativa(id) ON DELETE SET NULL,
    creado_por      INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    creado_en       TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- Actores del proyecto (interinstitucional)
CREATE TABLE proyecto_actor (
    proyecto_id  INTEGER NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    actor_id     INTEGER NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
    rol          TEXT,
    PRIMARY KEY (proyecto_id, actor_id)
);

-- Instrumentos de financiamiento aplicables
CREATE TABLE proyecto_instrumento (
    proyecto_id    INTEGER NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    instrumento_id INTEGER NOT NULL REFERENCES instrumento(id) ON DELETE CASCADE,
    PRIMARY KEY (proyecto_id, instrumento_id)
);

-- Agregar FK faltante en proyecto_trl_log (creada en migración 006 sin FK)
ALTER TABLE proyecto_trl_log
    ADD CONSTRAINT fk_proyecto_trl_log_proyecto
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE;
```

### API — router `/proyectos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/proyectos` | Lista con filtros: trl_min, trl_max, estado, area, actor_id, iniciativa_id |
| POST | `/proyectos` | Crear proyecto (admin/manager/directivo/vinculador) |
| GET | `/proyectos/{id}` | Detalle con actores, instrumentos, historial TRL |
| PATCH | `/proyectos/{id}` | Actualizar campos. Si cambia TRL → auto-log en proyecto_trl_log |
| POST | `/proyectos/{id}/actores` | Agregar actor participante |
| DELETE | `/proyectos/{id}/actores/{actor_id}` | Quitar actor |
| POST | `/proyectos/{id}/instrumentos` | Vincular instrumento |
| DELETE | `/proyectos/{id}/instrumentos/{instrumento_id}` | Desvincular instrumento |

**Router adicional `/zonas` (admin/manager):**
| GET | `/zonas` | Listar zonas activas |
| POST | `/zonas` | Crear zona |
| PATCH | `/zonas/{id}` | Activar/desactivar zona |

### Frontend — Páginas y componentes

- `/proyectos` — lista con filtros (TRL range, estado, área, actor) + métricas en cards
- `/proyectos/nueva` — formulario de creación
- `/proyectos/[id]` — detalle:
  - Header con TRL editable inline (selector 1-9) + badge de estado editable
  - Timeline de evolución del TRL (gráfico simple o lista de cambios desde `proyecto_trl_log`)
  - Sección actores participantes (con rol)
  - Sección instrumentos de financiamiento
  - Panel colapsable búsqueda IA contextual
  - Enlace a iniciativa (si aplica)
- Agregar "Proyectos" a la nav y al dashboard home

**Esfuerzo estimado:** 3-4 sesiones de trabajo.

---

## 🟠 Fase 3 — Módulo ADIT

### Contexto y decisiones tomadas (14 abril 2026)

ADIT y vinculador son sinónimos en SINAP. El ADIT es un vinculador regional que tiene zona geográfica asignada.

**Decisiones:**
- `vinculador.zona_id` FK a tabla `zona` (creada en migración 007)
- `vinculador.usuario_id` FK a tabla `usuario` (vincular el login con el perfil de vinculador)
- SINAP NO calcula compensación — solo registra actividades
- Actividades registradas automáticamente vía `creado_por` / `cambiado_por`:
  - Iniciativas creadas por el vinculador
  - Hitos creados por el vinculador
  - Proyectos creados por el vinculador
  - Actores vinculados en su zona
  - Cambios de TRL registrados (en `proyecto_trl_log.cambiado_por`)

### Lo que hay que implementar

1. **Migración 007** ya incluye `zona` y extensión de `vinculador` (ver arriba)

2. **API:**
   - `PATCH /vinculadores/{id}` → asignar zona a vinculador (admin/manager)
   - `GET /vinculadores/{id}/actividad` → resumen de actividad por vinculador:
     ```sql
     SELECT
         COUNT(DISTINCT i.id) AS iniciativas_creadas,
         COUNT(DISTINCT h.id) AS hitos_creados,
         COUNT(DISTINCT p.id) AS proyectos_creados,
         COUNT(DISTINCT tl.id) AS cambios_trl_registrados
     FROM vinculador v
     LEFT JOIN usuario u ON u.id = v.usuario_id
     LEFT JOIN iniciativa i ON i.creado_por = u.id
     LEFT JOIN hito h ON h.creado_por = u.id
     LEFT JOIN proyecto p ON p.creado_por = u.id
     LEFT JOIN proyecto_trl_log tl ON tl.cambiado_por = u.id
     WHERE v.id = $1
     ```

3. **Frontend:**
   - Panel "Mi actividad" en perfil del vinculador
   - Vista admin: lista de vinculadores con zona + resumen de actividad
   - Asignación de zona desde la UI (admin/manager)

**Prerequisito:** requiere que `creado_por` esté siendo poblado (Fase 1 o Fase 4).

**Esfuerzo estimado:** 2-3 sesiones.

---

## 🔵 Fase 4 — Seguridad API

### Middleware JWT en FastAPI

Hoy la API en Railway es pública. Cualquiera con la URL puede llamar a todos los endpoints.
El riesgo real es el endpoint `/search` (llama a Anthropic, cuesta dinero).

**Implementación:**
1. Agregar dependencia `python-jose[cryptography]`
2. Middleware que valida el JWT de Auth.js en cada request
3. Inyectar `usuario_id` y `rol` desde el token en cada endpoint que lo necesite
4. Usar `usuario_id` para poblar `creado_por` / `cambiado_por` automáticamente
5. Rate limiting en `/search`: máximo 10 requests/hora por usuario

**Prerequisito:** este paso desbloquea poblar `creado_por` de forma automática y correcta.

**Esfuerzo estimado:** 3-4h.

---

## ⚪ Backlog futuro (sin fecha)

### Informe IA — actividad semanal real
Hoy el informe muestra el estado actual (snapshot). Para que sea "lo que pasó esta semana":
- Agregar `created_at` a tablas sin timestamp (actor, necesidad, capacidad, instrumento)
- Filtrar en queries de informe por `created_at >= NOW() - INTERVAL '7 days'`
- Migración 008 (o 009 si Proyectos es 007 y otra cosa es 008)

### Datos reales del Clúster
- Actores, capacidades, necesidades reales del ecosistema biotech de Córdoba
- Usar script `api/scripts/seed_data.py` como base (modificar datos)
- Cuando Sebastián los tenga disponibles

### Login con Google (OAuth)
- Agregar Google provider en Auth.js v5
- Útil para usuarios que no quieren recordar contraseña
- No es bloqueante — el sistema actual funciona

### Vista marketplace diferenciada por rol
- Oferente: catálogo de capacidades + edición de su perfil de actor
- Demandante: catálogo lectura + búsqueda IA
- Actualmente las páginas no diferencian por rol (solo la nav)

### Dominio sinap.io en Cloudflare
- Registrar dominio
- Apuntar a Vercel

### Tabla `persona`
- Cuando haya usuarios reales activos (no antes)
- Reemplazar el campo `referente` TEXT libre en `iniciativa_actor`
- FK a una tabla `persona` que puede estar vinculada a `actor`

### Estados de participación en iniciativas
- Campo `estado` en `iniciativa_actor`: potencial → contactado → confirmado
- Acuerdo con Pablo — implementar cuando haya más uso real

### Simplificación de roles en iniciativas
- Acordado con Pablo: de 6 roles (lider/demandante/oferente/miembro/candidato/financiador) a 3
- Líder / Integrante / Colaborador
- Migración DB + labels frontend
- Implementar cuando haya más uso real

### Matching IA: necesidades ↔ financiamiento
- Actor describe necesidad → IA identifica instrumentos relevantes con justificación
- Mismo patrón técnico que `/search`
