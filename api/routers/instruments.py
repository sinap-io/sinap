from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_db
from schemas.instrument import InstrumentItem

router = APIRouter(prefix="/instruments", tags=["instruments"])


@router.get("", response_model=list[InstrumentItem])
async def list_instruments(
    search: str | None = Query(None, description="Buscar en nombre, organismo o sectores"),
    tipo: str | None = Query(None, description="subsidio | credito | capital | concurso"),
    status: str | None = Query(None, description="activo | proximamente | cerrado"),
    db: AsyncSession = Depends(get_db),
):
    query = """
        SELECT
            nombre,
            tipo,
            organismo,
            sectores_elegibles,
            status,
            url,
            monto_maximo,
            cobertura_porcentaje,
            plazo_ejecucion,
            contrapartida,
            gastos_elegibles,
            descripcion_extendida
        FROM instrumento
        WHERE 1=1
    """
    params: dict = {}

    if search:
        query += """
            AND (
                LOWER(nombre)             LIKE :search
                OR LOWER(organismo)       LIKE :search
                OR LOWER(sectores_elegibles) LIKE :search
            )
        """
        params["search"] = f"%{search.lower()}%"

    if tipo:
        query += " AND tipo = :tipo"
        params["tipo"] = tipo

    if status:
        query += " AND status = :status"
        params["status"] = status

    query += " ORDER BY tipo, nombre"

    result = await db.execute(text(query), params)
    return [InstrumentItem(**row) for row in result.mappings()]
