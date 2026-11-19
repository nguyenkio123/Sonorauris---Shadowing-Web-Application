FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    WHISPER_MODEL=base.en \
    WHISPER_COMPUTE_TYPE=int8 \
    WHISPER_BEAM_SIZE=2 \
    WHISPER_HOST=0.0.0.0

WORKDIR /app

# ffmpeg is required for decoding WebM/Opus audio uploads
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Whisper model into the image to avoid slow cold starts
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('base.en', device='cpu', compute_type='int8')"

COPY whisper_server.py .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn whisper_server:app --host 0.0.0.0 --port ${PORT:-8000}"]
