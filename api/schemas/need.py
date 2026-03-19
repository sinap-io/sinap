from pydantic import BaseModel


class NeedItem(BaseModel):
    actor: str
    tipo_actor: str
    area_tematica: str
    tipo_servicio: str
    descripcion: str | None
    descripcion_extendida: str | None
    urgencia: str
    status: str
