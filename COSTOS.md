# Costos de mantenimiento — SINAP

> Última actualización: 2 abril 2026
> Los números de Anthropic se calculan a partir del código real (max_tokens de cada router).

---

## Servicios activos

| Servicio | Para qué | Plan actual | Costo |
|---|---|---|---|
| Railway | Backend FastAPI | Hobby | ~USD 5/mes |
| Vercel | Frontend Next.js | Hobby (gratis) | USD 0 |
| Neon.tech | Base de datos | Free | USD 0 |
| Anthropic | IA generativa (Claude Sonnet) | Por uso | Variable (ver abajo) |
| Tavily | Búsqueda web para el Radar | Free (1.000 búsquedas/mes) | USD 0 |
| GitHub | Código fuente + Actions (cron radar) | Free (org) | USD 0 |
| Cloudflare | Dominio sinap.io | Pendiente registrar | ~USD 12/año (~1/mes) |

**Costo fijo mínimo hoy: ~USD 5–6/mes**

---

## El único costo variable: Anthropic

Es el único que crece con el uso. Cobra por cantidad de texto procesado.

**Precios de Claude Sonnet 4 (al 01/04/2026):**
- Entrada: USD 3 por millón de tokens
- Salida: USD 15 por millón de tokens
- 1 token ≈ ¾ de una palabra

### Costo por función (calculado del código real)

| Función | Configuración real | Frecuencia | Costo estimado/mes |
|---|---|---|---|
| **Informe IA** (`/informe`) | Salida: 2.000 tokens máx. Cache: 24h. | 1 generación/día = ~30/mes | ~USD 1.20 |
| **Radar sectorial** (`/radar`) | Salida: 8.000 tokens máx. Cache: 7 días. | 2 temas × 1 vez/semana = ~8/mes (cron automático lunes 9AM) | ~USD 1.10 |
| **Buscador IA** (`/search` + buscador en iniciativas) | Salida: 1.500 tokens máx. Sin cache — cada búsqueda llama a Claude. | Depende del uso activo | ~USD 0.03 por búsqueda |

> **Nota sobre el Buscador IA:** El panel "Buscar en el ecosistema" dentro del detalle de cada iniciativa y la pantalla `/search` usan el mismo endpoint. Cada uso activa una llamada a Claude. Con 20 búsquedas/mes el costo es ~USD 0.60; con 100 búsquedas/mes es ~USD 3.00.

**Total Anthropic estimado: USD 2.30 fijos (informe + radar) + USD 0.03 por cada búsqueda activa.**

---

## Cuándo escalan los costos

| Evento | Impacto |
|---|---|
| Más usuarios usando el buscador IA | Sube Anthropic (USD 0.03 por búsqueda) |
| Reinicio del servidor en Railway | Se pierde el caché en memoria → informe y radar se regeneran antes de tiempo |
| Agregar más temas al radar | +3 búsquedas Tavily y +1 llamada Claude por tema por semana |
| Superar 1.000 búsquedas/mes en Tavily | Tavily pasa a USD 20/mes (poco probable con caché semanal y 2 temas) |
| Escalar Vercel o Railway a plan Pro | USD 20/mes cada uno |
| Neon.tech supera 0.5 GB de datos | Plan Scale: USD 19/mes |

---

## Estimación por escenario

| Escenario | Costo mensual estimado |
|---|---|
| Hoy — equipo Clúster (~5 usuarios, uso interno) | USD 8–12/mes |
| Corto plazo — 20–30 usuarios activos | USD 15–30/mes |
| Escala real — múltiples clusters, 100+ usuarios | USD 60–120/mes |

---

## Lo que más conviene monitorear

1. **Gasto en Anthropic** — es el único impredecible. Panel en [console.anthropic.com](https://console.anthropic.com). Configurar un límite de gasto mensual para evitar sorpresas.

2. **Reinicios de Railway** — cada reinicio limpia el caché en memoria del informe y del radar, forzando regeneraciones anticipadas. Si ocurre frecuentemente, el costo de Anthropic sube.

3. **Tavily** — con el caché semanal actual y 2 temas, es prácticamente imposible superar las 1.000 búsquedas gratuitas. Solo sería relevante si se agregan muchos temas nuevos.

---

## Cómo funciona la generación automática (para no confundir con costos manuales)

- **Informe IA:** Se regenera al primer acceso del día (cache 24h). Si nadie entra a `/informe`, no se genera.
- **Radar sectorial:** Se regenera automáticamente todos los **lunes a las 9:00 AM (Argentina)** vía GitHub Actions (`.github/workflows/radar-refresh.yml`). No depende de que alguien entre a la pantalla. Si Railway está caído, el cron falla silenciosamente y el radar queda vacío hasta el próximo lunes o hasta que un admin/manager haga clic en "Regenerar".
- **Buscador IA:** Sin cache. Cada búsqueda = 1 llamada a Claude.
