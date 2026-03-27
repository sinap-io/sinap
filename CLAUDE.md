# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (27 marzo 2026)

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
- Revisión estética de la web (Sebastián quiere revisar cuando sea oportuno)
- Tabla `persona` vinculada a `actor` — deuda técnica, a implementar con el sistema de login
- Sistema de autenticación y usuarios (con roles oferente/demandante)
- Vista marketplace diferenciada por rol
- Registrar dominio sinap.io en Cloudflare

---

## Modelo de negocio y roles

**Oferente:** cualquier tipo de actor (laboratorio, empresa, startup, universidad, investigación) que ofrece servicios. Paga membresía. Tiene perfil completo editable.

**Demandante:** actor que busca servicios. Acceso free. Puede ver todo el catálogo de capacidades, necesidades e instrumentos. Necesita login para acceder.

**Acceso sin login (invitado):** no hay — toda la plataforma requiere autenticación.

**Regla importante:** no hay distinción por tipo de actor para ser oferente. Cualquier actor puede serlo.

---

## Próximo paso concreto

En orden de prioridad:

1. **Revisión estética** — Sebastián quiere revisar la estética de la web cuando sea oportuno
2. **Sistema de autenticación y roles** — login, oferente vs demandante
3. **Vista marketplace** — catálogo diferenciado por rol (oferente ve todo + puede editar su perfil; demandante ve catálogo en modo lectura)
4. **Tabla `persona`** — implementar cuando haya login (reemplaza el campo `referente` provisional)

**Paleta actual (branch activo):**
- Sidebar/cards: azul `#dbeafe`
- Acento: naranja `#e8622a`
- Hero: naranja suave `#fde0d0`
- Fondo: blanco `#ffffff`

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
