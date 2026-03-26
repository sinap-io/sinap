from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg

from db.connection import get_db
from schemas.vinculador import (
    CasoCreate, CasoDetail, CasoList, CasoPatch,
    HitoCreate, HitoOut,
    VinculadorCreate, VinculadorOut,
)

router = APIRouter(prefix="/vinculador", tags=["vinculador"])

ESTADOS_VALIDOS = {"abierto", "en_gestion", "vinculado", "cerrado", "cancelado"}


# ── Vinculadores ──────────────────────────────────────────────────────────────

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


# ── Casos de vinculación ──────────────────────────────────────────────────────

_CASO_SELECT = """
    SELECT
        cv.id,
        cv.estado,
        cv.notas,
        cv.creado_en,
        cv.actualizado_en,
        cv.actor_demandante_id   AS demandante_id,
        ad.nombre                AS demandante_nombre,
        cv.actor_oferente_id     AS oferente_id,
        ao.nombre                AS oferente_nombre,
        cv.necesidad_id,
        n.tipo_servicio          AS necesidad_tipo,
        cv.vinculador_id,
        v.nombre                 AS vinculador_nombre
    FROM caso_vinculacion cv
    JOIN actor ad ON ad.id = cv.actor_demandante_id
    LEFT JOIN actor ao ON ao.id = cv.actor_oferente_id
    JOIN necesidad n ON n.id = cv.necesidad_id
    JOIN vinculador v ON v.id = cv.vinculador_id
"""


@router.get("/casos", response_model=list[CasoList])
async def list_casos(
    estado: str | None = Query(None),
    vinculador_id: int | None = Query(None),
    db: asyncpg.Connection = Depends(get_db),
):
    conditions = []
    args = []

    if estado:
        args.append(estado)
        conditions.append(f"cv.estado = ${len(args)}")

    if vinculador_id:
        args.append(vinculador_id)
        conditions.append(f"cv.vinculador_id = ${len(args)}")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    rows = await db.fetch(
        f"{_CASO_SELECT} {where} ORDER BY cv.actualizado_en DESC",
        *args,
    )
    return [CasoList(**dict(r)) for r in rows]


@router.post("/casos", response_model=CasoList, status_code=201)
async def create_caso(
    body: CasoCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    # Verificar que el vinculador existe
    v = await db.fetchrow("SELECT id FROM vinculador WHERE id = $1", body.vinculador_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vinculador no encontrado")

    row = await db.fetchrow(
        """
        INSERT INTO caso_vinculacion
            (actor_demandante_id, actor_oferente_id, necesidad_id,
             capacidad_id, vinculador_id, notas)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        """,
        body.actor_demandante_id,
        body.actor_oferente_id,
        body.necesidad_id,
        body.capacidad_id,
        body.vinculador_id,
        body.notas,
    )
    caso_id = row["id"]

    caso = await db.fetchrow(
        f"{_CASO_SELECT} WHERE cv.id = $1",
        caso_id,
    )
    return CasoList(**dict(caso))


@router.get("/casos/{caso_id}", response_model=CasoDetail)
async def get_caso(caso_id: int, db: asyncpg.Connection = Depends(get_db)):
    caso = await db.fetchrow(
        f"""
        SELECT
            cv.id,
            cv.estado,
            cv.notas,
            cv.creado_en,
            cv.actualizado_en,
            cv.actor_demandante_id   AS demandante_id,
            ad.nombre                AS demandante_nombre,
            cv.actor_oferente_id     AS oferente_id,
            ao.nombre                AS oferente_nombre,
            cv.necesidad_id,
            n.tipo_servicio          AS necesidad_tipo,
            cv.vinculador_id,
            v.nombre                 AS vinculador_nombre,
            cv.capacidad_id,
            c.tipo_servicio          AS capacidad_tipo
        FROM caso_vinculacion cv
        JOIN actor ad ON ad.id = cv.actor_demandante_id
        LEFT JOIN actor ao ON ao.id = cv.actor_oferente_id
        JOIN necesidad n ON n.id = cv.necesidad_id
        JOIN vinculador v ON v.id = cv.vinculador_id
        LEFT JOIN capacidad c ON c.id = cv.capacidad_id
        WHERE cv.id = $1
        """,
        caso_id,
    )
    if not caso:
        raise HTTPException(status_code=404, detail="Caso no encontrado")

    hitos = await db.fetch(
        """
        SELECT id, tipo, descripcion, fecha, evidencia_url, creado_en
        FROM hito
        WHERE caso_id = $1
        ORDER BY fecha, creado_en
        """,
        caso_id,
    )

    return CasoDetail(
        **dict(caso),
        hitos=[HitoOut(**dict(h)) for h in hitos],
    )


@router.patch("/casos/{caso_id}", response_model=CasoList)
async def patch_caso(
    caso_id: int,
    body: CasoPatch,
    db: asyncpg.Connection = Depends(get_db),
):
    # Verificar que existe
    existing = await db.fetchrow(
        "SELECT id FROM caso_vinculacion WHERE id = $1", caso_id
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Caso no encontrado")

    if body.estado and body.estado not in ESTADOS_VALIDOS:
        raise HTTPException(
            status_code=422,
            detail=f"Estado inválido. Opciones: {', '.join(sorted(ESTADOS_VALIDOS))}",
        )

    # Construir SET dinámico con solo los campos enviados
    updates = []
    args = []

    if body.estado is not None:
        args.append(body.estado)
        updates.append(f"estado = ${len(args)}")
    if body.actor_oferente_id is not None:
        args.append(body.actor_oferente_id)
        updates.append(f"actor_oferente_id = ${len(args)}")
    if body.capacidad_id is not None:
        args.append(body.capacidad_id)
        updates.append(f"capacidad_id = ${len(args)}")
    if body.notas is not None:
        args.append(body.notas)
        updates.append(f"notas = ${len(args)}")

    if not updates:
        raise HTTPException(status_code=422, detail="No se enviaron campos para actualizar")

    updates.append("actualizado_en = NOW()")
    args.append(caso_id)

    await db.execute(
        f"UPDATE caso_vinculacion SET {', '.join(updates)} WHERE id = ${len(args)}",
        *args,
    )

    caso = await db.fetchrow(f"{_CASO_SELECT} WHERE cv.id = $1", caso_id)
    return CasoList(**dict(caso))


# ── Hitos ─────────────────────────────────────────────────────────────────────

TIPOS_HITO_VALIDOS = {
    "contacto_establecido", "reunion_realizada", "acuerdo_alcanzado",
    "convenio_firmado", "proyecto_iniciado", "financiamiento_obtenido", "otro",
}


@router.post("/casos/{caso_id}/hitos", response_model=HitoOut, status_code=201)
async def add_hito(
    caso_id: int,
    body: HitoCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    caso = await db.fetchrow(
        "SELECT id FROM caso_vinculacion WHERE id = $1", caso_id
    )
    if not caso:
        raise HTTPException(status_code=404, detail="Caso no encontrado")

    if body.tipo not in TIPOS_HITO_VALIDOS:
        raise HTTPException(
            status_code=422,
            detail=f"Tipo inválido. Opciones: {', '.join(sorted(TIPOS_HITO_VALIDOS))}",
        )

    row = await db.fetchrow(
        """
        INSERT INTO hito (caso_id, tipo, descripcion, fecha, evidencia_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, tipo, descripcion, fecha, evidencia_url, creado_en
        """,
        caso_id, body.tipo, body.descripcion, body.fecha, body.evidencia_url,
    )
    return HitoOut(**dict(row))
