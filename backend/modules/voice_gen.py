# backend/modules/voice_gen.py
from gtts import gTTS
import pathlib, logging
from config import settings

log = logging.getLogger("VoiceGen")

def generate_voice(script: dict, job_id: str) -> str:
    """Convert script dict → MP3 file → return path."""
    text = " ".join([
        script.get("hook", ""),
        script.get("body", ""),
        script.get("cta", ""),
    ]).strip()

    if not text:
        raise ValueError("Script text is empty")

    out_dir = pathlib.Path(settings.MEDIA_DIR) / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{job_id}.mp3"

    tts = gTTS(text=text, lang="en", slow=False)
    tts.save(str(out_path))

    log.info(f"[Voice] Saved: {out_path}")
    return str(out_path)