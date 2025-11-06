from __future__ import annotations

from datetime import datetime, timezone

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from . import generator
from .schemas import BatchResponse, Episode, HealthResponse


app = FastAPI(
    title="TouchBench v0 API",
    version="0.1.0",
    description="Synthetic tactile data generation service for TouchBench v0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="touchbench-api",
        timestamp=datetime.now(timezone.utc),
    )


@app.get("/api/generate_tactile", response_model=Episode, tags=["generation"])
async def generate_tactile_episode() -> Episode:
    return generator.generate_episode()


@app.get("/api/generate_batch", response_model=BatchResponse, tags=["generation"])
async def generate_batch(
    n: int = Query(10, ge=1, le=100, description="Number of tactile episodes to generate"),
) -> BatchResponse:
    episodes = [generator.generate_episode() for _ in range(n)]
    metrics = generator.compute_batch_metrics(episodes)
    return BatchResponse(episodes=episodes, metrics=metrics)
