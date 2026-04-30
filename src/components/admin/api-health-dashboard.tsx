'use client'

/**
 * ðŸ“Š SILEXAR PULSE - API Health & Rate Limiting
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
 * @last_modified 2025-04-28 - Migrated to AdminDesignSystem pattern
 */

import { useState, useEffect } from 'react'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
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
  method: 'GET' | 'POST' | 'PUT' | 'Eliminar'
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

    setAiRecommendations([
      'ðŸ“Š /api/analytics muestra latencia alta. Considerar caché adicional.',
      'š ï¸ Mega Media cerca del límite de rate. Sugerir upgrade a Enterprise.',
      'ðŸš€ /api/ai/predictions tiene 2.1% errores. Revisar logs de modelo ML.'
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'healthy': return { background: N.accent }
      case 'degraded': return { background: N.accent }
      case 'down': return { background: N.accent }
      default: return { background: N.textSub }
    }
  }

  const getMethodStyle = (method: string) => {
    switch (method) {
      case 'GET': return { background: `${N.accent}20`, color: N.accent }
      case 'POST': return { background: `${N.accent}20`, color: N.accent }
      case 'PUT': return { background: `${N.accent}20`, color: N.accent }
      case 'Eliminar': return { background: `${N.accent}20`, color: N.accent }
      default: return { background: `${N.dark}20`, color: N.textSub }
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid ${N.dark}30',
            borderTopColor: N.accent,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: N.textSub }}>Cargando API Health...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Activity style={{ width: 20, height: 20, color: N.accent }} />
          API Health & Rate Limiting
        </h3>
        <NeuButton variant="secondary" onClick={loadApiData}>
          <RefreshCw style={{ width: 16, height: 16 }} />
        </NeuButton>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
        <div style={{ padding: '12px', background: `${N.dark}30`, borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Server style={{ width: 16, height: 16, color: N.accent }} />
            <span style={{ color: N.textSub, fontSize: '0.75rem' }}>Requests Hoy</span>
          </div>
          <p style={{ color: N.text, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{(stats?.totalRequests || 0).toLocaleString()}</p>
        </div>
        <div style={{ padding: '12px', background: `${N.dark}30`, borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock style={{ width: 16, height: 16, color: N.accent }} />
            <span style={{ color: N.textSub, fontSize: '0.75rem' }}>Latencia Prom</span>
          </div>
          <p style={{ color: N.text, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{stats?.avgLatency}ms</p>
        </div>
        <div style={{ padding: '12px', background: `${N.dark}30`, borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <XCircle style={{ width: 16, height: 16, color: N.accent }} />
            <span style={{ color: N.textSub, fontSize: '0.75rem' }}>Error Rate</span>
          </div>
          <p style={{ color: N.text, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{stats?.errorRate}%</p>
        </div>
        <div style={{ padding: '12px', background: `${N.accent}10`, borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CheckCircle style={{ width: 16, height: 16, color: N.accent }} />
            <span style={{ color: N.textSub, fontSize: '0.75rem' }}>Uptime</span>
          </div>
          <p style={{ color: N.accent, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{stats?.uptime}%</p>
        </div>
        <div style={{ padding: '12px', background: `${N.accent}10`, borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <AlertTriangle style={{ width: 16, height: 16, color: N.accent }} />
            <span style={{ color: N.textSub, fontSize: '0.75rem' }}>Throttled</span>
          </div>
          <p style={{ color: N.accent, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{stats?.throttledRequests}</p>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1rem', background: N.base }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Brain style={{ width: 16, height: 16, color: N.accent }} />
            <span style={{ color: N.text, fontSize: '0.875rem', fontWeight: 500 }}>Recomendaciones IA</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {aiRecommendations.map((rec, i) => (
              <p key={i} style={{ color: N.textSub, fontSize: '0.75rem' }}>{rec}</p>
            ))}
          </div>
        </NeuCard>
      )}

      {/* Endpoints Status */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 style={{ color: N.text, fontWeight: 600, marginBottom: '12px' }}>Estado de Endpoints</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {endpoints.map(ep => (
            <div key={ep.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: `${N.dark}15`, borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', ...getStatusDot(ep.status) }} />
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', ...getMethodStyle(ep.method) }}>
                  {ep.method}
                </span>
                <code style={{ color: N.text, fontSize: '0.875rem' }}>{ep.path}</code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.75rem', color: N.textSub }}>
                <span>{ep.requestsToday.toLocaleString()} req</span>
                <span>{ep.avgLatency}ms</span>
                <span style={{ color: ep.errorRate > 1 ? N.accent : N.textSub }}>{ep.errorRate}% err</span>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Tenant Usage */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 style={{ color: N.text, fontWeight: 600, marginBottom: '12px' }}>Uso de API por Tenant</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tenantUsage.map(tenant => (
            <div key={tenant.tenantId} style={{
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${tenant.isThrottled ? N.accent : N.dark}30`,
              background: tenant.isThrottled ? `${N.accent}10` : `${N.dark}15`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Building2 style={{ width: 16, height: 16, color: N.textSub }} />
                  <span style={{ color: N.text, fontWeight: 500 }}>{tenant.tenantName}</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: `${N.dark}50`, color: N.textSub, borderRadius: '4px' }}>
                    {tenant.plan}
                  </span>
                  {tenant.isThrottled && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: `${N.accent}20`, color: N.accent, borderRadius: '4px', animation: 'pulse 2s infinite' }}>
                      š ï¸ THROTTLED
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={tenant.rateLimit}
                    onChange={(e) => adjustRateLimit(tenant.tenantId, parseInt(e.target.value))}
                    style={{ background: N.dark, color: N.text, fontSize: '0.75rem', borderRadius: '4px', padding: '4px 8px', border: `1px solid ${N.dark}50` }}
                  >
                    <option value="10000">10K/día</option>
                    <option value="50000">50K/día</option>
                    <option value="100000">100K/día</option>
                    <option value="500000">500K/día</option>
                    <option value="1000000">1M/día</option>
                  </select>
                  <button
                    onClick={() => toggleThrottle(tenant.tenantId)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: tenant.isThrottled ? `${N.accent}20` : `${N.accent}20`,
                      color: tenant.isThrottled ? N.accent : N.accent
                    }}
                  >
                    {tenant.isThrottled ? 'Liberar' : 'Throttle'}
                  </button>
                </div>
              </div>

              {/* Usage Bar */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: N.textSub }}>{tenant.requestsToday.toLocaleString()} / {tenant.rateLimit.toLocaleString()}</span>
                  <span style={{ fontSize: '0.75rem', color: N.textSub }}>{((tenant.requestsToday / tenant.rateLimit) * 100).toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: N.dark, borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      transition: 'all 0.3s',
                      background: (tenant.requestsToday / tenant.rateLimit) > 0.9 ? N.accent :
                        (tenant.requestsToday / tenant.rateLimit) > 0.7 ? N.accent : N.accent,
                      width: `${Math.min((tenant.requestsToday / tenant.rateLimit) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default ApiHealthDashboard
