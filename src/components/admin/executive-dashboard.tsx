'use client'

/**
 * 📊 SILEXAR PULSE - Dashboard Ejecutivo CEO
 * Métricas financieras, proyecciones IA y KPIs empresariales
 * 
 * @description Dashboard de alto nivel para el CEO con:
 * - Ingresos mensuales/anuales
 * - Proyecciones con IA
 * - Churn rate y predicción de bajas
 * - NPS y satisfacción
 * - Comparativos temporales
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton, 
  NeuromorphicGrid
} from '@/components/ui/neuromorphic'
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

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${(value / 1000).toFixed(0)}K`
  }

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.actual, 0)
  const totalPrevious = revenueData.reduce((sum, d) => sum + d.previous, 0)
  const revenueGrowth = ((totalRevenue - totalPrevious) / totalPrevious * 100).toFixed(1)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Dashboard Ejecutivo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Ejecutivo</h2>
          <p className="text-slate-400">Métricas financieras y proyecciones IA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            {(['month', 'quarter', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded ${
                  period === p ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
              </button>
            ))}
          </div>
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </NeuromorphicButton>
        </div>
      </div>

      {/* KPIs Principales */}
      <NeuromorphicGrid columns={4} gap="md">
        <NeuromorphicCard variant="glow" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase mb-1">Revenue Total</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+{revenueGrowth}%</span>
                <span className="text-xs text-slate-400">vs año anterior</span>
              </div>
            </div>
            <div className="p-3 bg-green-600/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase mb-1">Clientes Activos</p>
              <p className="text-3xl font-bold text-white">{customerMetrics?.totalCustomers}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+{customerMetrics?.newThisMonth} nuevos</span>
              </div>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase mb-1">Churn Rate</p>
              <p className="text-3xl font-bold text-white">{customerMetrics?.churnRate}%</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowDownRight className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">-0.3% vs mes anterior</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-600/20 rounded-xl">
              <UserMinus className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase mb-1">NPS Score</p>
              <p className="text-3xl font-bold text-white">{npsData?.score}</p>
              <div className="flex items-center gap-1 mt-2">
                {npsData?.trend === 'up' ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">+{npsData?.changePercent}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">-{npsData?.changePercent}%</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </NeuromorphicCard>
      </NeuromorphicGrid>

      {/* Gráfico de Revenue */}
      <NeuromorphicCard variant="embossed" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Revenue Mensual
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-slate-400">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-slate-400">Proyectado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-600 rounded" />
              <span className="text-slate-400">Año anterior</span>
            </div>
          </div>
        </div>

        {/* Gráfico de barras visual */}
        <div className="flex items-end justify-between h-48 gap-2">
          {revenueData.map((data, i) => {
            const maxValue = Math.max(...revenueData.map(d => Math.max(d.actual, d.projected, d.previous)))
            const actualHeight = (data.actual / maxValue) * 100
            const projectedHeight = (data.projected / maxValue) * 100
            const previousHeight = (data.previous / maxValue) * 100
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-40">
                  <div 
                    className="w-4 bg-slate-600 rounded-t transition-all"
                    style={{ height: `${previousHeight}%` }}
                    title={`Anterior: ${formatCurrency(data.previous)}`}
                  />
                  <div 
                    className="w-4 bg-blue-500 rounded-t transition-all"
                    style={{ height: `${projectedHeight}%` }}
                    title={`Proyectado: ${formatCurrency(data.projected)}`}
                  />
                  <div 
                    className="w-4 bg-green-500 rounded-t transition-all"
                    style={{ height: `${actualHeight}%` }}
                    title={`Actual: ${formatCurrency(data.actual)}`}
                  />
                </div>
                <span className="text-xs text-slate-400">{data.month}</span>
              </div>
            )
          })}
        </div>
      </NeuromorphicCard>

      {/* Predicciones IA y Clientes en Riesgo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predicciones IA */}
        <NeuromorphicCard variant="glow" className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Predicciones IA
          </h3>
          
          <div className="space-y-4">
            {aiPredictions.map((prediction, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{prediction.metric}</span>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                    {prediction.confidence}% confianza
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <p className="text-xs text-slate-400">Actual</p>
                    <p className="text-lg font-bold text-white">
                      {prediction.metric.includes('Rate') 
                        ? `${prediction.currentValue}%`
                        : prediction.currentValue >= 1000000 
                          ? formatCurrency(prediction.currentValue) 
                          : prediction.currentValue
                      }
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Predicción</p>
                    <p className="text-lg font-bold text-green-400">
                      {prediction.metric.includes('Rate') 
                        ? `${prediction.predictedValue}%`
                        : prediction.predictedValue >= 1000000 
                          ? formatCurrency(prediction.predictedValue) 
                          : prediction.predictedValue
                      }
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400">
                  💡 {prediction.recommendation}
                </p>
              </div>
            ))}
          </div>
        </NeuromorphicCard>

        {/* Clientes en Riesgo */}
        <NeuromorphicCard variant="embossed" className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            Clientes en Riesgo de Churn
          </h3>
          
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 font-medium">
                  {customerMetrics?.atRiskCustomers} clientes identificados
                </p>
                <p className="text-xs text-slate-400">
                  Predicción de {customerMetrics?.predictedChurnNextMonth} bajas próximo mes
                </p>
              </div>
              <NeuromorphicButton variant="primary" size="sm">
                Ver Detalle
              </NeuromorphicButton>
            </div>
          </div>

          {/* Lista de clientes en riesgo */}
          <div className="space-y-2">
            {[
              { name: 'Mega Media', risk: 85, reason: 'Sin actividad 15 días', revenue: 299000 },
              { name: 'Radio Cooperativa', risk: 72, reason: 'Licencia expira en 7 días', revenue: 599000 },
              { name: 'Tele13 Digital', risk: 68, reason: 'Baja tasa de uso', revenue: 99000 },
            ].map((client, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">{client.name}</p>
                  <p className="text-xs text-slate-400">{client.reason}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    client.risk >= 80 ? 'text-red-400' : 
                    client.risk >= 60 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {client.risk}% riesgo
                  </span>
                  <p className="text-xs text-slate-400">${(client.revenue/1000).toFixed(0)}K/mes</p>
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      </div>

      {/* NPS Breakdown */}
      <NeuromorphicCard variant="embossed" className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          Net Promoter Score - Desglose
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* NPS Score Grande */}
          <div className="flex flex-col items-center justify-center p-6 bg-purple-500/10 rounded-xl">
            <p className="text-6xl font-bold text-white">{npsData?.score}</p>
            <p className="text-sm text-slate-400 mt-2">NPS Score</p>
            <div className="flex items-center gap-1 mt-2">
              {npsData?.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
              <span className={`text-sm ${npsData?.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {npsData?.trend === 'up' ? '+' : '-'}{npsData?.changePercent}%
              </span>
            </div>
          </div>

          {/* Promotores */}
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-green-400 font-medium">Promotores (9-10)</span>
            </div>
            <p className="text-3xl font-bold text-white">{npsData?.promoters}</p>
            <p className="text-sm text-slate-400 mt-1">
              {((npsData?.promoters || 0) / (customerMetrics?.totalCustomers || 1) * 100).toFixed(0)}% del total
            </p>
          </div>

          {/* Pasivos */}
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-yellow-400 font-medium">Pasivos (7-8)</span>
            </div>
            <p className="text-3xl font-bold text-white">{npsData?.passives}</p>
            <p className="text-sm text-slate-400 mt-1">
              {((npsData?.passives || 0) / (customerMetrics?.totalCustomers || 1) * 100).toFixed(0)}% del total
            </p>
          </div>

          {/* Detractores */}
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-red-400 font-medium">Detractores (0-6)</span>
            </div>
            <p className="text-3xl font-bold text-white">{npsData?.detractors}</p>
            <p className="text-sm text-slate-400 mt-1">
              {((npsData?.detractors || 0) / (customerMetrics?.totalCustomers || 1) * 100).toFixed(0)}% del total
            </p>
          </div>
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default ExecutiveDashboard
