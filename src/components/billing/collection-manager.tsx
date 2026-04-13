/**
 * COLLECTION MANAGER - SUB-MÓDULO 10.3
 * 
 * @description Gestión de cobranza inteligente con automatización,
 * herramientas de negociación y análisis de impacto financiero
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Target,
  BarChart3,
  FileText,
  Send,
  Eye,
  RefreshCw,
  Settings,
  Zap,
  Building2,
  Calculator,
  HandHeart,
  AlertCircle
} from "lucide-react"

interface AccountReceivable {
  id: string
  clientId: string
  clientName: string
  invoiceNumber: string
  amount: number
  originalAmount: number
  dueDate: string
  daysOverdue: number
  status: 'current' | 'overdue_30' | 'overdue_60' | 'overdue_90' | 'collection' | 'legal'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastContact: string
  nextAction: string
  paymentHistory: PaymentRecord[]
  collectionActions: CollectionAction[]
}

interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: string
  status: 'completed' | 'pending' | 'failed'
}

interface CollectionAction {
  id: string
  type: 'email' | 'call' | 'letter' | 'legal' | 'negotiation'
  date: string
  description: string
  result: string
  nextFollowUp?: string
}

interface CollectionStrategy {
  id: string
  name: string
  description: string
  triggers: string[]
  actions: string[]
  successRate: number
  averageRecovery: number
}

interface CollectionMetrics {
  totalOutstanding: number
  currentMonth: number
  overdue30: number
  overdue60: number
  overdue90: number
  collectionRate: number
  averageCollectionTime: number
  riskDistribution: Record<string, number>
}

export function CollectionManager() {
  const [activeTab, setActiveTab] = useState("accounts")
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [autoCollectionEnabled, setAutoCollectionEnabled] = useState(true)

  const [metrics, setMetrics] = useState<CollectionMetrics>({
    totalOutstanding: 12300000,
    currentMonth: 8500000,
    overdue30: 2100000,
    overdue60: 1200000,
    overdue90: 500000,
    collectionRate: 87.3,
    averageCollectionTime: 28,
    riskDistribution: {
      low: 45,
      medium: 35,
      high: 15,
      critical: 5
    }
  })

  const [accounts, setAccounts] = useState<AccountReceivable[]>([
    {
      id: 'ar-001',
      clientId: 'client-1',
      clientName: 'Banco Santander',
      invoiceNumber: 'INV-001234',
      amount: 2450000,
      originalAmount: 2450000,
      dueDate: '2025-01-15',
      daysOverdue: 24,
      status: 'overdue_30',
      riskLevel: 'low',
      lastContact: '2025-02-05',
      nextAction: 'Llamada de seguimiento',
      paymentHistory: [
        {
          id: 'pay-1',
          date: '2024-12-15',
          amount: 2200000,
          method: 'Transferencia',
          status: 'completed'
        }
      ],
      collectionActions: [
        {
          id: 'action-1',
          type: 'email',
          date: '2025-02-05',
          description: 'Recordatorio de pago enviado',
          result: 'Cliente confirmó pago para esta semana',
          nextFollowUp: '2025-02-12'
        }
      ]
    },
    {
      id: 'ar-002',
      clientId: 'client-2',
      clientName: 'Falabella',
      invoiceNumber: 'INV-001236',
      amount: 980000,
      originalAmount: 980000,
      dueDate: '2024-12-30',
      daysOverdue: 40,
      status: 'overdue_30',
      riskLevel: 'medium',
      lastContact: '2025-01-28',
      nextAction: 'Negociación de plan de pago',
      paymentHistory: [],
      collectionActions: [
        {
          id: 'action-2',
          type: 'call',
          date: '2025-01-28',
          description: 'Llamada telefónica - Dificultades de flujo',
          result: 'Cliente solicita plan de pago',
          nextFollowUp: '2025-02-10'
        }
      ]
    },
    {
      id: 'ar-003',
      clientId: 'client-3',
      clientName: 'Empresa XYZ',
      invoiceNumber: 'INV-001240',
      amount: 1500000,
      originalAmount: 1500000,
      dueDate: '2024-11-15',
      daysOverdue: 85,
      status: 'overdue_90',
      riskLevel: 'high',
      lastContact: '2025-01-15',
      nextAction: 'Evaluación legal',
      paymentHistory: [],
      collectionActions: [
        {
          id: 'action-3',
          type: 'letter',
          date: '2025-01-15',
          description: 'Carta formal de cobranza enviada',
          result: 'Sin respuesta del cliente',
          nextFollowUp: '2025-02-15'
        }
      ]
    }
  ])

  const [collectionStrategies] = useState<CollectionStrategy[]>([
    {
      id: 'strategy-1',
      name: 'Seguimiento Suave',
      description: 'Para clientes con buen historial de pago',
      triggers: ['1-15 días vencido', 'Riesgo bajo'],
      actions: ['Email recordatorio', 'Llamada amigable', 'Extensión de plazo'],
      successRate: 92,
      averageRecovery: 18
    },
    {
      id: 'strategy-2',
      name: 'Seguimiento Activo',
      description: 'Para clientes con retrasos recurrentes',
      triggers: ['16-45 días vencido', 'Riesgo medio'],
      actions: ['Llamadas frecuentes', 'Plan de pago', 'Visita comercial'],
      successRate: 78,
      averageRecovery: 35
    },
    {
      id: 'strategy-3',
      name: 'Cobranza Intensiva',
      description: 'Para casos de alto riesgo',
      triggers: ['45+ días vencido', 'Riesgo alto'],
      actions: ['Carta formal', 'Suspensión servicios', 'Evaluación legal'],
      successRate: 45,
      averageRecovery: 65
    }
  ])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-orange-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'overdue_30': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
      case 'overdue_60': return 'bg-orange-500/20 text-orange-700 border-orange-500/30'
      case 'overdue_90': return 'bg-red-500/20 text-red-700 border-red-500/30'
      case 'collection': return 'bg-purple-500/20 text-purple-700 border-purple-500/30'
      case 'legal': return 'bg-red-600/20 text-red-800 border-red-600/30'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current': return 'Al día'
      case 'overdue_30': return '1-30 días'
      case 'overdue_60': return '31-60 días'
      case 'overdue_90': return '61-90 días'
      case 'collection': return 'Cobranza'
      case 'legal': return 'Legal'
      default: return status
    }
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesRisk = selectedRiskLevel === 'all' || account.riskLevel === selectedRiskLevel
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus
    return matchesRisk && matchesStatus
  })

  const executeAutomaticCollection = async (accountId: string) => {
    // Simular ejecución de cobranza automática
    
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Cobranza */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${(metrics.totalOutstanding / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Cartera total de cobranza
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cobranza</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {metrics.collectionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio últimos 12 meses
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {metrics.averageCollectionTime} días
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo de cobranza promedio
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido +90</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${(metrics.overdue90 / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Requiere acción inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Riesgo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Distribución de Riesgo de Cartera
          </CardTitle>
          <CardDescription>
            Análisis de riesgo de cuentas por cobrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(metrics.riskDistribution).map(([risk, percentage]) => (
              <div key={risk} className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(risk)} mb-1`}>
                  {percentage}%
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  Riesgo {risk === 'low' ? 'Bajo' : risk === 'medium' ? 'Medio' : risk === 'high' ? 'Alto' : 'Crítico'}
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      risk === 'low' ? 'bg-green-500' :
                      risk === 'medium' ? 'bg-yellow-500' :
                      risk === 'high' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cuentas por Cobrar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                Monitor de Cuentas por Cobrar
              </CardTitle>
              <CardDescription>
                Gestión inteligente de cobranza con automatización
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-collection"
                  checked={autoCollectionEnabled}
                  onCheckedChange={setAutoCollectionEnabled}
                />
                <Label htmlFor="auto-collection" className="text-sm">
                  Cobranza Automática
                </Label>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                <Zap className="w-3 h-3 mr-1" />
                IA ACTIVA
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="risk-filter">Nivel de Riesgo</Label>
              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los riesgos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los riesgos</SelectItem>
                  <SelectItem value="low">Riesgo Bajo</SelectItem>
                  <SelectItem value="medium">Riesgo Medio</SelectItem>
                  <SelectItem value="high">Riesgo Alto</SelectItem>
                  <SelectItem value="critical">Riesgo Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="current">Al día</SelectItem>
                  <SelectItem value="overdue_30">1-30 días vencido</SelectItem>
                  <SelectItem value="overdue_60">31-60 días vencido</SelectItem>
                  <SelectItem value="overdue_90">61-90 días vencido</SelectItem>
                  <SelectItem value="collection">En cobranza</SelectItem>
                  <SelectItem value="legal">Proceso legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Lista de Cuentas */}
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">{account.clientName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Factura: {account.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(account.status)}>
                      {getStatusLabel(account.status)}
                    </Badge>
                    <Badge variant="outline" className={getRiskColor(account.riskLevel)}>
                      {account.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monto</p>
                    <p className="text-lg font-bold">${account.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Días Vencido</p>
                    <p className={`text-lg font-bold ${
                      account.daysOverdue > 60 ? 'text-red-500' :
                      account.daysOverdue > 30 ? 'text-orange-500' :
                      account.daysOverdue > 0 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {account.daysOverdue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Último Contacto</p>
                    <p className="text-sm">{account.lastContact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Acción</p>
                    <p className="text-sm font-medium">{account.nextAction}</p>
                  </div>
                </div>

                {/* Acciones Recientes */}
                {account.collectionActions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2">Última Acción:</h5>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        {account.collectionActions[0].type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                        {account.collectionActions[0].type === 'call' && <Phone className="w-4 h-4 text-green-500" />}
                        {account.collectionActions[0].type === 'letter' && <FileText className="w-4 h-4 text-purple-500" />}
                        <span className="text-sm font-medium">{account.collectionActions[0].description}</span>
                        <span className="text-xs text-muted-foreground">({account.collectionActions[0].date})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{account.collectionActions[0].result}</p>
                    </div>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    Ver Detalle
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="w-3 h-3 mr-1" />
                    Llamar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline">
                    <HandHeart className="w-3 h-3 mr-1" />
                    Negociar
                  </Button>
                  {autoCollectionEnabled && (
                    <Button 
                      size="sm" 
                      onClick={() => executeAutomaticCollection(account.id)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-Cobranza
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estrategias de Cobranza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Estrategias de Cobranza Automática
          </CardTitle>
          <CardDescription>
            Configuración de estrategias inteligentes basadas en IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collectionStrategies.map((strategy) => (
              <Card key={strategy.id} className="p-4 bg-muted/30">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">{strategy.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {strategy.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">TRIGGERS:</p>
                      <div className="flex flex-wrap gap-1">
                        {strategy.triggers.map((trigger, index) => (
                          <Badge key={`${trigger}-${index}`} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">ACCIONES:</p>
                      <div className="flex flex-wrap gap-1">
                        {strategy.actions.map((action, index) => (
                          <Badge key={`${action}-${index}`} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-500">{strategy.successRate}%</p>
                      <p className="text-xs text-muted-foreground">Éxito</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-500">{strategy.averageRecovery}d</p>
                      <p className="text-xs text-muted-foreground">Promedio</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Configurar
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Activar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}