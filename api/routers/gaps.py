from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_db
from schemas.gap import GapItem, GapSummary, SearchLog

router = APIRouter(prefix="/gaps", tags=["gaps"])


@router.get("", response_model=list[GapItem])
async def list_gaps(
    solo_sin_oferta: bool = Query(True, description="True = solo gaps sin cobertura; False = incluye cobertura parcial"),
    db: AsyncSession = Depends(get_db),
):
    """
    Cruza necesidades activas contra capacidades disponibles.
    Devuelve los tipos de servicio con demanda insatisfecha total o parcialmente.
    """
    query = """
        SELECT
            n.tipo_servicio,
            n.area_tematica,
            COUNT(DISTINCT n.id)    AS demanda,
            COUNT(DISTINCT c.id)    AS oferta_disponible,
            STRING_AGG(DISTINCT a.nombre, ', ') AS actores_demandantes
        FROM necesidad n
        JOIN actor a ON a.id = n.actor_id
        LEFT JOIN capacidad c
            ON  c.tipo_servicio  = n.tipo_servicio
            AND c.disponibilidad = 'disponible'
        WHERE n.status = 'activa'
        GROUP BY n.tipo_servicio, n.area_tematica
        ORDER BY demanda DESC
    """
    result = await db.execute(text(query))
    rows = result.mappings().all()

    if solo_sin_oferta:
        rows = [r for r in rows if r["oferta_disponible"] == 0]

    return [GapItem(**row) for row in rows]


@router.get("/summary", response_model=GapSummary)
async def gap_summary(db: AsyncSession = Depends(get_db)):
    """Métricas agregadas para el header de la pantalla de gaps."""
    result = await db.execute(
        text("""
            WITH base AS (
                SELECT
                    n.tipo_servicio,
                    n.id                AS necesidad_id,
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
    )
    row = result.mappings().first()
    return GapSummary(
        total_gaps=row["total_gaps"] or 0,
        total_parcial=row["total_parcial"] or 0,
        total_demanda=row["total_demanda"] or 0,
    )


@router.get("/search-log", response_model=list[SearchLog])
async def search_log(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Ultimas consultas IA registradas — señal de demanda no declarada."""
    result = await db.execute(
        text("""
            SELECT consulta, creado_en::text AS creado_en
            FROM busqueda
            ORDER BY creado_en DESC
            LIMIT :limit
        """),
        {"limit": limit},
    )
    return [SearchLog(**row) for row in result.mappings()]
