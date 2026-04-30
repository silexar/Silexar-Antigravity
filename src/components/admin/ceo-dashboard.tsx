'use client'

/**
 * ðŸ“Š SILEXAR PULSE - CEO Executive Dashboard
 * Dashboard ejecutivo consolidado para CEO/Super Admin
 * 
 * @description Dashboard Features:
 * - Revenue metrics consolidados
 * - Métricas de adopción por tenant
 * - KPIs de negocio
 * - Alertas ejecutivas
 * - Proyecciones financieras
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @access CEO / Super Admin
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Users, Building, BarChart3, Globe, Zap,
  CheckCircle, Download, RefreshCw, ChevronUp, ChevronDown, Target
} from 'lucide-react'

interface RevenueMetric {
  label: string
  current: number
  previous: number
  change: number
  format: 'currency' | 'number' | 'percent'
}

interface TenantAdoption {
  tenantId: string
  name: string
  plan: string
  usersActive: number
  usersTotal: number
  mrr: number
  health: 'excellent' | 'good' | 'at_risk' | 'churning'
  lastActivity: Date
}

interface KPI {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
}

export function CEODashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d')
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetric[]>([])
  const [tenantAdoption, setTenantAdoption] = useState<TenantAdoption[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])

  useEffect(() => { loadData() }, [timeRange])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))

    setRevenueMetrics([
      { label: 'MRR', current: 125000, previous: 118000, change: 5.9, format: 'currency' },
      { label: 'ARR', current: 1500000, previous: 1416000, change: 5.9, format: 'currency' },
      { label: 'Nuevos Clientes', current: 12, previous: 8, change: 50, format: 'number' },
      { label: 'Churn Rate', current: 2.1, previous: 2.8, change: -25, format: 'percent' },
      { label: 'LTV Promedio', current: 45000, previous: 42000, change: 7.1, format: 'currency' },
      { label: 'CAC', current: 8500, previous: 9200, change: -7.6, format: 'currency' }
    ])

    const now = new Date()
    setTenantAdoption([
      { tenantId: 't1', name: 'Tech Solutions Inc', plan: 'Enterprise', usersActive: 42, usersTotal: 45, mrr: 4500, health: 'excellent', lastActivity: new Date() },
      { tenantId: 't2', name: 'Media Corp', plan: 'Professional', usersActive: 18, usersTotal: 23, mrr: 2500, health: 'good', lastActivity: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
      { tenantId: 't3', name: 'Finance Pro', plan: 'Enterprise', usersActive: 58, usersTotal: 67, mrr: 5500, health: 'excellent', lastActivity: new Date() },
      { tenantId: 't4', name: 'Retail Plus', plan: 'Starter', usersActive: 2, usersTotal: 5, mrr: 500, health: 'at_risk', lastActivity: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { tenantId: 't5', name: 'Health Systems', plan: 'Professional', usersActive: 28, usersTotal: 34, mrr: 2800, health: 'good', lastActivity: new Date(now.getTime() - 1 * 60 * 60 * 1000) }
    ])

    setKpis([
      { id: 'nps', name: 'NPS Score', value: 72, target: 70, unit: '', trend: 'up' },
      { id: 'uptime', name: 'Uptime', value: 99.99, target: 99.9, unit: '%', trend: 'stable' },
      { id: 'tickets_resolved', name: 'Tickets Resueltos', value: 156, target: 150, unit: '', trend: 'up' },
      { id: 'avg_response', name: 'Tiempo Respuesta', value: 2.3, target: 4, unit: 'hrs', trend: 'up' },
      { id: 'feature_adoption', name: 'Adopción Features', value: 78, target: 75, unit: '%', trend: 'up' },
      { id: 'user_satisfaction', name: 'Satisfacción', value: 4.6, target: 4.5, unit: '/5', trend: 'up' }
    ])

    setIsLoading(false)
  }

  const formatValue = (value: number, format: 'currency' | 'number' | 'percent') => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'percent':
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  const getHealthColor = (health: TenantAdoption['health']) => {
    switch (health) {
      case 'excellent': return 'bg-[#6888ff]/20 text-[#6888ff] border-[#6888ff]/30'
      case 'good': return 'bg-[#6888ff]/20 text-[#6888ff] border-[#6888ff]/30'
      case 'at_risk': return 'bg-[#6888ff]/20 text-[#6888ff] border-yellow-500/30'
      case 'churning': return 'bg-[#6888ff]/20 text-[#6888ff] border-[#6888ff]/30'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#69738c] flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#6888ff]" />
            Dashboard Ejecutivo
          </h2>
          <p className="text-[#9aa3b8]">Vista consolidada del negocio Silexar Pulse</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#dfeaff] rounded-lg p-1">
            {(['7d', '30d', '90d', 'ytd'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${timeRange === range
                  ? 'bg-[#6888ff] text-white'
                  : 'text-[#9aa3b8] hover:text-[#69738c]'
                  }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <NeuButton variant="secondary" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </NeuButton>
          <NeuButton variant="secondary">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </NeuButton>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {revenueMetrics.map((metric, i) => (
          <NeuCard key={metric.label} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <p className="text-xs text-[#9aa3b8] mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-[#69738c]">{formatValue(metric.current, metric.format)}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${metric.change > 0
              ? (metric.label === 'CAC' || metric.label === 'Churn Rate' ? 'text-[#6888ff]' : 'text-[#6888ff]')
              : (metric.label === 'CAC' || metric.label === 'Churn Rate' ? 'text-[#6888ff]' : 'text-[#6888ff]')
              }`}>
              {metric.change > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {Math.abs(metric.change)}%
              <span className="text-[#9aa3b8]">vs anterior</span>
            </div>
          </NeuCard>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Tenant Adoption */}
        <div className="col-span-8">
          <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1.5rem', background: N.base }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#69738c] font-medium flex items-center gap-2">
                <Building className="w-5 h-5 text-[#6888ff]" />
                Adopción por Cliente
              </h3>
              <span className="text-xs text-[#9aa3b8]">{tenantAdoption.length} clientes activos</span>
            </div>
            <div className="space-y-3">
              {tenantAdoption.map(tenant => (
                <div key={tenant.tenantId} className="p-4 bg-[#dfeaff]/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#69738c] font-medium">{tenant.name}</p>
                        <p className="text-xs text-[#9aa3b8]">{tenant.plan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[#69738c] font-medium">${tenant.mrr.toLocaleString()}</p>
                        <p className="text-xs text-[#9aa3b8]">MRR</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${getHealthColor(tenant.health)}`}>
                        {tenant.health === 'excellent' ? 'ðŸŒŸ Excelente' :
                          tenant.health === 'good' ? 'œ… Bueno' :
                            tenant.health === 'at_risk' ? 'š ï¸ En Riesgo' : 'ðŸš¨ Churning'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#9aa3b8]">Usuarios activos</span>
                        <span className="text-[#69738c]">{tenant.usersActive}/{tenant.usersTotal}</span>
                      </div>
                      <div className="h-2 bg-[#dfeaff] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                          style={{ width: `${(tenant.usersActive / tenant.usersTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-[#9aa3b8]">
                      Ášltima actividad: {tenant.lastActivity.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        </div>

        {/* KPIs */}
        <div className="col-span-4 space-y-4">
          <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1.5rem', background: N.base }}>
            <h3 className="text-[#69738c] font-medium mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#6888ff]" />
              KPIs de Negocio
            </h3>
            <div className="space-y-4">
              {kpis.map(kpi => {
                const progress = (kpi.value / kpi.target) * 100
                const onTarget = kpi.value >= kpi.target
                return (
                  <div key={kpi.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#9aa3b8]">{kpi.name}</span>
                      <span className={onTarget ? 'text-[#6888ff]' : 'text-[#6888ff]'}>
                        {kpi.value}{kpi.unit}
                        <span className="text-[#9aa3b8] text-xs ml-1">/ {kpi.target}{kpi.unit}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-[#dfeaff] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${onTarget ? 'bg-[#6888ff]' : 'bg-[#6888ff]'}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </NeuCard>

          {/* Quick Stats */}
          <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
            <h3 className="text-[#69738c] font-medium mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#6888ff]" />
              Resumen Rápido
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#6888ff]/10 rounded-lg border border-[#6888ff]/30">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#6888ff]" />
                  <span className="text-[#6888ff]">Sistema Operativo</span>
                </div>
                <span className="text-[#69738c] font-bold">99.99%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#6888ff]/10 rounded-lg border border-[#6888ff]/30">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#6888ff]" />
                  <span className="text-[#6888ff]">Usuarios Online</span>
                </div>
                <span className="text-[#69738c] font-bold">1,247</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#6888ff]/10 rounded-lg border border-[#6888ff]/30">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#6888ff]" />
                  <span className="text-[#6888ff]">Regiones Activas</span>
                </div>
                <span className="text-[#69738c] font-bold">7</span>
              </div>
            </div>
          </NeuCard>
        </div>
      </div>
    </div>
  )
}

export default CEODashboard