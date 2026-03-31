"""
Módulo de Inteligencia Externa — Radar del Sector
Genera un informe de inteligencia sectorial sobre el ecosistema biotech,
basado en el conocimiento actualizado del modelo IA.
"""
import logging
from datetime import datetime

import asyncpg
from anthropic import AsyncAnthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db.connection import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/radar", tags=["radar"])

_client = AsyncAnthropic()

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


_PROMPT = """\
Sos analista de inteligencia sectorial del Clúster de Biotecnología de Córdoba, Argentina.
Generás informes internos para el equipo de gestión del Clúster (no para los miembros).
La fecha actual es {fecha_actual}.

ANTES DE REDACTAR, buscá en la web:
1. Eventos y congresos de {tema_label} confirmados desde {fecha_actual} hasta fines de 2027 (incluir eventos lejanos es útil para planificación presupuestaria)
2. Noticias relevantes del sector publicadas en las últimas semanas
3. Convocatorias de financiamiento activas relacionadas con {tema_label}

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
async def generar_radar(tema: str = "biosensores", db: asyncpg.Connection = Depends(get_db)):
    if tema not in TEMAS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Tema no válido. Opciones: {list(TEMAS_VALIDOS.keys())}")

    try:
        return await _generar(tema, db)
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

    try:
        respuesta = await _client.messages.create(
            model="claude-opus-4-5",
            max_tokens=3000,
            tools=[{
                "type": "web_search_20250305",
                "name": "web_search",
                "max_uses": 5,
            }],
            messages=[{"role": "user", "content": prompt_texto}],
        )
    except Exception as e:
        logger.error("Error llamando a Claude: %s", e)
        raise HTTPException(status_code=502, detail="Error al generar el radar")

    # Extraer el texto final (el modelo puede incluir bloques de tool_use internos)
    texto = next(
        (block.text for block in respuesta.content if hasattr(block, "text")),
        "",
    )
    if not texto:
        raise HTTPException(status_code=502, detail="El modelo no devolvió texto")

    return RadarResponse(
        radar=texto,
        tema=tema,
        tema_label=tema_label,
        generado_en=datetime.now().isoformat(),
        trimestre=trimestre,
    )
