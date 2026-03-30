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
Sos el analista de inteligencia territorial del Clúster de Biotecnología de Córdoba, Argentina.
Tu trabajo es generar informes claros, concisos y útiles sobre el estado del ecosistema.

A continuación tenés los datos actuales de la plataforma SINAP:

## ACTORES DEL ECOSISTEMA
{actores}

## CAPACIDADES Y SERVICIOS DISPONIBLES
{capacidades}

## NECESIDADES ACTIVAS
{necesidades}

## GAPS DETECTADOS
{gaps}

## INSTRUMENTOS DE FINANCIAMIENTO ACTIVOS
{instrumentos}

## INICIATIVAS EN CURSO
{iniciativas}

## HITOS RECIENTES (últimos 90 días)
{hitos}

---

Generá un informe ejecutivo del estado del ecosistema con estas secciones:

1. **Resumen ejecutivo** (3-4 oraciones): estado general del ecosistema, destacando lo más relevante.
2. **Actores y capacidades**: composición del ecosistema, tipos de actores, áreas de fortaleza.
3. **Demanda y gaps**: necesidades activas más urgentes, gaps sin resolver.
4. **Iniciativas activas**: qué procesos de articulación están en curso, cuáles avanzaron.
5. **Financiamiento disponible**: oportunidades de fondos activos relevantes.
6. **Recomendaciones** (2-3 puntos concretos para el equipo del Clúster).

Tono: profesional, directo, orientado a la acción. En español rioplatense.
Extensión: conciso pero completo. Máximo 600 palabras.
No uses bullet points excesivos — preferí párrafos cortos y fluidos.
"""


@router.get("", response_model=InformeResponse)
async def generar_informe(db: asyncpg.Connection = Depends(get_db)):
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
        SELECT nombre, organismo, tipo, monto_maximo, fecha_cierre
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
                    instrumentos=fmt(instrumentos, ["nombre", "organismo", "tipo", "monto_maximo", "fecha_cierre"]),
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
