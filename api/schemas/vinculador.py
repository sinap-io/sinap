from datetime import date, datetime
from pydantic import BaseModel


# ── Vinculador ────────────────────────────────────────────────────────────────

class VinculadorCreate(BaseModel):
    nombre: str
    email: str


class VinculadorOut(BaseModel):
    id: int
    nombre: str
    email: str
    activo: bool
    creado_en: datetime


# ── Hito ──────────────────────────────────────────────────────────────────────

class HitoCreate(BaseModel):
    tipo: str
    descripcion: str | None = None
    fecha: date
    evidencia_url: str | None = None


class HitoOut(BaseModel):
    id: int
    tipo: str
    descripcion: str | None
    fecha: date
    evidencia_url: str | None
    creado_en: datetime


# ── Caso de vinculación ───────────────────────────────────────────────────────

class CasoCreate(BaseModel):
    actor_demandante_id: int
    necesidad_id: int
    vinculador_id: int
    actor_oferente_id: int | None = None
    capacidad_id: int | None = None
    notas: str | None = None


class CasoPatch(BaseModel):
    estado: str | None = None
    actor_oferente_id: int | None = None
    capacidad_id: int | None = None
    notas: str | None = None


class CasoList(BaseModel):
    id: int
    estado: str
    notas: str | None
    creado_en: datetime
    actualizado_en: datetime
    # Actor demandante
    demandante_id: int
    demandante_nombre: str
    # Actor oferente (puede estar vacío si el caso se abrió sin match)
    oferente_id: int | None
    oferente_nombre: str | None
    # Necesidad
    necesidad_id: int
    necesidad_tipo: str
    # Vinculador asignado
    vinculador_id: int
    vinculador_nombre: str


class CasoDetail(CasoList):
    capacidad_id: int | None
    capacidad_tipo: str | None
    hitos: list[HitoOut]
