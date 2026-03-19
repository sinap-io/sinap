from pydantic import BaseModel


class ServiceItem(BaseModel):
    actor: str
    tipo_actor: str
    area_tematica: str
    tipo_servicio: str
    descripcion: str | None
    descripcion_extendida: str | None
    disponibilidad: str
