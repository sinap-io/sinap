from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg

from db.connection import get_db
from schemas.proyecto import (
    ProyectoActorAdd, ProyectoActorOut,
    ProyectoCreate, ProyectoDetail, ProyectoList, ProyectoPatch,
    ProyectoInstrumentoAdd, ProyectoInstrumentoOut,
    ProyectoHitoCreate, ProyectoHitoOut,
    TRLLogOut,
    ZonaCreate, ZonaPatch, ZonaOut,
)

router = APIRouter(prefix="/proyectos", tags=["proyectos"])
zonas_router = APIRouter(prefix="/zonas", tags=["zonas"])

ESTADOS_VALIDOS = {"activo", "pausado", "finalizado"}
APOYOS_VALIDOS = {
    "financiamiento", "socio_tecnologico", "validacion",
    "mercado", "regulacion", "alianza_internacional",
    "transferencia_tecnologica",
}
TIPOS_HITO = {
    "prototipo_desarrollado", "validacion_tecnica", "presentacion_fondos",
    "financiamiento_obtenido", "acuerdo_transferencia", "publicacion",
    "patente", "reunion_estrategica", "cambio_trl", "otro",
}


# ══════════════════════════════════════════════════════════════
# PROYECTOS
# ══════════════════════════════════════════════════════════════

# ── Listar ────────────────────────────────────────────────────

@router.get("", response_model=list[ProyectoList])
async def list_proyectos(
    estado:       str | None = Query(None),
    apoyo:        str | None = Query(None),
    area:         str | None = Query(None),
    trl_min:      int | None = Query(None, ge=1, le=9),
    trl_max:      int | None = Query(None, ge=1, le=9),
    actor_id:     int | None = Query(None),
    iniciativa_id: int | None = Query(None),
    q:            str | None = Query(None),
    db: asyncpg.Connection = Depends(get_db),
):
    conditions, args = [], []

    if estado:
        args.append(estado)
        conditions.append(f"p.estado = ${len(args)}")
    if apoyo:
        args.append(apoyo)
        conditions.append(f"${len(args)} = ANY(p.apoyos_buscados)")
    if area:
        args.append(area)
        conditions.append(f"p.area_tematica = ${len(args)}")
    if trl_min is not None:
        args.append(trl_min)
        conditions.append(f"p.trl >= ${len(args)}")
    if trl_max is not None:
        args.append(trl_max)
        conditions.append(f"p.trl <= ${len(args)}")
    if iniciativa_id is not None:
        args.append(iniciativa_id)
        conditions.append(f"p.iniciativa_id = ${len(args)}")
    if actor_id is not None:
        args.append(actor_id)
        conditions.append(
            f"EXISTS (SELECT 1 FROM proyecto_actor pa WHERE pa.proyecto_id = p.id AND pa.actor_id = ${len(args)})"
        )
    if q:
        args.append(f"%{q}%")
        conditions.append(f"(p.titulo ILIKE ${len(args)} OR p.descripcion ILIKE ${len(args)})")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    rows = await db.fetch(f"""
        SELECT
            p.id, p.titulo, p.trl, p.area_tematica, p.estado,
            p.apoyos_buscados, p.prioridad,
            p.iniciativa_id,
            i.titulo AS iniciativa_titulo,
            p.creado_en, p.actualizado_en,
            COUNT(DISTINCT pa.actor_id) AS total_actores,
            COALESCE(
                ARRAY_AGG(DISTINCT pa.actor_id) FILTER (WHERE pa.actor_id IS NOT NULL),
                ARRAY[]::int[]
            ) AS actor_ids
        FROM proyecto p
        LEFT JOIN iniciativa i ON i.id = p.iniciativa_id
        LEFT JOIN proyecto_actor pa ON pa.proyecto_id = p.id
        {where}
        GROUP BY p.id, i.titulo
        ORDER BY p.prioridad NULLS LAST, p.actualizado_en DESC
    """, *args)

    return [
        ProyectoList(**{
            **dict(r),
            "actor_ids": list(r["actor_ids"]),
            "apoyos_buscados": list(r["apoyos_buscados"] or []),
        })
        for r in rows
    ]


# ── Crear ─────────────────────────────────────────────────────

