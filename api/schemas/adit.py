from datetime import date, datetime
from pydantic import BaseModel


class VinculadorList(BaseModel):
    id: int
    nombre: str
    email: str | None
    activo: bool
    zona_id: int | None
    zona_nombre: str | None
    usuario_id: int | None
    total_iniciativas: int
    total_hitos: int
    total_proyectos: int
    creado_en: datetime


class IniciativaResumen(BaseModel):
    id: int
    titulo: str
    tipo: str
    estado: str
    creado_en: datetime


class HitoResumen(BaseModel):
    id: int
    tipo: str
    descripcion: str | None
    fecha: date
    iniciativa_titulo: str
    creado_en: datetime


class ProyectoResumen(BaseModel):
    id: int
    titulo: str
    trl: int | None
    estado: str
    creado_en: datetime


class TRLChangeResumen(BaseModel):
    id: int
    trl_antes: int | None
    trl_despues: int | None
    proyecto_titulo: str
    creado_en: datetime


class VinculadorDetail(BaseModel):
    id: int
    nombre: str
    email: str | None
    activo: bool
    zona_id: int | None
    zona_nombre: str | None
    usuario_id: int | None
    creado_en: datetime
    iniciativas: list[IniciativaResumen]
    hitos: list[HitoResumen]
    proyectos: list[ProyectoResumen]
    trl_changes: list[TRLChangeResumen]


class VinculadorPatch(BaseModel):
    nombre: str | None = None
    zona_id: int | None = None
    activo: bool | None = None


class ActividadResumen(BaseModel):
    vinculadores_activos: int
    total_iniciativas: int
    total_hitos: int
    total_proyectos: int
    total_trl_changes: int
