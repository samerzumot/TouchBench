import axios from 'axios'
import type { TactileEpisode } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export async function generateTactileEpisode(): Promise<TactileEpisode> {
  const response = await api.get<TactileEpisode>('/api/generate_tactile')
  return response.data
}

export async function generateTimeSeries(frames: number = 10): Promise<TactileEpisode[]> {
  const response = await api.get<TactileEpisode[]>('/api/generate_timeseries', {
    params: { frames }
  })
  return response.data
}

export async function generateBatch(n: number = 10): Promise<TactileEpisode[]> {
  const response = await api.get<TactileEpisode[]>('/api/generate_batch', {
    params: { n }
  })
  return response.data
}
