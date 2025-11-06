'use client'

import React from 'react'

interface PressureHeatmapProps {
  data: number[][]
}

const PressureHeatmap: React.FC<PressureHeatmapProps> = ({ data }) => {
  // Get color based on pressure value (0-1)
  const getColor = (value: number): string => {
    // Use a gradient from dark blue (low) to red (high)
    const r = Math.floor(value * 255)
    const g = Math.floor((1 - Math.abs(value - 0.5) * 2) * 180)
    const b = Math.floor((1 - value) * 255)
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Heatmap Grid */}
      <div className="inline-grid gap-1 p-4 bg-slate-900/50 rounded-lg">
        {data.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((value, j) => (
              <div
                key={j}
                className="w-16 h-16 rounded flex items-center justify-center text-xs font-mono font-bold shadow-lg transition-all hover:scale-110 hover:z-10"
                style={{ 
                  backgroundColor: getColor(value),
                  boxShadow: `0 0 ${value * 20}px rgba(255, 100, 100, ${value * 0.5})`
                }}
                title={`[${i},${j}]: ${value.toFixed(3)}`}
              >
                {value.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400">Pressure:</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: getColor(0) }}></div>
          <span className="text-gray-400">0.0</span>
        </div>
        <div className="w-32 h-2 rounded" 
          style={{ 
            background: 'linear-gradient(to right, rgb(0, 0, 255), rgb(255, 180, 0), rgb(255, 0, 0))' 
          }}
        ></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: getColor(1) }}></div>
          <span className="text-gray-400">1.0</span>
        </div>
      </div>
    </div>
  )
}

export default PressureHeatmap
