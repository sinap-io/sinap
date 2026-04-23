from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg
from datetime import datetime

from db.connection import get_db
from schemas.adit import (
    VinculadorList, VinculadorDetail, VinculadorPatch,
    ActividadResumen,
)

router = APIRouter(prefix="/adit", tags=["adit"])


# ── Listar vinculadores con actividad agregada ────────────────

@router.get("/vinculadores", response_model=list[VinculadorList])
async def list_vinculadores(
    solo_activos: bool = Query(True),
    db: asyncpg.Connection = Depends(get_db),
):
    where = "WHERE v.activo = TRUE" if solo_activos else ""
    rows = await db.fetch(f"""
        SELECT
            v.id, v.nombre, v.email, v.activo, v.zona_id, v.usuario_id,
            z.nombre AS zona_nombre,
            v.creado_en,
            COUNT(DISTINCT i.id)   AS total_iniciativas,
            COUNT(DISTINCT h.id)   AS total_hitos,
            COUNT(DISTINCT p.id)   AS total_proyectos
        FROM vinculador v
        LEFT JOIN zona z ON z.id = v.zona_id
        LEFT JOIN iniciativa i ON i.vinculador_id = v.id
        LEFT JOIN hito h       ON h.creado_por = v.usuario_id
        LEFT JOIN proyecto p   ON p.vinculador_id = v.id
        {where}
        GROUP BY v.id, z.nombre
        ORDER BY v.nombre
    """)
    return [VinculadorList(**dict(r)) for r in rows]


# ── Detalle de un vinculador con actividad completa ───────────

@router.get("/vinculadores/{vid}", response_model=VinculadorDetail)
async def get_vinculador(vid: int, db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("""
        SELECT v.id, v.nombre, v.email, v.activo, v.zona_id, v.usuario_id,
               z.nombre AS zona_nombre, v.creado_en
        FROM vinculador v
        LEFT JOIN zona z ON z.id = v.zona_id
        WHERE v.id = $1
    """, vid)
    if not row:
        raise HTTPException(404, "Vinculador no encontrado")

    uid = row["usuario_id"]

    # Iniciativas asignadas a este vinculador
    iniciativas = await db.fetch("""
        SELECT id, titulo, tipo, estado, creado_en
        FROM iniciativa
        WHERE vinculador_id = $1
        ORDER BY creado_en DESC
    """, vid)

    # Hitos creados
    hitos = await db.fetch("""
        SELECT h.id, h.tipo, h.descripcion, h.fecha,
               i.titulo AS iniciativa_titulo, h.creado_en
        FROM hito h
        JOIN iniciativa i ON i.id = h.iniciativa_id
        WHERE h.creado_por = $1
        ORDER BY h.creado_en DESC
    """, uid) if uid else []

    # Proyectos asignados a este vinculador
    proyectos = await db.fetch("""
        SELECT id, titulo, trl, estado, creado_en
        FROM proyecto
        WHERE vinculador_id = $1
        ORDER BY creado_en DESC
    """, vid)

    # Cambios de TRL registrados
    trl_changes = await db.fetch("""
        SELECT ptl.id, ptl.trl_antes, ptl.trl_despues, ptl.creado_en,
               p.titulo AS proyecto_titulo
        FROM proyecto_trl_log ptl
        JOIN proyecto p ON p.id = ptl.proyecto_id
        WHERE ptl.cambiado_por = $1
        ORDER BY ptl.creado_en DESC
    """, uid) if uid else []

    return VinculadorDetail(
        **dict(row),
        iniciativas=[dict(r) for r in iniciativas],
        hitos=[dict(r) for r in hitos],
        proyectos=[dict(r) for r in proyectos],
        trl_changes=[dict(r) for r in trl_changes],
    )


# ── Actualizar vinculador (zona, activo) ──────────────────────

@router.patch("/vinculadores/{vid}", response_model=VinculadorList)
async def patch_vinculador(
    vid: int, body: VinculadorPatch,
    db: asyncpg.Connection = Depends(get_db),
):
    existing = await db.fetchrow("SELECT id FROM vinculador WHERE id = $1", vid)
    if not existing:
        raise HTTPException(404, "Vinculador no encontrado")

    updates, args = [], []
    if body.zona_id is not None:
        args.append(body.zona_id)
        updates.append(f"zona_id = ${len(args)}")
    if body.activo is not None:
        args.append(body.activo)
        updates.append(f"activo = ${len(args)}")
    if body.nombre is not None:
        args.append(body.nombre)
        updates.append(f"nombre = ${len(args)}")

    if not updates:
        raise HTTPException(422, "No se enviaron campos para actualizar")

    args.append(vid)
    await db.execute(
        f"UPDATE vinculador SET {', '.join(updates)} WHERE id = ${len(args)}", *args
    )

    row = await db.fetchrow("""
        SELECT v.id, v.nombre, v.email, v.activo, v.zona_id, v.usuario_id,
               z.nombre AS zona_nombre, v.creado_en,
               COUNT(DISTINCT i.id) AS total_iniciativas,
               COUNT(DISTINCT h.id) AS total_hitos,
               COUNT(DISTINCT p.id) AS total_proyectos
        FROM vinculador v
        LEFT JOIN zona z ON z.id = v.zona_id
        LEFT JOIN iniciativa i ON i.vinculador_id = v.id
        LEFT JOIN hito h       ON h.creado_por = v.usuario_id
        LEFT JOIN proyecto p   ON p.vinculador_id = v.id
        WHERE v.id = $1
        GROUP BY v.id, z.nombre
    """, vid)
    return VinculadorList(**dict(row))


# ── Resumen global de actividad ───────────────────────────────

@router.get("/resumen", response_model=ActividadResumen)
async def get_resumen(db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("""
        SELECT
            (SELECT COUNT(*) FROM vinculador WHERE activo = TRUE)   AS vinculadores_activos,
            (SELECT COUNT(*) FROM iniciativa)                        AS total_iniciativas,
            (SELECT COUNT(*) FROM hito)                              AS total_hitos,
            (SELECT COUNT(*) FROM proyecto)                          AS total_proyectos,
            (SELECT COUNT(*) FROM proyecto_trl_log)                  AS total_trl_changes
    """)
    return ActividadResumen(**dict(row))
