from pydantic import BaseModel
from typing import Optional


class ActorPatch(BaseModel):
    etapa: Optional[str] = None


class ServiceSummary(BaseModel):
    id: int
    tipo_servicio: str
    area_tematica: str
    disponibilidad: str


class NeedSummary(BaseModel):
    id: int
    tipo_servicio: str
    urgencia: str


class ContactoSummary(BaseModel):
    id: int
    nombre: str
    cargo: Optional[str]
    email: Optional[str]
    telefono: Optional[str]
    es_principal: bool


class ContactoCreate(BaseModel):
    nombre: str
    cargo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    es_principal: bool = False


class ContactoPatch(BaseModel):
    nombre: Optional[str] = None
    cargo: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    es_principal: Optional[bool] = None


class ActorBase(BaseModel):
    id: int
    nombre: str
    tipo: str
    etapa: str | None
    sitio_web: str | None
    descripcion: str | None


class ActorList(ActorBase):
    total_servicios: int
    total_necesidades: int


class ActorDetail(ActorBase):
    certificaciones: list[str]
    servicios: list[ServiceSummary]
    necesidades: list[NeedSummary]
    contactos: list[ContactoSummary]
