# TouchBench v0 — Synthetic Tactile Data Demo

TouchBench v0 is a full-stack demo showcasing synthetic tactile sensing episodes for robotic grasp benchmarking. It combines a FastAPI backend that procedurally generates tactile pressure maps with a Next.js + Tailwind frontend that visualizes time-varying contact patterns in real time.

## Project structure

- `backend/` — FastAPI service that synthesizes tactile episodes and batch datasets.
- `frontend/` — Next.js 14 (App Router) client for interactive exploration and download of generated data.
- `.env.example` — shared environment variable template for configuring the frontend API base URL.

## Prerequisites

- Python 3.12+
- Node.js 18+ (or the LTS required by Next.js 14)

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API exposes:

- `GET /api/generate_tactile` — single tactile episode with 10-frame pressure series, metadata, and grasp success estimate.
- `GET /api/generate_batch?n=10` — batch generator returning `n` episodes plus aggregate success/variance metrics.
- `GET /api/health` — health/readiness probe.

All responses are CORS-enabled for local development.

## Frontend setup

```bash
cd frontend
cp ../.env.example .env.local
npm install
npm run dev
```

Navigate to <http://localhost:3000> to explore generated episodes. The UI provides:

- Live pressure heatmap animation across 10 frames (play/pause + scrubber)
- Timeline chart (Recharts) for per-frame pressure statistics
- Episode metadata, grasp success indication, and download controls (JSON + CSV)
- Batch generation trigger and historical success/variance analytics

Ensure the backend server is running on the host specified by `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8000`).

## Deployment notes

- The backend can be hosted on any ASGI-compatible platform (Render, Railway, etc.).
- The frontend consumes the API via REST; update `.env.local` with the deployed backend URL before building for production.

## License

This project is provided as a demo scaffold for TouchBench v0. Adapt or extend as needed for your tactile dataset experiments.