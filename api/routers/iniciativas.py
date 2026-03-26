from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg

from db.connection import get_db
from schemas.iniciativa import (
    HitoCreate, HitoOut,
    IniciativaActorAdd, IniciativaActorOut,
    IniciativaCreate, IniciativaDetail, IniciativaList, IniciativaPatch,
    LinkCapacidad, LinkInstrumento, LinkNecesidad,
    NecesidadRef, CapacidadRef, InstrumentoRef,
)

router = APIRouter(prefix="/iniciativas", tags=["iniciativas"])

TIPOS_VALIDOS   = {"oportunidad", "consorcio", "demanda", "oferta", "instrumento", "gap"}
ESTADOS_VALIDOS = {"abierta", "en_curso", "concretada", "cerrada", "cancelada"}
ROLES_VALIDOS   = {"lider", "demandante", "oferente", "miembro", "candidato", "financiador"}
TIPOS_HITO      = {
    "contacto_establecido", "reunion_realizada", "acuerdo_alcanzado",
    "convenio_firmado", "proyecto_iniciado", "financiamiento_obtenido", "otro",
}


# ── Listar ────────────────────────────────────────────────────

@router.get("", response_model=list[IniciativaList])
async def list_iniciativas(
    tipo:   str | None = Query(None),
    estado: str | None = Query(None),
    db: asyncpg.Connection = Depends(get_db),
):
    conditions, args = [], []

    if tipo:
        args.append(tipo)
        conditions.append(f"i.tipo = ${len(args)}")
    if estado:
        args.append(estado)
        conditions.append(f"i.estado = ${len(args)}")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    rows = await db.fetch(f"""
        SELECT
            i.id, i.tipo, i.titulo, i.estado,
            v.nombre AS vinculador_nombre,
            i.creado_en, i.actualizado_en,
            COUNT(DISTINCT ia.actor_id)    AS total_actores,
            COUNT(DISTINCT h.id)           AS total_hitos
        FROM iniciativa i
        LEFT JOIN vinculador v  ON v.id = i.vinculador_id
        LEFT JOIN iniciativa_actor ia ON ia.iniciativa_id = i.id
        LEFT JOIN hito h        ON h.iniciativa_id = i.id
        {where}
        GROUP BY i.id, v.nombre
        ORDER BY i.actualizado_en DESC
    """, *args)

    return [IniciativaList(**dict(r)) for r in rows]


# ── Crear ─────────────────────────────────────────────────────

