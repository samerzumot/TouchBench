export interface TactileEpisode {
  episode_id: string
  object: string
  material: string
  pressure_map: number[][]
  timestamp: string
  grasp_success: boolean
  mean_pressure: number
  max_pressure: number
  variance: number
}
