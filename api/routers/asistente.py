"""
Asistente del Ecosistema SINAP
Conversación en lenguaje natural contra todos los datos del ecosistema.
"""
import logging
from typing import Literal

import asyncpg
from anthropic import AsyncAnthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db.connection import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/asistente", tags=["asistente"])

_client = AsyncAnthropic()


class Mensaje(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AsistenteRequest(BaseModel):
    messages: list[Mensaje]


class AsistenteResponse(BaseModel):
    respuesta: str


_SYSTEM = """\
Sos el asistente del Clúster de Biotecnología de Córdoba, Argentina.
Tenés acceso completo a la información del ecosistema SINAP: actores, capacidades, \
necesidades, instrumentos de financiamiento, iniciativas y proyectos.

Tu trabajo es ayudar a los socios del Clúster a encontrar conexiones y recursos \
dentro del ecosistema. Cuando alguien describe una situación, un proyecto, una \
capacidad o una necesidad, buscás en los datos del ecosistema todo lo que sea \
relevante y lo presentás con una explicación de por qué aplica.

REGLAS:
- Respondé siempre en español.
- Solo usá los datos del ecosistema que se te proporcionan. No inventes actores, \
  proyectos ni instrumentos que no estén en los datos.
- Si la consulta es muy vaga para dar resultados útiles, hacé UNA sola pregunta \
  de aclaración antes de responder con resultados.
- Para cada entidad que menciones, agregá una línea corta explicando por qué es \
  relevante para la consulta del usuario.
- Si no hay nada relevante en el ecosistema, decilo claramente.
- No des consejos ni recomendaciones de acción. Presentá la información y dejá \
  que el usuario decida.
- Tono: directo, profesional, sin frases de relleno.
- Usá negritas para nombres de entidades. No uses tablas.
- No termines tus respuestas con preguntas de seguimiento como "¿Querés profundizar...?", \
  "¿Te puedo ayudar con algo más?" o similares. Si hay algo más para explorar, integralo \
  en el cuerpo de la respuesta o simplemente terminá la respuesta.

---

ECOSISTEMA SINAP:

ACTORES:
{actores}

CAPACIDADES / OFERTAS DISPONIBLES:
Formato: actor | área temática | tipo de servicio | disponibilidad
{capacidades}

NECESIDADES / DEMANDAS ACTIVAS:
Formato: actor | descripción | urgencia
{necesidades}

INSTRUMENTOS DE FINANCIAMIENTO:
Formato: nombre | organismo | tipo | monto máximo | plazo
{instrumentos}

INICIATIVAS EN CURSO:
Formato: título | tipo | estado
{iniciativas}

PROYECTOS:
Formato: título | área | TRL | estado | apoyos buscados
{proyectos}
"""


@router.post("", response_model=AsistenteResponse)
async def chat(
    body: AsistenteRequest,
    db: asyncpg.Connection = Depends(get_db),
):
    if not body.messages:
        raise HTTPException(status_code=400, detail="Se requiere al menos un mensaje.")

    messages = body.messages[-20:]  # limitar historial

    system_prompt = await _build_context(db)

    try:
        respuesta = await _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=system_prompt,
            messages=[{"role": m.role, "content": m.content} for m in messages],
        )
        return AsistenteResponse(respuesta=respuesta.content[0].text)
    except Exception as e:
        logger.error("Error en /asistente: %s", e)
        raise HTTPException(status_code=502, detail="Error al conectar con el asistente.")


async def _build_context(db: asyncpg.Connection) -> str:
    actores = await db.fetch(
        "SELECT nombre, tipo, etapa FROM actor ORDER BY nombre LIMIT 60"
    )

    capacidades = await db.fetch("""
        SELECT a.nombre AS actor, c.area_tematica, c.tipo_servicio, c.disponibilidad
        FROM capacidad c JOIN actor a ON a.id = c.actor_id
        WHERE c.disponibilidad != 'no_disponible'
        LIMIT 60
    """)

    necesidades = await db.fetch("""
        SELECT a.nombre AS actor, n.descripcion, n.urgencia
        FROM necesidad n JOIN actor a ON a.id = n.actor_id
        WHERE n.status = 'activa'
        ORDER BY CASE n.urgencia
            WHEN 'critica' THEN 1 WHEN 'alta' THEN 2
            WHEN 'media' THEN 3 ELSE 4 END
        LIMIT 40
    """)

    instrumentos = await db.fetch("""
        SELECT nombre, organismo, tipo, monto_maximo, plazo_ejecucion
        FROM instrumento WHERE status = 'activo'
        LIMIT 20
    """)

    iniciativas = await db.fetch("""
        SELECT titulo, tipo, estado
        FROM iniciativa
        WHERE estado IN ('abierta', 'en_curso')
        ORDER BY id DESC LIMIT 20
    """)

    proyectos = await db.fetch("""
        SELECT titulo, area_tematica, trl, estado,
               array_to_string(apoyos_buscados, ', ') AS apoyos
        FROM proyecto
        WHERE estado NOT IN ('archivado', 'finalizado')
        ORDER BY prioridad ASC NULLS LAST, id DESC
        LIMIT 20
    """)

    def fmt(rows, cols):
        if not rows:
            return "(sin datos)"
        return "\n".join(
            " | ".join(str(dict(r).get(c, "") or "") for c in cols)
            for r in rows
        )

    return _SYSTEM.format(
        actores=fmt(actores, ["nombre", "tipo", "etapa"]),
        capacidades=fmt(capacidades, ["actor", "area_tematica", "tipo_servicio", "disponibilidad"]),
        necesidades=fmt(necesidades, ["actor", "descripcion", "urgencia"]),
        instrumentos=fmt(instrumentos, ["nombre", "organismo", "tipo", "monto_maximo", "plazo_ejecucion"]),
        iniciativas=fmt(iniciativas, ["titulo", "tipo", "estado"]),
        proyectos=fmt(proyectos, ["titulo", "area_tematica", "trl", "estado", "apoyos"]),
    )
