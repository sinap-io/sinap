from datetime import date, datetime
from pydantic import BaseModel


# ── Hito ──────────────────────────────────────────────────────

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


# ── Actor en la iniciativa ────────────────────────────────────

class IniciativaActorAdd(BaseModel):
    actor_id: int
    rol: str


class IniciativaActorOut(BaseModel):
    actor_id: int
    actor_nombre: str
    actor_tipo: str
    rol: str


# ── Relaciones (necesidad, capacidad, instrumento) ────────────

class LinkNecesidad(BaseModel):
    necesidad_id: int


class LinkCapacidad(BaseModel):
    capacidad_id: int


class LinkInstrumento(BaseModel):
    instrumento_id: int


class NecesidadRef(BaseModel):
    necesidad_id: int
    actor_nombre: str
    tipo_servicio: str


class CapacidadRef(BaseModel):
    capacidad_id: int
    actor_nombre: str
    tipo_servicio: str


class InstrumentoRef(BaseModel):
    instrumento_id: int
    nombre: str
    tipo: str


# ── Iniciativa ────────────────────────────────────────────────

class IniciativaCreate(BaseModel):
    tipo: str
    titulo: str
    descripcion: str | None = None
    vinculador_id: int | None = None
    notas: str | None = None


class IniciativaPatch(BaseModel):
    titulo: str | None = None
    descripcion: str | None = None
    estado: str | None = None
    vinculador_id: int | None = None
    notas: str | None = None


class IniciativaList(BaseModel):
    id: int
    tipo: str
    titulo: str
    estado: str
    vinculador_nombre: str | None
    total_actores: int
    total_hitos: int
    creado_en: datetime
    actualizado_en: datetime


class IniciativaDetail(BaseModel):
    id: int
    tipo: str
    titulo: str
    descripcion: str | None
    estado: str
    notas: str | None
    vinculador_id: int | None
    vinculador_nombre: str | None
    creado_en: datetime
    actualizado_en: datetime
    actores: list[IniciativaActorOut]
    necesidades: list[NecesidadRef]
    capacidades: list[CapacidadRef]
    instrumentos: list[InstrumentoRef]
    hitos: list[HitoOut]
