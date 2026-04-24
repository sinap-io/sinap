"""
Módulo de Inteligencia Externa — Radar del Sector
Genera un informe de inteligencia sectorial sobre el ecosistema biotech,
combinando búsqueda web real (Tavily) con análisis de Claude.
"""
import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone

import asyncpg
from anthropic import AsyncAnthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from tavily import TavilyClient

from db.connection import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/radar", tags=["radar"])

_client = AsyncAnthropic()
_tavily_key = os.environ.get("TAVILY_API_KEY", "")
_tavily = TavilyClient(api_key=_tavily_key) if _tavily_key else None


TEMAS_VALIDOS = {
    "biosensores": "biosensores para salud y diagnóstico point-of-care",
    "biotech_general": "biotecnología — panorama general del sector en Argentina y Latinoamérica",
}

# Consultas de búsqueda por tema (en inglés para mejores resultados)
TEMAS_BUSQUEDAS = {
    "biosensores": [
        "biosensors point-of-care diagnostics conferences events 2025 2026",
        "biosensors wearable health monitoring funding grants Argentina 2025",
        "point-of-care diagnostics biotech market trends Latin America 2025",
    ],
    "biotech_general": [
        "biotecnología argentina financiamiento FONARSEC MINCyT convocatorias 2025 2026",
        "Latin America biotech industry investment funding conferences events 2025 2026",
        "Argentina biotech startups innovation ecosystem trends 2025",
    ],
}


class RadarResponse(BaseModel):
    radar: str
    tema: str
    tema_label: str
    generado_en: str
    edicion: str


_CACHE_TTL_HORAS = 168  # 7 días


_PROMPT = """\
Sos analista de inteligencia sectorial del Clúster de Biotecnología de Córdoba, Argentina.
Generás informes internos para el equipo de gestión del Clúster (no para los miembros).
La fecha actual es {fecha_actual}.

CONTEXTO DEL ECOSISTEMA:
- Capacidades disponibles en el Clúster: {capacidades_ecosistema}
- Necesidades urgentes de los miembros: {necesidades_ecosistema}

INFORMACIÓN ACTUALIZADA DE LA WEB:
{resultados_web}

REGLAS CRÍTICAS:
- Este informe es inteligencia externa. Reportá hechos del sector, NO recomendaciones al Clúster.
- PROHIBIDO usar frases como "Para el Clúster:", "El Clúster debería", "Se recomienda", "podría considerarse".
- No asumas nada sobre el estado interno del Clúster, sus vínculos, sus proyectos o sus capacidades.
- Priorizá la información de la web para hechos concretos (fechas, eventos, convocatorias, datos de mercado).
- Solo citá eventos con fecha confirmada. Si algo no tiene fecha precisa, aclaralo.
- Tono: periodístico y técnico. Hechos, datos, fuentes. Sin valoraciones ni consejos.
- Sin línea de cierre ni "próxima actualización".
- Idioma: español.
- Extensión: completa y detallada. Desarrollá cada sección en profundidad. No hay límite de palabras.
- NO uses tablas. Usá listas con guión (- ).

Generá el informe con EXACTAMENTE estas secciones:

## Eventos del sector
Todos los eventos relevantes para {tema_label} desde {fecha_actual} hasta fines de 2026 que encuentres.
Incluí tanto eventos regionales como internacionales.
Por cada uno: nombre completo, lugar, fecha, link si está disponible, y descripción del contenido del evento y perfil de asistentes.

## Tendencias
Las tendencias científicas y de mercado más relevantes en {tema_label} ahora mismo.
No te limites a 2 o 3. Incluí todas las que tengan tracción en el sector.
Por cada una: qué está pasando globalmente, qué está pasando en Argentina/Latam, datos de mercado si están disponibles.

## Financiamiento disponible
Todos los instrumentos activos o próximos a abrir relevantes para {tema_label}.
Priorizá los accesibles desde Argentina, pero incluí también internacionales relevantes.
Por cada uno: nombre, organismo, monto si está disponible, plazos, tipo de entidad elegible.

## Oportunidades detectadas
Señales del sector que configuran ventanas de tiempo específicas: convocatorias con fecha límite próxima, acuerdos internacionales recientes, cambios regulatorios que abren mercados, fondos que acaban de lanzarse.
Solo hechos verificados con fuente. Sin proyecciones ni interpretaciones.
Formato por cada una: "**Señal** → contexto y datos relevantes".

## Actores internacionales de referencia
Organizaciones, empresas, centros de investigación o clusters internacionales líderes en {tema_label}.
Por cada uno: nombre, país, especialización, logros recientes o posición en el sector.
"""


def _tavily_one(query: str) -> list[str]:
    """Ejecuta una búsqueda Tavily y devuelve lista de resultados formateados."""
    if _tavily is None:
        return []
    try:
        resp = _tavily.search(query=query, max_results=4, search_depth="basic")
        results = []
        for r in resp.get("results", []):
            title = r.get("title", "")
            content = r.get("content", "")[:300]
            url = r.get("url", "")
            if title and content:
                results.append(f"- **{title}** ({url})\n  {content}")
        return results
    except Exception as e:
        logger.warning("Error en búsqueda Tavily '%s': %s", query, e)
        return []


