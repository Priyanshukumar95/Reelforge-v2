<<<<<<< HEAD
from sqlalchemy import create_engine
from db.models import Base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./reelforge.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


def init_db():
    # Here you can create tables later
    pass


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
=======
# backend/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from db.models import Base, ReelJob, Schedule
from config import settings
import logging

log = logging.getLogger("Database")
engine = None
SessionLocal = None

def init_db():
    global engine, SessionLocal
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
        if "sqlite" in settings.DATABASE_URL else {},
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine)
    # Seed default schedule row if missing
    with get_session() as db:
        if db.query(Schedule).count() == 0:
            db.add(Schedule())
            db.commit()
    log.info("[DB] Initialized")

@contextmanager
def get_session() -> Session:
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def get_db_stats() -> dict:
    with get_session() as db:
        return {
            "total":     db.query(ReelJob).count(),
            "pending":   db.query(ReelJob).filter_by(
                           status="awaiting_review").count(),
            "published": db.query(ReelJob).filter_by(
                           status="published").count(),
            "failed":    db.query(ReelJob).filter_by(
                           status="failed").count(),
        }
>>>>>>> origin/dev
