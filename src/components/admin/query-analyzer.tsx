'use client'

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
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

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-purple-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2"><Search className="w-5 h-5 text-[#6888ff]" />Query Analyzer</h3>
        <NeuButton variant="secondary" onClick={loadQueries}><RefreshCw className="w-4 h-4 mr-1" />Analyze</NeuButton>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-xl font-bold text-[#6888ff]">{queries.length}</p>
          <p className="text-xs text-[#9aa3b8]">Queries Monitoreadas</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-xl font-bold text-[#6888ff]">{queries.filter(q => q.avgTime > 1000).length}</p>
          <p className="text-xs text-[#9aa3b8]">Slow ({'>'}1s)</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-xl font-bold text-[#6888ff]">{(queries.reduce((s, q) => s + q.calls, 0) / 1000).toFixed(1)}K</p>
          <p className="text-xs text-[#9aa3b8]">Total Calls</p>
        </div>
      </div>
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-[#6888ff]" />Top Queries</h4>
        <div className="space-y-2">
          {queries.map((q, i) => (
            <div key={q.query} className="p-3 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs text-[#69738c] truncate max-w-[60%]">{q.query}</code>
                <span className={`text-sm font-bold ${q.avgTime > 1000 ? 'text-[#6888ff]' : 'text-[#6888ff]'}`}>{q.avgTime}ms</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#9aa3b8]">
                <span>Table: {q.table}</span>
                <span>Calls: {q.calls}x</span>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default QueryAnalyzer