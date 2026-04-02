# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (2 abril 2026 — mañana)

**Lo que funciona en producción (main / sinap-psi.vercel.app):**
- Backend FastAPI → Railway: `https://sinap-production.up.railway.app` ✅
- Frontend Next.js → Vercel: `https://sinap-psi.vercel.app` ✅
- Prototipo Streamlit (`app/`) — conectado a `sinap-production` — NO TOCAR
- Módulo Iniciativas completo ✅
- Rediseño visual (Open Sans + navy/teal) ✅
- Auth.js v5 con tabla `usuario` en Neon ✅
- Informe IA (`/informe`) ✅
- Roles en UI ✅ — rol `manager` en Nav y permisos
- Radar sectorial (`/radar`) ✅ — sin web search por ahora
- Buscador IA dentro del detalle de iniciativa ✅ — panel colapsable "Buscar en el ecosistema"
- **Login de Pablo resuelto** ✅ — fix definitivo en producción

**Branch activo:** `main` — todo mergeado. `claude/distracted-lamarr` sincronizado.

**⚠️ Nota de auth en preview:**
- Login en preview NO funciona (URLs preview de Vercel no tienen las env vars de auth — AUTH_SECRET, DATABASE_URL). Solo funciona en sinap-psi.vercel.app (producción).

**Sistema de autenticación — estado:**
- Auth.js v5 con email + contraseña ✅
- `proxy.ts` como middleware (Next.js 16) — usa `getToken` de `next-auth/jwt` directamente ✅
- `middleware.ts` eliminado (causaba conflicto con `proxy.ts` en Next.js 16) ✅
- Login usa `window.location.href = "/"` (no `router.push`) para evitar race condition con cookie store ✅
- Tabla `usuario` en Neon.tech ✅
- Usuarios: `sebabizzi@gmail.com` (admin) + `pdiazazulay@gmail.com` (manager) — contraseña: sinap2026
- ⚠️ Pablo debe hacer logout + login para que su sesión refleje `rol: manager` (el JWT viejo tiene `directivo`)
- Pendiente: crear usuarios para el resto del equipo

**Informe IA — estado:**
- Endpoint `GET /informe` en Railway ✅
- Sección "Oportunidades de negocios" con subsecciones corto/mediano plazo ✅
- Período: "Estado al [fecha]" ✅

**Radar sectorial — estado:**
- Endpoint `GET /radar?tema=X&force=true` ✅
- 5 temas: biosensores, biofarma, agroindustria, diagnostico_molecular, nanobiotecnologia ✅
- Cache 24h + botón Regenerar ✅
- Web search removido temporalmente (DuckDuckGo no funcionaba bien) ⚠️

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

**Lo que está pendiente:**
- Cargar datos reales (actores, necesidades, instrumentos del Clúster)
- Vista marketplace diferenciada por rol
- Crear usuarios para el resto del equipo
- Registrar dominio sinap.io en Cloudflare
- Web search para radar (Tavily o similar)
- Tabla `persona` vinculada a `actor` (ver BACKLOG.md)

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

En orden de prioridad:

1. **Cargar datos reales** — actores, necesidades, instrumentos del Clúster real
2. **Crear usuarios** para el resto del equipo (vinculadores, oferentes)
3. **Vista marketplace** — catálogo diferenciado por rol
4. **Registrar dominio** sinap.io en Cloudflare
5. **Tabla `persona`** — implementar cuando haya más usuarios activos (ver BACKLOG.md)

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
| Neon.tech | sinap-production (14 tablas + migración 003) | ✅ Operativo |
| Railway | sinap-production.up.railway.app | ✅ Operativo (FastAPI) |
| Vercel | sinap-psi.vercel.app | ✅ Operativo (Next.js) |
| Cloudflare / sinap.io | — | ⏳ Registrar dominio |
