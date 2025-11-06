'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

import Heatmap from "@/components/Heatmap";
import TimelineChart from "@/components/TimelineChart";
import { fetchBatch, fetchEpisode, getApiBaseUrl } from "@/lib/api";
import type { BatchMetrics, Episode, PressureFrame } from "@/types/tactile";

const FRAME_INTERVAL_MS = 650;
const HISTORY_LIMIT = 50;

type AggregatedStats = {
  averageSuccessRate: number;
  averageVariance: number;
  totalEpisodes: number;
};

export default function HomePage() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [history, setHistory] = useState<Episode[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchMetrics, setBatchMetrics] = useState<BatchMetrics | null>(null);

  const frameCount = episode?.pressure_series.length ?? 0;
  const currentFrame: PressureFrame | null = episode
    ? episode.pressure_series[frameIndex]
    : null;

  const aggregatedStats: AggregatedStats | null = useMemo(() => {
    if (!history.length) {
      return null;
    }

    const successes = history.filter((item) => item.grasp_success).length;
    const varianceSum = history.reduce(
      (sum, item) => sum + item.pressure_variance,
      0,
    );

    return {
      averageSuccessRate: Number((successes / history.length).toFixed(3)),
      averageVariance: Number((varianceSum / history.length).toFixed(4)),
      totalEpisodes: history.length,
    };
  }, [history]);

  useEffect(() => {
    if (!isPlaying || !episode || !frameCount) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((previous) => {
        const next = previous + 1;
        return next >= frameCount ? 0 : next;
      });
    }, FRAME_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [episode, frameCount, isPlaying]);

  useEffect(() => {
    setFrameIndex(0);
  }, [episode]);

  useEffect(() => {
    void handleGenerateEpisode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateHistory = useCallback((episodes: Episode[]) => {
    setHistory((current) => {
      const combined = [...episodes, ...current];
      return combined.slice(0, HISTORY_LIMIT);
    });
  }, []);

  const handleGenerateEpisode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const freshEpisode = await fetchEpisode();
      setEpisode(freshEpisode);
      updateHistory([freshEpisode]);
      setIsPlaying(true);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setLoading(false);
    }
  }, [updateHistory]);

  const handleGenerateBatch = useCallback(
    async (count = 10) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchBatch(count);
        updateHistory(result.episodes);
        setBatchMetrics(result.metrics);
        if (result.episodes.length) {
          setEpisode(result.episodes[0]);
          setIsPlaying(true);
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      } finally {
        setLoading(false);
      }
    },
    [updateHistory],
  );

  const handleDownloadJson = useCallback(() => {
    if (!episode) return;
    const json = JSON.stringify(episode, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${episode.episode_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [episode]);

  const handleExportCsv = useCallback(() => {
    if (!episode) return;
    const rows = ["frame,row,column,pressure"];
    episode.pressure_series.forEach((frame, frameIdx) => {
      frame.forEach((row, rowIdx) => {
        row.forEach((value, colIdx) => {
          rows.push(`${frameIdx + 1},${rowIdx + 1},${colIdx + 1},${value}`);
        });
      });
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${episode.episode_id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [episode]);

  return (
    <div className="min-h-screen bg-slate-950 py-10 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <header className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              TouchBench v0
            </p>
            <h1 className="text-3xl font-semibold text-slate-50 md:text-4xl">
              Synthetic Tactile Data Explorer
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Stream synthetic pressure maps, grasp outcomes, and temporal dynamics generated on-demand by the TouchBench tactile simulator.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateEpisode}
              disabled={loading}
              className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-600/60"
            >
              {loading ? "Generating…" : "Generate New Episode"}
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              disabled={!episode}
              className="rounded-full border border-slate-600 px-5 py-2.5 text-sm font-medium transition hover:border-slate-400 hover:text-white disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
            >
              {isPlaying ? "Pause" : "Play"} Animation
            </button>
            <button
              type="button"
              onClick={() => void handleGenerateBatch(10)}
              disabled={loading}
              className="rounded-full border border-emerald-600 px-5 py-2.5 text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:text-emerald-100 disabled:cursor-not-allowed disabled:border-emerald-900 disabled:text-emerald-800"
            >
              Generate Batch ×10
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            <p className="font-medium">API Error</p>
            <p>{error}</p>
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Pressure Heatmap</h2>
              {episode && (
                <span className="rounded-full bg-slate-800 px-4 py-1 text-xs uppercase tracking-wide text-slate-300">
                  Frame {frameIndex + 1} / {frameCount}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Heatmap updates in real time as the tactile episode streams through 10 simulated frames.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center">
              {currentFrame ? (
                <Heatmap data={currentFrame} />
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-500">
                  <p>Generate an episode to visualize tactile pressure maps.</p>
                </div>
              )}
            </div>

            {episode && (
              <div className="mt-6 flex flex-col gap-4">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Scrub timeline
                </label>
                <input
                  type="range"
                  min={0}
                  max={frameCount - 1}
                  step={1}
                  value={frameIndex}
                  onChange={(event) => setFrameIndex(Number(event.target.value))}
                  className="w-full accent-sky-500"
                />
                <TimelineChart frames={episode.pressure_series} />
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white">Episode Details</h2>
              {episode ? (
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Episode ID</dt>
                    <dd className="font-mono text-xs text-slate-200">
                      {episode.episode_id}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Object</dt>
                    <dd className="font-medium text-white">{episode.object}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Material</dt>
                    <dd className="text-white">{episode.material}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Mean pressure</dt>
                    <dd>{episode.mean_pressure.toFixed(3)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Variance</dt>
                    <dd>{episode.pressure_variance.toFixed(4)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Success probability</dt>
                    <dd>{(episode.grasp_success_probability * 100).toFixed(1)}%</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Grasp outcome</dt>
                    <dd>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${episode.grasp_success ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40" : "bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/40"}`}
                      >
                        {episode.grasp_success ? "Success" : "Failure"}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Timestamp</dt>
                    <dd className="text-right text-xs text-slate-400">
                      {new Date(episode.timestamp).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Generate an episode to view simulated object metadata and tactile metrics.
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  disabled={!episode}
                  className="rounded-full border border-slate-600 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 transition hover:border-slate-300 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={!episode}
                  className="rounded-full border border-slate-600 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 transition hover:border-slate-300 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white">Episode History</h2>
              {aggregatedStats ? (
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Episodes tracked</dt>
                    <dd>{aggregatedStats.totalEpisodes}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Avg. success rate</dt>
                    <dd>{(aggregatedStats.averageSuccessRate * 100).toFixed(1)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Avg. variance</dt>
                    <dd>{aggregatedStats.averageVariance.toFixed(4)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Generate multiple episodes to track success rates and variance trends.
                </p>
              )}

              {batchMetrics && (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  <p className="font-semibold uppercase tracking-wide text-xs text-emerald-200">
                    Latest batch (API)
                  </p>
                  <p className="mt-2">
                    Avg. success rate: {(batchMetrics.average_success_rate * 100).toFixed(1)}%
                  </p>
                  <p>
                    Avg. variance: {batchMetrics.average_pressure_variance.toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white">Episode JSON</h2>
              <details className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
                <summary className="cursor-pointer list-none font-medium text-slate-200">
                  {episode ? `${episode.episode_id}.json` : "Awaiting episode"}
                </summary>
                <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">
                  {episode
                    ? JSON.stringify(episode, null, 2)
                    : "Generate an episode to view raw JSON."}
                </pre>
              </details>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-xs text-slate-500">
              <p className="font-semibold uppercase tracking-[0.3em] text-slate-400">
                API endpoint
              </p>
              <p className="mt-2 font-mono text-[11px] text-slate-300">
                {getApiBaseUrl()}/api/generate_tactile
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-300">
                {getApiBaseUrl()}/api/generate_batch?n=10
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