async def _tavily_search(queries: list[str]) -> str:
    """Ejecuta todas las búsquedas en paralelo y combina los resultados."""
    if _tavily is None:
        raise HTTPException(
            status_code=503,
            detail="El servicio de búsqueda web no está configurado. Contactá al administrador."
        )
    tareas = [asyncio.to_thread(_tavily_one, q) for q in queries]
    resultados_por_query = await asyncio.gather(*tareas)
    todos = [item for lista in resultados_por_query for item in lista]
    if not todos:
        raise HTTPException(
            status_code=503,
            detail="No se pudo conectar con el servicio de búsqueda web. Intentá de nuevo en unos minutos."
        )
    return "\n\n".join(todos)


@router.get("", response_model=RadarResponse)
async def generar_radar(
    tema: str = "biosensores",
    force: bool = False,
    db: asyncpg.Connection = Depends(get_db),
):
    if tema not in TEMAS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Tema no válido. Opciones: {list(TEMAS_VALIDOS.keys())}")

    cache_tipo = f"radar_{tema}"

    # Buscar en cache persistente en DB
    if not force:
        try:
            row = await db.fetchrow("""
                SELECT contenido FROM cache_ia
                WHERE tipo = $1
                  AND generado_en + (ttl_horas || ' hours')::interval > NOW()
            """, cache_tipo)
            if row:
                contenido = row["contenido"]
                if isinstance(contenido, str):
                    import json
                    contenido = json.loads(contenido)
                return RadarResponse.model_validate(contenido)
        except Exception as cache_err:
            logger.warning("Cache read failed, regenerating: %s", cache_err)

    try:
        result = await _generar(tema, db)
        # Guardar en DB (upsert)
        await db.execute("""
            INSERT INTO cache_ia (tipo, contenido, generado_en, ttl_horas)
            VALUES ($1, $2::jsonb, NOW(), $3)
            ON CONFLICT (tipo) DO UPDATE
                SET contenido = $2::jsonb, generado_en = NOW()
        """, cache_tipo, result.model_dump_json(), _CACHE_TTL_HORAS)
        return result
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error("Error en /radar: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


async def _generar(tema: str, db: asyncpg.Connection) -> RadarResponse:
    # Traer contexto del ecosistema para personalizar el informe
    capacidades = await db.fetch("""
        SELECT DISTINCT c.area_tematica, c.tipo_servicio
        FROM capacidad c
        WHERE c.disponibilidad != 'no_disponible'
        LIMIT 20
    """)

    necesidades = await db.fetch("""
        SELECT a.nombre, n.descripcion, n.urgencia
        FROM necesidad n JOIN actor a ON a.id = n.actor_id
        WHERE n.status = 'activa' AND n.urgencia IN ('critica', 'alta')
        ORDER BY CASE n.urgencia WHEN 'critica' THEN 1 ELSE 2 END
        LIMIT 8
    """)

    caps_texto = ", ".join(
        f"{r['tipo_servicio']} ({r['area_tematica']})" for r in capacidades
    ) or "datos no disponibles"

    necs_texto = "; ".join(
        f"{r['nombre']}: {r['descripcion']}" for r in necesidades
    ) or "datos no disponibles"

    hoy = datetime.now()
    # Mostrar la semana de emisión (lunes de la semana actual)
    lunes = hoy - timedelta(days=hoy.weekday())
    _MESES_ES = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ]
    trimestre = f"Semana del {lunes.day} de {_MESES_ES[lunes.month - 1]} de {lunes.year}"

    tema_label = TEMAS_VALIDOS[tema]
    fecha_actual = hoy.strftime("%B %Y").replace(
        "January", "enero").replace("February", "febrero").replace(
        "March", "marzo").replace("April", "abril").replace(
        "May", "mayo").replace("June", "junio").replace(
        "July", "julio").replace("August", "agosto").replace(
        "September", "septiembre").replace("October", "octubre").replace(
        "November", "noviembre").replace("December", "diciembre")

    # Búsqueda web antes de llamar a Claude
    queries = TEMAS_BUSQUEDAS.get(tema, [f"{tema_label} biotech conference 2025"])
    resultados_web = await _tavily_search(queries)

    prompt_texto = _PROMPT.format(
        tema_label=tema_label,
        trimestre=trimestre,
        fecha_actual=fecha_actual,
        capacidades_ecosistema=caps_texto,
        necesidades_ecosistema=necs_texto,
        resultados_web=resultados_web,
    )

    try:
        respuesta = await _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt_texto}],
        )
        texto = next(
            (b.text for b in respuesta.content if hasattr(b, "text")), ""
        )
    except Exception as e:
        import traceback
        logger.error("Error llamando a Claude: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=502, detail="Error al generar el radar")

    if not texto:
        raise HTTPException(status_code=502, detail="El modelo no devolvió texto")

    return RadarResponse(
        radar=texto,
        tema=tema,
        tema_label=tema_label,
        generado_en=datetime.now(timezone.utc).isoformat(),
        edicion=trimestre,
    )
