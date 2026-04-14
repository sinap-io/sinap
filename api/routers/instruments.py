from fastapi import APIRouter, Depends, Query
import asyncpg

from db.connection import get_db
from schemas.instrument import InstrumentItem

router = APIRouter(prefix="/instruments", tags=["instruments"])


@router.get("", response_model=list[InstrumentItem])
async def list_instruments(
    search: str | None = Query(None),
    tipo: str | None = Query(None),
    status: str | None = Query(None),
    db: asyncpg.Connection = Depends(get_db),
):
    conditions = []
    args = []

    if search:
        args.append(f"%{search.lower()}%")
        conditions.append(
            f"(LOWER(nombre) LIKE ${len(args)} OR LOWER(organismo) LIKE ${len(args)} OR LOWER(sectores_elegibles) LIKE ${len(args)})"
        )

    if tipo:
        args.append(tipo)
        conditions.append(f"tipo = ${len(args)}")

    if status:
        args.append(status)
        conditions.append(f"status = ${len(args)}")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    query = f"""
        SELECT
            id, nombre, tipo, organismo, sectores_elegibles, status, url,
            monto_maximo, cobertura_porcentaje, plazo_ejecucion,
            contrapartida, gastos_elegibles, descripcion_extendida
        FROM instrumento
        {where}
        ORDER BY tipo, nombre
    """
    rows = await db.fetch(query, *args)
    return [InstrumentItem(**dict(row)) for row in rows]
