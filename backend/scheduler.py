import schedule, time, logging, json, uuid
import redis
from modules.trend_hunter import fetch_all_trends
from modules.script_gen import generate_script
from modules.voice_gen import generate_voice
from modules.image_gen import generate_images
from modules.video_editor import create_reel
from modules.publisher import publish_reel
from config import settings
from db.database import init_db

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger("ReelForge")
r = redis.from_url(settings.REDIS_URL, decode_responses=True)


def run_pipeline():
    log.info("Pipeline started")
    try:
        trends = fetch_all_trends()
        if not trends:
            log.warning("No trends found")
            return
        trend = trends[0]
        script = generate_script(trend)
        job_id = str(uuid.uuid4())[:8]
        audio_path = generate_voice(script, job_id)
        image_paths = generate_images(script, job_id)
        job = {
            "id": job_id,
            "script": script,
            "audio_path": audio_path,
            "image_paths": image_paths,
        }
        video_path = create_reel(job)
        job["video_path"] = video_path
        r.lpush(
            "review_queue",
            json.dumps(
                {
                    "id": job_id,
                    "video": video_path,
                    "script": script,
                    "status": "awaiting_review",
                }
            ),
        )
        log.info(f"Job {job_id} -> review queue OK")
    except Exception as e:
        log.error(f"Pipeline error: {e}", exc_info=True)


def auto_publish_approved():
    raw = r.rpop("approved_queue")
    if raw:
        job = json.loads(raw)
        publish_reel(job)


if __name__ == "__main__":
    init_db()
    schedule.every(settings.TREND_INTERVAL_MINUTES).minutes.do(run_pipeline)
    schedule.every().day.at(settings.DAILY_PUBLISH_TIME).do(auto_publish_approved)
    log.info(f"Scheduler running -- publish at {settings.DAILY_PUBLISH_TIME}")
    while True:
        schedule.run_pending()
        time.sleep(60)
