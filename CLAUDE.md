# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (26 marzo 2026)

**Lo que funciona en producción:**
- Backend FastAPI → Railway: `https://sinap-production.up.railway.app` ✅
- Frontend Next.js → Vercel: `https://sinap-psi.vercel.app` ✅
- Prototipo Streamlit (`app/`) — conectado a `sinap-production` — NO TOCAR

**Branch activo:** `claude/distracted-lamarr` (pendiente merge a main)

**Lo que está pendiente:**
- Merge PR `claude/distracted-lamarr` → `main` cuando se apruebe el diseño final
- Registrar dominio sinap.io en Cloudflare
- Módulo Vinculador: routers backend + pantallas frontend (tablas ya creadas en DB)
- Sistema de autenticación y usuarios (con roles oferente/demandante)
- Vista marketplace diferenciada por rol
- Estética: paleta definida ✅ (pendiente feedback final diseñadora)

---

## Modelo de negocio y roles

**Oferente:** cualquier tipo de actor (laboratorio, empresa, startup, universidad, investigación) que ofrece servicios. Paga membresía. Tiene perfil completo editable.

**Demandante:** actor que busca servicios. Acceso free. Puede ver todo el catálogo de capacidades, necesidades e instrumentos. Necesita login para acceder.

**Acceso sin login (invitado):** no hay — toda la plataforma requiere autenticación.

**Regla importante:** no hay distinción por tipo de actor para ser oferente. Cualquier actor puede serlo.

---

## Próximo paso concreto

En orden de prioridad:

1. **Módulo Vinculador backend** — routers (tablas ya están en DB)
2. **Módulo Vinculador frontend** — panel + detalle de casos
3. **Sistema de autenticación y roles** — login, oferente vs demandante
4. **Vista marketplace** — catálogo diferenciado por rol (oferente ve todo + puede editar su perfil; demandante ve catálogo en modo lectura)
5. Merge `claude/distracted-lamarr` → `main` cuando diseño esté aprobado

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
| Neon.tech | sinap-production (9 tablas) | ✅ Operativo |
| Railway | sinap-production.up.railway.app | ✅ Operativo (FastAPI) |
| Vercel | sinap-psi.vercel.app | ✅ Operativo (Next.js) |
| Cloudflare / sinap.io | — | ⏳ Registrar dominio |
