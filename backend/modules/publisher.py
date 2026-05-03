# backend/modules/publisher.py
import os, httpx, logging
from pathlib import Path
from config import settings

log = logging.getLogger("Publisher")

def publish_tiktok(video_path: str, caption: str) -> dict:
    token = settings.TIKTOK_ACCESS_TOKEN
    size  = Path(video_path).stat().st_size
    try:
        init = httpx.post(
            "https://open.tiktokapis.com/v2/post/publish"
            "/inbox/video/init/",
            headers={"Authorization": f"Bearer {token}",
                     "Content-Type": "application/json"},
            json={"post_info": {
                    "title": caption[:150],
                    "privacy_level": "PUBLIC_TO_EVERYONE",
                    "disable_comment": False},
                  "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": size,
                    "chunk_size": min(size, 10_000_000),
                    "total_chunk_count": 1}},
            timeout=30,
        ).json()

        upload_url = init["data"]["upload_url"]
        publish_id = init["data"]["publish_id"]

        with open(video_path, "rb") as f:
            httpx.put(upload_url, content=f.read(),
                      headers={"Content-Type": "video/mp4"},
                      timeout=120)

        log.info(f"[TikTok] Published: {publish_id}")
        return {"platform": "tiktok", "id": publish_id}
    except Exception as e:
        log.error(f"[TikTok] Error: {e}")
        return {"platform": "tiktok", "error": str(e)}

def publish_instagram(video_path: str, caption: str) -> dict:
    token = settings.INSTAGRAM_ACCESS_TOKEN
    ig_id = settings.INSTAGRAM_BUSINESS_ID
    base  = "https://graph.instagram.com/v19.0"
    try:
        cont = httpx.post(f"{base}/{ig_id}/media", params={
            "video_url": video_path, "media_type": "REELS",
            "caption": caption, "access_token": token},
            timeout=30).json()

        res = httpx.post(f"{base}/{ig_id}/media_publish",
            params={"creation_id": cont["id"],
                    "access_token": token},
            timeout=30).json()

        log.info(f"[Instagram] Published: {res['id']}")
        return {"platform": "instagram", "id": res["id"]}
    except Exception as e:
        log.error(f"[Instagram] Error: {e}")
        return {"platform": "instagram", "error": str(e)}

def publish_reel(job: dict) -> list:
    caption = (
        job["script"]["caption"] + "\n\n" +
        " ".join(job["script"]["hashtags"])
    )
    results = []
    for fn in [publish_tiktok, publish_instagram]:
        try:
            res = fn(job["video_path"], caption)
            results.append(res)
        except Exception as e:
            log.error(f"Publish error: {e}")
    return results