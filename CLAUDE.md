# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (28 marzo 2026)

**Lo que funciona en producción:**
- Backend FastAPI → Railway: `https://sinap-production.up.railway.app` ✅
- Frontend Next.js → Vercel: `https://sinap-psi.vercel.app` ✅
- Prototipo Streamlit (`app/`) — conectado a `sinap-production` — NO TOCAR
- Módulo Iniciativas completo en producción ✅

**Branch activo:** `claude/distracted-lamarr` (en uso continuo, se mergea a main por PR)

**Módulo Iniciativas — estado:**
- DB: 13 tablas + migración 003 aplicada (14 cambios: campo `referente` + estados) ✅
- API: router `/iniciativas` completo en Railway ✅
- Frontend: panel `/iniciativas`, form `/nueva`, detalle `/[id]` en producción ✅
- Estados: abierta / en_curso / concretada / cerrada / postergada ✅
- Actores con campo `referente` (persona dentro del actor) ✅
- Editar notas desde el detalle ✅

**Lo que está pendiente:**
- Revisar título "Plataforma de Inteligencia Territorial" con Pablo — puede no representar bien la plataforma
- Tabla `persona` vinculada a `actor` — deuda técnica, a implementar con el sistema de login
- Sistema de autenticación y usuarios (con roles oferente/demandante)
- Vista marketplace diferenciada por rol
- Registrar dominio sinap.io en Cloudflare
- Merge branch `claude/distracted-lamarr` → `main` (rediseño visual)

---

## Modelo de negocio y roles

**Oferente:** cualquier tipo de actor (laboratorio, empresa, startup, universidad, investigación) que ofrece servicios. Paga membresía. Tiene perfil completo editable.

**Demandante:** actor que busca servicios. Acceso free. Puede ver todo el catálogo de capacidades, necesidades e instrumentos. Necesita login para acceder.

**Acceso sin login (invitado):** no hay — toda la plataforma requiere autenticación.

**Regla importante:** no hay distinción por tipo de actor para ser oferente. Cualquier actor puede serlo.

---

## Próximo paso concreto

En orden de prioridad:

1. **Merge rediseño visual** → `main` (branch `claude/distracted-lamarr` listo)
2. **Revisar título** con Pablo
3. **Sistema de autenticación y roles** — login, oferente vs demandante
4. **Vista marketplace** — catálogo diferenciado por rol
5. **Tabla `persona`** — implementar cuando haya login

**Paleta actual (branch activo — nueva identidad visual):**
- Fuente: Open Sans (igual al Clúster Biotecnología)
- Sidebar: blanco `#ffffff` con borde `#e2e8f0`
- Acento principal: teal `#0d9488`
- Texto principal: navy `#1e3a5f`
- Fondo: blanco `#ffffff`
- Cards: blancas con borde superior teal + sombra al hover

**Sistema de colores semánticos:**
- Urgencia crítica: rojo `#dc2626`
- Urgencia alta: violeta `#a855f7`
- Urgencia normal: azul `#2563eb`
- Urgencia baja: gris `#94a3b8`
- Regla: el color comunica información, no decora

**Principio de diseño establecido:**
- Color solo cuando comunica algo (estado, urgencia, tipo)
- En el home: todas las cards con el mismo color (teal) — no hay diferencia que señalar
- Referencia visual: Clúster Biotecnología Córdoba + Bousoño Vargas

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
| Neon.tech | sinap-production (13 tablas + migración 003) | ✅ Operativo |
| Railway | sinap-production.up.railway.app | ✅ Operativo (FastAPI) |
| Vercel | sinap-psi.vercel.app | ✅ Operativo (Next.js) |
| Cloudflare / sinap.io | — | ⏳ Registrar dominio |
