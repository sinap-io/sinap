import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.connection import get_pool, settings
from routers import actors, services, needs, instruments, gaps, search, vinculador, iniciativas, informe, radar, asistente
from routers.proyectos import router as proyectos_router, zonas_router
from routers.adit import router as adit_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar pool de conexiones al arrancar.
    # Si Neon no responde en el momento del startup (timeout de red),
    # la app arranca igual — el pool se crea en el primer request.
    try:
        await get_pool()
        logger.info("Pool de DB inicializado correctamente.")
    except Exception as e:
        logger.warning("No se pudo inicializar el pool al arrancar: %s. Se reintentará en el primer request.", e)
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
app.include_router(adit_router)
app.include_router(asistente.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
