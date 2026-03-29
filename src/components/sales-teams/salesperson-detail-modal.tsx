/**
 * MÓDULO 4.1: GESTIÓN INDIVIDUAL DE VENDEDORES - TIER 0 Fortune 10
 * 
 * @description Modal detallado 360° para gestión individual de vendedores
 * con dashboard personalizado, KPIs en tiempo real y herramientas de IA
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - Sales Teams Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Target, 
  TrendingUp, 
  DollarSign,
  Trophy,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Star,
  Award,
  BarChart3,
  Clock,
  Users,
  Zap,
  Brain,
  Shield,
  Activity
} from 'lucide-react'

/**
 * Interfaces para Vendedor Individual
 */
interface VendedorDetallado {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  foto?: string
  
  // Información Profesional
  cargo: string
  equipo: string
  jefeDirecto: string
  fechaIngreso: string
  especializaciones: string[]
  certificaciones: string[]
  
  // Performance Actual
  metaMensual: number
  ventasActuales: number
  ventasAnuales: number
  comisionesAcumuladas: number
  ranking: number
  rankingAnual: number
  
  // Métricas Avanzadas
  conversionRate: number
  ticketPromedio: number
  cicloVentaPromedio: number
  clientesActivos: number
  clientesNuevos: number
  
  // Gamificación
  puntos: number
  nivel: number
  insignias: Insignia[]
  logros: Logro[]
  
  // Estado y Actividad
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
  ultimaActividad: string
  horasTrabajadasMes: number
  
  // IA y Automatización
  cortexScore: number
  recomendacionesIA: RecomendacionIA[]
  alertas: Alerta[]
}

interface Insignia {
  id: string
  nombre: string
  descripcion: string
  icono: string
  fechaObtenida: string
  rareza: 'comun' | 'raro' | 'epico' | 'legendario'
}

interface Logro {
  id: string
  titulo: string
  descripcion: string
  progreso: number
  objetivo: number
  recompensa: string
  fechaCompletado?: string
}

interface RecomendacionIA {
  id: string
  tipo: 'prospecto' | 'estrategia' | 'timing' | 'producto'
  titulo: string
  descripcion: string
  prioridad: 'alta' | 'media' | 'baja'
  impactoEstimado: number
  fechaGenerada: string
}

interface Alerta {
  id: string
  tipo: 'oportunidad' | 'riesgo' | 'meta' | 'cliente'
  mensaje: string
  severidad: 'info' | 'warning' | 'error' | 'success'
  fechaCreada: string
  leida: boolean
}

interface SalespersonDetailModalProps {
  vendedor: VendedorDetallado | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal Detallado de Vendedor Individual
 */
export function SalespersonDetailModal({ vendedor, isOpen, onClose }: SalespersonDetailModalProps) {
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!vendedor) return null

  /**
   * Calcular porcentaje de meta
   */
  const porcentajeMeta = ((vendedor.ventasActuales / vendedor.metaMensual) * 100).toFixed(1)

  /**
   * Obtener color por ranking
   */
  const getRankingColor = (ranking: number) => {
    if (ranking === 1) return 'text-yellow-400'
    if (ranking <= 3) return 'text-gray-300'
    if (ranking <= 5) return 'text-orange-400'
    return 'text-slate-400'
  }

  /**
   * Obtener color por rareza de insignia
   */
  const getRarezaColor = (rareza: string) => {
    switch (rareza) {
      case 'legendario': return 'border-yellow-400 bg-yellow-400/10'
      case 'epico': return 'border-purple-400 bg-purple-400/10'
      case 'raro': return 'border-blue-400 bg-blue-400/10'
      default: return 'border-gray-400 bg-gray-400/10'
    }
  }

