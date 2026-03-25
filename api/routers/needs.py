from fastapi import APIRouter, Depends, Query
import asyncpg

from db.connection import get_db
from schemas.need import NeedItem

router = APIRouter(prefix="/needs", tags=["needs"])

_URGENCIA_ORDER = "CASE n.urgencia WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'normal' THEN 3 WHEN 'baja' THEN 4 END"


@router.get("", response_model=list[NeedItem])
async def list_needs(
    search: str | None = Query(None),
    urgencia: str | None = Query(None),
    status: str | None = Query("activa"),
    db: asyncpg.Connection = Depends(get_db),
):
    conditions = []
    args = []

    if search:
        args.append(f"%{search.lower()}%")
        conditions.append(f"(LOWER(n.descripcion) LIKE ${len(args)} OR LOWER(a.nombre) LIKE ${len(args)})")

    if urgencia:
        args.append(urgencia)
        conditions.append(f"n.urgencia = ${len(args)}")

    if status:
        args.append(status)
        conditions.append(f"n.status = ${len(args)}")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

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
        {where}
        ORDER BY {_URGENCIA_ORDER}, a.nombre
    """
    rows = await db.fetch(query, *args)
    return [NeedItem(**dict(row)) for row in rows]
