import type { BatchResponse, Episode } from "@/types/tactile";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `API request failed (${response.status} ${response.statusText}): ${message}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchEpisode(): Promise<Episode> {
  return request<Episode>("/api/generate_tactile");
}

export async function fetchBatch(n = 10): Promise<BatchResponse> {
  const search = new URLSearchParams({ n: n.toString() });
  return request<BatchResponse>(`/api/generate_batch?${search.toString()}`);
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
