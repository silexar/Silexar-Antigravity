/**
 * BROADCAST METRICS - Métricas y Analytics del Módulo 9
 * 
 * @description Dashboard de métricas avanzadas para pauta broadcast
 * con analytics en tiempo real y KPIs especializados
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  Radio,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  Target,
  DollarSign,
  Volume2,
  Signal,
  Headphones,
  Eye,
  RefreshCw,
  type LucideIcon
} from "lucide-react"

interface MetricCard {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: LucideIcon
  color: string
  description: string
}

interface ChartData {
  name: string
  value: number
  color: string
}

export function BroadcastMetrics() {
  const [timeRange, setTimeRange] = useState("today")
  const [selectedStation, setSelectedStation] = useState("all")
  const [refreshing, setRefreshing] = useState(false)

  const metrics: MetricCard[] = [
    {
      id: 'spots-aired',
      title: 'Spots Emitidos',
      value: '1,247',
      change: 8.5,
      changeType: 'increase',
      icon: Radio,
      color: 'text-broadcast-500',
      description: 'Total de spots emitidos exitosamente'
    },
    {
      id: 'occupancy-rate',
      title: 'Tasa de Ocupación',
      value: '87.3%',
      change: 3.2,
      changeType: 'increase',
      icon: BarChart3,
      color: 'text-green-500',
      description: 'Porcentaje de inventario ocupado'
    },
    {
      id: 'revenue',
      title: 'Ingresos Generados',
      value: '$2.45M',
      change: 12.8,
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-purple-500',
      description: 'Ingresos totales del período'
    },
    {
      id: 'audience-reach',
      title: 'Alcance de Audiencia',
      value: '342K',
      change: -2.1,
      changeType: 'decrease',
      icon: Users,
      color: 'text-blue-500',
      description: 'Oyentes únicos alcanzados'
    },
    {
      id: 'cortex-optimizations',
      title: 'Optimizaciones IA',
      value: '23',
      change: 15.6,
      changeType: 'increase',
      icon: Zap,
      color: 'text-yellow-500',
      description: 'Optimizaciones aplicadas por Cortex'
    },
    {
      id: 'completion-rate',
      title: 'Tasa de Finalización',
      value: '94.7%',
      change: 1.8,
      changeType: 'increase',
      icon: Target,
      color: 'text-orange-500',
      description: 'Spots completados sin interrupciones'
    }
  ]

  const stationPerformance: ChartData[] = [
    { name: 'Radio Futuro', value: 28, color: '#3B82F6' },
    { name: 'Radio Corazón', value: 24, color: '#EF4444' },
    { name: 'Radio Activa', value: 22, color: '#10B981' },
    { name: 'Radio Pudahuel', value: 18, color: '#8B5CF6' },
    { name: 'Radio Zero', value: 8, color: '#F59E0B' }
  ]

  const hourlyDistribution: ChartData[] = [
    { name: '06:00', value: 45, color: '#3B82F6' },
    { name: '07:00', value: 78, color: '#3B82F6' },
    { name: '08:00', value: 92, color: '#10B981' },
    { name: '09:00', value: 85, color: '#10B981' },
    { name: '10:00', value: 67, color: '#F59E0B' },
    { name: '11:00', value: 72, color: '#F59E0B' },
    { name: '12:00', value: 89, color: '#10B981' },
    { name: '13:00', value: 94, color: '#10B981' },
    { name: '14:00', value: 76, color: '#F59E0B' },
    { name: '15:00', value: 68, color: '#F59E0B' },
    { name: '16:00', value: 71, color: '#F59E0B' },
    { name: '17:00', value: 88, color: '#10B981' },
    { name: '18:00', value: 96, color: '#10B981' },
    { name: '19:00', value: 91, color: '#10B981' },
    { name: '20:00', value: 83, color: '#F59E0B' },
    { name: '21:00', value: 74, color: '#F59E0B' },
    { name: '22:00', value: 58, color: '#EF4444' },
    { name: '23:00', value: 42, color: '#EF4444' }
  ]

  const categoryBreakdown: ChartData[] = [
    { name: 'Financiero', value: 32, color: '#3B82F6' },
    { name: 'Retail', value: 28, color: '#10B981' },
    { name: 'Telecomunicaciones', value: 18, color: '#8B5CF6' },
    { name: 'Automotriz', value: 12, color: '#F59E0B' },
    { name: 'Otros', value: 10, color: '#6B7280' }
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return TrendingUp
      case 'decrease': return TrendingDown
      default: return Activity
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-500'
      case 'decrease': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-broadcast-500" />
                Métricas y Analytics Broadcast
              </CardTitle>
              <CardDescription>
                Dashboard de performance en tiempo real con KPIs especializados
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Badge variant="outline" className="text-broadcast-400 border-broadcast-400/50">
                <Activity className="w-3 h-3 mr-1" />
                TIEMPO REAL
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Emisora</label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar emisora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Emisoras</SelectItem>
                  <SelectItem value="radio-futuro">Radio Futuro</SelectItem>
                  <SelectItem value="radio-corazon">Radio Corazón</SelectItem>
                  <SelectItem value="radio-activa">Radio Activa</SelectItem>
                  <SelectItem value="radio-pudahuel">Radio Pudahuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vista</label>
              <Select defaultValue="overview">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Vista General</SelectItem>
                  <SelectItem value="detailed">Vista Detallada</SelectItem>
                  <SelectItem value="comparative">Vista Comparativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const ChangeIcon = getChangeIcon(metric.changeType)
          
          return (
            <Card key={metric.id} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center ${getChangeColor(metric.changeType)}`}>
                    <ChangeIcon className="w-3 h-3 mr-1" />
                    <span className="text-xs font-medium">
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">vs período anterior</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance por Emisora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Radio className="w-5 h-5 mr-2 text-broadcast-500" />
              Performance por Emisora
            </CardTitle>
            <CardDescription>
              Distribución de spots por emisora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stationPerformance.map((station, index) => (
                <div key={station.name} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: station.color }}
                    ></div>
                    <span className="text-sm font-medium">{station.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${station.value * 3}%`,
                          backgroundColor: station.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{station.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-broadcast-500" />
              Distribución por Categoría
            </CardTitle>
            <CardDescription>
              Breakdown de spots por categoría de cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={category.name} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${category.value * 3}%`,
                          backgroundColor: category.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{category.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución Horaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-broadcast-500" />
            Distribución Horaria de Spots
          </CardTitle>
          <CardDescription>
            Ocupación por franja horaria durante el día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 lg:grid-cols-9 gap-2">
              {hourlyDistribution.map((hour, index) => (
                <div key={hour.name} className="text-center">
                  <div className="mb-2">
                    <div 
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{ 
                        height: `${hour.value}px`,
                        backgroundColor: hour.color,
                        maxHeight: '100px'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs font-medium">{hour.name}</div>
                  <div className="text-xs text-muted-foreground">{hour.value}%</div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-xs">Alta ocupación (80%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-xs">Media ocupación (50-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-xs">Baja ocupación (&lt;50%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Avanzados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio de Spot</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.5s</div>
            <p className="text-xs text-muted-foreground">
              +2.3s vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPM Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7.2K</div>
            <p className="text-xs text-muted-foreground">
              +8.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Cortex</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              Optimizaciones exitosas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción Cliente</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">
              Basado en 127 evaluaciones
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}