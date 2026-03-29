/**
 * BILLING METRICS - Métricas y Analytics del Módulo 10
 * 
 * @description Dashboard de métricas avanzadas para facturación inteligente
 * con analytics en tiempo real y KPIs financieros especializados
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Building2,
  Target,
  Zap,
  RefreshCw,
  Eye,
  Download,
  type LucideIcon
} from "lucide-react"

interface BillingMetric {
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

interface TimeSeriesData {
  period: string
  invoiced: number
  collected: number
  outstanding: number
}

export function BillingMetrics() {
  const [timeRange, setTimeRange] = useState("month")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [refreshing, setRefreshing] = useState(false)

  const metrics: BillingMetric[] = [
    {
      id: 'total-invoiced',
      title: 'Total Facturado',
      value: '$45.7M',
      change: 12.8,
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-500',
      description: 'Ingresos totales facturados en el período'
    },
    {
      id: 'collection-rate',
      title: 'Tasa de Cobranza',
      value: '87.3%',
      change: 3.2,
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-blue-500',
      description: 'Porcentaje de facturas cobradas exitosamente'
    },
    {
      id: 'average-payment-time',
      title: 'Tiempo Promedio de Pago',
      value: '28 días',
      change: -5.1,
      changeType: 'decrease',
      icon: Clock,
      color: 'text-purple-500',
      description: 'Días promedio entre facturación y pago'
    },
    {
      id: 'outstanding-amount',
      title: 'Por Cobrar',
      value: '$12.3M',
      change: -8.7,
      changeType: 'decrease',
      icon: CreditCard,
      color: 'text-orange-500',
      description: 'Monto total pendiente de cobro'
    },
    {
      id: 'invoices-generated',
      title: 'Facturas Generadas',
      value: '247',
      change: 15.6,
      changeType: 'increase',
      icon: FileText,
      color: 'text-cyan-500',
      description: 'Número de facturas emitidas'
    },
    {
      id: 'sii-compliance',
      title: 'Compliance SII',
      value: '99.8%',
      change: 0.3,
      changeType: 'increase',
      icon: CheckCircle,
      color: 'text-emerald-500',
      description: 'Tasa de éxito en envíos al SII'
    }
  ]

  const clientDistribution: ChartData[] = [
    { name: 'Banco Santander', value: 28, color: '#3B82F6' },
    { name: 'Coca-Cola', value: 22, color: '#EF4444' },
    { name: 'Falabella', value: 18, color: '#10B981' },
    { name: 'Movistar', value: 15, color: '#8B5CF6' },
    { name: 'Otros', value: 17, color: '#6B7280' }
  ]

  const paymentMethods: ChartData[] = [
    { name: 'Transferencia', value: 65, color: '#3B82F6' },
    { name: 'Cheque', value: 20, color: '#10B981' },
    { name: 'Tarjeta', value: 10, color: '#F59E0B' },
    { name: 'Efectivo', value: 5, color: '#6B7280' }
  ]

  const monthlyTrend: TimeSeriesData[] = [
    { period: 'Ene', invoiced: 3200000, collected: 2800000, outstanding: 400000 },
    { period: 'Feb', invoiced: 3800000, collected: 3200000, outstanding: 600000 },
    { period: 'Mar', invoiced: 4200000, collected: 3600000, outstanding: 600000 },
    { period: 'Abr', invoiced: 3900000, collected: 3400000, outstanding: 500000 },
    { period: 'May', invoiced: 4500000, collected: 3900000, outstanding: 600000 },
    { period: 'Jun', invoiced: 4800000, collected: 4200000, outstanding: 600000 },
    { period: 'Jul', invoiced: 5100000, collected: 4400000, outstanding: 700000 },
    { period: 'Ago', invoiced: 4700000, collected: 4100000, outstanding: 600000 }
  ]

  const documentTypes: ChartData[] = [
    { name: 'Factura Electrónica', value: 78, color: '#3B82F6' },
    { name: 'Boleta Electrónica', value: 15, color: '#10B981' },
    { name: 'Nota de Crédito', value: 5, color: '#F59E0B' },
    { name: 'Nota de Débito', value: 2, color: '#EF4444' }
  ]

  const collectionStatus: ChartData[] = [
    { name: 'Al día', value: 45, color: '#10B981' },
    { name: '1-30 días', value: 30, color: '#F59E0B' },
    { name: '31-60 días', value: 15, color: '#EF4444' },
    { name: '60+ días', value: 10, color: '#7F1D1D' }
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
                <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                Métricas y Analytics de Facturación
              </CardTitle>
              <CardDescription>
                Dashboard financiero en tiempo real con KPIs especializados
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
              <Badge variant="outline" className="text-green-400 border-green-400/50">
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
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Métrica Principal</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Ingresos</SelectItem>
                  <SelectItem value="collection">Cobranza</SelectItem>
                  <SelectItem value="outstanding">Por Cobrar</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
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

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-500" />
              Facturación por Cliente
            </CardTitle>
            <CardDescription>
              Distribución de ingresos por cliente principal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientDistribution.map((client, index) => (
                <div key={client.name} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: client.color }}
                    ></div>
                    <span className="text-sm font-medium">{client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${client.value * 3}%`,
                          backgroundColor: client.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{client.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-500" />
              Métodos de Pago
            </CardTitle>
            <CardDescription>
              Preferencias de pago de los clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={method.name} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: method.color }}
                    ></div>
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${method.value}%`,
                          backgroundColor: method.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{method.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
            Tendencia de Facturación y Cobranza
          </CardTitle>
          <CardDescription>
            Evolución mensual de ingresos y cobranza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
              {monthlyTrend.map((month, index) => (
                <div key={month.period} className="text-center">
                  <div className="mb-2 space-y-1">
                    {/* Facturado */}
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                      style={{ 
                        height: `${(month.invoiced / 60000)}px`,
                        maxHeight: '80px'
                      }}
                      title={`Facturado: $${(month.invoiced / 1000).toFixed(0)}K`}
                    ></div>
                    {/* Cobrado */}
                    <div 
                      className="w-full bg-green-500 transition-all duration-500"
                      style={{ 
                        height: `${(month.collected / 60000)}px`,
                        maxHeight: '80px'
                      }}
                      title={`Cobrado: $${(month.collected / 1000).toFixed(0)}K`}
                    ></div>
                    {/* Pendiente */}
                    <div 
                      className="w-full bg-orange-500 rounded-b-lg transition-all duration-500"
                      style={{ 
                        height: `${(month.outstanding / 60000)}px`,
                        maxHeight: '20px'
                      }}
                      title={`Pendiente: $${(month.outstanding / 1000).toFixed(0)}K`}
                    ></div>
                  </div>
                  <div className="text-xs font-medium">{month.period}</div>
                  <div className="text-xs text-muted-foreground">
                    ${(month.invoiced / 1000).toFixed(0)}K
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-xs">Facturado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-xs">Cobrado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-xs">Pendiente</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis Adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipos de Documento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-cyan-500" />
              Tipos de Documento
            </CardTitle>
            <CardDescription>
              Distribución de documentos tributarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentTypes.map((doc, index) => (
                <div key={doc.name} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: doc.color }}
                    ></div>
                    <span className="text-sm font-medium">{doc.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${doc.value}%`,
                          backgroundColor: doc.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{doc.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estado de Cobranza */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Estado de Cobranza
            </CardTitle>
            <CardDescription>
              Distribución por días de vencimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {collectionStatus.map((status, index) => (
                <div key={status.name} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-sm font-medium">{status.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${status.value}%`,
                          backgroundColor: status.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{status.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Avanzados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio Factura</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$185K</div>
            <p className="text-xs text-muted-foreground">
              +12.3% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas por Día</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2</div>
            <p className="text-xs text-muted-foreground">
              Promedio últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia SII</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              Documentos aceptados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Cobranza</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">340%</div>
            <p className="text-xs text-muted-foreground">
              Retorno sobre inversión
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}