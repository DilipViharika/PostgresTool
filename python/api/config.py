"""Configuration settings for the VIGIL FastAPI backend."""

from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://localhost:5432/vigil"
    REDIS_URL: str = "redis://localhost:6379"
    NODE_BACKEND_URL: str = "http://localhost:3000"
    PORT: int = 8000
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        """Pydantic config."""

        env_file = ".env"
        case_sensitive = True


settings = Settings()
