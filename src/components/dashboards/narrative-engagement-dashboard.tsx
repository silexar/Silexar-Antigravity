/**
 * NARRATIVE ENGAGEMENT DASHBOARD - TIER 0 Silexar Pulse 2.0
 * Dashboard de Engagement Narrativo con Visualización de Flujos
 * 
 * @description Dashboard interactivo que visualiza el engagement de narrativas
 * dinámicas con diagramas de flujo, métricas de progresión y análisis de rutas
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
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  Clock,
  Target,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

// Interfaces para el dashboard
interface NarrativeNode {
  id: string
  name: string
  type: 'introduction' | 'development' | 'climax' | 'resolution' | 'call_to_action'
  position: { x: number; y: number }
  metrics: {
    total_visits: number
    unique_visitors: number
    average_time_spent: number
    completion_rate: number
    abandonment_rate: number
    engagement_score: number
  }
}

interface NarrativeTransition {
  id: string
  source_node_id: string
  target_node_id: string
  condition: string
  metrics: {
    total_transitions: number
    conversion_rate: number
    average_trigger_time: number
  }
}

interface NarrativeMetrics {
  campaign_id: string
  campaign_name: string
  narrative_id: string
  narrative_name: string
  period: {
    start_date: string
    end_date: string
  }
  overall_metrics: {
    total_users: number
    completed_journeys: number
    average_journey_time: number
    narrative_engagement_score: number
    completion_rate: number
    drop_off_rate: number
  }
  nodes: NarrativeNode[]
  transitions: NarrativeTransition[]
  performance_trends: Array<{
    date: string
    users: number
    completions: number
    engagement_score: number
  }>
}

interface EngagementInsight {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  description: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
}

export function NarrativeEngagementDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d')
  const [narrativeMetrics, setNarrativeMetrics] = useState<NarrativeMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState<NarrativeNode | null>(null)
  const [viewMode, setViewMode] = useState<'flow' | 'funnel' | 'trends'>('flow')

  // Mock data para campañas narrativas
  const narrativeCampaigns = [
    { id: 'camp_001', name: 'Campaña Banco XYZ - Préstamos Hipotecarios' },
    { id: 'camp_002', name: 'Campaña Retail ABC - Nueva Colección' },
    { id: 'camp_003', name: 'Campaña Tech Corp - Lanzamiento App' }
  ]

  // Generar datos mock de métricas narrativas
  const generateMockMetrics = (campaignId: string): NarrativeMetrics => {
    const nodes: NarrativeNode[] = [
      {
        id: 'node_intro',
        name: 'Introducción: Presentación del Diseño',
        type: 'introduction',
        position: { x: 100, y: 200 },
        metrics: {
          total_visits: 15420,
          unique_visitors: 12340,
          average_time_spent: 8.5,
          completion_rate: 78.2,
          abandonment_rate: 21.8,
          engagement_score: 85.4
        }
      },
      {
        id: 'node_dev1',
        name: 'Desarrollo: Interesados en Diseño',
        type: 'development',
        position: { x: 300, y: 150 },
        metrics: {
          total_visits: 9650,
          unique_visitors: 8920,
          average_time_spent: 12.3,
          completion_rate: 82.1,
          abandonment_rate: 17.9,
          engagement_score: 88.7
        }
      },
      {
        id: 'node_dev2',
        name: 'Desarrollo: No Interesados',
        type: 'development',
        position: { x: 300, y: 250 },
        metrics: {
          total_visits: 3420,
          unique_visitors: 3180,
          average_time_spent: 4.2,
          completion_rate: 45.6,
          abandonment_rate: 54.4,
          engagement_score: 52.3
        }
      },
      {
        id: 'node_climax',
        name: 'Clímax: Demostración de Valor',
        type: 'climax',
        position: { x: 500, y: 150 },
        metrics: {
          total_visits: 7920,
          unique_visitors: 7310,
          average_time_spent: 15.7,
          completion_rate: 89.4,
          abandonment_rate: 10.6,
          engagement_score: 92.1
        }
      },
      {
        id: 'node_cta',
        name: 'CTA: Solicitar Cotización',
        type: 'call_to_action',
        position: { x: 700, y: 200 },
        metrics: {
          total_visits: 7080,
          unique_visitors: 6540,
          average_time_spent: 6.8,
          completion_rate: 34.2,
          abandonment_rate: 65.8,
          engagement_score: 76.5
        }
      }
    ]

    const transitions: NarrativeTransition[] = [
      {
        id: 'trans_001',
        source_node_id: 'node_intro',
        target_node_id: 'node_dev1',
        condition: 'Visto >75%',
        metrics: {
          total_transitions: 9650,
          conversion_rate: 62.6,
          average_trigger_time: 8.2
        }
      },
      {
        id: 'trans_002',
        source_node_id: 'node_intro',
        target_node_id: 'node_dev2',
        condition: 'Omitido <5s',
        metrics: {
          total_transitions: 3420,
          conversion_rate: 22.2,
          average_trigger_time: 3.1
        }
      },
      {
        id: 'trans_003',
        source_node_id: 'node_dev1',
        target_node_id: 'node_climax',
        condition: 'Interacción',
        metrics: {
          total_transitions: 7920,
          conversion_rate: 82.1,
          average_trigger_time: 11.5
        }
      },
      {
        id: 'trans_004',
        source_node_id: 'node_climax',
        target_node_id: 'node_cta',
        condition: 'Visto >90%',
        metrics: {
          total_transitions: 7080,
          conversion_rate: 89.4,
          average_trigger_time: 14.8
        }
      }
    ]

    const performanceTrends = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 3000) + 10000,
      completions: Math.floor(Math.random() * 1000) + 2000,
      engagement_score: Math.random() * 20 + 75
    }))

    return {
      campaign_id: campaignId,
      campaign_name: narrativeCampaigns.find(c => c.id === campaignId)?.name || 'Campaña Desconocida',
      narrative_id: 'narr_001',
      narrative_name: 'Journey de Préstamos Hipotecarios',
      period: {
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      },
      overall_metrics: {
        total_users: 15420,
        completed_journeys: 2420,
        average_journey_time: 42.3,
        narrative_engagement_score: 84.2,
        completion_rate: 15.7,
        drop_off_rate: 84.3
      },
      nodes,
      transitions,
      performance_trends: performanceTrends
    }
  }

  // Cargar métricas cuando cambia la campaña seleccionada
  useEffect(() => {
    if (selectedCampaign) {
      setIsLoading(true)
      
      // Clear any existing timeout
      const timeoutId = setTimeout(() => {
        setNarrativeMetrics(generateMockMetrics(selectedCampaign))
        setIsLoading(false)
      }, 1000)
      
      // Cleanup function to clear timeout
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [selectedCampaign, selectedPeriod])

  // Generar insights automáticos
  const generateInsights = useMemo((): EngagementInsight[] => {
    if (!narrativeMetrics) return []

    const insights: EngagementInsight[] = []

    // Analizar nodo con mayor abandono
    const highestAbandonmentNode = narrativeMetrics.nodes
      .reduce((max, node) => node.metrics.abandonment_rate > max.metrics.abandonment_rate ? node : max)

    if (highestAbandonmentNode.metrics.abandonment_rate > 50) {
      insights.push({
        type: 'warning',
        title: 'Alto abandono detectado',
        description: `El nodo "${highestAbandonmentNode.name}" tiene ${highestAbandonmentNode.metrics.abandonment_rate.toFixed(1)}% de abandono`,
        recommendation: 'Considera agregar creatividades más dinámicas o reducir la duración del contenido',
        impact: 'high'
      })
    }

    // Analizar ruta con mejor performance
    const bestPerformingTransition = narrativeMetrics.transitions
      .reduce((max, trans) => trans.metrics.conversion_rate > max.metrics.conversion_rate ? trans : max)

    insights.push({
      type: 'success',
      title: 'Ruta de alto rendimiento identificada',
      description: `La transición "${bestPerformingTransition.condition}" tiene ${bestPerformingTransition.metrics.conversion_rate.toFixed(1)}% de conversión`,
      recommendation: 'Replica esta estrategia en otras rutas de la narrativa',
      impact: 'medium'
    })

    // Analizar engagement general
    if (narrativeMetrics.overall_metrics.narrative_engagement_score > 80) {
      insights.push({
        type: 'success',
        title: 'Excelente engagement narrativo',
        description: `Score de engagement: ${narrativeMetrics.overall_metrics.narrative_engagement_score.toFixed(1)}%`,
        recommendation: 'Mantén la estrategia actual y considera expandir a más campañas',
        impact: 'high'
      })
    }

    return insights
  }, [narrativeMetrics])

  // Datos para el gráfico de embudo
  const funnelData = useMemo(() => {
    if (!narrativeMetrics) return []

    return narrativeMetrics.nodes.map((node, index) => ({
      name: node.name.split(':')[0],
      value: node.metrics.unique_visitors,
      fill: `hsl(${220 + index * 30}, 70%, 50%)`
    }))
  }, [narrativeMetrics])

  // Colores para los tipos de nodos
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'introduction': return '#3b82f6'
      case 'development': return '#10b981'
      case 'climax': return '#f59e0b'
      case 'resolution': return '#8b5cf6'
      case 'call_to_action': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'introduction': return Play
      case 'development': return ArrowRight
      case 'climax': return Zap
      case 'resolution': return Target
      case 'call_to_action': return CheckCircle
      default: return Activity
    }
  }

  if (!selectedCampaign) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dashboard de Engagement Narrativo
            </CardTitle>
            <CardDescription>
              Visualiza el rendimiento de tus narrativas dinámicas y optimiza el journey del usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Selecciona una campaña narrativa</label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Elegir campaña..." />
                  </SelectTrigger>
                  <SelectContent>
                    {narrativeCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
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
            <p>Cargando métricas narrativas...</p>
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
          <h1 className="text-2xl font-bold">Dashboard de Engagement Narrativo</h1>
          <p className="text-gray-600">{narrativeMetrics?.campaign_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoy</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
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

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                <p className="text-2xl font-bold">{narrativeMetrics?.overall_metrics.total_users.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Journeys Completados</p>
                <p className="text-2xl font-bold">{narrativeMetrics?.overall_metrics.completed_journeys.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.3% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{narrativeMetrics?.overall_metrics.average_journey_time.toFixed(1)}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600">-2.1s vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">NES (Score)</p>
                <p className="text-2xl font-bold">{narrativeMetrics?.overall_metrics.narrative_engagement_score.toFixed(1)}%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2% vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights automáticos */}
      {generateInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generateInsights.map((insight, index) => (
            <Alert key={index} className={
              insight.type === 'success' ? 'border-green-200 bg-green-50' :
              insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              insight.type === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              <div className="flex items-start gap-2">
                {insight.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                {insight.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
                {insight.type === 'info' && <Info className="h-4 w-4 text-blue-600 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                      {insight.impact}
                    </Badge>
                  </div>
                  <AlertDescription className="mt-1">
                    {insight.description}
                  </AlertDescription>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Recomendación:</strong> {insight.recommendation}
                  </p>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Visualizaciones principales */}
      <Tabs value={viewMode} onValueChange={(value: 'flow' | 'funnel' | 'trends') => setViewMode(value)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="flow">Diagrama de Flujo</TabsTrigger>
          <TabsTrigger value="funnel">Embudo de Conversión</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagrama de Flujo de la Narrativa</CardTitle>
              <CardDescription>
                Visualización del journey del usuario con métricas de engagement por nodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 bg-gray-50 rounded-lg overflow-auto">
                {/* SVG para las conexiones */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {narrativeMetrics?.transitions.map((transition) => {
                    const sourceNode = narrativeMetrics.nodes.find(n => n.id === transition.source_node_id)
                    const targetNode = narrativeMetrics.nodes.find(n => n.id === transition.target_node_id)
                    
                    if (!sourceNode || !targetNode) return null

                    const x1 = sourceNode.position.x + 100
                    const y1 = sourceNode.position.y + 40
                    const x2 = targetNode.position.x + 100
                    const y2 = targetNode.position.y + 40

                    // Calcular grosor de línea basado en el volumen de transiciones
                    const maxTransitions = Math.max(...narrativeMetrics.transitions.map(t => t.metrics.total_transitions))
                    const strokeWidth = Math.max(2, (transition.metrics.total_transitions / maxTransitions) * 8)

                    return (
                      <g key={transition.id}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#6366f1"
                          strokeWidth={strokeWidth}
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2 - 10}
                          className="text-xs fill-gray-600"
                          textAnchor="middle"
                        >
                          {transition.metrics.total_transitions.toLocaleString()}
                        </text>
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2 + 5}
                          className="text-xs fill-gray-500"
                          textAnchor="middle"
                        >
                          {transition.condition}
                        </text>
                      </g>
                    )
                  })}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                    </marker>
                  </defs>
                </svg>

                {/* Nodos */}
                {narrativeMetrics?.nodes.map((node) => {
                  const Icon = getNodeIcon(node.type)
                  const isSelected = selectedNode?.id === node.id
                  
                  return (
                    <div
                      key={node.id}
                      className={`absolute w-48 bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        borderColor: getNodeColor(node.type)
                      }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="p-1 rounded text-white"
                            style={{ backgroundColor: getNodeColor(node.type) }}
                          >
                            <Icon className="h-3 w-3" />
                          </div>
                          <span className="font-medium text-xs">{node.name}</span>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Visitantes:</span>
                            <span className="font-medium">{node.metrics.unique_visitors.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tiempo prom:</span>
                            <span className="font-medium">{node.metrics.average_time_spent.toFixed(1)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Engagement:</span>
                            <span className="font-medium">{node.metrics.engagement_score.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Indicador de abandono */}
                        {node.metrics.abandonment_rate > 30 && (
                          <div className="mt-2 flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Alto abandono</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Panel de detalles del nodo seleccionado */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(getNodeIcon(selectedNode.type), { className: "h-5 w-5" })}
                  Detalles: {selectedNode.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedNode.metrics.total_visits.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Visitas Totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedNode.metrics.completion_rate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Tasa de Completado</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedNode.metrics.average_time_spent.toFixed(1)}s</p>
                    <p className="text-sm text-gray-600">Tiempo Promedio</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedNode.metrics.engagement_score.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Score de Engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embudo de Conversión Narrativo</CardTitle>
              <CardDescription>
                Progresión de usuarios a través de los nodos de la narrativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="value"
                      data={funnelData}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Nodos de Mejor Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {narrativeMetrics?.nodes
                    .sort((a, b) => b.metrics.engagement_score - a.metrics.engagement_score)
                    .slice(0, 3)
                    .map((node, index) => (
                      <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium text-sm">{node.name.split(':')[0]}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{node.metrics.engagement_score.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">{node.metrics.unique_visitors.toLocaleString()} usuarios</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nodos con Mayor Abandono</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {narrativeMetrics?.nodes
                    .sort((a, b) => b.metrics.abandonment_rate - a.metrics.abandonment_rate)
                    .slice(0, 3)
                    .map((node, index) => (
                      <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">#{index + 1}</Badge>
                          <span className="font-medium text-sm">{node.name.split(':')[0]}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{node.metrics.abandonment_rate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">abandono</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Engagement</CardTitle>
              <CardDescription>
                Evolución del engagement narrativo en el tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={narrativeMetrics?.performance_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="Usuarios" />
                    <Bar yAxisId="left" dataKey="completions" fill="#10b981" name="Completados" />
                    <Line yAxisId="right" type="monotone" dataKey="engagement_score" stroke="#f59e0b" strokeWidth={3} name="Score de Engagement" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {narrativeMetrics?.overall_metrics.completion_rate.toFixed(1)}%
                  </div>
                  <Progress value={narrativeMetrics?.overall_metrics.completion_rate} className="mb-2" />
                  <p className="text-sm text-gray-600">de usuarios completan el journey</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tiempo de Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {narrativeMetrics?.overall_metrics.average_journey_time.toFixed(0)}s
                  </div>
                  <div className="text-sm text-gray-600 mb-2">tiempo promedio por journey</div>
                  <div className="flex items-center justify-center text-sm">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600">-5% vs período anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score NES</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {narrativeMetrics?.overall_metrics.narrative_engagement_score.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor((narrativeMetrics?.overall_metrics.narrative_engagement_score || 0) / 20) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Narrative Engagement Score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}