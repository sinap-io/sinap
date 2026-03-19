import json
import logging

from anthropic import AsyncAnthropic
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.connection import get_db
from api.schemas.search import SearchRequest, SearchResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["search"])

_client = AsyncAnthropic()

_PROMPT_TEMPLATE = """\
Sos un asistente del ecosistema biotech de Córdoba, Argentina.
Un actor del ecosistema tiene esta necesidad: "{consulta}"

Estos son los servicios disponibles en la plataforma:
{servicios}

Estos son los instrumentos de financiamiento disponibles:
{instrumentos}

Tu tarea:
1. Evaluá qué tan bien cubren los servicios disponibles la necesidad planteada.
2. Si hay buenos matches, listá los 3 más relevantes con una explicación breve.
3. Solo mencioná instrumentos de financiamiento si la consulta involucra \
explícitamente desarrollo de productos, proyectos de innovación, o si el usuario \
menciona que busca financiamiento. Para pedidos operativos simples (análisis, ensayos, \
certificaciones puntuales) NO sugieras financiamiento.
4. Si el match es parcial o bajo, sé honesto: indicá qué parte de la necesidad SÍ está \
cubierta y qué parte NO.
5. Al final, respondé SIEMPRE con un bloque JSON con este formato exacto \
(sin markdown, sin backticks):

GAPS_JSON
{{"necesidad_cubierta": true/false, "cobertura_parcial": true/false, "gaps_detectados": ["gap1", "gap2"]}}
END_JSON

Si la necesidad está bien cubierta, gaps_detectados debe ser una lista vacía [].
Si hay gaps, listá los tipos de servicio o capacidades que faltan en la red.

Respondé en español, de forma clara y directa.\
"""


def _rows_to_text(rows: list[dict], columns: list[str]) -> str:
    """Formatea filas de BD como tabla de texto para el prompt."""
    if not rows:
        return "(sin datos disponibles)"
    header = " | ".join(columns)
    sep = "-" * len(header)
    lines = [header, sep]
    for row in rows:
        lines.append(" | ".join(str(row.get(c, "")) for c in columns))
    return "\n".join(lines)


def _parse_claude_response(texto: str) -> tuple[str, dict]:
    """
    Separa la respuesta legible del bloque GAPS_JSON.
    Retorna (texto_visible, gaps_data).
    gaps_data tiene keys: necesidad_cubierta, cobertura_parcial, gaps_detectados.
    """
    default = {"necesidad_cubierta": False, "cobertura_parcial": False, "gaps_detectados": []}

    if "GAPS_JSON" not in texto or "END_JSON" not in texto:
        logger.warning("Respuesta de Claude sin bloque GAPS_JSON")
        return texto, default

    try:
        json_str = texto.split("GAPS_JSON")[1].split("END_JSON")[0].strip()
        gaps_data = json.loads(json_str)
        texto_visible = texto.split("GAPS_JSON")[0].strip()
        return texto_visible, gaps_data
    except (json.JSONDecodeError, IndexError) as e:
        logger.warning("No se pudo parsear GAPS_JSON: %s", e)
        return texto, default


@router.post("", response_model=SearchResponse)
async def search(body: SearchRequest, db: AsyncSession = Depends(get_db)):
    """
    Búsqueda con IA en lenguaje libre.
    - Cruza la consulta con capacidades e instrumentos activos.
    - Registra la búsqueda en `busqueda`.
    - Persiste gaps detectados en `gap`.
    """
    # 1. Traer contexto de BD
    caps_result = await db.execute(text("""
        SELECT a.nombre AS actor, a.tipo AS tipo_actor,
               a.descripcion AS descripcion_actor,
               c.area_tematica, c.tipo_servicio,
               c.descripcion, c.descripcion_extendida, c.disponibilidad
        FROM capacidad c
        JOIN actor a ON a.id = c.actor_id
        WHERE c.disponibilidad != 'no_disponible'
    """))
    caps = [dict(r) for r in caps_result.mappings()]

    instr_result = await db.execute(text("""
        SELECT nombre, organismo, sectores_elegibles,
               monto_maximo, cobertura_porcentaje,
               plazo_ejecucion, descripcion_extendida
        FROM instrumento
        WHERE status = 'activo'
    """))
    instrs = [dict(r) for r in instr_result.mappings()]

    # 2. Formatear contexto para el prompt
    servicios_txt = _rows_to_text(caps, [
        "actor", "tipo_actor", "tipo_servicio", "area_tematica",
        "descripcion", "disponibilidad"
    ])
    instrumentos_txt = _rows_to_text(instrs, [
        "nombre", "organismo", "sectores_elegibles",
        "monto_maximo", "cobertura_porcentaje"
    ])

    # 3. Llamar a Claude
    try:
        respuesta_claude = await _client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1500,
            messages=[{
                "role": "user",
                "content": _PROMPT_TEMPLATE.format(
                    consulta=body.consulta,
                    servicios=servicios_txt,
                    instrumentos=instrumentos_txt,
                ),
            }],
        )
    except Exception as e:
        logger.error("Error llamando a Claude: %s", e)
        raise HTTPException(status_code=502, detail="Error al contactar el servicio de IA")

    texto_completo = respuesta_claude.content[0].text
    texto_visible, gaps_data = _parse_claude_response(texto_completo)

    # 4. Persistir búsqueda
    await db.execute(
        text("INSERT INTO busqueda (consulta) VALUES (:q)"),
        {"q": body.consulta},
    )

    # 5. Persistir gaps detectados
    gaps_detectados: list[str] = gaps_data.get("gaps_detectados", [])
    for gap_desc in gaps_detectados:
        await db.execute(
            text("""
                INSERT INTO gap (descripcion, origen, status)
                VALUES (:desc, 'busqueda_ia', 'detectado')
            """),
            {"desc": f"{gap_desc} — detectado desde consulta: {body.consulta[:100]}"},
        )

    await db.commit()

    return SearchResponse(
        respuesta=texto_visible,
        necesidad_cubierta=gaps_data.get("necesidad_cubierta", False),
        cobertura_parcial=gaps_data.get("cobertura_parcial", False),
        gaps_detectados=gaps_detectados,
    )
