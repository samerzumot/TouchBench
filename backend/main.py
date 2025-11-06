"""
TouchBench v0 - FastAPI Backend
Generates synthetic tactile data dynamically using Perlin noise
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from datetime import datetime
import uuid
import random

app = FastAPI(title="TouchBench v0 API", version="0.1.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Object and material datasets
OBJECTS = [
    "ceramic_mug", "glass_bottle", "metal_can", "plastic_container",
    "wooden_block", "rubber_ball", "cardboard_box", "foam_cube",
    "steel_bolt", "aluminum_plate", "clay_pot", "silicon_grip",
    "leather_wallet", "fabric_pouch", "paper_cup", "stone_sphere"
]

MATERIALS = {
    "ceramic_mug": "ceramic",
    "glass_bottle": "glass",
    "metal_can": "aluminum",
    "plastic_container": "plastic",
    "wooden_block": "wood",
    "rubber_ball": "rubber",
    "cardboard_box": "cardboard",
    "foam_cube": "foam",
    "steel_bolt": "steel",
    "aluminum_plate": "aluminum",
    "clay_pot": "clay",
    "silicon_grip": "silicon",
    "leather_wallet": "leather",
    "fabric_pouch": "fabric",
    "paper_cup": "paper",
    "stone_sphere": "stone"
}


class TactileEpisode(BaseModel):
    episode_id: str
    object: str
    material: str
    pressure_map: List[List[float]]
    timestamp: str
    grasp_success: bool
    mean_pressure: float
    max_pressure: float
    variance: float


def perlin_noise_2d(shape, scale=10.0, octaves=1, persistence=0.5, seed=None):
    """
    Generate 2D Perlin-like noise using simplex approach
    """
    if seed is not None:
        np.random.seed(seed)
    
    noise = np.zeros(shape)
    amplitude = 1.0
    frequency = 1.0
    max_value = 0.0
    
    for _ in range(octaves):
        # Generate random gradients
        gradient_x = np.random.randn(shape[0] + 1, shape[1] + 1)
        gradient_y = np.random.randn(shape[0] + 1, shape[1] + 1)
        
        # Interpolate
        for i in range(shape[0]):
            for j in range(shape[1]):
                # Bilinear interpolation
                fx = (i % scale) / scale
                fy = (j % scale) / scale
                
                # Get corner gradients
                gx0 = int(i / scale) % (shape[0])
                gy0 = int(j / scale) % (shape[1])
                
                # Simple interpolation
                value = (
                    gradient_x[gx0, gy0] * (1 - fx) * (1 - fy) +
                    gradient_x[gx0 + 1, gy0] * fx * (1 - fy) +
                    gradient_x[gx0, gy0 + 1] * (1 - fx) * fy +
                    gradient_x[gx0 + 1, gy0 + 1] * fx * fy
                )
                
                noise[i, j] += value * amplitude
        
        max_value += amplitude
        amplitude *= persistence
        frequency *= 2
    
    # Normalize to [0, 1]
    noise = (noise + max_value) / (2 * max_value)
    return np.clip(noise, 0, 1)


def generate_realistic_pressure_map(size=5, seed=None, material_hardness=0.5):
    """
    Generate a realistic pressure map using noise and material properties
    """
    if seed is not None:
        np.random.seed(seed)
    
    # Generate base noise pattern
    pressure = perlin_noise_2d((size, size), scale=2.0, octaves=2, seed=seed)
    
    # Add center bias (typical grasp concentrates pressure in center)
    center = size // 2
    y, x = np.ogrid[:size, :size]
    center_dist = np.sqrt((x - center)**2 + (y - center)**2)
    center_mask = 1 - (center_dist / (size / 1.5))
    center_mask = np.clip(center_mask, 0, 1)
    
    # Combine noise with center bias
    pressure = pressure * 0.4 + center_mask * 0.6
    
    # Adjust for material hardness (harder materials = more concentrated pressure)
    pressure = pressure ** (1.5 - material_hardness)
    
    # Add some random sensor noise
    noise = np.random.normal(0, 0.05, (size, size))
    pressure = pressure + noise
    
    # Normalize and clip
    pressure = np.clip(pressure, 0, 1)
    
    return pressure


def get_material_hardness(material: str) -> float:
    """
    Get material hardness factor (0-1)
    """
    hardness_map = {
        "steel": 0.9,
        "aluminum": 0.8,
        "glass": 0.85,
        "ceramic": 0.75,
        "stone": 0.8,
        "wood": 0.6,
        "plastic": 0.5,
        "rubber": 0.3,
        "foam": 0.2,
        "fabric": 0.25,
        "leather": 0.4,
        "paper": 0.3,
        "cardboard": 0.35,
        "clay": 0.5,
        "silicon": 0.4,
    }
    return hardness_map.get(material, 0.5)


def generate_tactile_episode() -> TactileEpisode:
    """
    Generate a single synthetic tactile episode
    """
    # Random object and material
    obj = random.choice(OBJECTS)
    material = MATERIALS[obj]
    
    # Generate unique ID
    episode_id = f"touch_{uuid.uuid4().hex[:8]}"
    
    # Generate pressure map based on material properties
    material_hardness = get_material_hardness(material)
    seed = random.randint(0, 100000)
    pressure_map = generate_realistic_pressure_map(size=5, seed=seed, material_hardness=material_hardness)
    
    # Calculate statistics
    mean_pressure = float(np.mean(pressure_map))
    max_pressure = float(np.max(pressure_map))
    variance = float(np.var(pressure_map))
    
    # Determine grasp success based on pressure distribution
    # Good grasp: mean pressure in sweet spot (0.35-0.7) and not too uneven
    success_score = 0.0
    
    # Check mean pressure
    if 0.35 <= mean_pressure <= 0.7:
        success_score += 0.5
    elif 0.25 <= mean_pressure <= 0.8:
        success_score += 0.3
    
    # Check pressure distribution (lower variance is better)
    if variance < 0.05:
        success_score += 0.5
    elif variance < 0.1:
        success_score += 0.3
    
    # Random factor for realism
    success_score += random.uniform(-0.2, 0.2)
    
    grasp_success = success_score > 0.5
    
    # Convert pressure map to list for JSON serialization
    pressure_map_list = pressure_map.tolist()
    
    return TactileEpisode(
        episode_id=episode_id,
        object=obj,
        material=material,
        pressure_map=pressure_map_list,
        timestamp=datetime.utcnow().isoformat() + "Z",
        grasp_success=grasp_success,
        mean_pressure=round(mean_pressure, 3),
        max_pressure=round(max_pressure, 3),
        variance=round(variance, 3)
    )


def generate_time_series_episode(frames=10) -> List[TactileEpisode]:
    """
    Generate a time-series of tactile episodes (temporal variation)
    """
    # Start with base episode
    obj = random.choice(OBJECTS)
    material = MATERIALS[obj]
    material_hardness = get_material_hardness(material)
    base_seed = random.randint(0, 100000)
    
    episodes = []
    
    for frame_idx in range(frames):
        episode_id = f"touch_{uuid.uuid4().hex[:8]}_f{frame_idx}"
        
        # Generate pressure map with temporal variation
        seed = base_seed + frame_idx * 100
        base_pressure = generate_realistic_pressure_map(size=5, seed=seed, material_hardness=material_hardness)
        
        # Add temporal evolution (simulate grasp tightening or loosening)
        time_factor = np.sin(frame_idx / frames * np.pi)  # Peaks in middle
        pressure_map = base_pressure * (0.8 + 0.4 * time_factor)
        pressure_map = np.clip(pressure_map, 0, 1)
        
        # Calculate statistics
        mean_pressure = float(np.mean(pressure_map))
        max_pressure = float(np.max(pressure_map))
        variance = float(np.var(pressure_map))
        
        # Determine success (best in middle frames)
        success_score = 0.0
        if 0.35 <= mean_pressure <= 0.7:
            success_score += 0.5
        if variance < 0.05:
            success_score += 0.5
        success_score += random.uniform(-0.1, 0.1)
        
        grasp_success = success_score > 0.5
        
        episodes.append(TactileEpisode(
            episode_id=episode_id,
            object=obj,
            material=material,
            pressure_map=pressure_map.tolist(),
            timestamp=datetime.utcnow().isoformat() + "Z",
            grasp_success=grasp_success,
            mean_pressure=round(mean_pressure, 3),
            max_pressure=round(max_pressure, 3),
            variance=round(variance, 3)
        ))
    
    return episodes


@app.get("/")
def root():
    return {
        "message": "TouchBench v0 API",
        "version": "0.1.0",
        "endpoints": {
            "/api/generate_tactile": "Generate a single tactile episode",
            "/api/generate_timeseries": "Generate a time-series episode (10 frames)",
            "/api/generate_batch": "Generate multiple episodes (query param: n)"
        }
    }


@app.get("/api/generate_tactile", response_model=TactileEpisode)
def generate_tactile():
    """
    Generate a single synthetic tactile episode
    """
    return generate_tactile_episode()


@app.get("/api/generate_timeseries", response_model=List[TactileEpisode])
def generate_timeseries(frames: int = Query(default=10, ge=2, le=50)):
    """
    Generate a time-series of tactile episodes with temporal variation
    """
    return generate_time_series_episode(frames=frames)


@app.get("/api/generate_batch", response_model=List[TactileEpisode])
def generate_batch(n: int = Query(default=10, ge=1, le=100)):
    """
    Generate multiple independent tactile episodes
    """
    return [generate_tactile_episode() for _ in range(n)]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
