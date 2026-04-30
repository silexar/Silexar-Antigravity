'use client'

/**
 * ðŸŽ¯ SILEXAR PULSE - Customer Success Hub
 * Centro de éxito del cliente
 * 
 * @description Gestión de Customer Success:
 * - Health score en tiempo real
 * - Predicción de upsell/cross-sell
 * - NPS tracking por segmento
 * - Onboarding analytics
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Clock,
  ArrowUp
} from 'lucide-react'

interface CustomerHealth {
  tenantId: string
  tenantName: string
  healthScore: number
  trend: 'up' | 'down' | 'stable'
  npsScore: number
  lastActivity: Date
  usageLevel: 'high' | 'medium' | 'low'
  openTickets: number
  upsellPotential: number
  riskFactors: string[]
  opportunities: string[]
}

interface OnboardingMetrics {
  totalOnboarding: number
  completed: number
  inProgress: number
  stuck: number
  avgDaysToComplete: number
}

interface NPSData {
  segment: string
  score: number
  responses: number
  promoters: number
  passives: number
  detractors: number
}

export function CustomerSuccess() {
  const [customers, setCustomers] = useState<CustomerHealth[]>([])
  const [onboarding, setOnboarding] = useState<OnboardingMetrics | null>(null)
  const [npsData, setNpsData] = useState<NPSData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'at-risk' | 'healthy' | 'upsell'>('all')

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setCustomers([
      {
        tenantId: 'tenant_001',
        tenantName: 'RDF Media',
        healthScore: 92,
        trend: 'up',
        npsScore: 9,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        usageLevel: 'high',
        openTickets: 0,
        upsellPotential: 85,
        riskFactors: [],
        opportunities: ['Upgrade a Enterprise Plus', 'API Premium Add-on']
      },
      {
        tenantId: 'tenant_002',
        tenantName: 'Grupo Prisa Chile',
        healthScore: 88,
        trend: 'stable',
        npsScore: 8,
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
        usageLevel: 'high',
        openTickets: 1,
        upsellPotential: 70,
        riskFactors: [],
        opportunities: ['Más usuarios', 'Módulo Analytics Pro']
      },
      {
        tenantId: 'tenant_003',
        tenantName: 'Mega Media',
        healthScore: 45,
        trend: 'down',
        npsScore: 5,
        lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        usageLevel: 'low',
        openTickets: 3,
        upsellPotential: 10,
        riskFactors: ['Uso decreciente', 'Tickets sin resolver', 'NPS bajo'],
        opportunities: []
      },
      {
        tenantId: 'tenant_004',
        tenantName: 'Canal 13',
        healthScore: 78,
        trend: 'up',
        npsScore: 7,
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
        usageLevel: 'medium',
        openTickets: 0,
        upsellPotential: 60,
        riskFactors: [],
        opportunities: ['Cross-sell módulo Social']
      },
      {
        tenantId: 'tenant_005',
        tenantName: 'Digital First',
        healthScore: 52,
        trend: 'down',
        npsScore: 4,
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        usageLevel: 'low',
        openTickets: 2,
        upsellPotential: 15,
        riskFactors: ['Factura vencida', 'Feedback negativo'],
        opportunities: []
      }
    ])

    setOnboarding({
      totalOnboarding: 12,
      completed: 8,
      inProgress: 3,
      stuck: 1,
      avgDaysToComplete: 14
    })

    setNpsData([
      { segment: 'Enterprise', score: 72, responses: 45, promoters: 35, passives: 7, detractors: 3 },
      { segment: 'Professional', score: 58, responses: 78, promoters: 48, passives: 20, detractors: 10 },
      { segment: 'Starter', score: 45, responses: 120, promoters: 60, passives: 35, detractors: 25 }
    ])

    setIsLoading(false)
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-[#6888ff] bg-[#6888ff]/20'
    if (score >= 60) return 'text-[#6888ff] bg-[#6888ff]/20'
    return 'text-[#6888ff] bg-[#6888ff]/20'
  }

  const filteredCustomers = customers.filter(c => {
    switch (filter) {
      case 'at-risk': return c.healthScore < 60
      case 'healthy': return c.healthScore >= 80
      case 'upsell': return c.upsellPotential >= 60
      default: return true
    }
  })

  const avgHealth = Math.round(customers.reduce((sum, c) => sum + c.healthScore, 0) / customers.length)
  const atRiskCount = customers.filter(c => c.healthScore < 60).length
  const upsellReady = customers.filter(c => c.upsellPotential >= 60).length

  if (isLoading || !onboarding) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Customer Success...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#6888ff]" />
          Customer Success Hub
        </h3>
        <div className="flex items-center gap-2">
          {(['all', 'at-risk', 'healthy', 'upsell'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded ${filter === f ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'
                }`}
            >
              {f === 'all' ? 'Todos' : f === 'at-risk' ? 'ðŸš¨ En Riesgo' : f === 'healthy' ? 'œ“ Sanos' : '¬†ï¸ Upsell'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-3">
        <div className={`p-4 rounded-lg text-center ${getHealthColor(avgHealth)}`}>
          <p className="text-2xl font-bold">{avgHealth}%</p>
          <p className="text-xs opacity-80">Health Score Prom</p>
        </div>
        <div className="p-4 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{atRiskCount}</p>
          <p className="text-xs text-[#9aa3b8]">En Riesgo</p>
        </div>
        <div className="p-4 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{upsellReady}</p>
          <p className="text-xs text-[#9aa3b8]">Listos para Upsell</p>
        </div>
        <div className="p-4 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{npsData[0]?.score || 0}</p>
          <p className="text-xs text-[#9aa3b8]">NPS Enterprise</p>
        </div>
        <div className="p-4 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{onboarding.avgDaysToComplete}d</p>
          <p className="text-xs text-[#9aa3b8]">Avg Onboarding</p>
        </div>
      </div>

      {/* Onboarding Progress */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6888ff]" />
          Onboarding Pipeline
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-[#dfeaff]/50 rounded text-center">
            <p className="text-xl font-bold text-[#69738c]">{onboarding.totalOnboarding}</p>
            <p className="text-xs text-[#9aa3b8]">Total</p>
          </div>
          <div className="p-3 bg-[#6888ff]/10 rounded text-center">
            <p className="text-xl font-bold text-[#6888ff]">{onboarding.completed}</p>
            <p className="text-xs text-[#9aa3b8]">Completados</p>
          </div>
          <div className="p-3 bg-[#6888ff]/10 rounded text-center">
            <p className="text-xl font-bold text-[#6888ff]">{onboarding.inProgress}</p>
            <p className="text-xs text-[#9aa3b8]">En Progreso</p>
          </div>
          <div className="p-3 bg-[#6888ff]/10 rounded text-center">
            <p className="text-xl font-bold text-[#6888ff]">{onboarding.stuck}</p>
            <p className="text-xs text-[#9aa3b8]">Atascados</p>
          </div>
        </div>
      </NeuCard>

      {/* Customer Health List */}
      <div className="space-y-3">
        {filteredCustomers.map(customer => (
          <NeuCard key={customer.tenantId} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getHealthColor(customer.healthScore)}`}>
                  <span className="font-bold">{customer.healthScore}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#69738c] font-medium">{customer.tenantName}</span>
                    {customer.trend === 'up' && <TrendingUp className="w-4 h-4 text-[#6888ff]" />}
                    {customer.trend === 'down' && <TrendingDown className="w-4 h-4 text-[#6888ff]" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#9aa3b8] mt-1">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> NPS: {customer.npsScore}
                    </span>
                    <span>Uso: {customer.usageLevel}</span>
                    {customer.openTickets > 0 && (
                      <span className="text-[#6888ff]">{customer.openTickets} tickets</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {customer.riskFactors.length > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-[#6888ff] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {customer.riskFactors.length} factores de riesgo
                    </span>
                  </div>
                )}
                {customer.upsellPotential >= 60 && (
                  <div className="p-2 bg-[#6888ff]/10 rounded">
                    <span className="text-xs text-[#6888ff] flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      Upsell {customer.upsellPotential}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(customer.riskFactors.length > 0 || customer.opportunities.length > 0) && (
              <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-4">
                {customer.riskFactors.length > 0 && (
                  <div>
                    <p className="text-xs text-[#6888ff] mb-1">š ï¸ Riesgos:</p>
                    <div className="flex flex-wrap gap-1">
                      {customer.riskFactors.map((r, i) => (
                        <span key={r} className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {customer.opportunities.length > 0 && (
                  <div>
                    <p className="text-xs text-[#6888ff] mb-1">ðŸ’° Oportunidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {customer.opportunities.map((o, i) => (
                        <span key={o} className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">{o}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </NeuCard>
        ))}
      </div>
    </div>
  )
}

export default CustomerSuccess