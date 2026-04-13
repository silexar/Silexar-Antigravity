'use client'

/**
 * 📊 SILEXAR PULSE - API Health & Rate Limiting
 * Monitoreo de APIs y control de uso
 * 
 * @description Dashboard de APIs con:
 * - Uso de API por tenant
 * - Rate limiting configurable
 * - Alertas de throttling
 * - Métricas de rendimiento
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton,
  NeuromorphicStatus
} from '@/components/ui/neuromorphic'
import {
  Activity,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
  Brain
} from 'lucide-react'

interface ApiEndpoint {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  requestsToday: number
  avgLatency: number
  errorRate: number
  status: 'healthy' | 'degraded' | 'down'
}

interface TenantApiUsage {
  tenantId: string
  tenantName: string
  requestsToday: number
  requestsThisMonth: number
  rateLimit: number
  currentRate: number
  isThrottled: boolean
  plan: string
}

interface ApiStats {
  totalRequests: number
  avgLatency: number
  errorRate: number
  uptime: number
  throttledRequests: number
}

export function ApiHealthDashboard() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [tenantUsage, setTenantUsage] = useState<TenantApiUsage[]>([])
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  useEffect(() => {
    loadApiData()
    const interval = setInterval(loadApiData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadApiData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setEndpoints([
      { id: 'ep_001', path: '/api/campanas', method: 'GET', requestsToday: 45230, avgLatency: 45, errorRate: 0.1, status: 'healthy' },
      { id: 'ep_002', path: '/api/campanas', method: 'POST', requestsToday: 12450, avgLatency: 120, errorRate: 0.5, status: 'healthy' },
      { id: 'ep_003', path: '/api/analytics', method: 'GET', requestsToday: 32100, avgLatency: 250, errorRate: 1.2, status: 'degraded' },
      { id: 'ep_004', path: '/api/reports', method: 'GET', requestsToday: 8900, avgLatency: 890, errorRate: 0.3, status: 'healthy' },
      { id: 'ep_005', path: '/api/ai/predictions', method: 'POST', requestsToday: 5600, avgLatency: 1500, errorRate: 2.1, status: 'degraded' },
      { id: 'ep_006', path: '/api/auth', method: 'POST', requestsToday: 15200, avgLatency: 35, errorRate: 0.05, status: 'healthy' }
    ])

    setTenantUsage([
      { tenantId: 'tnt_001', tenantName: 'RDF Media', requestsToday: 45000, requestsThisMonth: 1250000, rateLimit: 100000, currentRate: 45, isThrottled: false, plan: 'Enterprise' },
      { tenantId: 'tnt_002', tenantName: 'Grupo Prisa', requestsToday: 38000, requestsThisMonth: 980000, rateLimit: 100000, currentRate: 38, isThrottled: false, plan: 'Enterprise+' },
      { tenantId: 'tnt_003', tenantName: 'Mega Media', requestsToday: 28000, requestsThisMonth: 720000, rateLimit: 50000, currentRate: 56, isThrottled: true, plan: 'Professional' },
      { tenantId: 'tnt_004', tenantName: 'TVN Chile', requestsToday: 12000, requestsThisMonth: 350000, rateLimit: 100000, currentRate: 12, isThrottled: false, plan: 'Enterprise' }
    ])

    setStats({
      totalRequests: 119480,
      avgLatency: 156,
      errorRate: 0.72,
      uptime: 99.97,
      throttledRequests: 1250
    })

    // AI Recommendations
    setAiRecommendations([
      '📊 /api/analytics muestra latencia alta. Considerar caché adicional.',
      '⚠️ Mega Media cerca del límite de rate. Sugerir upgrade a Enterprise.',
      '🚀 /api/ai/predictions tiene 2.1% errores. Revisar logs de modelo ML.'
    ])

    setIsLoading(false)
  }

  const adjustRateLimit = (tenantId: string, newLimit: number) => {
    setTenantUsage(prev => prev.map(t => 
      t.tenantId === tenantId ? { ...t, rateLimit: newLimit, isThrottled: t.currentRate > (newLimit / 1000) } : t
    ))
    
  }

  const toggleThrottle = (tenantId: string) => {
    setTenantUsage(prev => prev.map(t => 
      t.tenantId === tenantId ? { ...t, isThrottled: !t.isThrottled } : t
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando API Health...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          API Health & Rate Limiting
        </h3>
        <NeuromorphicButton variant="secondary" size="sm" onClick={loadApiData}>
          <RefreshCw className="w-4 h-4" />
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Requests Hoy</span>
          </div>
          <p className="text-xl font-bold text-white">{(stats?.totalRequests || 0).toLocaleString()}</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Latencia Prom</span>
          </div>
          <p className="text-xl font-bold text-white">{stats?.avgLatency}ms</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-slate-400">Error Rate</span>
          </div>
          <p className="text-xl font-bold text-white">{stats?.errorRate}%</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Uptime</span>
          </div>
          <p className="text-xl font-bold text-green-400">{stats?.uptime}%</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Throttled</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats?.throttledRequests}</p>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <NeuromorphicCard variant="glow" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Recomendaciones IA</span>
          </div>
          <div className="space-y-1">
            {aiRecommendations.map((rec, i) => (
              <p key={rec} className="text-xs text-slate-300">{rec}</p>
            ))}
          </div>
        </NeuromorphicCard>
      )}

      {/* Endpoints Status */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3">Estado de Endpoints</h4>
        <div className="space-y-2">
          {endpoints.map(ep => (
            <div key={ep.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
              <div className="flex items-center gap-3">
                <NeuromorphicStatus 
                  status={ep.status === 'healthy' ? 'online' : ep.status === 'degraded' ? 'warning' : 'error'}
                  size="sm"
                />
                <span className={`text-xs px-2 py-0.5 rounded ${
                  ep.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                  ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                  ep.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm text-slate-300">{ep.path}</code>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <span>{ep.requestsToday.toLocaleString()} req</span>
                <span>{ep.avgLatency}ms</span>
                <span className={ep.errorRate > 1 ? 'text-red-400' : ''}>{ep.errorRate}% err</span>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>

      {/* Tenant Usage */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3">Uso de API por Tenant</h4>
        <div className="space-y-3">
          {tenantUsage.map(tenant => (
            <div key={tenant.tenantId} className={`p-3 rounded-lg border ${
              tenant.isThrottled ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/30 border-slate-700/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-white font-medium">{tenant.tenantName}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                    {tenant.plan}
                  </span>
                  {tenant.isThrottled && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded animate-pulse">
                      ⚠️ THROTTLED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={tenant.rateLimit}
                    onChange={(e) => adjustRateLimit(tenant.tenantId, parseInt(e.target.value))}
                    className="bg-slate-700 text-white text-xs rounded px-2 py-1"
                  >
                    <option value="10000">10K/día</option>
                    <option value="50000">50K/día</option>
                    <option value="100000">100K/día</option>
                    <option value="500000">500K/día</option>
                    <option value="1000000">1M/día</option>
                  </select>
                  <button
                    onClick={() => toggleThrottle(tenant.tenantId)}
                    className={`px-2 py-1 text-xs rounded ${
                      tenant.isThrottled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tenant.isThrottled ? 'Liberar' : 'Throttle'}
                  </button>
                </div>
              </div>
              
              {/* Usage Bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{tenant.requestsToday.toLocaleString()} / {tenant.rateLimit.toLocaleString()}</span>
                  <span>{((tenant.requestsToday / tenant.rateLimit) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      (tenant.requestsToday / tenant.rateLimit) > 0.9 ? 'bg-red-500' :
                      (tenant.requestsToday / tenant.rateLimit) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((tenant.requestsToday / tenant.rateLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default ApiHealthDashboard
