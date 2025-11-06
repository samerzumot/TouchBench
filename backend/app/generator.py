from __future__ import annotations

import math
import random
from datetime import datetime, timezone
from typing import List

import numpy as np
from perlin_noise import PerlinNoise
from uuid import uuid4

from .schemas import BatchMetrics, Episode


OBJECT_NAMES: List[str] = [
    "ycb_wood_block",
    "ycb_cracker_box",
    "ycb_sugar_box",
    "ycb_tomato_soup_can",
    "ycb_mustard_bottle",
    "ycb_tuna_can",
    "ycb_pudding_box",
    "ycb_gelatin_box",
    "ycb_potted_meat_can",
    "ycb_banana",
    "ycb_strawberry",
    "ycb_apple",
    "ycb_lemon",
    "ycb_peach",
    "ycb_pear",
    "ycb_orange",
    "ycb_plum",
    "ycb_wine_glass",
    "ycb_mug",
    "ycb_extension_cord",
    "ycb_large_marker",
    "ycb_flat_screwdriver",
    "ycb_phillips_screwdriver",
    "ycb_spoon",
    "ycb_fork",
]


MATERIAL_NAMES: List[str] = [
    "acrylonitrile_butadiene_styrene",
    "aluminum",
    "cardboard",
    "ceramic",
    "glass",
    "high_density_polyethylene",
    "nylon",
    "polypropylene",
    "silicone",
    "stainless_steel",
    "rubber",
    "oak_wood",
    "pine_wood",
    "foam",
    "carbon_fiber",
]


def _build_noise_generator() -> PerlinNoise:
    octaves = random.uniform(1.5, 4.0)
    seed = random.randint(0, 10_000)
    return PerlinNoise(octaves=octaves, seed=seed)


def _generate_pressure_frame(
    noise: PerlinNoise,
    size: int,
    offsets: tuple[float, float],
    z_offset: float,
    frame_jitter: float,
) -> np.ndarray:
    data = np.zeros((size, size), dtype=float)
    for i in range(size):
        for j in range(size):
            x = (i / size) + offsets[0]
            y = (j / size) + offsets[1]
            value = noise([x, y, z_offset])
            normalized = (value + 1.0) / 2.0
            jitter = random.uniform(-frame_jitter, frame_jitter)
            data[i, j] = normalized + jitter

    data = np.clip(data, 0.0, 1.0)
    return data


def _generate_pressure_series(size: int = 5, frames: int = 10) -> List[np.ndarray]:
    noise = _build_noise_generator()
    base_offsets = (random.random(), random.random())
    z_base = random.random() * 10
    frame_jitter = random.uniform(0.02, 0.06)

    series: List[np.ndarray] = []
    for frame_idx in range(frames):
        z = z_base + frame_idx * 0.15
        decay = math.exp(-frame_idx / (frames * 1.8))
        current_jitter = frame_jitter * decay
        frame = _generate_pressure_frame(
            noise,
            size=size,
            offsets=base_offsets,
            z_offset=z,
            frame_jitter=current_jitter,
        )
        series.append(frame)

    return series


def _compute_grasp_success(mean_pressure: float) -> tuple[bool, float]:
    # Higher success probability when mean pressure is moderate (around 0.5)
    distance_from_optimal = abs(mean_pressure - 0.5)
    probability = max(0.0, 1.0 - distance_from_optimal / 0.5)
    probability = round(probability, 3)
    success = random.random() < probability
    return success, probability


def generate_episode(size: int = 5, frames: int = 10) -> Episode:
    series = _generate_pressure_series(size=size, frames=frames)
    final_frame = series[-1]

    mean_pressure = float(np.mean(final_frame))
    pressure_variance = float(np.var(final_frame))
    success, probability = _compute_grasp_success(mean_pressure)

    episode = Episode(
        episode_id=f"touch_{uuid4().hex[:8]}",
        object=random.choice(OBJECT_NAMES),
        material=random.choice(MATERIAL_NAMES),
        pressure_map=final_frame.round(4).tolist(),
        pressure_series=[frame.round(4).tolist() for frame in series],
        timestamp=datetime.now(timezone.utc),
        grasp_success=success,
        grasp_success_probability=probability,
        mean_pressure=round(mean_pressure, 4),
        pressure_variance=round(pressure_variance, 4),
    )

    return episode


def compute_batch_metrics(episodes: List[Episode]) -> BatchMetrics:
    if not episodes:
        return BatchMetrics(average_success_rate=0.0, average_pressure_variance=0.0)

    success_rate = sum(1 for ep in episodes if ep.grasp_success) / len(episodes)
    avg_variance = sum(ep.pressure_variance for ep in episodes) / len(episodes)
    return BatchMetrics(
        average_success_rate=round(success_rate, 3),
        average_pressure_variance=round(avg_variance, 4),
    )
