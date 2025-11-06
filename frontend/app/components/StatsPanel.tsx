'use client'

import React from 'react'
import type { TactileEpisode } from '../lib/types'

interface StatsPanelProps {
  episode: TactileEpisode
}

const StatsPanel: React.FC<StatsPanelProps> = ({ episode }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-slate-900/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Mean Pressure</div>
        <div className="text-2xl font-bold text-cyan-400">
          {episode.mean_pressure.toFixed(3)}
        </div>
      </div>
      
      <div className="bg-slate-900/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Max Pressure</div>
        <div className="text-2xl font-bold text-orange-400">
          {episode.max_pressure.toFixed(3)}
        </div>
      </div>
      
      <div className="bg-slate-900/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Variance</div>
        <div className="text-2xl font-bold text-purple-400">
          {episode.variance.toFixed(3)}
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