@router.post("", response_model=ProyectoList, status_code=201)
async def create_proyecto(
    body: ProyectoCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    if body.estado not in ESTADOS_VALIDOS:
        raise HTTPException(422, f"Estado invalido. Opciones: {', '.join(sorted(ESTADOS_VALIDOS))}")
    if body.trl is not None and not (1 <= body.trl <= 9):
        raise HTTPException(422, "TRL debe estar entre 1 y 9")
    invalid_apoyos = set(body.apoyos_buscados) - APOYOS_VALIDOS
    if invalid_apoyos:
        raise HTTPException(422, f"Apoyos invalidos: {', '.join(invalid_apoyos)}")

    row = await db.fetchrow("""
        INSERT INTO proyecto (titulo, descripcion, trl, area_tematica, estado, apoyos_buscados, iniciativa_id, creado_por)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
    """, body.titulo, body.descripcion, body.trl, body.area_tematica,
        body.estado, body.apoyos_buscados, body.iniciativa_id, body.creado_por)

    pid = row["id"]
    if body.trl is not None:
        await db.execute("""
            INSERT INTO proyecto_trl_log (proyecto_id, trl_antes, trl_despues)
            VALUES ($1, NULL, $2)
        """, pid, body.trl)

    return await _get_list_row(pid, db)


# ── Detalle ───────────────────────────────────────────────────

@router.get("/{pid}", response_model=ProyectoDetail)
async def get_proyecto(pid: int, db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("""
        SELECT p.id, p.titulo, p.descripcion, p.trl, p.area_tematica, p.estado,
               p.apoyos_buscados, p.prioridad,
               p.iniciativa_id, i.titulo AS iniciativa_titulo,
               p.creado_en, p.actualizado_en
        FROM proyecto p
        LEFT JOIN iniciativa i ON i.id = p.iniciativa_id
        WHERE p.id = $1
    """, pid)
    if not row:
        raise HTTPException(404, "Proyecto no encontrado")

    actores = await db.fetch("""
        SELECT pa.actor_id, a.nombre AS actor_nombre, a.tipo AS actor_tipo, pa.rol
        FROM proyecto_actor pa JOIN actor a ON a.id = pa.actor_id
        WHERE pa.proyecto_id = $1 ORDER BY a.nombre
    """, pid)

    instrumentos = await db.fetch("""
        SELECT pi.instrumento_id, inst.nombre, inst.tipo
        FROM proyecto_instrumento pi JOIN instrumento inst ON inst.id = pi.instrumento_id
        WHERE pi.proyecto_id = $1 ORDER BY inst.nombre
    """, pid)

    historial = await db.fetch("""
        SELECT id, trl_antes, trl_despues, creado_en
        FROM proyecto_trl_log WHERE proyecto_id = $1 ORDER BY creado_en
    """, pid)

    hitos = await db.fetch("""
        SELECT id, tipo, descripcion, fecha, evidencia_url, creado_por, creado_en
        FROM proyecto_hito WHERE proyecto_id = $1 ORDER BY fecha, creado_en
    """, pid)

    return ProyectoDetail(
        **{**dict(row), "apoyos_buscados": list(row["apoyos_buscados"] or [])},
        actores=[ProyectoActorOut(**dict(r)) for r in actores],
        instrumentos=[ProyectoInstrumentoOut(**dict(r)) for r in instrumentos],
        historial_trl=[TRLLogOut(**dict(r)) for r in historial],
        hitos=[ProyectoHitoOut(**dict(h)) for h in hitos],
    )


# ── Actualizar ────────────────────────────────────────────────

@router.patch("/{pid}", response_model=ProyectoList)
async def patch_proyecto(
    pid: int, body: ProyectoPatch,
    db: asyncpg.Connection = Depends(get_db),
):
    existing = await db.fetchrow("SELECT id, trl FROM proyecto WHERE id = $1", pid)
    if not existing:
        raise HTTPException(404, "Proyecto no encontrado")

    if body.estado and body.estado not in ESTADOS_VALIDOS:
        raise HTTPException(422, f"Estado invalido. Opciones: {', '.join(sorted(ESTADOS_VALIDOS))}")
    if body.trl is not None and not (1 <= body.trl <= 9):
        raise HTTPException(422, "TRL debe estar entre 1 y 9")
    if body.apoyos_buscados is not None:
        invalid = set(body.apoyos_buscados) - APOYOS_VALIDOS
        if invalid:
            raise HTTPException(422, f"Apoyos invalidos: {', '.join(invalid)}")

    updates, args = [], []
    for field, val in [
        ("titulo",        body.titulo),
        ("descripcion",   body.descripcion),
        ("trl",           body.trl),
        ("area_tematica", body.area_tematica),
        ("estado",        body.estado),
        ("iniciativa_id", body.iniciativa_id),
    ]:
        if val is not None:
            args.append(val)
            updates.append(f"{field} = ${len(args)}")

    # prioridad: -1 = quitar (NULL), 1-4 = asignar
    if body.prioridad is not None:
        args.append(None if body.prioridad == -1 else body.prioridad)
        updates.append(f"prioridad = ${len(args)}")

    # apoyos_buscados puede ser lista vacía (válida), usar sentinel None = no enviado
    if body.apoyos_buscados is not None:
        args.append(body.apoyos_buscados)
        updates.append(f"apoyos_buscados = ${len(args)}")

    if not updates:
        raise HTTPException(422, "No se enviaron campos para actualizar")

    updates.append("actualizado_en = NOW()")
    args.append(pid)
    await db.execute(
        f"UPDATE proyecto SET {', '.join(updates)} WHERE id = ${len(args)}", *args
    )

    if body.trl is not None and body.trl != existing["trl"]:
        await db.execute("""
            INSERT INTO proyecto_trl_log (proyecto_id, trl_antes, trl_despues, cambiado_por)
            VALUES ($1, $2, $3, $4)
        """, pid, existing["trl"], body.trl, body.cambiado_por)

    return await _get_list_row(pid, db)


# ── Eliminar ─────────────────────────────────────────────────

@router.delete("/{pid}", status_code=204)
async def delete_proyecto(pid: int, db: asyncpg.Connection = Depends(get_db)):
    deleted = await db.fetchval("DELETE FROM proyecto WHERE id = $1 RETURNING 1", pid)
    if not deleted:
        raise HTTPException(404, "Proyecto no encontrado")


# ── Actores ───────────────────────────────────────────────────

@router.post("/{pid}/actores", response_model=ProyectoActorOut, status_code=201)
async def add_actor(pid: int, body: ProyectoActorAdd, db: asyncpg.Connection = Depends(get_db)):
    await _check_proyecto(pid, db)
    actor = await db.fetchrow("SELECT id, nombre, tipo FROM actor WHERE id = $1", body.actor_id)
    if not actor:
        raise HTTPException(404, "Actor no encontrado")
    try:
        await db.execute(
            "INSERT INTO proyecto_actor (proyecto_id, actor_id, rol) VALUES ($1, $2, $3)",
            pid, body.actor_id, body.rol
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, "El actor ya participa en este proyecto")
    await db.execute("UPDATE proyecto SET actualizado_en = NOW() WHERE id = $1", pid)
    return ProyectoActorOut(
        actor_id=actor["id"], actor_nombre=actor["nombre"],
        actor_tipo=actor["tipo"], rol=body.rol,
    )


@router.delete("/{pid}/actores/{actor_id}", status_code=204)
async def remove_actor(pid: int, actor_id: int, db: asyncpg.Connection = Depends(get_db)):
    await _check_proyecto(pid, db)
    deleted = await db.fetchval(
        "DELETE FROM proyecto_actor WHERE proyecto_id = $1 AND actor_id = $2 RETURNING 1",
        pid, actor_id
    )
    if not deleted:
        raise HTTPException(404, "Relacion no encontrada")


# ── Instrumentos ──────────────────────────────────────────────

@router.post("/{pid}/instrumentos", response_model=ProyectoInstrumentoOut, status_code=201)
async def add_instrumento(pid: int, body: ProyectoInstrumentoAdd, db: asyncpg.Connection = Depends(get_db)):
    await _check_proyecto(pid, db)
    inst = await db.fetchrow("SELECT id, nombre, tipo FROM instrumento WHERE id = $1", body.instrumento_id)
    if not inst:
        raise HTTPException(404, "Instrumento no encontrado")
    try:
        await db.execute(
            "INSERT INTO proyecto_instrumento (proyecto_id, instrumento_id) VALUES ($1, $2)",
            pid, body.instrumento_id
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, "Instrumento ya vinculado")
    await db.execute("UPDATE proyecto SET actualizado_en = NOW() WHERE id = $1", pid)
    return ProyectoInstrumentoOut(**dict(inst))


@router.delete("/{pid}/instrumentos/{instrumento_id}", status_code=204)
async def remove_instrumento(pid: int, instrumento_id: int, db: asyncpg.Connection = Depends(get_db)):
    await _check_proyecto(pid, db)
    deleted = await db.fetchval(
        "DELETE FROM proyecto_instrumento WHERE proyecto_id = $1 AND instrumento_id = $2 RETURNING 1",
        pid, instrumento_id
    )
    if not deleted:
        raise HTTPException(404, "Relacion no encontrada")


# ── Hitos ─────────────────────────────────────────────────────

@router.post("/{pid}/hitos", response_model=ProyectoHitoOut, status_code=201)
async def add_hito(pid: int, body: ProyectoHitoCreate, db: asyncpg.Connection = Depends(get_db)):
    await _check_proyecto(pid, db)
    if body.tipo not in TIPOS_HITO:
        raise HTTPException(422, f"Tipo invalido. Opciones: {', '.join(sorted(TIPOS_HITO))}")

    row = await db.fetchrow("""
        INSERT INTO proyecto_hito (proyecto_id, tipo, descripcion, fecha, evidencia_url, creado_por)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, tipo, descripcion, fecha, evidencia_url, creado_por, creado_en
    """, pid, body.tipo, body.descripcion, body.fecha, body.evidencia_url, body.creado_por)

    await db.execute("UPDATE proyecto SET actualizado_en = NOW() WHERE id = $1", pid)
    return ProyectoHitoOut(**dict(row))


@router.delete("/{pid}/hitos/{hito_id}", status_code=204)
async def remove_hito(pid: int, hito_id: int, db: asyncpg.Connection = Depends(get_db)):
    await _check_proyecto(pid, db)
    deleted = await db.fetchval(
        "DELETE FROM proyecto_hito WHERE id = $1 AND proyecto_id = $2 RETURNING 1",
        hito_id, pid
    )
    if not deleted:
        raise HTTPException(404, "Hito no encontrado")


# ── Helpers ───────────────────────────────────────────────────

async def _check_proyecto(pid: int, db: asyncpg.Connection):
    row = await db.fetchrow("SELECT id FROM proyecto WHERE id = $1", pid)
    if not row:
        raise HTTPException(404, "Proyecto no encontrado")


async def _get_list_row(pid: int, db: asyncpg.Connection) -> ProyectoList:
    row = await db.fetchrow("""
        SELECT
            p.id, p.titulo, p.trl, p.area_tematica, p.estado,
            p.apoyos_buscados, p.prioridad,
            p.iniciativa_id,
            i.titulo AS iniciativa_titulo,
            p.creado_en, p.actualizado_en,
            COUNT(DISTINCT pa.actor_id) AS total_actores,
            COALESCE(
                ARRAY_AGG(DISTINCT pa.actor_id) FILTER (WHERE pa.actor_id IS NOT NULL),
                ARRAY[]::int[]
            ) AS actor_ids
        FROM proyecto p
        LEFT JOIN iniciativa i ON i.id = p.iniciativa_id
        LEFT JOIN proyecto_actor pa ON pa.proyecto_id = p.id
        WHERE p.id = $1
        GROUP BY p.id, i.titulo
    """, pid)
    return ProyectoList(**{
        **dict(row),
        "actor_ids": list(row["actor_ids"]),
        "apoyos_buscados": list(row["apoyos_buscados"] or []),
    })


# ══════════════════════════════════════════════════════════════
# ZONAS
# ══════════════════════════════════════════════════════════════

@zonas_router.get("", response_model=list[ZonaOut])
async def list_zonas(
    solo_activas: bool = Query(True),
    db: asyncpg.Connection = Depends(get_db),
):
    where = "WHERE activa = TRUE" if solo_activas else ""
    rows = await db.fetch(f"SELECT id, nombre, activa, creado_en FROM zona {where} ORDER BY nombre")
    return [ZonaOut(**dict(r)) for r in rows]


@zonas_router.post("", response_model=ZonaOut, status_code=201)
async def create_zona(body: ZonaCreate, db: asyncpg.Connection = Depends(get_db)):
    try:
        row = await db.fetchrow("""
            INSERT INTO zona (nombre) VALUES ($1)
            RETURNING id, nombre, activa, creado_en
        """, body.nombre.strip())
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, "Ya existe una zona con ese nombre")
    return ZonaOut(**dict(row))


@zonas_router.patch("/{zona_id}", response_model=ZonaOut)
async def patch_zona(zona_id: int, body: ZonaPatch, db: asyncpg.Connection = Depends(get_db)):
    if body.activa is None:
        raise HTTPException(422, "No se enviaron campos para actualizar")
    row = await db.fetchrow("""
        UPDATE zona SET activa = $1 WHERE id = $2
        RETURNING id, nombre, activa, creado_en
    """, body.activa, zona_id)
    if not row:
        raise HTTPException(404, "Zona no encontrada")
    return ZonaOut(**dict(row))
