/**
 * TANDA OPTIMIZER - SUB-MÓDULO 9.2
 * 
 * @description Optimizador de tandas con Cortex-Scheduler integrado,
 * construcción automática y algoritmo Fair-Play
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Zap, 
  Play, 
  Pause, 
  SkipForward, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Users, 
  Clock,
  Volume2,
  Brain,
  Target,
  BarChart3,
  Shuffle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from "lucide-react"

interface TandaSpot {
  id: string
  clientName: string
  campaignName: string
  duration: number
  priority: 'low' | 'medium' | 'high' | 'premium'
  emotionalTone: 'energetic' | 'calm' | 'urgent' | 'friendly' | 'professional'
  category: string
  targetAudience: string
  cortexScore: number
  engagementPrediction: number
  retentionImpact: number
  position: number
  conflicts?: string[]
}

interface OptimizationResult {
  originalScore: number
  optimizedScore: number
  improvement: number
  changes: OptimizationChange[]
  reasoning: string[]
  metrics: {
    engagement: number
    retention: number
    revenue: number
    satisfaction: number
  }
}

interface OptimizationChange {
  type: 'reorder' | 'replace' | 'remove' | 'add'
  spotId: string
  fromPosition?: number
  toPosition?: number
  reason: string
  impact: number
}

export function TandaOptimizer() {
  const [selectedTanda, setSelectedTanda] = useState("tanda-matinal")
  const [optimizationMode, setOptimizationMode] = useState<'engagement' | 'retention' | 'revenue' | 'balanced'>('balanced')
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [fairPlayWeight, setFairPlayWeight] = useState([75])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)

  const [originalSpots, setOriginalSpots] = useState<TandaSpot[]>([
    {
      id: 'spot-1',
      clientName: 'Banco Santander',
      campaignName: 'Crédito Hipotecario',
      duration: 30,
      priority: 'premium',
      emotionalTone: 'professional',
      category: 'Financiero',
      targetAudience: 'Adultos 30-50',
      cortexScore: 85,
      engagementPrediction: 78,
      retentionImpact: 82,
      position: 1
    },
    {
      id: 'spot-2',
      clientName: 'Coca-Cola',
      campaignName: 'Verano Refrescante',
      duration: 20,
      priority: 'high',
      emotionalTone: 'energetic',
      category: 'Bebidas',
      targetAudience: 'Jóvenes 18-35',
      cortexScore: 92,
      engagementPrediction: 88,
      retentionImpact: 75,
      position: 2
    },
    {
      id: 'spot-3',
      clientName: 'Falabella',
      campaignName: 'Cyber Monday',
      duration: 25,
      priority: 'medium',
      emotionalTone: 'urgent',
      category: 'Retail',
      targetAudience: 'Adultos 25-45',
      cortexScore: 79,
      engagementPrediction: 72,
      retentionImpact: 68,
      position: 3
    },
    {
      id: 'spot-4',
      clientName: 'Movistar',
      campaignName: 'Fibra Óptica',
      duration: 30,
      priority: 'high',
      emotionalTone: 'friendly',
      category: 'Telecomunicaciones',
      targetAudience: 'Familias',
      cortexScore: 81,
      engagementPrediction: 76,
      retentionImpact: 79,
      position: 4
    },
    {
      id: 'spot-5',
      clientName: 'McDonald\'s',
      campaignName: 'Desayuno Completo',
      duration: 20,
      priority: 'medium',
      emotionalTone: 'friendly',
      category: 'Comida Rápida',
      targetAudience: 'Trabajadores',
      cortexScore: 88,
      engagementPrediction: 84,
      retentionImpact: 71,
      position: 5
    }
  ])

  const [optimizedSpots, setOptimizedSpots] = useState<TandaSpot[]>([])

  const tandaOptions = [
    { id: 'tanda-matinal', name: 'Tanda Matinal (07:00-09:00)', audience: '45K oyentes' },
    { id: 'tanda-mediodia', name: 'Tanda Mediodía (12:00-14:00)', audience: '38K oyentes' },
    { id: 'tanda-tarde', name: 'Tanda Tarde (17:00-19:00)', audience: '52K oyentes' },
    { id: 'tanda-noche', name: 'Tanda Noche (20:00-22:00)', audience: '29K oyentes' }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'premium': return 'bg-purple-500'
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'energetic': return 'text-orange-500'
      case 'calm': return 'text-blue-500'
      case 'urgent': return 'text-red-500'
      case 'friendly': return 'text-green-500'
      case 'professional': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  const runOptimization = async () => {
    setIsOptimizing(true)
    
    // Simular proceso de optimización con Cortex-Scheduler
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generar resultado optimizado
    const optimized = [...originalSpots].sort((a, b) => {
      // Algoritmo simplificado de optimización
      const scoreA = a.cortexScore * 0.4 + a.engagementPrediction * 0.3 + a.retentionImpact * 0.3
      const scoreB = b.cortexScore * 0.4 + b.engagementPrediction * 0.3 + b.retentionImpact * 0.3
      return scoreB - scoreA
    }).map((spot, index) => ({
      ...spot,
      position: index + 1
    }))

    setOptimizedSpots(optimized)
    
    const result: OptimizationResult = {
      originalScore: 78.5,
      optimizedScore: 89.2,
      improvement: 13.6,
      changes: [
        {
          type: 'reorder',
          spotId: 'spot-2',
          fromPosition: 2,
          toPosition: 1,
          reason: 'Mayor engagement y tono energético ideal para apertura',
          impact: 8.5
        },
        {
          type: 'reorder',
          spotId: 'spot-5',
          fromPosition: 5,
          toPosition: 2,
          reason: 'Complementa tono energético y mantiene engagement',
          impact: 6.2
        },
        {
          type: 'reorder',
          spotId: 'spot-1',
          fromPosition: 1,
          toPosition: 3,
          reason: 'Tono profesional mejor posicionado después del pico energético',
          impact: 4.8
        }
      ],
      reasoning: [
        'Apertura con spot de mayor engagement (Coca-Cola) para captar atención',
        'Secuencia energética mantenida con McDonald\'s en segunda posición',
        'Transición suave a tono profesional con Banco Santander',
        'Finalización con spots de menor impacto emocional para evitar fatiga'
      ],
      metrics: {
        engagement: 89.2,
        retention: 85.7,
        revenue: 92.1,
        satisfaction: 87.4
      }
    }
    
    setOptimizationResult(result)
    setIsOptimizing(false)
  }

  const applyOptimization = () => {
    setOriginalSpots(optimizedSpots)
    setOptimizationResult(null)
    setOptimizedSpots([])
  }

  const resetOptimization = () => {
    setOptimizedSpots([])
    setOptimizationResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Controles de Optimización */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-broadcast-500" />
                Optimizador de Tandas Cortex-Scheduler
              </CardTitle>
              <CardDescription>
                IA avanzada para construcción automática y algoritmo Fair-Play
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-broadcast-400 border-broadcast-400/50">
              <Brain className="w-3 h-3 mr-1" />
              CORTEX-SCHEDULER v3.2
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tanda">Tanda a Optimizar</Label>
              <Select value={selectedTanda} onValueChange={setSelectedTanda}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tanda" />
                </SelectTrigger>
                <SelectContent>
                  {tandaOptions.map((tanda) => (
                    <SelectItem key={tanda.id} value={tanda.id}>
                      <div>
                        <div className="font-medium">{tanda.name}</div>
                        <div className="text-xs text-muted-foreground">{tanda.audience}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Modo de Optimización</Label>
              <Select value={optimizationMode} onValueChange={(value: 'engagement' | 'retention' | 'revenue' | 'balanced') => setOptimizationMode(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Máximo Engagement</SelectItem>
                  <SelectItem value="retention">Máxima Retención</SelectItem>
                  <SelectItem value="revenue">Máximos Ingresos</SelectItem>
                  <SelectItem value="balanced">Balanceado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Peso Fair-Play: {fairPlayWeight[0]}%</Label>
              <Slider
                value={fairPlayWeight}
                onValueChange={setFairPlayWeight}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Equilibrio entre optimización y rotación equitativa
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-optimize"
                  checked={autoOptimize}
                  onCheckedChange={setAutoOptimize}
                />
                <Label htmlFor="auto-optimize" className="text-sm">
                  Optimización Automática
                </Label>
              </div>
              <Button 
                onClick={runOptimization} 
                disabled={isOptimizing}
                className="w-full"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Optimizando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Optimizar Tanda
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparación Original vs Optimizada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tanda Original */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="w-5 h-5 mr-2 text-gray-500" />
              Tanda Original
            </CardTitle>
            <CardDescription>
              Configuración actual de la tanda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {originalSpots.map((spot, index) => (
                <div key={spot.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">{spot.clientName}</span>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(spot.priority)}`}></div>
                      <Badge variant="outline" className="text-xs">
                        {spot.duration}s
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{spot.campaignName}</div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs ${getToneColor(spot.emotionalTone)}`}>
                        {spot.emotionalTone}
                      </span>
                      <span className="text-xs">Score: {spot.cortexScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tanda Optimizada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-broadcast-500" />
              Tanda Optimizada
              {optimizedSpots.length > 0 && (
                <Badge className="ml-2 bg-green-500">
                  +{optimizationResult?.improvement.toFixed(1)}% mejor
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configuración optimizada por Cortex-Scheduler
            </CardDescription>
          </CardHeader>
          <CardContent>
            {optimizedSpots.length > 0 ? (
              <div className="space-y-3">
                {optimizedSpots.map((spot, index) => {
                  const originalPosition = originalSpots.findIndex(s => s.id === spot.id)
                  const positionChange = originalPosition - index
                  
                  return (
                    <div key={spot.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-broadcast-500/5 border-broadcast-500/20">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-broadcast-500 text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold">{spot.clientName}</span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(spot.priority)}`}></div>
                          <Badge variant="outline" className="text-xs">
                            {spot.duration}s
                          </Badge>
                          {positionChange !== 0 && (
                            <Badge variant="outline" className="text-xs">
                              {positionChange > 0 ? (
                                <ArrowUp className="w-3 h-3 text-green-500" />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-red-500" />
                              )}
                              {Math.abs(positionChange)}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{spot.campaignName}</div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`text-xs ${getToneColor(spot.emotionalTone)}`}>
                            {spot.emotionalTone}
                          </span>
                          <span className="text-xs">Score: {spot.cortexScore}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ejecuta la optimización para ver los resultados</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultados de Optimización */}
      {optimizationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              Resultados de Optimización
            </CardTitle>
            <CardDescription>
              Análisis detallado de mejoras propuestas por Cortex-Scheduler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métricas */}
              <div className="space-y-4">
                <h4 className="font-semibold">Métricas de Mejora</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-500">
                      {optimizationResult.metrics.engagement.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Engagement</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-500">
                      {optimizationResult.metrics.retention.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Retención</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-500">
                      {optimizationResult.metrics.revenue.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Ingresos</div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-500">
                      {optimizationResult.metrics.satisfaction.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Satisfacción</div>
                  </div>
                </div>
              </div>

              {/* Razonamiento */}
              <div className="space-y-4">
                <h4 className="font-semibold">Razonamiento de IA</h4>
                <div className="space-y-2">
                  {optimizationResult.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cambios Detallados */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Cambios Propuestos</h4>
              <div className="space-y-2">
                {optimizationResult.changes.map((change, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                    <ArrowRight className="w-4 h-4 text-broadcast-500" />
                    <div className="flex-1">
                      <span className="font-medium">{change.reason}</span>
                      <div className="text-sm text-muted-foreground">
                        Impacto: +{change.impact.toFixed(1)}% en score general
                      </div>
                    </div>
                    <Badge variant="outline">
                      {change.fromPosition} → {change.toPosition}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex space-x-3 mt-6">
              <Button onClick={applyOptimization} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aplicar Optimización
              </Button>
              <Button variant="outline" onClick={resetOptimization}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}