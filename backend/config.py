# backend/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"
    TIKTOK_ACCESS_TOKEN: str = ""
    INSTAGRAM_ACCESS_TOKEN: str = ""
    INSTAGRAM_BUSINESS_ID: str = ""
    REDIS_URL: str = "redis://redis:6379"
    DATABASE_URL: str = "sqlite:///./reelforge.db"
    DAILY_PUBLISH_TIME: str = "18:00"
    TREND_INTERVAL_MINUTES: int = 30
    MEDIA_DIR: str = "./media"
    OUTPUT_DIR: str = "./output"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()