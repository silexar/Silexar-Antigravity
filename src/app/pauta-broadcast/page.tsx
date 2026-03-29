/**
 * MÓDULO 9: PAUTA Y EXPORTACIÓN BROADCAST - TIER 0 FORTUNE 10
 * 
 * @description Sistema avanzado de planificación broadcast con Cortex-Scheduler,
 * cuadrícula visual inteligente y exportación universal a sistemas de playout
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - Broadcast Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  Clock, 
  Radio, 
  Download, 
  Settings, 
  Play, 
  Pause, 
  SkipForward,
  AlertTriangle,
  CheckCircle,
  Zap,
  Grid3X3,
  Filter,
  Upload,
  FileText,
  Cpu,
  Activity,
  TrendingUp,
  Users,
  Volume2
} from "lucide-react"
import { BroadcastPlanningGrid } from "@/components/broadcast/broadcast-planning-grid"
import { TandaOptimizer } from "@/components/broadcast/tanda-optimizer"
import { UniversalExporter } from "@/components/broadcast/universal-exporter"
import { BroadcastMetrics } from "@/components/broadcast/broadcast-metrics"

interface BroadcastStats {
  totalSpots: number
  scheduledToday: number
  exportedFiles: number
  activeStations: number
  occupancyRate: number
  revenueToday: number
  cortexOptimizations: number
  alertsCount: number
}

interface RecentActivity {
  id: string
  type: 'schedule' | 'export' | 'optimization' | 'alert'
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  station?: string
}

export default function PautaBroadcastPage() {
  const [activeTab, setActiveTab] = useState("planning")
  const [stats, setStats] = useState<BroadcastStats>({
    totalSpots: 1247,
    scheduledToday: 89,
    exportedFiles: 12,
    activeStations: 8,
    occupancyRate: 87.3,
    revenueToday: 2450000,
    cortexOptimizations: 23,
    alertsCount: 3
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'optimization',
      description: 'Cortex-Scheduler optimizó tanda matinal - +15% engagement',
      timestamp: '10:30',
      status: 'success',
      station: 'Radio Futuro'
    },
    {
      id: '2',
      type: 'export',
      description: 'Exportación Dalet completada - 47 spots programados',
      timestamp: '10:15',
      status: 'success',
      station: 'Radio Corazón'
    },
    {
      id: '3',
      type: 'alert',
      description: 'Conflicto detectado: Competidores en misma tanda',
      timestamp: '09:45',
      status: 'warning',
      station: 'Radio Activa'
    },
    {
      id: '4',
      type: 'schedule',
      description: 'Nueva campaña programada - Banco Santander',
      timestamp: '09:30',
      status: 'info',
      station: 'Radio Pudahuel'
    }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'schedule': return Calendar
      case 'export': return Download
      case 'optimization': return Zap
      case 'alert': return AlertTriangle
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'info': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-broadcast-500/20 to-radio-500/20 border border-broadcast-500/30">
                <Radio className="w-6 h-6 text-broadcast-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-broadcast-500 to-radio-500 bg-clip-text text-transparent">
                  PAUTA Y EXPORTACIÓN BROADCAST
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema TIER 0 con Cortex-Scheduler • Planificación Inteligente • Exportación Universal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-broadcast-400 border-broadcast-400/50">
                <Cpu className="w-3 h-3 mr-1" />
                CORTEX-SCHEDULER ACTIVO
              </Badge>
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                <CheckCircle className="w-3 h-3 mr-1" />
                {stats.activeStations} EMISORAS ONLINE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-broadcast-500/20 bg-gradient-to-br from-broadcast-500/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spots Programados</CardTitle>
              <Calendar className="h-4 w-4 text-broadcast-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-broadcast-500">{stats.totalSpots.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.scheduledToday} programados hoy
              </p>
            </CardContent>
          </Card>

          <Card className="border-radio-500/20 bg-gradient-to-br from-radio-500/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-radio-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-radio-500">{stats.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                Optimizado por Cortex-Scheduler
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${(stats.revenueToday / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.exportedFiles} archivos exportados
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimizaciones IA</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.cortexOptimizations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.alertsCount} alertas pendientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actividad Reciente */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-broadcast-500" />
              Actividad en Tiempo Real
            </CardTitle>
            <CardDescription>
              Últimas acciones del sistema de pauta broadcast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                    <Icon className={`w-5 h-5 ${getStatusColor(activity.status)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      {activity.station && (
                        <p className="text-xs text-muted-foreground">{activity.station}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="planning" className="flex items-center space-x-2">
              <Grid3X3 className="w-4 h-4" />
              <span>Planificación</span>
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Optimizador</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportación</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Métricas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <BroadcastPlanningGrid />
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-6">
            <TandaOptimizer />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <UniversalExporter />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <BroadcastMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}