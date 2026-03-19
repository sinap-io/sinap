from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.connection import get_db
from api.schemas.service import ServiceItem

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceItem])
async def list_services(
    search: str | None = Query(None, description="Buscar en descripcion o nombre de actor"),
    area_tematica: str | None = Query(None, description="Filtrar por area tematica"),
    tipo_servicio: str | None = Query(None, description="Filtrar por tipo de servicio"),
    disponibilidad: str | None = Query(None, description="disponible | parcial | no_disponible"),
    db: AsyncSession = Depends(get_db),
):
    query = """
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
        WHERE 1=1
    """
    params: dict = {}

    if search:
        query += """
            AND (
                LOWER(c.descripcion) LIKE :search
                OR LOWER(a.nombre)   LIKE :search
            )
        """
        params["search"] = f"%{search.lower()}%"

    if area_tematica:
        query += " AND c.area_tematica = :area"
        params["area"] = area_tematica

    if tipo_servicio:
        query += " AND c.tipo_servicio = :tipo"
        params["tipo"] = tipo_servicio

    if disponibilidad:
        query += " AND c.disponibilidad = :disp"
        params["disp"] = disponibilidad

    query += " ORDER BY a.nombre, c.area_tematica"

    result = await db.execute(text(query), params)
    return [ServiceItem(**row) for row in result.mappings()]
