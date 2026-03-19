from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    consulta: str = Field(..., min_length=10, max_length=1000,
                          description="Consulta en lenguaje libre")


class SearchResponse(BaseModel):
    respuesta: str                    # Texto legible para el usuario
    necesidad_cubierta: bool
    cobertura_parcial: bool
    gaps_detectados: list[str]        # Lista de gaps registrados en BD
