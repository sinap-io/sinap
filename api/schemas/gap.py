from pydantic import BaseModel


class GapItem(BaseModel):
    tipo_servicio: str
    area_tematica: str
    demanda: int
    oferta_disponible: int
    actores_demandantes: str | None


class GapSummary(BaseModel):
    total_gaps: int
    total_parcial: int
    total_demanda: int


class SearchLog(BaseModel):
    consulta: str
    creado_en: str