  /**
   * Obtener color por severidad de alerta
   */
  const getAlertColor = (severidad: string) => {
    switch (severidad) {
      case 'error': return 'border-red-500 bg-red-500/10 text-red-400'
      case 'warning': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'success': return 'border-green-500 bg-green-500/10 text-green-400'
      default: return 'border-blue-500 bg-blue-500/10 text-blue-400'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={vendedor.foto} />
              <AvatarFallback className="bg-green-600 text-white">
                {vendedor.nombre.charAt(0)}{vendedor.apellido.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {vendedor.nombre} {vendedor.apellido}
                <Badge 
                  variant="outline" 
                  className={`${getRankingColor(vendedor.ranking)} border-current`}
                >
                  #{vendedor.ranking} Ranking
                </Badge>
              </div>
              <p className="text-sm text-slate-400 font-normal">
                {vendedor.cargo} • {vendedor.equipo}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-600">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="gamificacion" className="data-[state=active]:bg-purple-600">
              Gamificación
            </TabsTrigger>
            <TabsTrigger value="ia-insights" className="data-[state=active]:bg-orange-600">
              IA Insights
            </TabsTrigger>
            <TabsTrigger value="perfil" className="data-[state=active]:bg-slate-600">
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Tab Dashboard Personal */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Ventas Mes</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${vendedor.ventasActuales.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-400">
                    {porcentajeMeta}% de meta (${vendedor.metaMensual.toLocaleString()})
                  </p>
                  <Progress 
                    value={parseFloat(porcentajeMeta)} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Comisiones</CardTitle>
                  <Target className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${vendedor.comisionesAcumuladas.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-400">
                    Acumuladas este mes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Conversión</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {vendedor.conversionRate}%
                  </div>
                  <p className="text-xs text-slate-400">
                    Tasa de conversión
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Cortex Score</CardTitle>
                  <Brain className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {vendedor.cortexScore}/100
                  </div>
                  <p className="text-xs text-slate-400">
                    Puntuación IA
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alertas y Recomendaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alertas Activas */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-400" />
                    Alertas Activas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vendedor.alertas.slice(0, 3).map((alerta) => (
                      <div 
                        key={alerta.id}
                        className={`p-3 rounded-lg border ${getAlertColor(alerta.severidad)}`}
                      >
                        <p className="text-sm font-medium">
                          {alerta.mensaje}
                        </p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(alerta.fechaCreada).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recomendaciones IA */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-orange-400" />
                    Recomendaciones IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vendedor.recomendacionesIA.slice(0, 3).map((rec) => (
                      <div 
                        key={rec.id}
                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-white">
                            {rec.titulo}
                          </h4>
                          <Badge 
                            variant="outline"
                            className={
                              rec.prioridad === 'alta' ? 'border-red-400 text-red-400' :
                              rec.prioridad === 'media' ? 'border-yellow-400 text-yellow-400' :
                              'border-green-400 text-green-400'
                            }
                          >
                            {rec.prioridad}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {rec.descripcion}
                        </p>
                        <p className="text-xs text-orange-400 mt-1">
                          Impacto estimado: +{rec.impactoEstimado}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Performance Detallado */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métricas de Ventas */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Métricas de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ticket Promedio</span>
                    <span className="text-white font-bold">
                      ${vendedor.ticketPromedio.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ciclo de Venta</span>
                    <span className="text-white font-bold">
                      {vendedor.cicloVentaPromedio} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Clientes Activos</span>
                    <span className="text-white font-bold">
                      {vendedor.clientesActivos}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Clientes Nuevos</span>
                    <span className="text-white font-bold">
                      {vendedor.clientesNuevos}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Horas Trabajadas</span>
                    <span className="text-white font-bold">
                      {vendedor.horasTrabajadasMes}h
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Comparativa Anual */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Performance Anual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ventas Anuales</span>
                    <span className="text-white font-bold">
                      ${vendedor.ventasAnuales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ranking Anual</span>
                    <span className={`font-bold ${getRankingColor(vendedor.rankingAnual)}`}>
                      #{vendedor.rankingAnual}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Nivel Actual</span>
                    <span className="text-white font-bold">
                      Nivel {vendedor.nivel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Puntos Totales</span>
                    <span className="text-white font-bold">
                      {vendedor.puntos.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Gamificación */}
          <TabsContent value="gamificacion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insignias */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-400" />
                    Insignias Obtenidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {vendedor.insignias.map((insignia) => (
                      <div 
                        key={insignia.id}
                        className={`p-3 rounded-lg border ${getRarezaColor(insignia.rareza)}`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{insignia.icono}</div>
                          <h4 className="text-sm font-medium text-white">
                            {insignia.nombre}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {insignia.descripcion}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(insignia.fechaObtenida).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Logros en Progreso */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Logros en Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendedor.logros.map((logro) => (
                      <div key={logro.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-white">
                            {logro.titulo}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {logro.progreso}/{logro.objetivo}
                          </span>
                        </div>
                        <Progress 
                          value={(logro.progreso / logro.objetivo) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-slate-400">
                          {logro.descripcion}
                        </p>
                        <p className="text-xs text-green-400">
                          Recompensa: {logro.recompensa}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab IA Insights */}
          <TabsContent value="ia-insights" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-400" />
                  Análisis Completo IA
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Insights generados por Cortex-Sales para optimizar performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendedor.recomendacionesIA.map((rec) => (
                    <div 
                      key={rec.id}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-orange-400 border-orange-400">
                            {rec.tipo}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={
                              rec.prioridad === 'alta' ? 'border-red-400 text-red-400' :
                              rec.prioridad === 'media' ? 'border-yellow-400 text-yellow-400' :
                              'border-green-400 text-green-400'
                            }
                          >
                            {rec.prioridad}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(rec.fechaGenerada).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-white font-medium mb-2">
                        {rec.titulo}
                      </h4>
                      <p className="text-slate-400 text-sm mb-3">
                        {rec.descripcion}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400 text-sm font-medium">
                          Impacto estimado: +{rec.impactoEstimado}%
                        </span>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Aplicar Recomendación
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Personal */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{vendedor.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{vendedor.telefono}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      Ingreso: {new Date(vendedor.fechaIngreso).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      Última actividad: {new Date(vendedor.ultimaActividad).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Información Profesional */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-400" />
                    Información Profesional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-slate-400 text-sm">Cargo:</span>
                    <p className="text-white font-medium">{vendedor.cargo}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Jefe Directo:</span>
                    <p className="text-white font-medium">{vendedor.jefeDirecto}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Especializaciones:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vendedor.especializaciones.map((esp, index) => (
                        <Badge key={index} variant="outline" className="text-blue-400 border-blue-400">
                          {esp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Certificaciones:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vendedor.certificaciones.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-green-400 border-green-400">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Editar Vendedor
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Dashboard Móvil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}