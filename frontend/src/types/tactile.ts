export type PressureFrame = number[][];

export interface Episode {
  episode_id: string;
  object: string;
  material: string;
  pressure_map: PressureFrame;
  pressure_series: PressureFrame[];
  timestamp: string;
  grasp_success: boolean;
  grasp_success_probability: number;
  mean_pressure: number;
  pressure_variance: number;
}

export interface BatchMetrics {
  average_success_rate: number;
  average_pressure_variance: number;
}

export interface BatchResponse {
  episodes: Episode[];
  metrics: BatchMetrics;
}
