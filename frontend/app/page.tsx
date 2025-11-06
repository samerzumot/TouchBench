'use client'

import { useState } from 'react'
import { Play, Pause, Download, RefreshCw, Sparkles, BarChart3 } from 'lucide-react'
import PressureHeatmap from './components/PressureHeatmap'
import JsonViewer from './components/JsonViewer'
import StatsPanel from './components/StatsPanel'
import BatchViewer from './components/BatchViewer'
import { generateTactileEpisode, generateTimeSeries, generateBatch } from './lib/api'
import type { TactileEpisode } from './lib/types'

export default function Home() {
  const [currentEpisode, setCurrentEpisode] = useState<TactileEpisode | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<TactileEpisode[]>([])
  const [batchData, setBatchData] = useState<TactileEpisode[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'single' | 'timeseries' | 'batch'>('single')

  // Generate single episode
  const handleGenerateSingle = async () => {
    setLoading(true)
    try {
      const data = await generateTactileEpisode()
      setCurrentEpisode(data)
      setTimeSeriesData([])
      setActiveTab('single')
    } catch (error) {
      console.error('Error generating episode:', error)
      alert('Failed to generate episode. Make sure the backend is running on http://localhost:8000')
    } finally {
      setLoading(false)
    }
  }

  // Generate time series
  const handleGenerateTimeSeries = async () => {
    setLoading(true)
    try {
      const data = await generateTimeSeries(10)
      setTimeSeriesData(data)
      setCurrentFrame(0)
      setCurrentEpisode(data[0])
      setIsPlaying(false)
      setActiveTab('timeseries')
    } catch (error) {
      console.error('Error generating time series:', error)
      alert('Failed to generate time series. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Generate batch
  const handleGenerateBatch = async () => {
    setLoading(true)
    try {
      const data = await generateBatch(20)
      setBatchData(data)
      setActiveTab('batch')
    } catch (error) {
      console.error('Error generating batch:', error)
      alert('Failed to generate batch. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Animation controls
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Handle frame changes
  useState(() => {
    if (isPlaying && timeSeriesData.length > 0) {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = (prev + 1) % timeSeriesData.length
          setCurrentEpisode(timeSeriesData[next])
          return next
        })
      }, 300) // 300ms per frame

      return () => clearInterval(interval)
    }
  })

  // Download JSON
  const downloadJSON = () => {
    if (!currentEpisode) return
    const dataStr = JSON.stringify(currentEpisode, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentEpisode.episode_id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Download CSV
  const downloadCSV = () => {
    if (!currentEpisode) return
    
    // Flatten pressure map
    const flatPressure = currentEpisode.pressure_map.flat()
    const headers = ['episode_id', 'object', 'material', 'timestamp', 'grasp_success', 'mean_pressure', 'max_pressure', 'variance', ...flatPressure.map((_, i) => `pressure_${i}`)]
    const values = [
      currentEpisode.episode_id,
      currentEpisode.object,
      currentEpisode.material,
      currentEpisode.timestamp,
      currentEpisode.grasp_success,
      currentEpisode.mean_pressure,
      currentEpisode.max_pressure,
      currentEpisode.variance,
      ...flatPressure
    ]
    
    const csv = [headers.join(','), values.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentEpisode.episode_id}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Download batch CSV
  const downloadBatchCSV = () => {
    if (batchData.length === 0) return
    
    const headers = ['episode_id', 'object', 'material', 'timestamp', 'grasp_success', 'mean_pressure', 'max_pressure', 'variance']
    const rows = batchData.map(ep => [
      ep.episode_id,
      ep.object,
      ep.material,
      ep.timestamp,
      ep.grasp_success,
      ep.mean_pressure,
      ep.max_pressure,
      ep.variance
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'touchbench_batch.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              TouchBench v0
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Synthetic Tactile Data Explorer — Dynamically Generated Sensor Data for AI Benchmarking
          </p>
        </header>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={handleGenerateSingle}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Generate Episode
          </button>

          <button
            onClick={handleGenerateTimeSeries}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5" />
            Generate Time Series
          </button>

          <button
            onClick={handleGenerateBatch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="w-5 h-5" />
            Generate Batch (20)
          </button>
        </div>

        {/* Tab Navigation */}
        {(currentEpisode || batchData.length > 0) && (
          <div className="flex justify-center gap-2 mb-8">
            {(currentEpisode && timeSeriesData.length === 0) && (
              <button
                onClick={() => setActiveTab('single')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'single' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Single Episode
              </button>
            )}
            {timeSeriesData.length > 0 && (
              <button
                onClick={() => setActiveTab('timeseries')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'timeseries' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Time Series ({timeSeriesData.length} frames)
              </button>
            )}
            {batchData.length > 0 && (
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'batch' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Batch Analysis ({batchData.length} episodes)
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'batch' && batchData.length > 0 ? (
          <BatchViewer data={batchData} onDownloadCSV={downloadBatchCSV} />
        ) : currentEpisode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Visualization */}
            <div className="space-y-6">
              {/* Episode Info Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-purple-300 mb-1">
                      {currentEpisode.object.replace(/_/g, ' ').toUpperCase()}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Material: <span className="text-cyan-400">{currentEpisode.material}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {currentEpisode.episode_id}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                    currentEpisode.grasp_success 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    {currentEpisode.grasp_success ? '✓ SUCCESS' : '✗ FAILED'}
                  </div>
                </div>

                {/* Stats */}
                <StatsPanel episode={currentEpisode} />
              </div>

              {/* Pressure Heatmap */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">
                  Pressure Map (5×5)
                </h3>
                <PressureHeatmap data={currentEpisode.pressure_map} />
              </div>

              {/* Time Series Controls */}
              {timeSeriesData.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
                  <h3 className="text-xl font-semibold mb-4 text-blue-300">
                    Animation Controls
                  </h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={timeSeriesData.length - 1}
                        value={currentFrame}
                        onChange={(e) => {
                          const frame = parseInt(e.target.value)
                          setCurrentFrame(frame)
                          setCurrentEpisode(timeSeriesData[frame])
                          setIsPlaying(false)
                        }}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-400 mt-1">
                        Frame {currentFrame + 1} / {timeSeriesData.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Data & Controls */}
            <div className="space-y-6">
              {/* Download Buttons */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">
                  Export Data
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={downloadJSON}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    JSON
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    CSV
                  </button>
                </div>
              </div>

              {/* JSON Viewer */}
              <JsonViewer data={currentEpisode} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-xl text-gray-400">
              Click a button above to generate synthetic tactile data
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>TouchBench v0 — Built with Next.js, FastAPI, and Perlin Noise</p>
          <p className="mt-1">All data is dynamically generated • No hardcoded samples</p>
        </footer>
      </div>
    </main>
  )
}
