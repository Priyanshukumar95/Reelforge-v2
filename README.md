# ReelForge AI

Automated AI-powered short-form video pipeline.

## Team
- Member 1: Backend Core (trend hunter, script gen, scheduler, FastAPI)
- Member 2: Media Pipeline (voice, images, video editing, publishing)
- Member 3: Frontend (React dashboard, queue, settings)
- Member 4: Lead / DevOps (DB, Docker, GitHub, integration)

## Quick Start

### Local Development
```bash
# Terminal 1 – Redis
redis-server

# Terminal 2 – Backend
cd backend && source ../venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 3 – Scheduler
cd backend && source ../venv/bin/activate
python scheduler.py

# Terminal 4 – Frontend
cd frontend && npm install && npm run dev
```

### Docker (Full Stack)
```bash
cp .env.example .env   # fill in your API keys
docker-compose up --build -d
# Open: http://localhost:3000
```
## Installation Note
Before running `pip install -r requirements.txt`, always run:
```bash
pip install setuptools
```
This is required for openai-whisper to build correctly on all platforms.