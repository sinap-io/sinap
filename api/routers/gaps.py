from fastapi import APIRouter, Depends, Query
import asyncpg

from db.connection import get_db
from schemas.gap import GapItem, GapSummary, SearchLog

router = APIRouter(prefix="/gaps", tags=["gaps"])


@router.get("", response_model=list[GapItem])
async def list_gaps(
    solo_sin_oferta: bool = Query(True),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch("""
        SELECT
            n.tipo_servicio,
            n.area_tematica,
            COUNT(DISTINCT n.id)                AS demanda,
            COUNT(DISTINCT c.id)                AS oferta_disponible,
            STRING_AGG(DISTINCT a.nombre, ', ') AS actores_demandantes
        FROM necesidad n
        JOIN actor a ON a.id = n.actor_id
        LEFT JOIN capacidad c
            ON  c.tipo_servicio  = n.tipo_servicio
            AND c.disponibilidad = 'disponible'
        WHERE n.status = 'activa'
        GROUP BY n.tipo_servicio, n.area_tematica
        ORDER BY demanda DESC
    """)

    if solo_sin_oferta:
        rows = [r for r in rows if r["oferta_disponible"] == 0]

    return [GapItem(**dict(row)) for row in rows]


@router.get("/summary", response_model=GapSummary)
async def gap_summary(db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("""
        WITH base AS (
            SELECT
                n.tipo_servicio,
                n.id                 AS necesidad_id,
                COUNT(DISTINCT c.id) AS oferta
            FROM necesidad n
            LEFT JOIN capacidad c
                ON  c.tipo_servicio  = n.tipo_servicio
                AND c.disponibilidad = 'disponible'
            WHERE n.status = 'activa'
            GROUP BY n.tipo_servicio, n.id
        )
        SELECT
            COUNT(DISTINCT tipo_servicio) FILTER (WHERE oferta = 0) AS total_gaps,
            COUNT(DISTINCT tipo_servicio) FILTER (WHERE oferta > 0) AS total_parcial,
            COUNT(necesidad_id)                                      AS total_demanda
        FROM base
    """)
    return GapSummary(
        total_gaps=row["total_gaps"] or 0,
        total_parcial=row["total_parcial"] or 0,
        total_demanda=row["total_demanda"] or 0,
    )


@router.get("/search-log", response_model=list[SearchLog])
async def search_log(
    limit: int = Query(20, ge=1, le=100),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch("""
        SELECT consulta, creado_en::text AS creado_en
        FROM busqueda
        ORDER BY creado_en DESC
        LIMIT $1
    """, limit)
    return [SearchLog(**dict(row)) for row in rows]
