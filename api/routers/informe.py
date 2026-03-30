"""
Módulo de Inteligencia — Informe del Clúster
Genera un informe narrativo del estado del ecosistema usando Claude.
"""
import logging
from datetime import datetime

import asyncpg
from anthropic import AsyncAnthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db.connection import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/informe", tags=["informe"])

_client = AsyncAnthropic()


class InformeResponse(BaseModel):
    informe: str
    generado_en: str
    datos: dict


_PROMPT = """\
Sos el analista del Clúster de Biotecnología de Córdoba, Argentina.
Tu tarea es generar un informe ejecutivo a partir de los datos de la plataforma SINAP.

REGLAS ESTRICTAS DE REDACCIÓN:
- Solo afirmá lo que esté respaldado por los datos. Si un dato no está, no lo inferís ni inventás.
- No usés adjetivos valorativos sin justificación numérica concreta. Prohibido: "equilibrado", "robusto", "incipiente", "sólido", "prometedor", "diversificado" y similares, salvo que puedas fundamentarlos con datos específicos.
- No usés frases de relleno como "presenta una composición", "se observa que", "cabe destacar". Escribí directamente.
- Si los datos son escasos, decilo explícitamente. Ejemplo: "La plataforma registra 1 iniciativa activa — no hay suficiente información para evaluar tendencias."
- Tono: técnico, objetivo, sin retórica. Como un informe de gestión real.
- Idioma: español neutro, sin regionalismos.
- Extensión: máximo 500 palabras. Párrafos cortos.

DATOS ACTUALES DE SINAP:

ACTORES REGISTRADOS (por tipo):
{actores}

CAPACIDADES Y SERVICIOS DISPONIBLES:
{capacidades}

NECESIDADES ACTIVAS (ordenadas por urgencia):
{necesidades}

GAPS DETECTADOS:
{gaps}

INSTRUMENTOS DE FINANCIAMIENTO ACTIVOS:
{instrumentos}

INICIATIVAS EN CURSO:
{iniciativas}

HITOS RECIENTES (últimos 90 días):
{hitos}

---

Generá el informe con exactamente estas secciones. No agregués ni quitées ninguna:

## Resumen
(2-3 oraciones. Qué hay registrado, qué está activo, qué llama la atención de los datos.)

## Actores y capacidades
(Quiénes son, cuántos por tipo, qué servicios ofrecen. Solo datos concretos.)

## Necesidades sin resolver
(Cuáles son las necesidades activas, cuántas son urgentes, si hay coincidencia con las capacidades disponibles o no.)

## Iniciativas activas
(Qué iniciativas están en curso, en qué estado, qué hitos tuvieron. Si hay pocas, decilo.)

## Financiamiento disponible
(Qué instrumentos están activos, montos, organismos. Solo los que aparecen en los datos.)

## Próximos pasos sugeridos
(2-3 acciones concretas y específicas para el equipo del Clúster, basadas en los datos anteriores.)
"""


@router.get("", response_model=InformeResponse)
async def generar_informe(db: asyncpg.Connection = Depends(get_db)):
    try:
        return await _generar(db)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error("Error en /informe: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


async def _generar(db: asyncpg.Connection) -> InformeResponse:
    # Recolectar datos del ecosistema
    actores = await db.fetch("""
        SELECT tipo, COUNT(*) as cantidad
        FROM actor GROUP BY tipo ORDER BY cantidad DESC
    """)

    capacidades = await db.fetch("""
        SELECT a.nombre as actor, c.area_tematica, c.tipo_servicio, c.disponibilidad
        FROM capacidad c JOIN actor a ON a.id = c.actor_id
        WHERE c.disponibilidad != 'no_disponible'
        LIMIT 30
    """)

    necesidades = await db.fetch("""
        SELECT a.nombre as actor, n.descripcion, n.urgencia
        FROM necesidad n JOIN actor a ON a.id = n.actor_id
        WHERE n.status = 'activa'
        ORDER BY CASE n.urgencia
            WHEN 'critica' THEN 1 WHEN 'alta' THEN 2
            WHEN 'media' THEN 3 ELSE 4 END
        LIMIT 20
    """)

    gaps = await db.fetch("""
        SELECT descripcion, origen, status FROM gap
        WHERE status IN ('detectado', 'confirmado')
        LIMIT 15
    """)

    instrumentos = await db.fetch("""
        SELECT nombre, organismo, tipo, monto_maximo, plazo_ejecucion
        FROM instrumento WHERE status = 'activo'
        LIMIT 10
    """)

    iniciativas_rows = await db.fetch("""
        SELECT i.titulo, i.tipo, i.estado,
               COUNT(DISTINCT ia.actor_id) as total_actores,
               COUNT(DISTINCT h.id) as total_hitos
        FROM iniciativa i
        LEFT JOIN iniciativa_actor ia ON ia.iniciativa_id = i.id
        LEFT JOIN hito h ON h.iniciativa_id = i.id
        WHERE i.estado IN ('abierta', 'en_curso')
        GROUP BY i.id, i.titulo, i.tipo, i.estado
        ORDER BY i.estado DESC, i.id DESC
        LIMIT 15
    """)

    hitos_recientes = await db.fetch("""
        SELECT i.titulo as iniciativa, h.tipo, h.descripcion, h.fecha
        FROM hito h JOIN iniciativa i ON i.id = h.iniciativa_id
        WHERE h.fecha >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY h.fecha DESC
        LIMIT 10
    """)

    def fmt(rows, cols):
        if not rows:
            return "(sin datos)"
        return "\n".join(
            " | ".join(str(dict(r).get(c, "")) for c in cols)
            for r in rows
        )

    datos_resumen = {
        "total_actores": sum(r["cantidad"] for r in actores),
        "total_capacidades": len(capacidades),
        "total_necesidades_activas": len(necesidades),
        "total_gaps": len(gaps),
        "total_instrumentos_activos": len(instrumentos),
        "total_iniciativas_activas": len(iniciativas_rows),
    }

    try:
        respuesta = await _client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": _PROMPT.format(
                    actores=fmt(actores, ["tipo", "cantidad"]),
                    capacidades=fmt(capacidades, ["actor", "area_tematica", "tipo_servicio", "disponibilidad"]),
                    necesidades=fmt(necesidades, ["actor", "descripcion", "urgencia"]),
                    gaps=fmt(gaps, ["descripcion", "origen", "status"]),
                    instrumentos=fmt(instrumentos, ["nombre", "organismo", "tipo", "monto_maximo", "plazo_ejecucion"]),
                    iniciativas=fmt(iniciativas_rows, ["titulo", "tipo", "estado", "total_actores", "total_hitos"]),
                    hitos=fmt(hitos_recientes, ["iniciativa", "tipo", "descripcion", "fecha"]),
                ),
            }],
        )
    except Exception as e:
        logger.error("Error llamando a Claude: %s", e)
        raise HTTPException(status_code=502, detail="Error al generar el informe")

    return InformeResponse(
        informe=respuesta.content[0].text,
        generado_en=datetime.now().isoformat(),
        datos=datos_resumen,
    )
