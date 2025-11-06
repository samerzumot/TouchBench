'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface JsonViewerProps {
  data: any
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-all"
      >
        <h3 className="text-xl font-semibold text-purple-300">
          Raw JSON Data
        </h3>
        {isExpanded ? (
          <ChevronDown className="w-6 h-6 text-gray-400" />
        ) : (
          <ChevronRight className="w-6 h-6 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          <pre className="bg-slate-900/70 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 font-mono max-h-96 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default JsonViewer
