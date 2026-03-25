# Contexto de sesión — SINAP

Antes de responder cualquier cosa, leer ARCHITECTURE.md y PROYECTO.md.

---

## Qué es este proyecto

Plataforma de inteligencia territorial para el ecosistema biotech de Córdoba, Argentina.
Desarrollada para el Clúster de Biotecnología de Córdoba bajo el nombre **sinap.io**.

El dueño del proyecto es Sebastián, economista que está aprendiendo a desarrollar.
Las explicaciones técnicas deben ser claras para alguien sin formación en programación.

---

## Estado actual (25 marzo 2026)

**Lo que funciona localmente:**
- Backend FastAPI (`api/`) — 10 endpoints, conectado a `sinap-production` en Neon.tech
- Frontend Next.js (`web/`) — 9 rutas, conectado al backend
- Prototipo Streamlit (`app/`) — conectado a `sinap-production` — NO TOCAR

**Lo que está pendiente:**
- Migrar cuentas a organización sinap-io (Gmail ya creado: sinap.io.dev@gmail.com)
- Deploy: FastAPI → Railway, Next.js → Vercel (bajo cuentas de la organización)
- Módulo Vinculador: routers backend + pantallas frontend (tablas ya creadas en DB)

---

## Próximo paso concreto

Configurar la infraestructura bajo la organización sinap-io:
1. GitHub Organization con sinap.io.dev@gmail.com
2. Registrar sinap.io en Cloudflare
3. Deploy en Railway (FastAPI) y Vercel (Next.js)

---

## Flujo de trabajo

- **Para cerrar sesión:** el usuario dice "cerramos" → actualizar CLAUDE.md + ARCHITECTURE.md + PROYECTO.md → commit
- **Para iniciar sesión:** el usuario dice "continuamos" → Claude ya leyó este archivo, arrancar directamente

---

## Cuentas del proyecto

| Servicio | Cuenta | Estado |
|---|---|---|
| Gmail | sinap.io.dev@gmail.com | ✅ Creado |
| GitHub | sebasbizzi/sinap-prototype | ⏳ Migrar a org sinap-io |
| Neon.tech | sinap-production (9 tablas) | ✅ Operativo |
| Railway | — | ⏳ Crear con Gmail del proyecto |
| Vercel | — | ⏳ Crear con Gmail del proyecto |
| Cloudflare / sinap.io | — | ⏳ Registrar dominio |
