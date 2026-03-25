from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg

from db.connection import get_db
from schemas.actor import ActorDetail, ActorList, NeedSummary, ServiceSummary

router = APIRouter(prefix="/actors", tags=["actors"])


@router.get("", response_model=list[ActorList])
async def list_actors(
    search: str | None = Query(None),
    tipo: str | None = Query(None),
    db: asyncpg.Connection = Depends(get_db),
):
    conditions = []
    args = []

    if search:
        args.append(f"%{search.lower()}%")
        conditions.append(f"LOWER(a.nombre) LIKE ${len(args)}")

    if tipo:
        args.append(tipo)
        conditions.append(f"a.tipo = ${len(args)}")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    query = f"""
        SELECT
            a.id, a.nombre, a.tipo, a.etapa, a.sitio_web, a.descripcion,
            COUNT(DISTINCT c.id) AS total_servicios,
            COUNT(DISTINCT n.id) AS total_necesidades
        FROM actor a
        LEFT JOIN capacidad c ON c.actor_id = a.id
        LEFT JOIN necesidad n ON n.actor_id = a.id
        {where}
        GROUP BY a.id
        ORDER BY a.nombre
    """
    rows = await db.fetch(query, *args)
    return [ActorList(**dict(row)) for row in rows]


@router.get("/{actor_id}", response_model=ActorDetail)
async def get_actor(actor_id: int, db: asyncpg.Connection = Depends(get_db)):
    actor = await db.fetchrow("""
        SELECT id, nombre, tipo, etapa, sitio_web, descripcion, certificaciones
        FROM actor WHERE id = $1
    """, actor_id)

    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    servicios = await db.fetch("""
        SELECT id, tipo_servicio, area_tematica, disponibilidad
        FROM capacidad WHERE actor_id = $1
    """, actor_id)

    necesidades = await db.fetch("""
        SELECT id, tipo_servicio, urgencia
        FROM necesidad WHERE actor_id = $1
    """, actor_id)

    actor_dict = dict(actor)
    return ActorDetail(
        **{k: v for k, v in actor_dict.items() if k != "certificaciones"},
        certificaciones=actor_dict["certificaciones"] or [],
        servicios=[ServiceSummary(**dict(r)) for r in servicios],
        necesidades=[NeedSummary(**dict(r)) for r in necesidades],
    )
