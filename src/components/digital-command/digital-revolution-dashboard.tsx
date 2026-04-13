/**
 * DIGITAL REVOLUTION DASHBOARD - TIER 0 Digital Revolution
 * 
 * @description Dashboard principal del Plan Maestro de Mejoras Digitales que integra
 * atribución cross-media, audio inteligente, optimización en tiempo real y analytics predictivo
 * 
 * @version 2040.15.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Digital Revolution Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  BarChart3, 
  Bot, 
  Brain,
  CheckCircle, 
  Clock, 
  DollarSign, 
  Eye, 
  Globe, 
  Mic,
  MousePointer, 
  Play, 
  RefreshCw, 
  Settings, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Pause,
  PlayCircle,
  StopCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Video,
  Phone,
  MessageSquare,
  Shield,
  Lightbulb,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Radio,
  Tv,
  Headphones,
  Volume2
} from 'lucide-react'

// Interfaces para el estado del dashboard
interface RevolutionMetrics {
  attribution: {
    total_journeys: number
    radio_to_digital_conversions: number
    cross_media_roas: number
    attribution_accuracy: number
  }
  intelligent_audio: {
    variants_generated: number
    personalization_rate: number
    engagement_improvement: number
    production_time_saved: number
  }
  realtime_optimization: {
    active_optimizations: number
    budget_redistributed: number
    performance_improvement: number
    automation_rate: number
  }
  predictive_analytics: {
    forecasts_generated: number
    churn_predictions: number
    opportunities_identified: number
    prediction_accuracy: number
  }
}

interface RevolutionAlert {
  id: string
  type: 'ATTRIBUTION' | 'AUDIO' | 'OPTIMIZATION' | 'PREDICTION'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  action_required: boolean
  created_at: string
}

interface RevolutionInsight {
  id: string
  category: 'CROSS_MEDIA' | 'AUDIO_PERFORMANCE' | 'OPTIMIZATION' | 'PREDICTION'
  title: string
  description: string
  impact: number
  confidence: number
  recommendations: string[]
  created_at: string
}

export function DigitalRevolutionDashboard() {
  // Estados principales
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState<RevolutionMetrics | null>(null)
  const [alerts, setAlerts] = useState<RevolutionAlert[]>([])
  const [insights, setInsights] = useState<RevolutionInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  // Estados para cada módulo
  const [attributionActive, setAttributionActive] = useState(true)
  const [audioEngineActive, setAudioEngineActive] = useState(true)
  const [optimizerActive, setOptimizerActive] = useState(true)
  const [predictiveActive, setPredictiveActive] = useState(true)

  // Inicialización
  useEffect(() => {
    initializeRevolutionDashboard()
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      if (autoRefresh) {
        refreshMetrics()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  const initializeRevolutionDashboard = async () => {
    try {
      
      setIsLoading(true)
      
      // Simular inicialización de todos los motores
      await Promise.all([
        loadRevolutionMetrics(),
        loadRevolutionAlerts(),
        loadRevolutionInsights()
      ])
      
      setLastUpdate(new Date().toISOString())

    } catch (error) {
      } finally {
      setIsLoading(false)
    }
  }

  const loadRevolutionMetrics = async () => {
    // Simular carga de métricas de todos los motores
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setMetrics({
      attribution: {
        total_journeys: 15847,
        radio_to_digital_conversions: 3421,
        cross_media_roas: 4.7,
        attribution_accuracy: 94.2
      },
      intelligent_audio: {
        variants_generated: 1247,
        personalization_rate: 87.3,
        engagement_improvement: 42.1,
        production_time_saved: 89.5
      },
      realtime_optimization: {
        active_optimizations: 23,
        budget_redistributed: 2850000,
        performance_improvement: 28.4,
        automation_rate: 91.7
      },
      predictive_analytics: {
        forecasts_generated: 156,
        churn_predictions: 34,
        opportunities_identified: 67,
        prediction_accuracy: 88.9
      }
    })
  }

  const loadRevolutionAlerts = async () => {
    // Simular carga de alertas
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setAlerts([
      {
        id: 'alert_001',
        type: 'ATTRIBUTION',
        severity: 'HIGH',
        title: 'Radio Attribution Spike Detected',
        description: 'Radio campaigns showing 45% increase in digital conversions',
        action_required: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'alert_002',
        type: 'OPTIMIZATION',
        severity: 'MEDIUM',
        title: 'Budget Reallocation Opportunity',
        description: 'Google Ads showing 300% better ROAS than Meta - recommend redistribution',
        action_required: true,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'alert_003',
        type: 'PREDICTION',
        severity: 'CRITICAL',
        title: 'High Churn Risk Client',
        description: 'Cliente Premium ABC has 87% churn probability - immediate action required',
        action_required: true,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'alert_004',
        type: 'AUDIO',
        severity: 'LOW',
        title: 'Audio Variant Performance',
        description: 'Morning variants showing 15% better engagement than evening',
        action_required: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ])
  }

  const loadRevolutionInsights = async () => {
    // Simular carga de insights
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setInsights([
      {
        id: 'insight_001',
        category: 'CROSS_MEDIA',
        title: 'Radio-Digital Synergy Pattern',
        description: 'Radio exposure increases digital conversion rate by 34% within 2 hours',
        impact: 34,
        confidence: 92,
        recommendations: [
          'Increase radio frequency during peak digital hours',
          'Create specific digital campaigns for radio-exposed audiences'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_002',
        category: 'AUDIO_PERFORMANCE',
        title: 'Personalization Impact',
        description: 'Personalized audio variants show 67% higher completion rates',
        impact: 67,
        confidence: 89,
        recommendations: [
          'Expand personalization to all audio campaigns',
          'Implement location-based audio variants'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_003',
        category: 'OPTIMIZATION',
        title: 'Cross-Platform Efficiency',
        description: 'Automated optimization improved overall ROAS by 28% this month',
        impact: 28,
        confidence: 95,
        recommendations: [
          'Enable more aggressive optimization settings',
          'Expand automation to additional campaigns'
        ],
        created_at: new Date().toISOString()
      }
    ])
  }

  const refreshMetrics = useCallback(async () => {
    try {
      await loadRevolutionMetrics()
      setLastUpdate(new Date().toISOString())
    } catch (error) {
      }
  }, [])


  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ATTRIBUTION': return <Target className="h-4 w-4" />
      case 'AUDIO': return <Mic className="h-4 w-4" />
      case 'OPTIMIZATION': return <Zap className="h-4 w-4" />
      case 'PREDICTION': return <Brain className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Inicializando Digital Revolution Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 SILEXAR PULSE - Digital Revolution
          </h1>
          <p className="text-gray-600 mt-1">
            Plan Maestro de Mejoras Digitales - TIER 0 Supremacy
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Status de Motores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-medium">Attribution Engine</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {attributionActive ? 'ACTIVO' : 'INACTIVO'}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Rastreando {metrics?.attribution.total_journeys.toLocaleString()} journeys
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Audio Inteligente</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {audioEngineActive ? 'ACTIVO' : 'INACTIVO'}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {metrics?.intelligent_audio.variants_generated} variantes generadas
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Optimizador RT</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {optimizerActive ? 'ACTIVO' : 'INACTIVO'}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {metrics?.realtime_optimization.active_optimizations} optimizaciones activas
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Analytics Predictivo</span>
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                {predictiveActive ? 'ACTIVO' : 'INACTIVO'}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {metrics?.predictive_analytics.forecasts_generated} forecasts generados
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticas */}
      {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-medium text-red-800 mb-2">
              Alertas que requieren atención inmediata:
            </div>
            <div className="space-y-1">
              {alerts
                .filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH')
                .slice(0, 3)
                .map(alert => (
                  <div key={alert.id} className="text-sm text-red-700">
                    • {alert.title}
                  </div>
                ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attribution">Atribución</TabsTrigger>
          <TabsTrigger value="audio">Audio IA</TabsTrigger>
          <TabsTrigger value="optimization">Optimización</TabsTrigger>
          <TabsTrigger value="predictive">Predictivo</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROAS Cross-Media</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.attribution.cross_media_roas.toFixed(1)}x</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +23% vs mes anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Audio</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{metrics?.intelligent_audio.engagement_improvement.toFixed(1)}%</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  vs audio tradicional
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mejora Performance</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{metrics?.realtime_optimization.performance_improvement.toFixed(1)}%</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  por optimización automática
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisión Predictiva</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.predictive_analytics.prediction_accuracy.toFixed(1)}%</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  en predicciones
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Insights Principales
                </CardTitle>
                <CardDescription>
                  Descubrimientos clave del sistema de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="border-l-4 border-l-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant="outline">
                          {insight.confidence}% confianza
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          +{insight.impact}% impacto
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {insight.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Activas
                </CardTitle>
                <CardDescription>
                  Notificaciones que requieren atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs opacity-90">{alert.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-75">
                              {new Date(alert.created_at).toLocaleTimeString()}
                            </span>
                            {alert.action_required && (
                              <Button size="sm" variant="outline" className="h-6 text-xs">
                                Revisar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progreso de Implementación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Progreso del Plan Maestro
              </CardTitle>
              <CardDescription>
                Estado de implementación de las mejoras digitales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Motor de Atribución</span>
                    <span className="text-sm text-green-600">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-gray-500">Completamente implementado</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audio Inteligente</span>
                    <span className="text-sm text-green-600">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                  <p className="text-xs text-gray-500">Audio espacial en desarrollo</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Optimización RT</span>
                    <span className="text-sm text-green-600">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <p className="text-xs text-gray-500">Integrando nuevas plataformas</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analytics Predictivo</span>
                    <span className="text-sm text-blue-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-gray-500">Refinando modelos de IA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Journey del Usuario Cross-Media
                </CardTitle>
                <CardDescription>
                  Visualización del path completo desde radio hasta conversión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Radio className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Radio Exposure</div>
                        <div className="text-sm text-gray-500">Radio Cooperativa - 14:30</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">15,847</div>
                      <div className="text-sm text-gray-500">usuarios expuestos</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-gray-300"></div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Search className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">Google Search</div>
                        <div className="text-sm text-gray-500">Búsqueda orgánica - 15:15</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">8,923</div>
                      <div className="text-sm text-gray-500">clicks</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-gray-300"></div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Website Visit</div>
                        <div className="text-sm text-gray-500">Página de producto - 15:18</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">5,647</div>
                      <div className="text-sm text-gray-500">visitantes</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-gray-300"></div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">Conversión</div>
                        <div className="text-sm text-gray-500">Compra completada - 15:45</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">3,421</div>
                      <div className="text-sm text-gray-500">conversiones</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atribución por Canal</CardTitle>
                <CardDescription>
                  Valor atribuido a cada touchpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Radio</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">34%</div>
                      <div className="text-xs text-gray-500">$2.3M atribuido</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Google Ads</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">28%</div>
                      <div className="text-xs text-gray-500">$1.9M atribuido</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Website</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">22%</div>
                      <div className="text-xs text-gray-500">$1.5M atribuido</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Meta Ads</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">16%</div>
                      <div className="text-xs text-gray-500">$1.1M atribuido</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Generación de Audio IA
                </CardTitle>
                <CardDescription>
                  Creación automática de variantes personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">1,247</div>
                      <div className="text-sm text-gray-600">Variantes generadas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">89.5%</div>
                      <div className="text-sm text-gray-600">Tiempo ahorrado</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">Versión Mañana</div>
                          <div className="text-xs text-gray-500">Energética - Target 25-35</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">+42% engagement</Badge>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="font-medium text-sm">Versión Tarde</div>
                          <div className="text-xs text-gray-500">Profesional - Target 35-45</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">+28% engagement</Badge>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-orange-600" />
                        <div>
                          <div className="font-medium text-sm">Versión Noche</div>
                          <div className="text-xs text-gray-500">Relajada - Target 45+</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">+15% engagement</Badge>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Audio Espacial 3D
                </CardTitle>
                <CardDescription>
                  Experiencias inmersivas para podcasts y streaming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="text-lg font-bold text-purple-800 mb-2">
                      Próximamente
                    </div>
                    <div className="text-sm text-purple-600">
                      Audio que se mueve alrededor del oyente
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold">Studio</div>
                      <div className="text-xs text-gray-500">Ambiente íntimo</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold">Concert Hall</div>
                      <div className="text-xs text-gray-500">Espacioso</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold">Outdoor</div>
                      <div className="text-xs text-gray-500">Al aire libre</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold">Custom</div>
                      <div className="text-xs text-gray-500">Personalizado</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Optimizaciones en Tiempo Real
                </CardTitle>
                <CardDescription>
                  Movimientos automáticos de presupuesto basados en performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">Optimización Ejecutada</div>
                        <div className="text-sm text-gray-500">Google Ads ← Meta Ads</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">+23% ROI</div>
                      <div className="text-sm text-gray-500">$500K movidos</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Optimización Pendiente</div>
                        <div className="text-sm text-gray-500">LinkedIn Ads ← TikTok Ads</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">+18% ROI</div>
                      <div className="text-sm text-gray-500">$200K a mover</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      <div>
                        <div className="font-medium">Alerta de Performance</div>
                        <div className="text-sm text-gray-500">Radio - ROAS bajo detectado</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">Revisar</div>
                      <div className="text-sm text-gray-500">ROAS: 1.8x</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Centro de Control 24/7</CardTitle>
                <CardDescription>
                  Monitoreo continuo de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-gray-600">Optimizaciones activas</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Presupuesto redistribuido</span>
                      <span className="font-bold">{formatCurrency(metrics?.realtime_optimization.budget_redistributed || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mejora de performance</span>
                      <span className="font-bold text-green-600">+{metrics?.realtime_optimization.performance_improvement}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasa de automatización</span>
                      <span className="font-bold text-blue-600">{metrics?.realtime_optimization.automation_rate}%</span>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Reglas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Cristal Mágico de Campañas
                </CardTitle>
                <CardDescription>
                  Predicciones de performance 7-30 días hacia adelante
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div className="font-medium text-red-800">Campaña en Riesgo</div>
                    </div>
                    <div className="text-sm text-red-700 mb-2">
                      Campaña Black Friday proyecta -25% vs meta el viernes
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Aplicar Optimización
                    </Button>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div className="font-medium text-green-800">Oportunidad Detectada</div>
                    </div>
                    <div className="text-sm text-green-700 mb-2">
                      Cliente Retail ABC debería invertir +40% en diciembre
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Crear Propuesta
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <div className="font-medium text-blue-800">Tendencia de Mercado</div>
                    </div>
                    <div className="text-sm text-blue-700 mb-2">
                      Rubro retail creciendo 20% - contactar prospects
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Ver Prospects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Detector de Fuga de Clientes
                </CardTitle>
                <CardDescription>
                  Análisis de riesgo de churn con planes de retención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-red-800">Cliente Premium ABC</div>
                      <Badge className="bg-red-100 text-red-800">87% riesgo</Badge>
                    </div>
                    <div className="text-sm text-red-700 mb-3">
                      Cancelará en 45 días - Acción inmediata requerida
                    </div>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                        Asignar Account Manager Premium
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        Ver Plan de Retención
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-yellow-800">Cliente Tech XYZ</div>
                      <Badge className="bg-yellow-100 text-yellow-800">73% riesgo</Badge>
                    </div>
                    <div className="text-sm text-yellow-700 mb-3">
                      Baja actividad detectada - 60 días para actuar
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Enviar Re-engagement
                    </Button>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-green-800">Cliente Retail 123</div>
                      <Badge className="bg-green-100 text-green-800">15% riesgo</Badge>
                    </div>
                    <div className="text-sm text-green-700">
                      Cliente saludable - Performance excelente
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}