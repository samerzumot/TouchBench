# TouchBench v0 - Backend API

FastAPI backend that generates synthetic tactile data using Perlin noise and physics-based models.

## Features

- **Dynamic data generation** - No hardcoded samples
- **Realistic pressure maps** - Using Perlin noise and material properties
- **Time-series support** - Generate temporal sequences
- **Batch generation** - Create multiple episodes at once
- **Material-aware** - Different materials have different pressure characteristics

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### `GET /api/generate_tactile`
Generate a single synthetic tactile episode.

**Response:**
```json
{
  "episode_id": "touch_a1b2c3d4",
  "object": "ceramic_mug",
  "material": "ceramic",
  "pressure_map": [[0.1, 0.3, ...], ...],
  "timestamp": "2025-11-06T19:00:00Z",
  "grasp_success": true,
  "mean_pressure": 0.542,
  "max_pressure": 0.875,
  "variance": 0.042
}
```

### `GET /api/generate_timeseries?frames=10`
Generate a time-series of tactile episodes (default 10 frames).

**Parameters:**
- `frames` (optional): Number of frames (2-50, default 10)

### `GET /api/generate_batch?n=10`
Generate multiple independent episodes.

**Parameters:**
- `n` (optional): Number of episodes (1-100, default 10)

## Interactive Docs

Visit `http://localhost:8000/docs` for interactive API documentation.
