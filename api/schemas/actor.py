from pydantic import BaseModel


class ServiceSummary(BaseModel):
    id: int
    tipo_servicio: str
    area_tematica: str
    disponibilidad: str


class NeedSummary(BaseModel):
    id: int
    tipo_servicio: str
    urgencia: str


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
