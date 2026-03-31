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
Tu tarea es generar un informe de inteligencia sobre el área de **{tema_label}** para el equipo directivo del Clúster.

CONTEXTO:
- El Clúster opera en Córdoba, Argentina.
- Los actores son laboratorios, empresas, startups, centros de investigación y universidades.
- El Clúster tiene capacidades en: {capacidades_ecosistema}
- Las necesidades actuales más urgentes del ecosistema son: {necesidades_ecosistema}

REGLAS:
- Basate en tu conocimiento actualizado del sector.
- Sé específico: citá eventos, publicaciones, empresas, tendencias reales cuando puedas.
- Aplicá cada dato a la realidad del ecosistema cordobés: ¿qué significa esto para el Clúster?
- Tono: profesional, como un memo de inteligencia competitiva.
- Sin adjetivos vacíos. Sin frases de relleno.
- Idioma: español. Máximo 600 palabras.
- NO uses tablas. Usá listas con guión (- ).

Generá el informe con EXACTAMENTE estas secciones:

## Eventos y ferias relevantes
Los 3-4 eventos del sector más relevantes para {trimestre} y próximos meses.
Por cada uno: nombre, lugar, fecha aproximada y por qué le interesa al Clúster.

## Tendencias del sector
Las 2-3 tendencias científicas o de mercado más importantes en {tema_label} en este momento.
Para cada una: qué está pasando y qué oportunidad o riesgo representa para el ecosistema cordobés.

## Panorama de financiamiento
Instrumentos de financiamiento internacionales o nacionales activos o próximos relevantes para {tema_label}.
Mencioná fondos, convocatorias o programas que el Clúster debería estar monitoreando.

## Recomendaciones para el Clúster
3 acciones concretas que el Clúster debería considerar en los próximos 90 días, basadas en todo lo anterior.
Sé específico: a quién involucrar, qué hacer, por qué ahora.
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

    try:
        respuesta = await _client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": _PROMPT.format(
                    tema_label=tema_label,
                    trimestre=trimestre,
                    capacidades_ecosistema=caps_texto,
                    necesidades_ecosistema=necs_texto,
                ),
            }],
        )
    except Exception as e:
        logger.error("Error llamando a Claude: %s", e)
        raise HTTPException(status_code=502, detail="Error al generar el radar")

    return RadarResponse(
        radar=respuesta.content[0].text,
        tema=tema,
        tema_label=tema_label,
        generado_en=datetime.now().isoformat(),
        trimestre=trimestre,
    )
