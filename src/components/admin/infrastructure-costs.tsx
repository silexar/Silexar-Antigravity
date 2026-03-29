'use client'

import { useState, useEffect } from 'react'
import { NeuromorphicCard, NeuromorphicButton } from '@/components/ui/neuromorphic'
import { DollarSign, TrendingUp, TrendingDown, Cloud, Server, Database, RefreshCw } from 'lucide-react'

interface CostItem { service: string; cost: number; change: number; category: string }

export function InfrastructureCosts() {
  const [costs, setCosts] = useState<CostItem[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadCosts() }, [])

  const loadCosts = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const data: CostItem[] = [
      { service: 'AWS EC2', cost: 8450, change: 5.2, category: 'compute' },
      { service: 'AWS RDS', cost: 3200, change: -2.1, category: 'database' },
      { service: 'AWS S3', cost: 1250, change: 8.5, category: 'storage' },
      { service: 'CloudFront CDN', cost: 890, change: 12.3, category: 'network' },
      { service: 'AWS Lambda', cost: 650, change: -5.0, category: 'compute' },
      { service: 'ElastiCache', cost: 480, change: 0, category: 'cache' },
      { service: 'Route 53', cost: 120, change: 0, category: 'network' },
      { service: 'CloudWatch', cost: 340, change: 15.2, category: 'monitoring' }
    ]
    setCosts(data)
    setTotalCost(data.reduce((s, c) => s + c.cost, 0))
    setIsLoading(false)
  }

  const getCategoryIcon = (cat: string) => {
    switch(cat) { case 'compute': return <Server className="w-4 h-4 text-blue-400" />; case 'database': return <Database className="w-4 h-4 text-purple-400" />; default: return <Cloud className="w-4 h-4 text-cyan-400" /> }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400" />Infrastructure Costs</h3>
        <NeuromorphicButton variant="secondary" size="sm" onClick={loadCosts}><RefreshCw className="w-4 h-4 mr-1" />Refresh</NeuromorphicButton>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <p className="text-2xl font-bold text-white">${(totalCost/1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400">Costo Mensual</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">${(totalCost*12/1000).toFixed(0)}K</p>
          <p className="text-xs text-slate-400">Proyección Anual</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">$54</p>
          <p className="text-xs text-slate-400">Costo/Cliente</p>
        </NeuromorphicCard>
      </div>
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3">Desglose por Servicio</h4>
        <div className="space-y-2">
          {costs.map(c => (
            <div key={c.service} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">{getCategoryIcon(c.category)}<span className="text-white">{c.service}</span></div>
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">${c.cost.toLocaleString()}</span>
                <span className={`text-xs flex items-center gap-1 ${c.change > 0 ? 'text-red-400' : c.change < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                  {c.change > 0 ? <TrendingUp className="w-3 h-3" /> : c.change < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                  {c.change !== 0 ? `${c.change > 0 ? '+' : ''}${c.change}%` : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default InfrastructureCosts
