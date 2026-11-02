import os

class Settings:
    AI_MODE: str = os.getenv("AI_MODE", "mock")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./memoria_viva.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "legado-vivo-palmares-secret-key-2026")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1")

settings = Settings()
