from fastapi import APIRouter, Depends, HTTPException
import asyncpg

from db.connection import get_db
from schemas.vinculador import VinculadorCreate, VinculadorOut

router = APIRouter(prefix="/vinculador", tags=["vinculador"])


# ── Operadores vinculadores ────────────────────────────────────

@router.get("/operadores", response_model=list[VinculadorOut])
async def list_vinculadores(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch(
        "SELECT id, nombre, email, activo, creado_en FROM vinculador ORDER BY nombre"
    )
    return [VinculadorOut(**dict(r)) for r in rows]


@router.post("/operadores", response_model=VinculadorOut, status_code=201)
async def create_vinculador(
    body: VinculadorCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    try:
        row = await db.fetchrow(
            """
            INSERT INTO vinculador (nombre, email)
            VALUES ($1, $2)
            RETURNING id, nombre, email, activo, creado_en
            """,
            body.nombre, body.email,
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=409, detail="Ya existe un vinculador con ese email")
    return VinculadorOut(**dict(row))
