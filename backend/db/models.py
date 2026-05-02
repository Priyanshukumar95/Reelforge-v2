# backend/db/models.py
from sqlalchemy import (
    Column, String, Float, DateTime,
    Text, JSON, Integer
)
from sqlalchemy.orm import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def gen_id():
    return str(uuid.uuid4())[:8]

class Trend(Base):
    __tablename__ = "trends"
    id      = Column(String, primary_key=True, default=gen_id)
    title   = Column(String,   nullable=False)
    source  = Column(String,   nullable=False)
    score   = Column(Float,    default=0.0)
    link    = Column(String)
    fetched = Column(DateTime, default=datetime.utcnow)

class ReelJob(Base):
    __tablename__ = "reel_jobs"
    id          = Column(String, primary_key=True, default=gen_id)
    trend_id    = Column(String)
    script      = Column(JSON)
    audio_path  = Column(String)
    image_paths = Column(JSON)
    video_path  = Column(String)
    theme       = Column(String,  default="dark")
    status      = Column(String,  default="pending")
    # Status flow: pending → processing → awaiting_review
    #              → approved → published | rejected | failed
    error_msg   = Column(Text,    nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, onupdate=datetime.utcnow)

class PublishRecord(Base):
    __tablename__ = "publish_records"
    id           = Column(String, primary_key=True, default=gen_id)
    job_id       = Column(String, nullable=False)
    platform     = Column(String)   # tiktok | instagram
    platform_id  = Column(String)
    caption      = Column(Text)
    published_at = Column(DateTime, default=datetime.utcnow)
    status       = Column(String)   # success | failed

class Schedule(Base):
    __tablename__ = "schedules"
    id           = Column(String, primary_key=True, default="main")
    publish_time = Column(String,  default="18:00")
    max_per_day  = Column(Integer, default=3)
    platforms    = Column(JSON,    default=["tiktok", "instagram"])
    theme        = Column(String,  default="dark")
    active       = Column(String,  default="true")