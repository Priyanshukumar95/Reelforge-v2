FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg imagemagick libmagic1 \
    && python3 -c "\
import re; \
content = open('/etc/ImageMagick-7/policy.xml').read(); \
content = content.replace('rights=\"none\" pattern=\"@*\"', 'rights=\"read|write\" pattern=\"@*\"'); \
open('/etc/ImageMagick-7/policy.xml', 'w').write(content); \
print('Patched OK')" \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip setuptools==69.5.1 wheel
RUN pip install --no-cache-dir -r requirements.txt --no-build-isolation
RUN python -c "import whisper; whisper.load_model('base')"
COPY . .
EXPOSE 8000