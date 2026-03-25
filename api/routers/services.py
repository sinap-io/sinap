from fastapi import APIRouter, Depends, Query
import asyncpg

from db.connection import get_db
from schemas.service import ServiceItem

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceItem])
async def list_services(
    search: str | None = Query(None),
    area_tematica: str | None = Query(None),
    tipo_servicio: str | None = Query(None),
    disponibilidad: str | None = Query(None),
    db: asyncpg.Connection = Depends(get_db),
):
    conditions = []
    args = []

    if search:
        args.append(f"%{search.lower()}%")
        conditions.append(f"(LOWER(c.descripcion) LIKE ${len(args)} OR LOWER(a.nombre) LIKE ${len(args)})")

    if area_tematica:
        args.append(area_tematica)
        conditions.append(f"c.area_tematica = ${len(args)}")

    if tipo_servicio:
        args.append(tipo_servicio)
        conditions.append(f"c.tipo_servicio = ${len(args)}")

    if disponibilidad:
        args.append(disponibilidad)
        conditions.append(f"c.disponibilidad = ${len(args)}")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    query = f"""
        SELECT
            a.nombre        AS actor,
            a.tipo          AS tipo_actor,
            c.area_tematica,
            c.tipo_servicio,
            c.descripcion,
            c.descripcion_extendida,
            c.disponibilidad
        FROM capacidad c
        JOIN actor a ON a.id = c.actor_id
        {where}
        ORDER BY a.nombre, c.area_tematica
    """
    rows = await db.fetch(query, *args)
    return [ServiceItem(**dict(row)) for row in rows]
