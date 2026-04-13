'use client'

import { useState, useEffect } from 'react'
import { NeuromorphicCard, NeuromorphicButton } from '@/components/ui/neuromorphic'
import { Search, RefreshCw, Zap } from 'lucide-react'

interface Query { query: string; avgTime: number; calls: number; table: string }

export function QueryAnalyzer() {
  const [queries, setQueries] = useState<Query[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadQueries() }, [])

  const loadQueries = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))
    setQueries([
      { query: 'SELECT * FROM campaigns WHERE status = active', avgTime: 2500, calls: 147, table: 'campaigns' },
      { query: 'SELECT COUNT(*) FROM events GROUP BY tenant_id', avgTime: 1800, calls: 23, table: 'events' },
      { query: 'UPDATE users SET last_login = NOW()', avgTime: 1200, calls: 12, table: 'users' },
      { query: 'SELECT * FROM analytics JOIN campaigns...', avgTime: 890, calls: 456, table: 'analytics' },
      { query: 'INSERT INTO events VALUES...', avgTime: 45, calls: 12500, table: 'events' }
    ])
    setIsLoading(false)
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Search className="w-5 h-5 text-purple-400" />Query Analyzer</h3>
        <NeuromorphicButton variant="secondary" size="sm" onClick={loadQueries}><RefreshCw className="w-4 h-4 mr-1" />Analyze</NeuromorphicButton>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-purple-500/10 rounded-lg text-center">
          <p className="text-xl font-bold text-purple-400">{queries.length}</p>
          <p className="text-xs text-slate-400">Queries Monitoreadas</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-xl font-bold text-red-400">{queries.filter(q => q.avgTime > 1000).length}</p>
          <p className="text-xs text-slate-400">Slow ({'>'}1s)</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-xl font-bold text-green-400">{(queries.reduce((s, q) => s + q.calls, 0) / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400">Total Calls</p>
        </div>
      </div>
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" />Top Queries</h4>
        <div className="space-y-2">
          {queries.map((q, i) => (
            <div key={q.query} className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs text-slate-300 truncate max-w-[60%]">{q.query}</code>
                <span className={`text-sm font-bold ${q.avgTime > 1000 ? 'text-red-400' : 'text-green-400'}`}>{q.avgTime}ms</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Table: {q.table}</span>
                <span>Calls: {q.calls}x</span>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default QueryAnalyzer
