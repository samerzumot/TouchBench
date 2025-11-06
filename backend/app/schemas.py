from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class Episode(BaseModel):
    episode_id: str = Field(..., description="Unique identifier for the tactile episode")
    object: str = Field(..., description="Name of the object being grasped")
    material: str = Field(..., description="Primary material of the object")
    pressure_map: List[List[float]] = Field(..., description="5x5 matrix of pressure readings for the current frame")
    pressure_series: List[List[List[float]]] = Field(
        ..., description="Time series of pressure maps for the episode"
    )
    timestamp: datetime = Field(..., description="ISO8601 timestamp when the episode was generated")
    grasp_success: bool = Field(..., description="Whether the grasp succeeded")
    grasp_success_probability: float = Field(
        ..., description="Probability estimate (0-1) for a successful grasp"
    )
    mean_pressure: float = Field(..., description="Mean pressure value of the final frame")
    pressure_variance: float = Field(..., description="Variance of pressure values in the final frame")


class BatchMetrics(BaseModel):
    average_success_rate: float = Field(
        ..., description="Average success rate across generated episodes"
    )
    average_pressure_variance: float = Field(
        ..., description="Average pressure variance across generated episodes"
    )


class BatchResponse(BaseModel):
    episodes: List[Episode]
    metrics: BatchMetrics


class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime
