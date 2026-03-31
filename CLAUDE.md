# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (30 marzo 2026)

**Lo que funciona en producción (main):**
- Backend FastAPI → Railway: `https://sinap-production.up.railway.app` ✅
- Frontend Next.js → Vercel: `https://sinap-psi.vercel.app` ✅
- Prototipo Streamlit (`app/`) — conectado a `sinap-production` — NO TOCAR
- Módulo Iniciativas completo en producción ✅
- Rediseño visual (Open Sans + navy/teal) en producción ✅
- Auth.js v5 mergeado a main (PR #22) ✅
- Informe IA mergeado a main ✅
- Roles en UI mergeados a main ✅

**Branch activo:** `claude/distracted-lamarr` (continúa en uso — se mergeó PR #22 a main hoy)

**Sistema de autenticación — estado:**
- Auth.js v5 con email + contraseña ✅ (en main)
- Tabla `usuario` en Neon.tech (migración 003) ✅
- `proxy.ts` protege todas las rutas ✅
- Página de login `/login` con diseño SINAP ✅
- Nav muestra usuario + rol + botón logout ✅
- Usuarios creados: `sebabizzi@gmail.com` (admin) + `pdiazazulay@gmail.com` (directivo) ✅
- Pendiente: crear usuarios para el resto del equipo (vinculadores, oferentes)

**Informe IA — estado:**
- Endpoint `GET /informe` en Railway ✅
- Prompt v4: análisis cruzado entre módulos ✅
- Sección "Oportunidades de negocios" con subsecciones corto/mediano plazo ✅
- Frontend `/informe` con métricas, período "Estado al [fecha]" y botón PDF ✅
- Acceso restringido a admin/directivo/vinculador ✅
- Pendiente: el deploy de Railway a veces tarda en reflejar cambios recientes

**Roles en UI — estado:**
- Nav filtra "Informe IA" según rol ✅
- Footer del nav muestra nombre legible del rol ✅
- `/iniciativas/nueva` redirige a oferente/demandante ✅
- Detalle de iniciativa: botones de gestión restringidos por rol ✅

**Lo que está pendiente:**
- Cargar datos reales (actores, necesidades, instrumentos del Clúster)
- Vista marketplace diferenciada por rol
- Crear usuarios para el resto del equipo
- Registrar dominio sinap.io en Cloudflare
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
