# backend/modules/image_gen.py
import httpx, pathlib, logging, time
from urllib.parse import quote
from config import settings

log = logging.getLogger("ImageGen")

def generate_images(
    script: dict, job_id: str, count: int = 5
) -> list[str]:
    """Generate 'count' vertical images using Pollinations AI (free, no API key) → return paths."""
    out_dir = pathlib.Path(settings.MEDIA_DIR) / "images"
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = []

    hook = script.get("hook", "viral trending content")[:100]

    for i in range(count):
        prompt = f"cinematic 9:16 vertical reel about {hook}, high quality, no text, no watermark"
        url = (
            f"https://image.pollinations.ai/prompt/"
            f"{quote(prompt)}"
            f"?width=1080&height=1920&nologo=true"
        )

        for attempt in range(3):
            try:
                data = httpx.get(url, timeout=60).content
                path = out_dir / f"{job_id}_{i}.png"
                path.write_bytes(data)
                paths.append(str(path))
                log.info(f"[Image] {i+1}/{count} saved")
                break
            except Exception as e:
                log.warning(f"[Image] attempt {attempt+1}: {e}")
                if attempt < 2:
                    time.sleep(2)

    return paths