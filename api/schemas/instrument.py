from pydantic import BaseModel


class InstrumentItem(BaseModel):
    id: int
    nombre: str
    tipo: str
    organismo: str
    sectores_elegibles: str | None
    status: str
    url: str | None
    monto_maximo: str | None
    cobertura_porcentaje: float | None
    plazo_ejecucion: str | None
    contrapartida: str | None
    gastos_elegibles: str | None
    descripcion_extendida: str | None
