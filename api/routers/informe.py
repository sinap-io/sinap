"""
Módulo de Inteligencia — Informe del Clúster
Genera un informe analítico cruzando datos de todos los módulos de SINAP.
"""
import logging
from datetime import datetime, timedelta

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
    periodo: str
    datos: dict


_PROMPT = """\
Sos el analista del Clúster de Biotecnología de Córdoba, Argentina.
Tu tarea es CRUZAR los datos de la plataforma SINAP para encontrar patrones que no son visibles mirando cada módulo por separado.
NO hagas un resumen de cada módulo. Hacé análisis cruzado: buscá conexiones, vacíos, y situaciones que requieren acción.

REGLAS:
- Solo afirmá lo que esté respaldado por los datos. Si un dato no está, decilo.
- Sin adjetivos valorativos sin respaldo. Prohibido: "robusto", "prometedor", "sólido".
- Sin frases de relleno. Ve al punto.
- Si los datos son escasos: "La plataforma registra X — información insuficiente para evaluar tendencias."
- Tono: técnico, como un memo interno de gestión.
- Idioma: español. Sin regionalismos.
- Extensión: máximo 500 palabras.
- NO uses tablas markdown. Usá listas con guión (- ).

---

DATOS DEL ECOSISTEMA:

ACTORES (por tipo):
{actores}

CAPACIDADES Y SERVICIOS DISPONIBLES:
Formato: actor | área temática | tipo de servicio | disponibilidad
{capacidades}

NECESIDADES ACTIVAS (por urgencia):
Formato: actor | descripción | urgencia
{necesidades}

GAPS DETECTADOS:
Formato: descripción | origen | estado
{gaps}

INSTRUMENTOS DE FINANCIAMIENTO ACTIVOS:
Formato: nombre | organismo | tipo | monto máximo | plazo
{instrumentos}

INICIATIVAS EN CURSO:
Formato: título | tipo | estado | actores vinculados | total hitos
{iniciativas}

HITOS RECIENTES — ÚLTIMOS 7 DÍAS:
Formato: iniciativa | tipo | descripción | fecha
{hitos_semana}

HITOS RECIENTES — ÚLTIMOS 90 DÍAS:
{hitos_90}

INICIATIVAS EN CURSO SIN ACTIVIDAD RECIENTE (+30 días):
Formato: título | estado | último hito | total hitos
{estancadas}

---

Generá el informe con EXACTAMENTE estas secciones en este orden. Sin agregar ni quitar ninguna:

## Resumen ejecutivo
2 oraciones máximo. La situación más relevante que surge del cruce de todos los datos. Qué requiere atención inmediata del equipo del Clúster.

## Oportunidades sin iniciativa
Cruzá necesidades activas con capacidades disponibles. ¿Hay actores que necesitan algo que otro actor ofrece, pero no hay ninguna iniciativa que los conecte?
Formato por cada match: "**[Actor demandante]** necesita [descripción breve] → **[Actor oferente]** ofrece [servicio/área]"
Si no hay matches identificables con los datos disponibles, decilo explícitamente.

## Necesidades sin cobertura
Necesidades con urgencia crítica o alta para las que no existe ninguna capacidad registrada en el sistema que pueda dar respuesta.
Si todas las necesidades urgentes tienen cobertura potencial, decilo.

## Iniciativas: avance y alertas
Para las iniciativas en_curso: ¿cuáles tienen actividad esta semana? ¿cuáles no tuvieron hitos en más de 30 días?
Mencioná cada iniciativa estancada por nombre con su último hito (si existe).

## Financiamiento: matches disponibles
Cruzá actores con necesidades activas contra los instrumentos de financiamiento disponibles.
¿Hay algún actor con una necesidad que podría calificar para algún fondo, pero no tiene iniciativa de financiamiento en curso?
Sé específico: actor → instrumento → por qué aplica.

## Esta semana
Qué actividad registró la plataforma en los últimos 7 días según los hitos. Si no hubo actividad, decilo.
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

    hitos_semana = await db.fetch("""
        SELECT i.titulo as iniciativa, h.tipo, h.descripcion, h.fecha
        FROM hito h JOIN iniciativa i ON i.id = h.iniciativa_id
        WHERE h.fecha >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY h.fecha DESC
        LIMIT 10
    """)

    hitos_90 = await db.fetch("""
        SELECT i.titulo as iniciativa, h.tipo, h.descripcion, h.fecha
        FROM hito h JOIN iniciativa i ON i.id = h.iniciativa_id
        WHERE h.fecha >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY h.fecha DESC
        LIMIT 15
    """)

    estancadas = await db.fetch("""
        SELECT i.titulo, i.estado, i.tipo,
               MAX(h.fecha) as ultimo_hito,
               COUNT(h.id) as total_hitos
        FROM iniciativa i
        LEFT JOIN hito h ON h.iniciativa_id = i.id
        WHERE i.estado = 'en_curso'
        GROUP BY i.id, i.titulo, i.estado, i.tipo
        HAVING MAX(h.fecha) < CURRENT_DATE - INTERVAL '30 days'
            OR MAX(h.fecha) IS NULL
        LIMIT 5
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

    # Calcular período (semana actual: lunes → domingo)
    hoy = datetime.now()
    day_of_week = hoy.weekday()  # 0=lun, 6=dom
    lunes = hoy - timedelta(days=day_of_week)
    domingo = lunes + timedelta(days=6)
    fmt_fecha = lambda d: d.strftime("%-d de %B").replace(
        "January", "enero").replace("February", "febrero").replace(
        "March", "marzo").replace("April", "abril").replace(
        "May", "mayo").replace("June", "junio").replace(
        "July", "julio").replace("August", "agosto").replace(
        "September", "septiembre").replace("October", "octubre").replace(
        "November", "noviembre").replace("December", "diciembre")
    periodo = f"Semana del {fmt_fecha(lunes)} al {fmt_fecha(domingo)} de {hoy.year}"

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
                    hitos_semana=fmt(hitos_semana, ["iniciativa", "tipo", "descripcion", "fecha"]),
                    hitos_90=fmt(hitos_90, ["iniciativa", "tipo", "descripcion", "fecha"]),
                    estancadas=fmt(estancadas, ["titulo", "estado", "ultimo_hito", "total_hitos"]),
                ),
            }],
        )
    except Exception as e:
        logger.error("Error llamando a Claude: %s", e)
        raise HTTPException(status_code=502, detail="Error al generar el informe")

    return InformeResponse(
        informe=respuesta.content[0].text,
        generado_en=datetime.now().isoformat(),
        periodo=periodo,
        datos=datos_resumen,
    )