@router.post("", response_model=IniciativaList, status_code=201)
async def create_iniciativa(
    body: IniciativaCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    if body.tipo not in TIPOS_VALIDOS:
        raise HTTPException(422, f"Tipo inválido. Opciones: {', '.join(sorted(TIPOS_VALIDOS))}")

    row = await db.fetchrow("""
        INSERT INTO iniciativa (tipo, titulo, descripcion, vinculador_id, notas)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    """, body.tipo, body.titulo, body.descripcion, body.vinculador_id, body.notas)

    return await _get_list_row(row["id"], db)


# ── Detalle ───────────────────────────────────────────────────

@router.get("/{iid}", response_model=IniciativaDetail)
async def get_iniciativa(iid: int, db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("""
        SELECT i.id, i.tipo, i.titulo, i.descripcion, i.estado, i.notas,
               i.vinculador_id, v.nombre AS vinculador_nombre,
               i.creado_en, i.actualizado_en
        FROM iniciativa i
        LEFT JOIN vinculador v ON v.id = i.vinculador_id
        WHERE i.id = $1
    """, iid)
    if not row:
        raise HTTPException(404, "Iniciativa no encontrada")

    actores = await db.fetch("""
        SELECT ia.actor_id, a.nombre AS actor_nombre, a.tipo AS actor_tipo, ia.rol
        FROM iniciativa_actor ia
        JOIN actor a ON a.id = ia.actor_id
        WHERE ia.iniciativa_id = $1
        ORDER BY ia.rol, a.nombre
    """, iid)

    necesidades = await db.fetch("""
        SELECT in2.necesidad_id, a.nombre AS actor_nombre, n.tipo_servicio
        FROM iniciativa_necesidad in2
        JOIN necesidad n ON n.id = in2.necesidad_id
        JOIN actor a ON a.id = n.actor_id
        WHERE in2.iniciativa_id = $1
    """, iid)

    capacidades = await db.fetch("""
        SELECT ic.capacidad_id, a.nombre AS actor_nombre, c.tipo_servicio
        FROM iniciativa_capacidad ic
        JOIN capacidad c ON c.id = ic.capacidad_id
        JOIN actor a ON a.id = c.actor_id
        WHERE ic.iniciativa_id = $1
    """, iid)

    instrumentos = await db.fetch("""
        SELECT ii.instrumento_id, inst.nombre, inst.tipo
        FROM iniciativa_instrumento ii
        JOIN instrumento inst ON inst.id = ii.instrumento_id
        WHERE ii.iniciativa_id = $1
    """, iid)

    hitos = await db.fetch("""
        SELECT id, tipo, descripcion, fecha, evidencia_url, creado_en
        FROM hito WHERE iniciativa_id = $1
        ORDER BY fecha, creado_en
    """, iid)

    return IniciativaDetail(
        **dict(row),
        actores=[IniciativaActorOut(**dict(r)) for r in actores],
        necesidades=[NecesidadRef(**dict(r)) for r in necesidades],
        capacidades=[CapacidadRef(**dict(r)) for r in capacidades],
        instrumentos=[InstrumentoRef(**dict(r)) for r in instrumentos],
        hitos=[HitoOut(**dict(h)) for h in hitos],
    )


# ── Actualizar ────────────────────────────────────────────────

@router.patch("/{iid}", response_model=IniciativaList)
async def patch_iniciativa(
    iid: int, body: IniciativaPatch,
    db: asyncpg.Connection = Depends(get_db),
):
    existing = await db.fetchrow("SELECT id FROM iniciativa WHERE id = $1", iid)
    if not existing:
        raise HTTPException(404, "Iniciativa no encontrada")

    if body.estado and body.estado not in ESTADOS_VALIDOS:
        raise HTTPException(422, f"Estado inválido. Opciones: {', '.join(sorted(ESTADOS_VALIDOS))}")

    updates, args = [], []
    for field, val in [
        ("titulo", body.titulo), ("descripcion", body.descripcion),
        ("estado", body.estado), ("vinculador_id", body.vinculador_id),
        ("notas", body.notas),
    ]:
        if val is not None:
            args.append(val)
            updates.append(f"{field} = ${len(args)}")

    if not updates:
        raise HTTPException(422, "No se enviaron campos para actualizar")

    updates.append("actualizado_en = NOW()")
    args.append(iid)
    await db.execute(
        f"UPDATE iniciativa SET {', '.join(updates)} WHERE id = ${len(args)}", *args
    )
    return await _get_list_row(iid, db)


# ── Actores ───────────────────────────────────────────────────

@router.post("/{iid}/actores", response_model=IniciativaActorOut, status_code=201)
async def add_actor(
    iid: int, body: IniciativaActorAdd,
    db: asyncpg.Connection = Depends(get_db),
):
    await _check_iniciativa(iid, db)
    if body.rol not in ROLES_VALIDOS:
        raise HTTPException(422, f"Rol inválido. Opciones: {', '.join(sorted(ROLES_VALIDOS))}")

    actor = await db.fetchrow("SELECT id, nombre, tipo FROM actor WHERE id = $1", body.actor_id)
    if not actor:
        raise HTTPException(404, "Actor no encontrado")

    try:
        await db.execute("""
            INSERT INTO iniciativa_actor (iniciativa_id, actor_id, rol)
            VALUES ($1, $2, $3)
        """, iid, body.actor_id, body.rol)
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, "El actor ya tiene ese rol en esta iniciativa")

    await db.execute(
        "UPDATE iniciativa SET actualizado_en = NOW() WHERE id = $1", iid
    )
    return IniciativaActorOut(
        actor_id=actor["id"], actor_nombre=actor["nombre"],
        actor_tipo=actor["tipo"], rol=body.rol,
    )


@router.delete("/{iid}/actores/{actor_id}/{rol}", status_code=204)
async def remove_actor(
    iid: int, actor_id: int, rol: str,
    db: asyncpg.Connection = Depends(get_db),
):
    await _check_iniciativa(iid, db)
    result = await db.execute("""
        DELETE FROM iniciativa_actor
        WHERE iniciativa_id = $1 AND actor_id = $2 AND rol = $3
    """, iid, actor_id, rol)
    if result == "DELETE 0":
        raise HTTPException(404, "Relación no encontrada")


# ── Necesidades ───────────────────────────────────────────────

@router.post("/{iid}/necesidades", status_code=201)
async def link_necesidad(
    iid: int, body: LinkNecesidad,
    db: asyncpg.Connection = Depends(get_db),
):
    await _check_iniciativa(iid, db)
    try:
        await db.execute("""
            INSERT INTO iniciativa_necesidad (iniciativa_id, necesidad_id)
            VALUES ($1, $2)
        """, iid, body.necesidad_id)
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, "Necesidad ya vinculada")
    except asyncpg.ForeignKeyViolationError:
        raise HTTPException(404, "Necesidad no encontrada")
    return {"ok": True}


