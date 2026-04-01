"""
Módulo de Inteligencia Externa — Radar del Sector
Genera un informe de inteligencia sectorial sobre el ecosistema biotech,
basado en el conocimiento actualizado del modelo IA.
"""
import asyncio
import json
import logging
import urllib.parse
import urllib.request
from datetime import datetime

import asyncpg
from anthropic import AsyncAnthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db.connection import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/radar", tags=["radar"])

_client = AsyncAnthropic()


def _ddg_search_sync(query: str) -> str:
    """Búsqueda via DuckDuckGo Instant Answer API (sincrónica)."""
    url = "https://api.duckduckgo.com/?" + urllib.parse.urlencode({
        "q": query, "format": "json", "no_html": "1", "skip_disambig": "1",
    })
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SINAP/1.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read().decode())
        parts = []
        if data.get("AbstractText"):
            parts.append(data["AbstractText"])
        for topic in (data.get("RelatedTopics") or [])[:5]:
            if isinstance(topic, dict) and topic.get("Text"):
                parts.append(topic["Text"])
        return "\n".join(parts) if parts else f"Sin resultados para: {query}"
    except Exception as e:
        return f"Error de búsqueda: {e}"


async def _web_search(query: str) -> str:
    return await asyncio.to_thread(_ddg_search_sync, query)

TEMAS_VALIDOS = {
    "biosensores": "biosensores para salud y diagnóstico point-of-care",
    "biofarma": "biotecnología farmacéutica y biológicos terapéuticos",
    "agroindustria": "biotecnología agrícola y bioinsumos",
    "diagnostico_molecular": "diagnóstico molecular y genómica clínica",
    "nanobiotecnologia": "nanobiotecnología y nanomateriales para salud",
}


class RadarResponse(BaseModel):
    radar: str
    tema: str
    tema_label: str
    generado_en: str
    trimestre: str


# Cache en memoria por tema — se limpia al reiniciar Railway
_cache: dict[str, RadarResponse] = {}
_CACHE_TTL_HORAS = 168  # 7 días


_PROMPT = """\
Sos analista de inteligencia sectorial del Clúster de Biotecnología de Córdoba, Argentina.
Generás informes internos para el equipo de gestión del Clúster (no para los miembros).
La fecha actual es {fecha_actual}.

CONTEXTO DEL ECOSISTEMA:
- Capacidades disponibles en el Clúster: {capacidades_ecosistema}
- Necesidades urgentes de los miembros: {necesidades_ecosistema}

REGLAS:
- Usá solo información verificada. Si buscaste y no encontraste algo concreto, decilo.
- Solo eventos confirmados y futuros (posteriores a {fecha_actual}).
- Tono: memo interno de gestión. Directo, sin adjetivos vacíos.
- Sin línea de cierre ni "próxima actualización".
- Idioma: español. Máximo 600 palabras.
- NO uses tablas. Usá listas con guión (- ).

Generá el informe con EXACTAMENTE estas secciones:

## Eventos del sector
Eventos relevantes para {tema_label} desde {fecha_actual} hasta fines de 2027.
Incluí eventos lejanos — los europeos o internacionales requieren planificación presupuestaria con al menos 6-12 meses de anticipación.
Por cada uno: nombre, lugar, fecha y por qué es relevante para el ecosistema cordobés.

## Tendencias
Las 2-3 tendencias científicas o de mercado más importantes en {tema_label} ahora mismo.
Para cada una: qué está pasando y qué significa concretamente para los actores del Clúster.

## Financiamiento disponible
Instrumentos activos o próximos a abrir relevantes para {tema_label}.
Priorizá los accesibles desde Argentina.

## Oportunidades detectadas
Señales del sector que abren ventanas concretas para los miembros del Clúster.
NO es una lista de tareas. Es inteligencia: qué está pasando afuera que es relevante para actores como los del ecosistema cordobés.
Formato: "Señal → por qué importa al Clúster". Máximo 3 items.
"""


@router.get("", response_model=RadarResponse)
async def generar_radar(
    tema: str = "biosensores",
    force: bool = False,
    db: asyncpg.Connection = Depends(get_db),
):
    if tema not in TEMAS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Tema no válido. Opciones: {list(TEMAS_VALIDOS.keys())}")

    # Devolver cache si existe y no se fuerza regeneración
    if not force and tema in _cache:
        cached = _cache[tema]
        horas_desde = (datetime.now() - datetime.fromisoformat(cached.generado_en)).total_seconds() / 3600
        if horas_desde < _CACHE_TTL_HORAS:
            return cached

    try:
        result = await _generar(tema, db)
        _cache[tema] = result
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
    mes = hoy.month
    if mes <= 3:
        trimestre = f"Q1 {hoy.year}"
    elif mes <= 6:
        trimestre = f"Q2 {hoy.year}"
    elif mes <= 9:
        trimestre = f"Q3 {hoy.year}"
    else:
        trimestre = f"Q4 {hoy.year}"

    tema_label = TEMAS_VALIDOS[tema]
    fecha_actual = hoy.strftime("%B %Y").replace(
        "January", "enero").replace("February", "febrero").replace(
        "March", "marzo").replace("April", "abril").replace(
        "May", "mayo").replace("June", "junio").replace(
        "July", "julio").replace("August", "agosto").replace(
        "September", "septiembre").replace("October", "octubre").replace(
        "November", "noviembre").replace("December", "diciembre")

    prompt_texto = _PROMPT.format(
        tema_label=tema_label,
        trimestre=trimestre,
        fecha_actual=fecha_actual,
        capacidades_ecosistema=caps_texto,
        necesidades_ecosistema=necs_texto,
    )

    _tools = [{
        "name": "web_search",
        "description": "Busca información actualizada en la web sobre eventos, noticias y convocatorias del sector.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Consulta de búsqueda en inglés o español"},
            },
            "required": ["query"],
        },
    }]

    try:
        respuesta = await _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
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
        generado_en=datetime.now().isoformat(),
        trimestre=trimestre,
    )
