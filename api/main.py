from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.connection import get_pool, settings
from routers import actors, services, needs, instruments, gaps, search, vinculador, iniciativas, informe, radar
from routers.proyectos import router as proyectos_router, zonas_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar pool de conexiones al arrancar
    await get_pool()
    yield


app = FastAPI(
    title="SINAP API",
    description="Inteligencia territorial para el ecosistema biotech de Córdoba",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(actors.router)
app.include_router(services.router)
app.include_router(needs.router)
app.include_router(instruments.router)
app.include_router(gaps.router)
app.include_router(search.router)
app.include_router(vinculador.router)
app.include_router(iniciativas.router)
app.include_router(informe.router)
app.include_router(radar.router)
app.include_router(proyectos_router)
app.include_router(zonas_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
