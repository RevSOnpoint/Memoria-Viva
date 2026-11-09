from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.config import settings
from app.routers import (
    auth,
    memorias,
    consentimientos,
    aportes,
    validacion,
    busqueda,
    narrador,
    admin
)

# Crear tablas en base de datos si no existen
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de datos semilla si la base de datos está vacía
    from seed.init_seed import run_seed, run_region_seed
    db = SessionLocal()
    try:
        run_seed(db)
        run_region_seed(db)
    except Exception as e:
        print(f"Aviso durante seed en inicio: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="Memoria Viva API - Fundación Legado Vivo",
    description="Plataforma de preservación de memoria histórica comunitaria en Palmares, Costa Rica",
    version="1.0.0",
    lifespan=lifespan
)

# Configuración de CORS para interactuar fluidamente con el frontend en React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers
app.include_router(auth.router)
app.include_router(memorias.router)
app.include_router(consentimientos.router)
app.include_router(aportes.router)
app.include_router(validacion.router)
app.include_router(busqueda.router)
app.include_router(narrador.router)
app.include_router(admin.router)

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "app": "Memoria Viva",
        "organization": "Fundación Legado Vivo (Palmares, Costa Rica)",
        "ai_mode": settings.AI_MODE
    }
