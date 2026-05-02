# backend/modules/video_editor.py
from moviepy.editor import (
    ImageClip, AudioFileClip,
    concatenate_videoclips, CompositeVideoClip, TextClip
)
from moviepy.video.tools.subtitles import SubtitlesClip
from moviepy.config import change_settings
import whisper, pathlib, logging, os, platform
from config import settings

# Auto-detect OS and set correct ImageMagick path
if platform.system() == "Windows":
    change_settings({"IMAGEMAGICK_BINARY": r"C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"})
else:
    # Linux / Docker
    change_settings({"IMAGEMAGICK_BINARY": "/usr/bin/convert"})

log = logging.getLogger("VideoEditor")
_whisper_model = None

def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model("base")
    return _whisper_model

def add_captions(video, audio_path: str):
    model = get_whisper()
    result = model.transcribe(audio_path, fp16=False)

    # Correct format for SubtitlesClip — ((start, end), text)
    subs = [
        ((seg["start"], seg["end"]), seg["text"].strip())
        for seg in result["segments"]
    ]

    if not subs:
        log.warning("[Editor] No subtitles generated, skipping captions")
        return video

    def make_caption(txt):
        return TextClip(
            txt, fontsize=44, font="DejaVu-Sans-Bold",
            color="white", stroke_color="black",
            stroke_width=2, size=(900, None), method="caption",
        )

    sub_clip = SubtitlesClip(subs, make_caption)
    return CompositeVideoClip([
        video,
        sub_clip.set_pos(("center", 0.75), relative=True),
    ])

def create_reel(job: dict) -> str:
    images     = job["image_paths"]
    audio_path = job["audio_path"]
    job_id     = job["id"]

    # Use actual audio duration instead of hardcoded 30 seconds
    audio    = AudioFileClip(audio_path)
    duration = audio.duration
    log.info(f"[Editor] Audio duration: {duration:.2f}s")

    dur_each = duration / max(len(images), 1)
    clips    = []

    for img_path in images:
        c = (ImageClip(img_path)
             .set_duration(dur_each)
             .resize((1080, 1920))
             .fadein(0.3).fadeout(0.3))
        c = c.resize(lambda t: 1 + 0.02 * t)
        clips.append(c)

    video = concatenate_videoclips(clips, method="compose")
    video = video.set_audio(audio)

    # Try captions — if it fails, video still gets created without them
    try:
        video = add_captions(video, audio_path)
    except Exception as e:
        log.warning(f"[Editor] Captions failed, skipping: {e}")

    out = pathlib.Path(settings.OUTPUT_DIR)
    out.mkdir(exist_ok=True)
    out_path = str(out / f"{job_id}.mp4")

    video.write_videofile(
        out_path, fps=30, codec="libx264",
        audio_codec="aac", bitrate="4000k",
        logger=None,
    )
    log.info(f"[Editor] Done: {out_path}")
    return out_path