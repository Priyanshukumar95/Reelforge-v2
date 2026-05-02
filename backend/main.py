# backend/main.py
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List
import redis, json, uuid, asyncio
from config import settings
from db.database import init_db, get_session
from db.models import Schedule
from modules.trend_hunter import fetch_all_trends

# ── App startup ────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="ReelForge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

r = redis.from_url(settings.REDIS_URL, decode_responses=True)
clients: list[WebSocket] = []


# ── /api/generate  (new — required by M3 frontend) ────────────────────────────


class GenerateRequest(BaseModel):
    topic: str
    prompt: str
    style: str = "cinematic"
    effects: List[str] = []
    duration: str = "30s"


@app.post("/api/generate")
async def generate_video(req: GenerateRequest):
    job_id = str(uuid.uuid4())[:8]

    async def run_pipeline_task():
        try:
            from modules.script_gen import generate_script

            trend = {
                "id": job_id,
                "source": "user",
                "title": req.topic,
                "link": "",
                "score": 1.0,
                "fetched": "",
            }
            script = generate_script(trend)
            r.lpush(
                "review_queue",
                json.dumps(
                    {
                        "id": job_id,
                        "script": script,
                        "status": "awaiting_review",
                        "topic": req.topic,
                        "prompt": req.prompt,
                        "style": req.style,
                    }
                ),
            )
            await broadcast(
                {"type": "job_created", "id": job_id, "status": "processing"}
            )
        except Exception as e:
            print(f"[Generate] Error: {e}")
            await broadcast({"type": "job_error", "id": job_id, "error": str(e)})

    asyncio.create_task(run_pipeline_task())
    return {
        "job_id": job_id,
        "status": "processing",
        "videoUrl": "http://localhost:8000/outputs/something.mp4",
        "message": "Pipeline started. Check /api/queue for status.",
    }


# ── /api/stats ─────────────────────────────────────────────────────────────────


@app.get("/api/stats")
async def get_stats():
    total = r.llen("review_queue") + r.llen("approved_queue")
    pending = r.llen("review_queue")
    published = r.llen("approved_queue")
    failed = 0
    return {
        "total": total,
        "pending": pending,
        "published": published,
        "failed": failed,
    }


# ── /api/queue ─────────────────────────────────────────────────────────────────


@app.get("/api/queue")
async def get_queue():
    items = r.lrange("review_queue", 0, -1)
    return [json.loads(i) for i in items]


# ── /api/jobs approve / reject ─────────────────────────────────────────────────


@app.post("/api/jobs/{job_id}/approve")
async def approve(job_id: str):
    items = r.lrange("review_queue", 0, -1)
    for item in items:
        j = json.loads(item)
        if j["id"] == job_id:
            j["status"] = "approved"
            r.lrem("review_queue", 0, item)
            r.lpush("approved_queue", json.dumps(j))
            await broadcast({"type": "approved", "id": job_id})
            return {"ok": True}
    return {"ok": False, "error": "Not found"}


@app.post("/api/jobs/{job_id}/reject")
async def reject(job_id: str):
    items = r.lrange("review_queue", 0, -1)
    for item in items:
        j = json.loads(item)
        if j["id"] == job_id:
            r.lrem("review_queue", 0, item)
            return {"ok": True}
    return {"ok": False}


# ── /api/pipeline/trigger ──────────────────────────────────────────────────────


@app.post("/api/pipeline/trigger")
async def trigger():
    asyncio.create_task(asyncio.to_thread(fetch_all_trends))
    return {"ok": True, "msg": "Pipeline triggered"}


# ── /api/schedule ──────────────────────────────────────────────────────────────


@app.get("/api/schedule")
async def get_schedule():
    with get_session() as db:
        s = db.query(Schedule).first()
        return {
            "publish_time": s.publish_time,
            "max_per_day": s.max_per_day,
        }


@app.post("/api/schedule")
async def set_schedule(data: dict):
    with get_session() as db:
        s = db.query(Schedule).first()
        if data.get("publish_time"):
            s.publish_time = data["publish_time"]
        if data.get("max_per_day"):
            s.max_per_day = int(data["max_per_day"])
        db.commit()
    return {"ok": True}


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        clients.remove(ws)


async def broadcast(data: dict):
    dead = []
    for c in clients:
        try:
            await c.send_json(data)
        except:
            dead.append(c)
    for d in dead:
        clients.remove(d)
