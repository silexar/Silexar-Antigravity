'use client'

import { useState, useEffect } from 'react'
import { NeuromorphicCard } from '@/components/ui/neuromorphic'
import { Target, CheckCircle, Clock, Activity } from 'lucide-react'

interface SLAMetric { name: string; target: number; current: number; status: 'met' | 'at-risk' | 'breached' }
interface TenantSLA { tenantId: string; tenantName: string; plan: string; slaLevel: number; currentUptime: number; incidents30d: number; status: 'compliant' | 'at-risk' | 'breached' }
interface Incident { id: string; startTime: Date; duration: number; severity: 'critical' | 'major' | 'minor'; description: string; affected: string[] }

export function SLADashboard() {
  const [metrics, setMetrics] = useState<SLAMetric[]>([])
  const [tenants, setTenants] = useState<TenantSLA[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSLAData()
  }, [])

  const loadSLAData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setMetrics([
      { name: 'Uptime', target: 99.9, current: 99.97, status: 'met' },
      { name: 'API Response', target: 200, current: 145, status: 'met' },
      { name: 'Error Rate', target: 0.1, current: 0.08, status: 'met' },
      { name: 'Support', target: 4, current: 3.2, status: 'met' }
    ])
    setTenants([
      { tenantId: 't_001', tenantName: 'RDF Media', plan: 'Enterprise', slaLevel: 99.99, currentUptime: 99.998, incidents30d: 0, status: 'compliant' },
      { tenantId: 't_002', tenantName: 'Grupo Prisa', plan: 'Enterprise', slaLevel: 99.99, currentUptime: 99.97, incidents30d: 1, status: 'compliant' },
      { tenantId: 't_003', tenantName: 'Mega Media', plan: 'Professional', slaLevel: 99.9, currentUptime: 99.85, incidents30d: 2, status: 'at-risk' },
      { tenantId: 't_004', tenantName: 'Canal 13', plan: 'Enterprise', slaLevel: 99.99, currentUptime: 99.995, incidents30d: 0, status: 'compliant' }
    ])
    setIncidents([
      { id: 'inc_001', startTime: new Date(Date.now() - 7*24*60*60*1000), duration: 45, severity: 'major', description: 'API degradation', affected: ['Mega Media'] }
    ])
    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) { case 'met': case 'compliant': return 'bg-green-500/20 text-green-400'; case 'at-risk': return 'bg-yellow-500/20 text-yellow-400'; default: return 'bg-red-500/20 text-red-400' }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Target className="w-5 h-5 text-green-400" />SLA Dashboard</h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {metrics.map(m => (
          <NeuromorphicCard key={m.name} variant="embossed" className="p-4 text-center">
            <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-400">{m.current}{m.name === 'Uptime' ? '%' : m.name === 'Support' ? 'h' : 'ms'}</p>
            <p className="text-xs text-slate-400">{m.name}</p>
          </NeuromorphicCard>
        ))}
      </div>
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" />SLA por Cliente</h4>
        <div className="space-y-2">
          {tenants.map(t => (
            <div key={t.tenantId} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${t.status === 'compliant' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-white">{t.tenantName}</span>
                <span className="text-xs text-slate-500">{t.plan}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${t.currentUptime >= t.slaLevel ? 'text-green-400' : 'text-red-400'}`}>{t.currentUptime.toFixed(3)}%</span>
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(t.status)}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
      {incidents.length > 0 && (
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400" />Incidentes</h4>
          {incidents.map(i => (
            <div key={i.id} className="p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">{i.description}</span>
                <span className="text-xs text-slate-400">{i.duration}min</span>
              </div>
            </div>
          ))}
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default SLADashboard
