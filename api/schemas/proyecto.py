from datetime import date, datetime
from pydantic import BaseModel


# ── Actores del proyecto ──────────────────────────────────────

class ProyectoActorAdd(BaseModel):
    actor_id: int
    rol: str | None = None


class ProyectoActorOut(BaseModel):
    actor_id: int
    actor_nombre: str
    actor_tipo: str
    rol: str | None


# ── Instrumentos del proyecto ─────────────────────────────────

class ProyectoInstrumentoAdd(BaseModel):
    instrumento_id: int


class ProyectoInstrumentoOut(BaseModel):
    instrumento_id: int
    nombre: str
    tipo: str


# ── Hitos del proyecto ────────────────────────────────────────

class ProyectoHitoCreate(BaseModel):
    tipo: str
    descripcion: str | None = None
    fecha: date
    evidencia_url: str | None = None
    creado_por: int | None = None


class ProyectoHitoOut(BaseModel):
    id: int
    tipo: str
    descripcion: str | None
    fecha: date
    evidencia_url: str | None
    creado_por: int | None
    creado_en: datetime


# ── TRL log ───────────────────────────────────────────────────

class TRLLogOut(BaseModel):
    id: int
    trl_antes: int | None
    trl_despues: int
    creado_en: datetime


# ── Proyecto ──────────────────────────────────────────────────

class ProyectoCreate(BaseModel):
    titulo: str
    descripcion: str | None = None
    trl: int | None = None
    area_tematica: str | None = None
    estado: str = "activo"
    apoyos_buscados: list[str] = []
    iniciativa_id: int | None = None
    creado_por: int | None = None


class ProyectoPatch(BaseModel):
    titulo: str | None = None
    descripcion: str | None = None
    trl: int | None = None
    area_tematica: str | None = None
    estado: str | None = None
    apoyos_buscados: list[str] | None = None
    iniciativa_id: int | None = None
    cambiado_por: int | None = None


class ProyectoList(BaseModel):
    id: int
    titulo: str
    trl: int | None
    area_tematica: str | None
    estado: str
    apoyos_buscados: list[str] = []
    iniciativa_id: int | None
    iniciativa_titulo: str | None
    total_actores: int
    actor_ids: list[int] = []
    creado_en: datetime
    actualizado_en: datetime


class ProyectoDetail(BaseModel):
    id: int
    titulo: str
    descripcion: str | None
    trl: int | None
    area_tematica: str | None
    estado: str
    apoyos_buscados: list[str] = []
    iniciativa_id: int | None
    iniciativa_titulo: str | None
    creado_en: datetime
    actualizado_en: datetime
    actores: list[ProyectoActorOut]
    instrumentos: list[ProyectoInstrumentoOut]
    historial_trl: list[TRLLogOut]
    hitos: list[ProyectoHitoOut]


# ── Zona ──────────────────────────────────────────────────────

class ZonaCreate(BaseModel):
    nombre: str


class ZonaPatch(BaseModel):
    activa: bool | None = None


class ZonaOut(BaseModel):
    id: int
    nombre: str
    activa: bool
    creado_en: datetime
