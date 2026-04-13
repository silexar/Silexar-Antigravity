/**
 * VALUE METRICS DASHBOARD - TIER 0 Silexar Pulse 2.0
 * Dashboard de Métricas de Valor (CPVI/CPCN)
 * 
 * @description Dashboard especializado para visualizar métricas de facturación
 * basada en valor, incluyendo CPVI, CPCN y análisis de ROI
 * 
 * @version 2040.20.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Silexar Pulse 2.0 Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap,
  Users,
  MousePointer,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Star,
  Award,
  Coins,
  CreditCard,
  Calculator,
  Eye,
  Clock,
  ThumbsUp
} from 'lucide-react'

// Interfaces para métricas de valor
interface ValueMetrics {
  campaign_id: string
  campaign_name: string
  billing_model: 'CPM' | 'CPC' | 'CPVI' | 'CPCN'
  period: {
    start_date: string
    end_date: string
  }
  financial_metrics: {
    total_spend: number
    total_revenue: number
    roi: number
    cost_per_acquisition: number
    average_order_value: number
    lifetime_value: number
  }
  interaction_metrics: {
    total_interactions: number
    valuable_interactions: number
    interaction_rate: number
    quality_score: number
    satisfaction_score: number
    completion_rate: number
  }
  narrative_metrics?: {
    completed_narratives: number
    average_journey_time: number
    narrative_completion_rate: number
    engagement_depth: number
  }
  trends: Array<{
    date: string
    spend: number
    revenue: number
    interactions: number
    quality_score: number
  }>
}

interface BillingComparison {
  model: string
  spend: number
  interactions: number
  roi: number
  efficiency_score: number
  color: string
}

interface ValueInteractionBreakdown {
  interaction_type: string
  count: number
  average_value: number
  total_value: number
  quality_score: number
  conversion_rate: number
}

export function ValueMetricsDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d')
  const [valueMetrics, setValueMetrics] = useState<ValueMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'models' | 'campaigns' | 'periods'>('models')

  // Mock data para campañas con facturación basada en valor
  const valueCampaigns = [
    { id: 'camp_001', name: 'Banco XYZ - Calculadora Préstamos (CPVI)', model: 'CPVI' },
    { id: 'camp_002', name: 'Retail ABC - Journey Narrativo (CPCN)', model: 'CPCN' },
    { id: 'camp_003', name: 'Tech Corp - Utilidades Múltiples (CPVI)', model: 'CPVI' },
    { id: 'camp_004', name: 'Seguros DEF - Narrativa Completa (CPCN)', model: 'CPCN' }
  ]

  // Generar datos mock de métricas de valor
  const generateMockValueMetrics = (campaignId: string): ValueMetrics => {
    const campaign = valueCampaigns.find(c => c.id === campaignId)
    const isNarrative = campaign?.model === 'CPCN'

    const trends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      spend: Math.floor(Math.random() * 5000) + 15000,
      revenue: Math.floor(Math.random() * 15000) + 45000,
      interactions: Math.floor(Math.random() * 500) + 1200,
      quality_score: Math.random() * 20 + 75
    }))

    return {
      campaign_id: campaignId,
      campaign_name: campaign?.name || 'Campaña Desconocida',
      billing_model: campaign?.model as unknown || 'CPVI',
      period: {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      },
      financial_metrics: {
        total_spend: 485000,
        total_revenue: 1450000,
        roi: 199.2,
        cost_per_acquisition: 45.50,
        average_order_value: 125.80,
        lifetime_value: 890.50
      },
      interaction_metrics: {
        total_interactions: 34520,
        valuable_interactions: 12840,
        interaction_rate: 37.2,
        quality_score: 87.4,
        satisfaction_score: 91.2,
        completion_rate: 68.5
      },
      narrative_metrics: isNarrative ? {
        completed_narratives: 8420,
        average_journey_time: 142.5,
        narrative_completion_rate: 24.4,
        engagement_depth: 4.2
      } : undefined,
      trends
    }
  }

  // Datos de comparación entre modelos de facturación
  const billingComparison: BillingComparison[] = [
    {
      model: 'CPM',
      spend: 125000,
      interactions: 45000,
      roi: 85.2,
      efficiency_score: 65.4,
      color: '#3b82f6'
    },
    {
      model: 'CPC',
      spend: 180000,
      interactions: 28000,
      roi: 142.8,
      efficiency_score: 78.9,
      color: '#10b981'
    },
    {
      model: 'CPVI',
      spend: 485000,
      interactions: 12840,
      roi: 199.2,
      efficiency_score: 94.7,
      color: '#f59e0b'
    },
    {
      model: 'CPCN',
      spend: 620000,
      interactions: 8420,
      roi: 245.6,
      efficiency_score: 97.3,
      color: '#8b5cf6'
    }
  ]

  // Breakdown de interacciones valiosas
  const interactionBreakdown: ValueInteractionBreakdown[] = [
    {
      interaction_type: 'Cálculo Completado',
      count: 5420,
      average_value: 8.50,
      total_value: 46070,
      quality_score: 89.2,
      conversion_rate: 34.2
    },
    {
      interaction_type: 'Cotización Solicitada',
      count: 2840,
      average_value: 25.00,
      total_value: 71000,
      quality_score: 94.8,
      conversion_rate: 68.5
    },
    {
      interaction_type: 'Formulario Completado',
      count: 3180,
      average_value: 15.75,
      total_value: 50085,
      quality_score: 86.7,
      conversion_rate: 45.8
    },
    {
      interaction_type: 'Journey Narrativo',
      count: 1400,
      average_value: 45.00,
      total_value: 63000,
      quality_score: 96.1,
      conversion_rate: 78.9
    }
  ]

  // Cargar métricas cuando cambia la campaña
  useEffect(() => {
    if (selectedCampaign) {
      setIsLoading(true)
      setTimeout(() => {
        setValueMetrics(generateMockValueMetrics(selectedCampaign))
        setIsLoading(false)
      }, 1000)
    }
  }, [selectedCampaign, selectedPeriod])

  // Calcular métricas derivadas
  const derivedMetrics = useMemo(() => {
    if (!valueMetrics) return null

    const costEfficiency = valueMetrics.financial_metrics.total_revenue / valueMetrics.financial_metrics.total_spend
    const valuePerInteraction = valueMetrics.financial_metrics.total_revenue / valueMetrics.interaction_metrics.valuable_interactions
    const qualityIndex = (valueMetrics.interaction_metrics.quality_score + valueMetrics.interaction_metrics.satisfaction_score) / 2

    return {
      cost_efficiency: costEfficiency,
      value_per_interaction: valuePerInteraction,
      quality_index: qualityIndex,
      predicted_ltv: valueMetrics.financial_metrics.lifetime_value * 1.15 // Proyección 15% crecimiento
    }
  }, [valueMetrics])

  if (!selectedCampaign) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dashboard de Métricas de Valor
            </CardTitle>
            <CardDescription>
              Analiza el rendimiento de campañas con facturación CPVI y CPCN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Selecciona una campaña con facturación basada en valor</label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Elegir campaña..." />
                  </SelectTrigger>
                  <SelectContent>
                    {valueCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.model === 'CPVI' ? 'default' : 'secondary'}>
                            {campaign.model}
                          </Badge>
                          {campaign.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando métricas de valor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Métricas de Valor</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600">{valueMetrics?.campaign_name}</p>
            <Badge variant={valueMetrics?.billing_model === 'CPVI' ? 'default' : 'secondary'}>
              {valueMetrics?.billing_model}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas financieras principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inversión Total</p>
                <p className="text-2xl font-bold">${valueMetrics?.financial_metrics.total_spend.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.2% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Generados</p>
                <p className="text-2xl font-bold">${valueMetrics?.financial_metrics.total_revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+24.7% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p className="text-2xl font-bold">{valueMetrics?.financial_metrics.roi.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+15.3% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interacciones Valiosas</p>
                <p className="text-2xl font-bold">{valueMetrics?.interaction_metrics.valuable_interactions.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+18.9% vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de calidad y eficiencia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Puntuación de Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {valueMetrics?.interaction_metrics.quality_score.toFixed(1)}%
              </div>
              <Progress value={valueMetrics?.interaction_metrics.quality_score} className="mb-2" />
              <p className="text-sm text-gray-600">Calidad promedio de interacciones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Satisfacción del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {valueMetrics?.interaction_metrics.satisfaction_score.toFixed(1)}%
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={`star-${i}`}
                    className={`h-4 w-4 ${
                      i < Math.floor((valueMetrics?.interaction_metrics.satisfaction_score || 0) / 20) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">Satisfacción reportada</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eficiencia de Costo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {derivedMetrics?.cost_efficiency.toFixed(2)}x
              </div>
              <div className="text-sm text-gray-600 mb-2">retorno por peso invertido</div>
              <div className="flex items-center justify-center text-sm">
                <Award className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-purple-600">Excelente eficiencia</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="interactions">Interacciones</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          {valueMetrics?.narrative_metrics && (
            <TabsTrigger value="narratives">Narrativas</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Rendimiento</CardTitle>
                <CardDescription>
                  Evolución de ingresos vs inversión en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={valueMetrics?.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name === 'spend' ? 'Inversión' : 'Ingresos'
                      ]} />
                      <Area type="monotone" dataKey="spend" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="revenue" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calidad de Interacciones</CardTitle>
                <CardDescription>
                  Score de calidad y volumen de interacciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={valueMetrics?.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="interactions" fill="#3b82f6" name="Interacciones" />
                      <Line yAxisId="right" type="monotone" dataKey="quality_score" stroke="#f59e0b" strokeWidth={3} name="Score de Calidad" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Calculator className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">${derivedMetrics?.value_per_interaction.toFixed(2)}</div>
                <p className="text-sm text-gray-600">Valor por Interacción</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Coins className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">${valueMetrics?.financial_metrics.cost_per_acquisition.toFixed(2)}</div>
                <p className="text-sm text-gray-600">Costo por Adquisición</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">${valueMetrics?.financial_metrics.average_order_value.toFixed(2)}</div>
                <p className="text-sm text-gray-600">Valor Promedio de Orden</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">${derivedMetrics?.predicted_ltv.toFixed(2)}</div>
                <p className="text-sm text-gray-600">LTV Proyectado</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Breakdown de Interacciones Valiosas</CardTitle>
              <CardDescription>
                Análisis detallado por tipo de interacción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interactionBreakdown.map((interaction, index) => (
                  <div key={`${interaction}-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{interaction.interaction_type}</h4>
                      <Badge variant="outline">{interaction.count.toLocaleString()} interacciones</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Valor Promedio</p>
                        <p className="font-bold text-green-600">${interaction.average_value.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Valor Total</p>
                        <p className="font-bold">${interaction.total_value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Score de Calidad</p>
                        <p className="font-bold text-blue-600">{interaction.quality_score.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tasa de Conversión</p>
                        <p className="font-bold text-purple-600">{interaction.conversion_rate.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Rendimiento</span>
                        <span>{interaction.quality_score.toFixed(1)}%</span>
                      </div>
                      <Progress value={interaction.quality_score} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Modelos de Facturación</CardTitle>
              <CardDescription>
                Rendimiento comparativo entre CPM, CPC, CPVI y CPCN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={billingComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'roi' ? `${Number(value).toFixed(1)}%` : Number(value).toLocaleString(),
                      name === 'spend' ? 'Inversión' : 
                      name === 'interactions' ? 'Interacciones' : 
                      name === 'roi' ? 'ROI' : 'Score de Eficiencia'
                    ]} />
                    <Bar dataKey="roi" fill="#10b981" name="ROI" />
                    <Bar dataKey="efficiency_score" fill="#3b82f6" name="Eficiencia" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {billingComparison.map((model, index) => (
                  <Card key={`${model}-${index}`} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">{model.model}</h4>
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: model.color }}
                        />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Inversión:</span>
                          <span className="font-medium">${model.spend.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interacciones:</span>
                          <span className="font-medium">{model.interactions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span className="font-bold text-green-600">{model.roi.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Eficiencia:</span>
                          <span className="font-bold text-blue-600">{model.efficiency_score.toFixed(1)}</span>
                        </div>
                      </div>

                      {model.model === valueMetrics?.billing_model && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default">Actual</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {valueMetrics?.narrative_metrics && (
          <TabsContent value="narratives" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{valueMetrics.narrative_metrics.completed_narratives.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Narrativas Completadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{valueMetrics.narrative_metrics.average_journey_time.toFixed(1)}s</div>
                  <p className="text-sm text-gray-600">Tiempo Promedio de Journey</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{valueMetrics.narrative_metrics.narrative_completion_rate.toFixed(1)}%</div>
                  <p className="text-sm text-gray-600">Tasa de Completado</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{valueMetrics.narrative_metrics.engagement_depth.toFixed(1)}</div>
                  <p className="text-sm text-gray-600">Profundidad de Engagement</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Narrativas CPCN</CardTitle>
                <CardDescription>
                  Análisis específico para facturación por narrativa completada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Eficiencia de Narrativas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Costo por Narrativa Completada</span>
                          <span className="font-bold">${(valueMetrics.financial_metrics.total_spend / valueMetrics.narrative_metrics.completed_narratives).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Valor por Narrativa</span>
                          <span className="font-bold text-green-600">${(valueMetrics.financial_metrics.total_revenue / valueMetrics.narrative_metrics.completed_narratives).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">ROI por Narrativa</span>
                          <span className="font-bold text-purple-600">{((valueMetrics.financial_metrics.total_revenue / valueMetrics.narrative_metrics.completed_narratives) / (valueMetrics.financial_metrics.total_spend / valueMetrics.narrative_metrics.completed_narratives) * 100 - 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Engagement de Journey</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Tasa de Completado</span>
                            <span>{valueMetrics.narrative_metrics.narrative_completion_rate.toFixed(1)}%</span>
                          </div>
                          <Progress value={valueMetrics.narrative_metrics.narrative_completion_rate} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Profundidad de Engagement</span>
                            <span>{valueMetrics.narrative_metrics.engagement_depth.toFixed(1)}/5</span>
                          </div>
                          <Progress value={(valueMetrics.narrative_metrics.engagement_depth / 5) * 100} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}