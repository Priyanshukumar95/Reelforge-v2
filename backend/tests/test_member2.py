# backend/tests/test_member2.py
import pytest, os
from dotenv import load_dotenv

load_dotenv()


def test_voice_gen_imports():
    from modules.voice_gen import generate_voice

    assert callable(generate_voice)


def test_voice_gen_empty_script():
    from modules.voice_gen import generate_voice

    with pytest.raises(ValueError):
        generate_voice({}, "testjob")


def test_image_gen_imports():
    from modules.image_gen import generate_images

    assert callable(generate_images)


def test_video_editor_imports():
    from modules.video_editor import create_reel

    assert callable(create_reel)


def test_publisher_imports():
    from modules.publisher import publish_reel

    assert callable(publish_reel)
