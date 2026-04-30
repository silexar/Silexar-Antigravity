'use client'

/**
 * ðŸ“Š SILEXAR PULSE - Dashboard Ejecutivo CEO
 * Métricas financieras, proyecciones IA y KPIs empresariales
 * 
 * @description Dashboard de alto nivel para el CEO con:
 * - Ingresos mensuales/anuales
 * - Proyecciones con IA
 * - Churn rate y predicción de bajas
 * - NPS y satisfacción
 * - Comparativos temporales
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * 
 * @last_modified 2025-04-27 - Migrated to AdminDesignSystem pattern
 */

import { useState, useEffect } from 'react'
import { N, NeuCard, NeuCardSmall, NeuButton, StatCard, NeuProgress, NeuDivider, getShadow, getSmallShadow, StatusBadge } from './_sdk/AdminDesignSystem'
import {
  TrendingUp,
  DollarSign,
  Users,
  UserMinus,
  Star,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Target,
  RefreshCw,
  Download
} from 'lucide-react'

interface RevenueData {
  month: string
  actual: number
  projected: number
  previous: number
}

interface CustomerMetrics {
  totalCustomers: number
  newThisMonth: number
  churnedThisMonth: number
  churnRate: number
  predictedChurnNextMonth: number
  atRiskCustomers: number
}

interface NpsData {
  score: number
  promoters: number
  passives: number
  detractors: number
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

interface AiPrediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
  recommendation: string
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  return `$${(value / 1000).toFixed(0)}K`
}