@router.delete("/{iid}/necesidades/{necesidad_id}", status_code=204)
async def unlink_necesidad(
    iid: int, necesidad_id: int,
    db: asyncpg.Connection = Depends(get_db),
):
    await db.execute("""
        DELETE FROM iniciativa_necesidad
        WHERE iniciativa_id = $1 AND necesidad_id = $2
    """, iid, necesidad_id)


# ── Capacidades ───────────────────────────────────────────────

@router.post("/{iid}/capacidades", status_code=201)
async def link_capacidad(
    iid: int, body: LinkCapacidad,
    db: asyncpg.Connection = Depends(get_db),
):
    await _check_iniciativa(iid, db)
    try:
        await db.execute("""
            INSERT INTO iniciativa_capacidad (iniciativa_id, capacidad_id)
            VALUES ($1, $2)
        """, iid, body.capacidad_id)
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, "Capacidad ya vinculada")
    except asyncpg.ForeignKeyViolationError:
        raise HTTPException(404, "Capacidad no encontrada")
    return {"ok": True}


@router.delete("/{iid}/capacidades/{capacidad_id}", status_code=204)
async def unlink_capacidad(
    iid: int, capacidad_id: int,
    db: asyncpg.Connection = Depends(get_db),
):
    await db.execute("""
        DELETE FROM iniciativa_capacidad
        WHERE iniciativa_id = $1 AND capacidad_id = $2
    """, iid, capacidad_id)


# ── Instrumentos ──────────────────────────────────────────────

@router.post("/{iid}/instrumentos", status_code=201)
async def link_instrumento(
    iid: int, body: LinkInstrumento,
    db: asyncpg.Connection = Depends(get_db),
):
    await _check_iniciativa(iid, db)
    try:
        await db.execute("""
            INSERT INTO iniciativa_instrumento (iniciativa_id, instrumento_id)
            VALUES ($1, $2)
        """, iid, body.instrumento_id)
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, "Instrumento ya vinculado")
    except asyncpg.ForeignKeyViolationError:
        raise HTTPException(404, "Instrumento no encontrado")
    return {"ok": True}


@router.delete("/{iid}/instrumentos/{instrumento_id}", status_code=204)
async def unlink_instrumento(
    iid: int, instrumento_id: int,
    db: asyncpg.Connection = Depends(get_db),
):
    await db.execute("""
        DELETE FROM iniciativa_instrumento
        WHERE iniciativa_id = $1 AND instrumento_id = $2
    """, iid, instrumento_id)


# ── Hitos ─────────────────────────────────────────────────────

@router.post("/{iid}/hitos", response_model=HitoOut, status_code=201)
async def add_hito(
    iid: int, body: HitoCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    await _check_iniciativa(iid, db)
    if body.tipo not in TIPOS_HITO:
        raise HTTPException(422, f"Tipo inválido. Opciones: {', '.join(sorted(TIPOS_HITO))}")

    row = await db.fetchrow("""
        INSERT INTO hito (iniciativa_id, tipo, descripcion, fecha, evidencia_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, tipo, descripcion, fecha, evidencia_url, creado_en
    """, iid, body.tipo, body.descripcion, body.fecha, body.evidencia_url)

    await db.execute(
        "UPDATE iniciativa SET actualizado_en = NOW() WHERE id = $1", iid
    )
    return HitoOut(**dict(row))


# ── Helpers ───────────────────────────────────────────────────

async def _check_iniciativa(iid: int, db: asyncpg.Connection):
    row = await db.fetchrow("SELECT id FROM iniciativa WHERE id = $1", iid)
    if not row:
        raise HTTPException(404, "Iniciativa no encontrada")


async def _get_list_row(iid: int, db: asyncpg.Connection) -> IniciativaList:
    row = await db.fetchrow("""
        SELECT i.id, i.tipo, i.titulo, i.estado,
               v.nombre AS vinculador_nombre,
               i.creado_en, i.actualizado_en,
               COUNT(DISTINCT ia.actor_id) AS total_actores,
               COUNT(DISTINCT h.id)        AS total_hitos
        FROM iniciativa i
        LEFT JOIN vinculador v         ON v.id = i.vinculador_id
        LEFT JOIN iniciativa_actor ia  ON ia.iniciativa_id = i.id
        LEFT JOIN hito h               ON h.iniciativa_id = i.id
        WHERE i.id = $1
        GROUP BY i.id, v.nombre
    """, iid)
    return IniciativaList(**dict(row))
