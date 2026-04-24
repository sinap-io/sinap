from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg

from db.connection import get_db
from schemas.actor import (
    ActorDetail, ActorList, ActorPatch, NeedSummary, ServiceSummary,
    ContactoSummary, ContactoCreate, ContactoPatch,
)

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

    contactos = await db.fetch("""
        SELECT id, nombre, cargo, email, telefono, es_principal
        FROM actor_contacto WHERE actor_id = $1
        ORDER BY es_principal DESC, id ASC
    """, actor_id)

    actor_dict = dict(actor)
    return ActorDetail(
        **{k: v for k, v in actor_dict.items() if k != "certificaciones"},
        certificaciones=actor_dict["certificaciones"] or [],
        servicios=[ServiceSummary(**dict(r)) for r in servicios],
        necesidades=[NeedSummary(**dict(r)) for r in necesidades],
        contactos=[ContactoSummary(**dict(r)) for r in contactos],
    )


ETAPAS_VALIDAS = {"spinoff", "seed", "growth", "consolidada", "publica"}


@router.patch("/{actor_id}", response_model=ActorDetail)
async def patch_actor(
    actor_id: int, body: ActorPatch,
    db: asyncpg.Connection = Depends(get_db),
):
    existing = await db.fetchrow(
        "SELECT id, etapa FROM actor WHERE id = $1", actor_id
    )
    if not existing:
        raise HTTPException(404, "Actor no encontrado")

    if body.etapa is not None:
        if body.etapa not in ETAPAS_VALIDAS:
            raise HTTPException(
                422, f"Etapa inválida. Opciones: {', '.join(sorted(ETAPAS_VALIDAS))}"
            )
        # Registrar en log histórico si la etapa cambió
        if body.etapa != existing["etapa"]:
            await db.execute(
                """UPDATE actor SET etapa = $1, actualizado_en = NOW()
                   WHERE id = $2""",
                body.etapa, actor_id,
            )
            await db.execute(
                """INSERT INTO actor_etapa_log
                   (actor_id, etapa_antes, etapa_despues)
                   VALUES ($1, $2, $3)""",
                actor_id, existing["etapa"], body.etapa,
            )

    return await get_actor(actor_id, db)


# ── Contactos ─────────────────────────────────────────────────

@router.post("/{actor_id}/contactos", response_model=ContactoSummary, status_code=201)
async def crear_contacto(
    actor_id: int, body: ContactoCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    actor = await db.fetchrow("SELECT id FROM actor WHERE id = $1", actor_id)
    if not actor:
        raise HTTPException(404, "Actor no encontrado")

    # Si se marca como principal, quitar flag del anterior principal
    if body.es_principal:
        await db.execute(
            "UPDATE actor_contacto SET es_principal = FALSE WHERE actor_id = $1",
            actor_id,
        )

    row = await db.fetchrow(
        """INSERT INTO actor_contacto (actor_id, nombre, cargo, email, telefono, es_principal)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, nombre, cargo, email, telefono, es_principal""",
        actor_id, body.nombre, body.cargo, body.email, body.telefono, body.es_principal,
    )
    return ContactoSummary(**dict(row))


@router.patch("/{actor_id}/contactos/{contacto_id}", response_model=ContactoSummary)
async def patch_contacto(
    actor_id: int, contacto_id: int, body: ContactoPatch,
    db: asyncpg.Connection = Depends(get_db),
):
    existing = await db.fetchrow(
        "SELECT id FROM actor_contacto WHERE id = $1 AND actor_id = $2",
        contacto_id, actor_id,
    )
    if not existing:
        raise HTTPException(404, "Contacto no encontrado")

    # Si se marca como principal, quitar flag del anterior principal
    if body.es_principal:
        await db.execute(
            "UPDATE actor_contacto SET es_principal = FALSE WHERE actor_id = $1 AND id != $2",
            actor_id, contacto_id,
        )

    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        row = await db.fetchrow(
            "SELECT id, nombre, cargo, email, telefono, es_principal FROM actor_contacto WHERE id = $1",
            contacto_id,
        )
        return ContactoSummary(**dict(row))

    set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
    values = list(fields.values())
    row = await db.fetchrow(
        f"""UPDATE actor_contacto SET {set_clause}
            WHERE id = $1
            RETURNING id, nombre, cargo, email, telefono, es_principal""",
        contacto_id, *values,
    )
    return ContactoSummary(**dict(row))


@router.delete("/{actor_id}/contactos/{contacto_id}", status_code=204)
async def eliminar_contacto(
    actor_id: int, contacto_id: int,
    db: asyncpg.Connection = Depends(get_db),
):
    deleted = await db.fetchval(
        "DELETE FROM actor_contacto WHERE id = $1 AND actor_id = $2 RETURNING 1",
        contacto_id, actor_id,
    )
    if not deleted:
        raise HTTPException(404, "Contacto no encontrado")