export function ExecutiveDashboard() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null)
  const [npsData, setNpsData] = useState<NpsData | null>(null)
  const [aiPredictions, setAiPredictions] = useState<AiPrediction[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [period])

  const loadDashboardData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Revenue data por mes
    setRevenueData([
      { month: 'Jul', actual: 45000000, projected: 44000000, previous: 38000000 },
      { month: 'Ago', actual: 48000000, projected: 47000000, previous: 40000000 },
      { month: 'Sep', actual: 52000000, projected: 50000000, previous: 42000000 },
      { month: 'Oct', actual: 55000000, projected: 54000000, previous: 45000000 },
      { month: 'Nov', actual: 58000000, projected: 57000000, previous: 48000000 },
      { month: 'Dic', actual: 62000000, projected: 60000000, previous: 51000000 },
    ])

    // Customer metrics
    setCustomerMetrics({
      totalCustomers: 247,
      newThisMonth: 12,
      churnedThisMonth: 3,
      churnRate: 1.2,
      predictedChurnNextMonth: 4,
      atRiskCustomers: 8
    })

    // NPS data
    setNpsData({
      score: 72,
      promoters: 156,
      passives: 64,
      detractors: 27,
      trend: 'up',
      changePercent: 5.2
    })

    // AI Predictions
    setAiPredictions([
      {
        metric: 'Revenue Q1 2026',
        currentValue: 186000000,
        predictedValue: 215000000,
        confidence: 87,
        timeframe: 'Próximos 3 meses',
        recommendation: 'Aumentar inversión en Enterprise+ para maximizar crecimiento'
      },
      {
        metric: 'Nuevos Clientes',
        currentValue: 12,
        predictedValue: 18,
        confidence: 82,
        timeframe: 'Próximo mes',
        recommendation: 'Optimizar pipeline comercial con leads calificados'
      },
      {
        metric: 'Churn Rate',
        currentValue: 1.2,
        predictedValue: 0.9,
        confidence: 78,
        timeframe: 'Próximo trimestre',
        recommendation: 'Implementar programa de retención proactiva'
      }
    ])

    setIsLoading(false)
  }

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.actual, 0)
  const totalPrevious = revenueData.reduce((sum, d) => sum + d.previous, 0)
  const revenueGrowth = ((totalRevenue - totalPrevious) / totalPrevious * 100).toFixed(1)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #6888ff30',
            borderTopColor: '#6888ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: N.textSub }}>Cargando Dashboard Ejecutivo...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header con filtros */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>Dashboard Ejecutivo</h2>
          <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Métricas financieras y proyecciones IA</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: `${N.dark}50`, borderRadius: 8, padding: '0.25rem' }}>
            {(['month', 'quarter', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: period === p ? '#6888ff' : 'transparent',
                  color: period === p ? N.base : N.textSub,
                  fontWeight: period === p ? 600 : 400
                }}
              >
                {p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
              </button>
            ))}
          </div>
          <NeuButton variant="secondary" onClick={loadDashboardData}>
            <RefreshCw style={{ width: 16, height: 16, marginRight: 4 }} />
            Actualizar
          </NeuButton>
          <NeuButton variant="secondary">
            <Download style={{ width: 16, height: 16, marginRight: 4 }} />
            Exportar
          </NeuButton>
        </div>
      </div>

      {/* KPIs Principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Revenue Total</p>
              <p style={{ color: N.text, fontSize: '1.875rem', fontWeight: 700 }}>{formatCurrency(totalRevenue)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                <ArrowUpRight style={{ color: '#6888ff', width: 16, height: 16 }} />
                <span style={{ color: '#6888ff', fontSize: '0.875rem' }}>+{revenueGrowth}%</span>
                <span style={{ color: N.textSub, fontSize: '0.75rem' }}>vs año anterior</span>
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: '#6888ff20', borderRadius: 12 }}>
              <DollarSign style={{ color: '#6888ff', width: 32, height: 32 }} />
            </div>
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Clientes Activos</p>
              <p style={{ color: N.text, fontSize: '1.875rem', fontWeight: 700 }}>{customerMetrics?.totalCustomers}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                <ArrowUpRight style={{ color: '#6888ff', width: 16, height: 16 }} />
                <span style={{ color: '#6888ff', fontSize: '0.875rem' }}>+{customerMetrics?.newThisMonth} nuevos</span>
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: '#6888ff20', borderRadius: 12 }}>
              <Users style={{ color: '#6888ff', width: 32, height: 32 }} />
            </div>
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Churn Rate</p>
              <p style={{ color: N.text, fontSize: '1.875rem', fontWeight: 700 }}>{customerMetrics?.churnRate}%</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                <ArrowDownRight style={{ color: '#6888ff', width: 16, height: 16 }} />
                <span style={{ color: '#6888ff', fontSize: '0.875rem' }}>-0.3% vs mes anterior</span>
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: '#6888ff20', borderRadius: 12 }}>
              <UserMinus style={{ color: '#6888ff', width: 32, height: 32 }} />
            </div>
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>NPS Score</p>
              <p style={{ color: N.text, fontSize: '1.875rem', fontWeight: 700 }}>{npsData?.score}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                {npsData?.trend === 'up' ? (
                  <>
                    <ArrowUpRight style={{ color: '#6888ff', width: 16, height: 16 }} />
                    <span style={{ color: '#6888ff', fontSize: '0.875rem' }}>+{npsData?.changePercent}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight style={{ color: '#6888ff', width: 16, height: 16 }} />
                    <span style={{ color: '#6888ff', fontSize: '0.875rem' }}>-{npsData?.changePercent}%</span>
                  </>
                )}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: '#6888ff20', borderRadius: 12 }}>
              <Star style={{ color: '#6888ff', width: 32, height: 32 }} />
            </div>
          </div>
        </NeuCard>
      </div>

      {/* Gráfico de Revenue */}
      <NeuCard style={{ boxShadow: getShadow() }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 style={{ color: '#6888ff', width: 20, height: 20 }} />
            Revenue Mensual
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, background: '#6888ff', borderRadius: 4 }} />
              <span style={{ color: N.textSub }}>Actual</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, background: '#6888ff', borderRadius: 4 }} />
              <span style={{ color: N.textSub }}>Proyectado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, background: N.textSub, borderRadius: 4 }} />
              <span style={{ color: N.textSub }}>Año anterior</span>
            </div>
          </div>
        </div>

        {/* Gráfico de barras visual */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 192, gap: '0.5rem' }}>
          {revenueData.map((data) => {
            const maxValue = Math.max(...revenueData.map(d => Math.max(d.actual, d.projected, d.previous)))
            const actualHeight = (data.actual / maxValue) * 100
            const projectedHeight = (data.projected / maxValue) * 100
            const previousHeight = (data.previous / maxValue) * 100

            return (
              <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.25rem', height: 160 }}>
                  <div
                    style={{ width: 16, background: N.textSub, borderRadius: '4px 4px 0 0', height: `${previousHeight}%` }}
                    title={`Anterior: ${formatCurrency(data.previous)}`}
                  />
                  <div
                    style={{ width: 16, background: '#6888ff', borderRadius: '4px 4px 0 0', height: `${projectedHeight}%` }}
                    title={`Proyectado: ${formatCurrency(data.projected)}`}
                  />
                  <div
                    style={{ width: 16, background: '#6888ff', borderRadius: '4px 4px 0 0', height: `${actualHeight}%` }}
                    title={`Actual: ${formatCurrency(data.actual)}`}
                  />
                </div>
                <span style={{ color: N.textSub, fontSize: '0.75rem' }}>{data.month}</span>
              </div>
            )
          })}
        </div>
      </NeuCard>

      {/* Predicciones IA y Clientes en Riesgo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {/* Predicciones IA */}
        <NeuCard style={{ boxShadow: getShadow() }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain style={{ color: '#6888ff', width: 20, height: 20 }} />
            Predicciones IA
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aiPredictions.map((prediction) => (
              <div key={prediction.metric} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: N.text, fontWeight: 500 }}>{prediction.metric}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#6888ff20', color: '#6888ff', borderRadius: 4 }}>
                    {prediction.confidence}% confianza
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Actual</p>
                    <p style={{ color: N.text, fontSize: '1.125rem', fontWeight: 700 }}>
                      {prediction.metric.includes('Rate')
                        ? `${prediction.currentValue}%`
                        : prediction.currentValue >= 1000000
                          ? formatCurrency(prediction.currentValue)
                          : prediction.currentValue
                      }
                    </p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp style={{ color: '#6888ff', width: 20, height: 20 }} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Predicción</p>
                    <p style={{ color: '#6888ff', fontSize: '1.125rem', fontWeight: 700 }}>
                      {prediction.metric.includes('Rate')
                        ? `${prediction.predictedValue}%`
                        : prediction.predictedValue >= 1000000
                          ? formatCurrency(prediction.predictedValue)
                          : prediction.predictedValue
                      }
                    </p>
                  </div>
                </div>

                <p style={{ color: N.textSub, fontSize: '0.75rem' }}>
                  ðŸ’¡ {prediction.recommendation}
                </p>
              </div>
            ))}
          </div>
        </NeuCard>

        {/* Clientes en Riesgo */}
        <NeuCard style={{ boxShadow: getShadow() }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target style={{ color: '#6888ff', width: 20, height: 20 }} />
            Clientes en Riesgo de Churn
          </h3>

          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#6888ff15', borderRadius: 8, border: `1px solid #6888ff50` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6888ff', fontWeight: 500 }}>
                  {customerMetrics?.atRiskCustomers} clientes identificados
                </p>
                <p style={{ color: N.textSub, fontSize: '0.75rem' }}>
                  Predicción de {customerMetrics?.predictedChurnNextMonth} bajas próximo mes
                </p>
              </div>
              <NeuButton variant="primary" onClick={() => { }}>
                Ver Detalle
              </NeuButton>
            </div>
          </div>

          {/* Lista de clientes en riesgo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { name: 'Mega Media', risk: 85, reason: 'Sin actividad 15 días', revenue: 299000 },
              { name: 'Radio Cooperativa', risk: 72, reason: 'Licencia expira en 7 días', revenue: 599000 },
              { name: 'Tele13 Digital', risk: 68, reason: 'Baja tasa de uso', revenue: 99000 },
            ].map((client) => (
              <div key={client.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: `${N.dark}30`, borderRadius: 8 }}>
                <div>
                  <p style={{ color: N.text, fontWeight: 500 }}>{client.name}</p>
                  <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{client.reason}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    color: client.risk >= 80 ? '#6888ff' : client.risk >= 60 ? '#6888ff' : '#6888ff',
                    fontWeight: 700,
                    fontSize: '0.875rem'
                  }}>
                    {client.risk}% riesgo
                  </span>
                  <p style={{ color: N.textSub, fontSize: '0.75rem' }}>${(client.revenue / 1000).toFixed(0)}K/mes</p>
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      </div>

      {/* NPS Breakdown */}
      <NeuCard style={{ boxShadow: getShadow() }}>
        <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star style={{ color: '#6888ff', width: 20, height: 20 }} />
          Net Promoter Score - Desglose
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {/* NPS Score Grande */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#6888ff15', borderRadius: 12 }}>
            <p style={{ color: N.text, fontSize: '3.75rem', fontWeight: 700 }}>{npsData?.score}</p>
            <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '0.5rem' }}>NPS Score</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
              {npsData?.trend === 'up' && <TrendingUp style={{ color: '#6888ff', width: 16, height: 16 }} />}
              <span style={{ color: npsData?.trend === 'up' ? '#6888ff' : '#6888ff', fontSize: '0.875rem' }}>
                {npsData?.trend === 'up' ? '+' : '-'}{npsData?.changePercent}%
              </span>
            </div>
          </div>

          {/* Promotores */}
          <div style={{ padding: '1rem', background: '#6888ff15', borderRadius: 8, border: '1px solid #6888ff50' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 12, height: 12, background: '#6888ff', borderRadius: '50%' }} />
              <span style={{ color: '#6888ff', fontWeight: 500 }}>Promotores (9-10)</span>
            </div>
            <p style={{ color: N.text, fontSize: '1.875rem', fontWeight: 700 }}>{npsData?.promoters}</p>
            <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {((npsData?.promoters || 0) / (customerMetrics?.totalCustomers || 1) * 100).toFixed(0)}% del total
            </p>
          </div>

          {/* Pasivos */}
          <div style={{ padding: '1rem', background: '#6888ff15', borderRadius: 8, border: '1px solid #6888ff50' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 12, height: 12, background: '#6888ff', borderRadius: '50%' }} />
              <span style={{ color: '#6888ff', fontWeight: 500 }}>Pasivos (7-8)</span>
            </div>
            <p style={{ color: N.text, fontSize: '1.875rem', fontWeight: 700 }}>{npsData?.passives}</p>
            <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {((npsData?.passives || 0) / (customerMetrics?.totalCustomers || 1) * 100).toFixed(0)}% del total
            </p>
          </div>

          {/* Detractores */}
          <div style={{ padding: '1rem', background: '#6888ff15', borderRadius: 8, border: '1px solid #6888ff50' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 12, height: 12, background: '#6888ff', borderRadius: '50%' }} />
              <span style={{ color: '#6888ff', fontWeight: 500 }}>Detractores (0-6)</span>
            </div>
            <p style={{ color: N.text, fontSize: '1.875rem', fontWeight: 700 }}>{npsData?.detractors}</p>
            <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {((npsData?.detractors || 0) / (customerMetrics?.totalCustomers || 1) * 100).toFixed(0)}% del total
            </p>
          </div>
        </div>
      </NeuCard>
    </div>
  )
}

export default ExecutiveDashboard
