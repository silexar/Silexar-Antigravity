/**
 * MODAL DE GESTIÓN DETALLADA DE CONTRATOS - TIER 0 Fortune 10
 * 
 * @description Modal completo para gestión 360° de contratos con 5 pestañas
 * especializadas, integración Cortex-Contracts y workflows automatizados
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - Contracts Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cortexContracts, CortexContractsUtils } from '@/lib/cortex/cortex-contracts'
import {
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
  Download,
  Send,
  Workflow,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Zap,
  Shield,
  Star,
  Award,
  Briefcase,
  CreditCard,
  FileCheck,
  Users,
  Globe,
  Settings,
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react'

interface ContractDetailModalProps {
  isOpen: boolean
  onClose: () => void
  contract: Record<string, unknown>
  onUpdate?: (updatedContract: Record<string, unknown>) => void
}

export default function ContractDetailModal({
  isOpen,
  onClose,
  contract,
  onUpdate
}: ContractDetailModalProps) {
  // Typed view of contract fields — contract is Record<string,unknown> from parent
  type ContractView = {
    id: string; numero: string; anunciante: string; producto: string;
    estado: string; prioridad: string;
    fechaInicio?: string; fechaFin?: string; moneda?: string;
    valorNeto?: number; valorBruto?: number;
    rutAnunciante?: string; ejecutivo?: string; agencia?: string;
    tipoContrato?: string; modalidadFacturacion?: string; plazoPago?: number | string;
    descuentoAplicado?: number; esCanje?: boolean;
    facturarComisionAgencia?: boolean;
    financiero?: {
      montoFacturado?: number; montoPendiente?: number;
      comisionAgencia?: number; descuentosAplicados?: number; impuestos?: number;
      [k: string]: unknown;
    };
    workflow?: {
      pasos?: unknown[]; historial?: unknown[]; etapaActual?: string; progreso?: number;
      proximaAccion?: string; responsable?: string; fechaLimite?: string;
    };
    alertas?: string[];
    performance?: {
      cumplimiento?: number; satisfaccionCliente?: number; rentabilidad?: number;
      [k: string]: unknown;
    };
    documentos?: {
      contrato?: boolean; anexos?: boolean; aprobaciones?: boolean; facturas?: number;
      [k: string]: unknown;
    };
    tags?: string[];
    observaciones?: string;
    [k: string]: unknown
  }
  const c = contract as ContractView
  type ContractAnalysisView = {
    riskScore?: number; complianceScore?: number; profitabilityScore?: number;
    recommendations?: { title?: string; priority?: string; description?: string; impact?: number; timeline?: string }[];
    optimization?: { timeReduction?: number; potentialSavings?: number; riskReduction?: number; optimizedEfficiency?: number };
    [k: string]: unknown;
  }
  type PredictiveAnalyticsView = {
    contractSuccess?: { probability?: number; factors?: { name?: string; impact?: number }[] };
    revenueForecasting?: { nextQuarter?: number; confidence?: number };
    [k: string]: unknown;
  }
  const [activeTab, setActiveTab] = useState('resumen')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContract, setEditedContract] = useState(contract)
  const [contractAnalysis, setContractAnalysis] = useState<Record<string, unknown> | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<Record<string, unknown> | null>(null)
  const ca = contractAnalysis as ContractAnalysisView | null
  const pa = predictiveAnalytics as PredictiveAnalyticsView | null

  // Inicializar análisis Cortex-Contracts
  useEffect(() => {
    if (contract && isOpen) {
      setEditedContract(contract)
      initializeCortexAnalysis()
    }
  }, [contract, isOpen])

  const initializeCortexAnalysis = async () => {
    try {
      setIsAnalyzing(true)
      
      // Análisis integral del contrato
      const analysis = await cortexContracts.analyzeContract(c.id)
      setContractAnalysis(analysis)
      
      // Analytics predictivo
      const predictive = await cortexContracts.generatePredictiveAnalytics(c.id)
      setPredictiveAnalytics(predictive as unknown as Record<string, unknown>)
      
    } catch (error) {
      } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    try {
      // Aquí iría la lógica de guardado
      onUpdate?.(editedContract)
      setIsEditing(false)
      
      // Re-analizar después de cambios
      await initializeCortexAnalysis()
    } catch (error) {
      }
  }

  const handleInputChange = (field: string, value: unknown) => {
    setEditedContract((prev: Record<string, unknown>) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: unknown) => {
    setEditedContract((prev: Record<string, unknown>) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value
      }
    }))
  }

  if (!contract) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#F0EDE8] border-slate-700">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-600/20 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  {c.numero}
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </DialogTitle>
                <p className="text-slate-400 mt-1">
                  {c.anunciante} • {c.producto}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                className={`${CortexContractsUtils.getStatusColor(c.estado)} text-white`}
              >
                {c.estado.toUpperCase()}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${CortexContractsUtils.getPriorityColor(c.prioridad)} border-current`}
              >
                {c.prioridad.toUpperCase()}
              </Badge>
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    size="sm" 
                    variant="outline"
                    className="border-slate-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="resumen" className="data-[state=active]:bg-emerald-600">
              📊 Resumen
            </TabsTrigger>
            <TabsTrigger value="financiero" className="data-[state=active]:bg-green-600">
              💰 Financiero
            </TabsTrigger>
            <TabsTrigger value="pauta" className="data-[state=active]:bg-blue-600">
              📺 Pauta
            </TabsTrigger>
            <TabsTrigger value="documentos" className="data-[state=active]:bg-purple-600">
              📄 Documentos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600">
              🧠 Analytics IA
            </TabsTrigger>
          </TabsList>

          {/* Tab Resumen del Acuerdo */}
          <TabsContent value="resumen" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información General */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Anunciante</Label>
                      {isEditing ? (
                        <Input
                          value={(editedContract as ContractView).anunciante}
                          onChange={(e) => handleInputChange('anunciante', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium">{c.anunciante}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-slate-300">RUT</Label>
                      <p className="text-white font-medium">{c.rutAnunciante}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-300">Producto/Servicio</Label>
                    {isEditing ? (
                      <Input
                        value={(editedContract as ContractView).producto}
                        onChange={(e) => handleInputChange('producto', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">{c.producto}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Ejecutivo</Label>
                      <p className="text-white font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        {c.ejecutivo}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Agencia</Label>
                      <p className="text-white font-medium">
                        {c.agencia || 'Directo'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-300">Tipo</Label>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        Tipo {c.tipoContrato}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-slate-300">Facturación</Label>
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        {c.modalidadFacturacion}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-slate-300">Pago</Label>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {c.plazoPago} días
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow y Estado */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-purple-400" />
                    Workflow y Estado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-slate-300">Progreso General</Label>
                      <span className="text-white font-bold">{c.workflow?.progreso}%</span>
                    </div>
                    <Progress 
                      value={c.workflow?.progreso} 
                      className="h-3 bg-slate-700"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Etapa Actual</Label>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      {c.workflow?.etapaActual}
                    </p>
                  </div>

                  <div>
                    <Label className="text-slate-300">Próxima Acción</Label>
                    <p className="text-white font-medium">{c.workflow?.proximaAccion}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Responsable</Label>
                      <p className="text-white font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        {c.workflow?.responsable}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Fecha Límite</Label>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-400" />
                        {c.workflow?.fechaLimite ? new Date(c.workflow.fechaLimite).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  {(c.alertas?.length ?? 0) > 0 && (
                    <div>
                      <Label className="text-slate-300">Alertas Activas</Label>
                      <div className="space-y-2 mt-2">
                        {c.alertas?.map((alerta: string, index: number) => (
                          <div key={`${alerta}-${index}`} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <AlertTriangle className="h-4 w-4 text-orange-400" />
                            <span className="text-orange-300 text-sm">{alerta}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {c.performance?.cumplimiento}%
                    </div>
                    <div className="text-slate-300">Cumplimiento</div>
                    <Progress 
                      value={c.performance?.cumplimiento} 
                      className="h-2 mt-2 bg-slate-700"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {c.performance?.satisfaccionCliente}%
                    </div>
                    <div className="text-slate-300">Satisfacción Cliente</div>
                    <Progress 
                      value={c.performance?.satisfaccionCliente} 
                      className="h-2 mt-2 bg-slate-700"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {c.performance?.rentabilidad}%
                    </div>
                    <div className="text-slate-300">Rentabilidad</div>
                    <Progress 
                      value={c.performance?.rentabilidad} 
                      className="h-2 mt-2 bg-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Términos Financieros */}
          <TabsContent value="financiero" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Valores del Contrato */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Valores del Contrato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Valor Bruto</Label>
                      <p className="text-2xl font-bold text-green-400">
                        {CortexContractsUtils.formatCurrency(c.valorBruto ?? 0)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Valor Neto</Label>
                      <p className="text-2xl font-bold text-white">
                        {CortexContractsUtils.formatCurrency(c.valorNeto ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-300">Moneda</Label>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {c.moneda}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-slate-300">Descuento</Label>
                      <p className="text-orange-400 font-medium">{c.descuentoAplicado}%</p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Es Canje</Label>
                      <Badge 
                        variant={c.esCanje ? "destructive" : "outline"}
                        className={c.esCanje ? "" : "text-green-400 border-green-400"}
                      >
                        {c.esCanje ? 'SÍ' : 'NO'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Fechas del Contrato</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="text-xs text-slate-400">Inicio</p>
                          <p className="text-white font-medium">
                            {c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-400" />
                        <div>
                          <p className="text-xs text-slate-400">Fin</p>
                          <p className="text-white font-medium">
                            {c.fechaFin ? new Date(c.fechaFin).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estado Financiero */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                    Estado Financiero
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Monto Facturado</Label>
                    <p className="text-2xl font-bold text-green-400">
                      {CortexContractsUtils.formatCurrency(c.financiero?.montoFacturado ?? 0)}
                    </p>
                    <p className="text-sm text-slate-400">
                      {(((c.financiero?.montoFacturado ?? 0) / (c.valorNeto ?? 1)) * 100).toFixed(1)}% del total
                    </p>
                  </div>

                  <div>
                    <Label className="text-slate-300">Monto Pendiente</Label>
                    <p className="text-2xl font-bold text-orange-400">
                      {CortexContractsUtils.formatCurrency(c.financiero?.montoPendiente ?? 0)}
                    </p>
                    <p className="text-sm text-slate-400">
                      {(((c.financiero?.montoPendiente ?? 0) / (c.valorNeto ?? 1)) * 100).toFixed(1)}% del total
                    </p>
                  </div>

                  {c.agencia && c.facturarComisionAgencia && (
                    <div>
                      <Label className="text-slate-300">Comisión Agencia</Label>
                      <p className="text-xl font-bold text-blue-400">
                        {CortexContractsUtils.formatCurrency(c.financiero?.comisionAgencia ?? 0)}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Descuentos</Label>
                      <p className="text-red-400 font-medium">
                        {CortexContractsUtils.formatCurrency(c.financiero?.descuentosAplicados ?? 0)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Impuestos</Label>
                      <p className="text-slate-300 font-medium">
                        {CortexContractsUtils.formatCurrency(c.financiero?.impuestos ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Flujo de Caja */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Flujo de Caja Proyectado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400">Gráfico de flujo de caja</p>
                    <p className="text-sm text-slate-500">Integración con Cortex-Analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Especificaciones de Pauta */}
          <TabsContent value="pauta" className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Especificaciones de Pauta
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configuración de medios, formatos y distribución de pauta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Especificaciones de Pauta
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Configuración detallada de medios, horarios y distribución
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Pauta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Documentos y Referencias */}
          <TabsContent value="documentos" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estado de Documentos */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-green-400" />
                    Estado de Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${c.documentos?.contrato ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-white">Contrato Principal</span>
                      </div>
                      {c.documentos?.contrato ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${c.documentos?.anexos ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-white">Anexos</span>
                      </div>
                      {c.documentos?.anexos ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${c.documentos?.aprobaciones ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-white">Aprobaciones</span>
                      </div>
                      {c.documentos?.aprobaciones ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        <span className="text-white">Facturas Generadas</span>
                      </div>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {c.documentos?.facturas}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Documentos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones de Documentos */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="h-5 w-5 text-purple-400" />
                    Acciones de Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Contrato
                  </Button>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar para Firma
                  </Button>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Solicitar Aprobaciones
                  </Button>
                  
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Tags del Contrato */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Tags y Clasificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {c.tags?.map((tag: string, index: number) => (
                    <Badge
                      key={`${tag}-${index}`}
                      variant="outline" 
                      className="text-emerald-400 border-emerald-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button size="sm" variant="outline" className="border-dashed border-slate-500">
                      + Agregar Tag
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Analytics IA */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {isAnalyzing ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-emerald-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Analizando con Cortex-Contracts
                    </h3>
                    <p className="text-slate-400">
                      Procesando datos del contrato con IA avanzada...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : contractAnalysis ? (
              <div className="space-y-6">
                {/* Scores de IA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-300">Score de Riesgo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center mb-2">
                        <span className={`${(ca?.riskScore ?? 0) >= 80 ? 'text-green-400' : (ca?.riskScore ?? 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {ca?.riskScore}
                        </span>
                        <span className="text-slate-400 text-lg">/100</span>
                      </div>
                      <Progress
                        value={ca?.riskScore ?? 0}
                        className="h-2 bg-slate-700"
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-300">Score de Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center mb-2">
                        <span className={`${(ca?.complianceScore ?? 0) >= 80 ? 'text-green-400' : (ca?.complianceScore ?? 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {ca?.complianceScore}
                        </span>
                        <span className="text-slate-400 text-lg">/100</span>
                      </div>
                      <Progress
                        value={ca?.complianceScore ?? 0}
                        className="h-2 bg-slate-700"
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-300">Score de Rentabilidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center mb-2">
                        <span className={`${(ca?.profitabilityScore ?? 0) >= 80 ? 'text-green-400' : (ca?.profitabilityScore ?? 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {ca?.profitabilityScore}
                        </span>
                        <span className="text-slate-400 text-lg">/100</span>
                      </div>
                      <Progress
                        value={ca?.profitabilityScore ?? 0}
                        className="h-2 bg-slate-700"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Recomendaciones de IA */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-emerald-400" />
                      Recomendaciones Cortex-Contracts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ca?.recommendations?.map((rec, index: number) => (
                        <div key={`rec-${index}`} className="p-4 bg-slate-700/50 rounded-lg border-l-4 border-emerald-500">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white">{rec.title}</h4>
                            <Badge
                              variant={rec.priority === 'critical' ? 'destructive' : 'outline'}
                              className={rec.priority === 'high' ? 'text-orange-400 border-orange-400' : ''}
                            >
                              {(rec.priority ?? '').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{rec.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Impacto: +{rec.impact}%</span>
                            <span className="text-slate-400">Timeline: {rec.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics Predictivo */}
                {predictiveAnalytics && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        Analytics Predictivo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-white mb-3">Probabilidad de Éxito</h4>
                          <div className="text-2xl font-bold text-green-400 mb-2">
                            {pa?.contractSuccess?.probability}%
                          </div>
                          <div className="space-y-2">
                            {pa?.contractSuccess?.factors?.map((factor, index: number) => (
                              <div key={`factor-${index}`} className="flex justify-between text-sm">
                                <span className="text-slate-300">{factor.name}</span>
                                <span className="text-white">{Math.round((factor.impact ?? 0) * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-white mb-3">Forecasting de Revenue</h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-slate-300 text-sm">Próximo Trimestre</span>
                              <div className="text-xl font-bold text-blue-400">
                                {CortexContractsUtils.formatCurrency(pa?.revenueForecasting?.nextQuarter ?? 0)}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-300 text-sm">Confianza</span>
                              <div className="text-lg font-semibold text-white">
                                {Math.round((pa?.revenueForecasting?.confidence ?? 0) * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Optimización Sugerida */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-400" />
                      Optimización Sugerida
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">
                          +{ca?.optimization?.timeReduction}%
                        </div>
                        <div className="text-slate-300 text-sm">Reducción Tiempo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {(CortexContractsUtils.formatCurrency(ca?.optimization?.potentialSavings ?? 0) ?? '').slice(0, -3)}K
                        </div>
                        <div className="text-slate-300 text-sm">Ahorro Potencial</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          -{ca?.optimization?.riskReduction}%
                        </div>
                        <div className="text-slate-300 text-sm">Reducción Riesgo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {ca?.optimization?.optimizedEfficiency}%
                        </div>
                        <div className="text-slate-300 text-sm">Eficiencia Objetivo</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Analytics IA No Disponible
                    </h3>
                    <p className="text-slate-400 mb-4">
                      No se pudo cargar el análisis de Cortex-Contracts
                    </p>
                    <Button 
                      onClick={initializeCortexAnalysis}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar Análisis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}