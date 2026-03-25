from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_db
from schemas.need import NeedItem

router = APIRouter(prefix="/needs", tags=["needs"])

_URGENCIA_ORDER = "CASE n.urgencia WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'normal' THEN 3 WHEN 'baja' THEN 4 END"


@router.get("", response_model=list[NeedItem])
async def list_needs(
    search: str | None = Query(None, description="Buscar en descripcion o nombre de actor"),
    urgencia: str | None = Query(None, description="critica | alta | normal | baja"),
    status: str | None = Query("activa", description="activa | resuelta | cancelada"),
    db: AsyncSession = Depends(get_db),
):
    query = f"""
        SELECT
            a.nombre        AS actor,
            a.tipo          AS tipo_actor,
            n.area_tematica,
            n.tipo_servicio,
            n.descripcion,
            n.descripcion_extendida,
            n.urgencia,
            n.status
        FROM necesidad n
        JOIN actor a ON a.id = n.actor_id
        WHERE 1=1
    """
    params: dict = {}

    if search:
        query += """
            AND (
                LOWER(n.descripcion) LIKE :search
                OR LOWER(a.nombre)   LIKE :search
            )
        """
        params["search"] = f"%{search.lower()}%"

    if urgencia:
        query += " AND n.urgencia = :urgencia"
        params["urgencia"] = urgencia

    if status:
        query += " AND n.status = :status"
        params["status"] = status

    query += f" ORDER BY {_URGENCIA_ORDER}, a.nombre"

    result = await db.execute(text(query), params)
    return [NeedItem(**row) for row in result.mappings()]
