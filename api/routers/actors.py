from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.db.connection import get_db
from api.schemas.actor import ActorDetail, ActorList, NeedSummary, ServiceSummary

router = APIRouter(prefix="/actors", tags=["actors"])


@router.get("", response_model=list[ActorList])
async def list_actors(
    search: str | None = Query(None, description="Buscar por nombre"),
    tipo: str | None = Query(None, description="Filtrar por tipo de actor"),
    db: AsyncSession = Depends(get_db),
):
    query = """
        SELECT
            a.id,
            a.nombre,
            a.tipo,
            a.etapa,
            a.sitio_web,
            a.descripcion,
            COUNT(DISTINCT c.id) AS total_servicios,
            COUNT(DISTINCT n.id) AS total_necesidades
        FROM actor a
        LEFT JOIN capacidad c ON c.actor_id = a.id
        LEFT JOIN necesidad n ON n.actor_id = a.id
        WHERE 1=1
    """
    params: dict = {}

    if search:
        query += " AND LOWER(a.nombre) LIKE :search"
        params["search"] = f"%{search.lower()}%"

    if tipo:
        query += " AND a.tipo = :tipo"
        params["tipo"] = tipo

    query += " GROUP BY a.id ORDER BY a.nombre"

    result = await db.execute(text(query), params)
    rows = result.mappings().all()
    return [ActorList(**row) for row in rows]


@router.get("/{actor_id}", response_model=ActorDetail)
async def get_actor(actor_id: int, db: AsyncSession = Depends(get_db)):
    actor_result = await db.execute(
        text("""
            SELECT id, nombre, tipo, etapa, sitio_web, descripcion, certificaciones
            FROM actor
            WHERE id = :id
        """),
        {"id": actor_id},
    )
    actor = actor_result.mappings().first()

    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    services_result = await db.execute(
        text("""
            SELECT id, tipo_servicio, area_tematica, disponibilidad
            FROM capacidad
            WHERE actor_id = :id
        """),
        {"id": actor_id},
    )
    needs_result = await db.execute(
        text("""
            SELECT id, tipo_servicio, urgencia
            FROM necesidad
            WHERE actor_id = :id
        """),
        {"id": actor_id},
    )

    return ActorDetail(
        **{k: v for k, v in actor.items() if k != "certificaciones"},
        certificaciones=actor["certificaciones"] or [],
        servicios=[ServiceSummary(**r) for r in services_result.mappings()],
        necesidades=[NeedSummary(**r) for r in needs_result.mappings()],
    )
