'use client'

import React, { useMemo } from 'react'
import { Download, TrendingUp, Target, Activity } from 'lucide-react'
import type { TactileEpisode } from '../lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts'

interface BatchViewerProps {
  data: TactileEpisode[]
  onDownloadCSV: () => void
}

const BatchViewer: React.FC<BatchViewerProps> = ({ data, onDownloadCSV }) => {
  // Calculate aggregate statistics
  const stats = useMemo(() => {
    const successCount = data.filter(ep => ep.grasp_success).length
    const successRate = (successCount / data.length) * 100
    const avgPressure = data.reduce((sum, ep) => sum + ep.mean_pressure, 0) / data.length
    const avgVariance = data.reduce((sum, ep) => sum + ep.variance, 0) / data.length
    
    // Material distribution
    const materialCounts: Record<string, number> = {}
    data.forEach(ep => {
      materialCounts[ep.material] = (materialCounts[ep.material] || 0) + 1
    })
    
    return {
      successRate,
      avgPressure,
      avgVariance,
      successCount,
      totalCount: data.length,
      materialCounts
    }
  }, [data])

  // Prepare chart data
  const materialData = useMemo(() => {
    return Object.entries(stats.materialCounts).map(([material, count]) => ({
      material,
      count,
      successRate: (data.filter(ep => ep.material === material && ep.grasp_success).length / count * 100).toFixed(1)
    }))
  }, [data, stats.materialCounts])

  // Scatter plot data
  const scatterData = useMemo(() => {
    return data.map(ep => ({
      mean_pressure: ep.mean_pressure,
      variance: ep.variance,
      success: ep.grasp_success ? 1 : 0,
      material: ep.material,
      object: ep.object
    }))
  }, [data])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-white opacity-80" />
            <div className="text-3xl font-bold text-white">{stats.successRate.toFixed(1)}%</div>
          </div>
          <div className="text-sm text-green-100">Success Rate</div>
          <div className="text-xs text-green-200 mt-1">
            {stats.successCount} / {stats.totalCount} episodes
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-white opacity-80" />
            <div className="text-3xl font-bold text-white">{stats.avgPressure.toFixed(3)}</div>
          </div>
          <div className="text-sm text-blue-100">Avg Pressure</div>
          <div className="text-xs text-blue-200 mt-1">Mean across all episodes</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-white opacity-80" />
            <div className="text-3xl font-bold text-white">{stats.avgVariance.toFixed(3)}</div>
          </div>
          <div className="text-sm text-purple-100">Avg Variance</div>
          <div className="text-xs text-purple-200 mt-1">Pressure distribution</div>
        </div>

        <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Download className="w-8 h-8 text-white opacity-80" />
          </div>
          <button
            onClick={onDownloadCSV}
            className="w-full mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-all"
          >
            Export CSV
          </button>
          <div className="text-xs text-pink-200 mt-2">Download all data</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-purple-300">
            Material Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={materialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="material" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pressure vs Variance Scatter */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-purple-300">
            Pressure vs Variance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="mean_pressure" 
                stroke="#9CA3AF" 
                name="Mean Pressure"
                label={{ value: 'Mean Pressure', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
              />
              <YAxis 
                dataKey="variance" 
                stroke="#9CA3AF" 
                name="Variance"
                label={{ value: 'Variance', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => value.toFixed(3)}
              />
              <Scatter name="Episodes" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.success ? '#10b981' : '#ef4444'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-400">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-400">Failure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Episode List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
        <h3 className="text-xl font-semibold mb-4 text-purple-300">
          All Episodes ({data.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Episode ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Object</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Material</th>
                <th className="text-center py-3 px-4 text-gray-400 font-semibold">Mean P</th>
                <th className="text-center py-3 px-4 text-gray-400 font-semibold">Max P</th>
                <th className="text-center py-3 px-4 text-gray-400 font-semibold">Variance</th>
                <th className="text-center py-3 px-4 text-gray-400 font-semibold">Success</th>
              </tr>
            </thead>
            <tbody>
              {data.map((episode, idx) => (
                <tr key={episode.episode_id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">{episode.episode_id}</td>
                  <td className="py-3 px-4 text-gray-300">{episode.object.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-cyan-400">{episode.material}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{episode.mean_pressure.toFixed(3)}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{episode.max_pressure.toFixed(3)}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{episode.variance.toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      episode.grasp_success 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {episode.grasp_success ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BatchViewer
