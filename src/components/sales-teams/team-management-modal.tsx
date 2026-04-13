/**
 * MÓDULO 4.2: GESTIÓN DE EQUIPOS DE VENTAS - TIER 0 Fortune 10
 * 
 * @description Modal para gestión completa de equipos comerciales con
 * estructuras organizacionales, coaching IA y herramientas de liderazgo
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
  Users, 
  Target, 
  TrendingUp, 
  DollarSign,
  Trophy,
  Crown,
  Star,
  BarChart3,
  Brain,
  Zap,
  Award,
  MapPin,
  Briefcase,
  Calendar,
  Activity,
  UserPlus,
  Settings,
  MessageSquare,
  BookOpen,
  Lightbulb
} from 'lucide-react'

/**
 * Interfaces para Gestión de Equipos
 */
interface EquipoDetallado {
  id: string
  nombre: string
  descripcion: string
  
  // Liderazgo
  jefe: {
    id: string
    nombre: string
    apellido: string
    email: string
    foto?: string
    experiencia: number
    certificaciones: string[]
  }
  
  // Configuración del Equipo
  especializacion: 'geografica' | 'vertical' | 'mixta' | 'producto'
  territorio?: string[]
  industrias?: string[]
  productos?: string[]
  
  // Miembros del Equipo
  miembros: MiembroEquipo[]
  capacidadMaxima: number
  
  // Performance Grupal
  metaGrupal: number
  ventasGrupales: number
  ventasAnuales: number
  comisionesGrupales: number
  ranking: number
  rankingAnual: number
  
  // Métricas Avanzadas
  conversionRatePromedio: number
  ticketPromedioEquipo: number
  cicloVentaPromedio: number
  clientesActivosTotal: number
  
  // Coaching y Desarrollo
  sesionesCoaching: SesionCoaching[]
  planDesarrollo: PlanDesarrollo[]
  objetivosEquipo: ObjetivoEquipo[]
  
  // IA y Automatización
  cortexTeamScore: number
  recomendacionesEquipo: RecomendacionEquipo[]
  alertasEquipo: AlertaEquipo[]
  
  // Estado
  estado: 'activo' | 'reestructuracion' | 'expansion'
  fechaCreacion: string
  ultimaReunion: string
}

interface MiembroEquipo {
  id: string
  nombre: string
  apellido: string
  email: string
  foto?: string
  cargo: string
  fechaIngreso: string
  ventasMes: number
  metaIndividual: number
  ranking: number
  especializaciones: string[]
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
  cortexScore: number
}

interface SesionCoaching {
  id: string
  fecha: string
  tipo: 'individual' | 'grupal' | 'skill-building'
  participantes: string[]
  tema: string
  objetivos: string[]
  resultados?: string
  proximaSesion?: string
  coach: string
}

interface PlanDesarrollo {
  id: string
  miembroId: string
  area: string
  objetivoActual: string
  progreso: number
  fechaInicio: string
  fechaObjetivo: string
  recursos: string[]
  mentor?: string
}

interface ObjetivoEquipo {
  id: string
  titulo: string
  descripcion: string
  tipo: 'ventas' | 'desarrollo' | 'proceso' | 'cliente'
  progreso: number
  objetivo: number
  fechaLimite: string
  responsables: string[]
  prioridad: 'alta' | 'media' | 'baja'
}

interface RecomendacionEquipo {
  id: string
  tipo: 'estructura' | 'proceso' | 'coaching' | 'asignacion'
  titulo: string
  descripcion: string
  impactoEstimado: number
  esfuerzoRequerido: 'bajo' | 'medio' | 'alto'
  fechaGenerada: string
  aplicada: boolean
}

interface AlertaEquipo {
  id: string
  tipo: 'performance' | 'estructura' | 'proceso' | 'desarrollo'
  mensaje: string
  severidad: 'info' | 'warning' | 'error' | 'success'
  afectados: string[]
  fechaCreada: string
  resuelta: boolean
}

interface TeamManagementModalProps {
  equipo: EquipoDetallado | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal de Gestión de Equipos
 */
export function TeamManagementModal({ equipo, isOpen, onClose }: TeamManagementModalProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!equipo) return null

  /**
   * Calcular porcentaje de meta grupal
   */
  const porcentajeMetaGrupal = ((equipo.ventasGrupales / equipo.metaGrupal) * 100).toFixed(1)

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
   * Obtener color por estado del miembro
   */
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'border-green-500 text-green-400'
      case 'vacaciones': return 'border-yellow-500 text-yellow-400'
      case 'licencia': return 'border-blue-500 text-blue-400'
      default: return 'border-red-500 text-red-400'
    }
  }

  /**
   * Obtener color por prioridad
   */
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'border-red-400 text-red-400'
      case 'media': return 'border-yellow-400 text-yellow-400'
      default: return 'border-green-400 text-green-400'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-[#F0EDE8] border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {equipo.nombre}
                <Badge 
                  variant="outline" 
                  className={`${getRankingColor(equipo.ranking)} border-current`}
                >
                  #{equipo.ranking} Ranking
                </Badge>
                <Badge 
                  variant="outline"
                  className={
                    equipo.estado === 'activo' ? 'border-green-500 text-green-400' :
                    equipo.estado === 'expansion' ? 'border-blue-500 text-blue-400' :
                    'border-yellow-500 text-yellow-400'
                  }
                >
                  {equipo.estado.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 font-normal">
                {equipo.descripcion} • {equipo.miembros.length}/{equipo.capacidadMaxima} miembros
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="miembros" className="data-[state=active]:bg-green-600">
              Miembros
            </TabsTrigger>
            <TabsTrigger value="coaching" className="data-[state=active]:bg-purple-600">
              Coaching
            </TabsTrigger>
            <TabsTrigger value="objetivos" className="data-[state=active]:bg-orange-600">
              Objetivos
            </TabsTrigger>
            <TabsTrigger value="ia-insights" className="data-[state=active]:bg-red-600">
              IA Insights
            </TabsTrigger>
          </TabsList>

          {/* Tab Overview del Equipo */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs del Equipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Ventas Grupales</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${equipo.ventasGrupales.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-400">
                    {porcentajeMetaGrupal}% de meta (${equipo.metaGrupal.toLocaleString()})
                  </p>
                  <Progress 
                    value={parseFloat(porcentajeMetaGrupal)} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Miembros Activos</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {equipo.miembros.filter(m => m.estado === 'activo').length}
                  </div>
                  <p className="text-xs text-slate-400">
                    de {equipo.miembros.length} total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Conversión Promedio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {equipo.conversionRatePromedio}%
                  </div>
                  <p className="text-xs text-slate-400">
                    Tasa del equipo
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Cortex Team Score</CardTitle>
                  <Brain className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {equipo.cortexTeamScore}/100
                  </div>
                  <p className="text-xs text-slate-400">
                    Puntuación IA grupal
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Información del Jefe de Equipo */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Jefe de Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={equipo.jefe.foto} />
                    <AvatarFallback className="bg-yellow-600 text-white text-lg">
                      {equipo.jefe.nombre.charAt(0)}{equipo.jefe.apellido.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {equipo.jefe.nombre} {equipo.jefe.apellido}
                    </h3>
                    <p className="text-slate-400">{equipo.jefe.email}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {equipo.jefe.experiencia} años de experiencia
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {equipo.jefe.certificaciones.map((cert, index) => (
                        <Badge key={`${cert}-${index}`} variant="outline" className="text-yellow-400 border-yellow-400">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Button className="bg-yellow-600 hover:bg-yellow-700 mb-2">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                    <br />
                    <Button variant="outline" className="border-yellow-500 text-yellow-400">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración del Equipo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-400" />
                    Configuración
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-slate-400 text-sm">Especialización:</span>
                    <p className="text-white font-medium capitalize">{equipo.especializacion}</p>
                  </div>
                  {equipo.territorio && (
                    <div>
                      <span className="text-slate-400 text-sm">Territorio:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {equipo.territorio.map((t, index) => (
                          <Badge key={`${t}-${index}`} variant="outline" className="text-blue-400 border-blue-400">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {equipo.industrias && (
                    <div>
                      <span className="text-slate-400 text-sm">Industrias:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {equipo.industrias.map((ind, index) => (
                          <Badge key={`${ind}-${index}`} variant="outline" className="text-green-400 border-green-400">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Métricas Avanzadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ticket Promedio</span>
                    <span className="text-white font-bold">
                      ${equipo.ticketPromedioEquipo.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ciclo de Venta</span>
                    <span className="text-white font-bold">
                      {equipo.cicloVentaPromedio} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Clientes Activos</span>
                    <span className="text-white font-bold">
                      {equipo.clientesActivosTotal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Comisiones Grupales</span>
                    <span className="text-white font-bold">
                      ${equipo.comisionesGrupales.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Miembros del Equipo */}
          <TabsContent value="miembros" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-400" />
                      Miembros del Equipo
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Gestión individual y performance de cada miembro
                    </CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar Miembro
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipo.miembros.map((miembro) => {
                    const porcentajeMeta = ((miembro.ventasMes / miembro.metaIndividual) * 100).toFixed(1)
                    
                    return (
                      <div 
                        key={miembro.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={miembro.foto} />
                            <AvatarFallback className="bg-green-600 text-white">
                              {miembro.nombre.charAt(0)}{miembro.apellido.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium text-lg">
                                {miembro.nombre} {miembro.apellido}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={`${getRankingColor(miembro.ranking)} border-current`}
                              >
                                #{miembro.ranking}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={getEstadoColor(miembro.estado)}
                              >
                                {miembro.estado.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">
                              {miembro.cargo} • {miembro.email}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-slate-400">
                              <span>
                                Especialización: {miembro.especializaciones.join(', ')}
                              </span>
                              <span>
                                Cortex Score: {miembro.cortexScore}/100
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-white font-bold text-lg">
                              ${miembro.ventasMes.toLocaleString()}
                            </p>
                            <p className="text-slate-400 text-sm">
                              Meta: ${miembro.metaIndividual.toLocaleString()}
                            </p>
                            <p className="text-green-400 text-sm">
                              {porcentajeMeta}% cumplimiento
                            </p>
                          </div>
                          
                          <div className="w-24">
                            <div className="w-full bg-slate-600 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  parseFloat(porcentajeMeta) >= 100 ? 'bg-green-500' :
                                  parseFloat(porcentajeMeta) >= 80 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(parseFloat(porcentajeMeta), 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-1 text-center">
                              {porcentajeMeta}%
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-green-500 text-green-400 hover:bg-green-500/10"
                            >
                              Dashboard
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                            >
                              Coaching
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Coaching y Desarrollo */}
          <TabsContent value="coaching" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sesiones de Coaching */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                    Sesiones de Coaching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipo.sesionesCoaching.slice(0, 3).map((sesion) => (
                      <div 
                        key={sesion.id}
                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">
                            {sesion.tema}
                          </h4>
                          <Badge 
                            variant="outline"
                            className={
                              sesion.tipo === 'individual' ? 'border-blue-400 text-blue-400' :
                              sesion.tipo === 'grupal' ? 'border-green-400 text-green-400' :
                              'border-purple-400 text-purple-400'
                            }
                          >
                            {sesion.tipo}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">
                          Coach: {sesion.coach}
                        </p>
                        <p className="text-slate-400 text-sm mb-2">
                          Participantes: {sesion.participantes.length}
                        </p>
                        <div className="text-xs text-slate-500">
                          {new Date(sesion.fecha).toLocaleDateString()}
                          {sesion.proximaSesion && (
                            <span className="ml-2 text-green-400">
                              • Próxima: {new Date(sesion.proximaSesion).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Programar Sesión
                  </Button>
                </CardContent>
              </Card>

              {/* Planes de Desarrollo */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Planes de Desarrollo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipo.planDesarrollo.slice(0, 3).map((plan) => {
                      const miembro = equipo.miembros.find(m => m.id === plan.miembroId)
                      
                      return (
                        <div 
                          key={plan.id}
                          className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">
                              {miembro?.nombre} {miembro?.apellido}
                            </h4>
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              {plan.area}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">
                            {plan.objetivoActual}
                          </p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-500">
                              Progreso: {plan.progreso}%
                            </span>
                            <span className="text-xs text-slate-500">
                              Objetivo: {new Date(plan.fechaObjetivo).toLocaleDateString()}
                            </span>
                          </div>
                          <Progress value={plan.progreso} className="h-2" />
                          {plan.mentor && (
                            <p className="text-xs text-blue-400 mt-2">
                              Mentor: {plan.mentor}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Objetivos del Equipo */}
          <TabsContent value="objetivos" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-400" />
                      Objetivos del Equipo
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Metas grupales y seguimiento de progreso
                    </CardDescription>
                  </div>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Target className="h-4 w-4 mr-2" />
                    Nuevo Objetivo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipo.objetivosEquipo.map((objetivo) => (
                    <div 
                      key={objetivo.id}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">
                            {objetivo.titulo}
                          </h4>
                          <Badge 
                            variant="outline"
                            className={getPrioridadColor(objetivo.prioridad)}
                          >
                            {objetivo.prioridad}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={
                              objetivo.tipo === 'ventas' ? 'border-green-400 text-green-400' :
                              objetivo.tipo === 'desarrollo' ? 'border-blue-400 text-blue-400' :
                              objetivo.tipo === 'proceso' ? 'border-purple-400 text-purple-400' :
                              'border-yellow-400 text-yellow-400'
                            }
                          >
                            {objetivo.tipo}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400">
                          Límite: {new Date(objetivo.fechaLimite).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-3">
                        {objetivo.descripcion}
                      </p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">
                          Progreso: {objetivo.progreso}/{objetivo.objetivo}
                        </span>
                        <span className="text-sm text-slate-300">
                          {((objetivo.progreso / objetivo.objetivo) * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={(objetivo.progreso / objetivo.objetivo) * 100} 
                        className="mb-3 h-2"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {objetivo.responsables.slice(0, 3).map((responsable, index) => (
                            <Badge key={`${responsable}-${index}`} variant="outline" className="text-xs">
                              {responsable}
                            </Badge>
                          ))}
                          {objetivo.responsables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{objetivo.responsables.length - 3}
                            </Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Actualizar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab IA Insights */}
          <TabsContent value="ia-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recomendaciones IA */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-orange-400" />
                    Recomendaciones IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipo.recomendacionesEquipo.map((rec) => (
                      <div 
                        key={rec.id}
                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-orange-400 border-orange-400">
                            {rec.tipo}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={
                              rec.esfuerzoRequerido === 'alto' ? 'border-red-400 text-red-400' :
                              rec.esfuerzoRequerido === 'medio' ? 'border-yellow-400 text-yellow-400' :
                              'border-green-400 text-green-400'
                            }
                          >
                            {rec.esfuerzoRequerido} esfuerzo
                          </Badge>
                        </div>
                        <h4 className="text-white font-medium mb-2">
                          {rec.titulo}
                        </h4>
                        <p className="text-slate-400 text-sm mb-3">
                          {rec.descripcion}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-orange-400 text-sm font-medium">
                            Impacto: +{rec.impactoEstimado}%
                          </span>
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={rec.aplicada}
                          >
                            {rec.aplicada ? 'Aplicada' : 'Aplicar'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alertas del Equipo */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-400" />
                    Alertas del Equipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipo.alertasEquipo.map((alerta) => (
                      <div 
                        key={alerta.id}
                        className={`p-3 rounded-lg border ${
                          alerta.severidad === 'error' ? 'border-red-500 bg-red-500/10' :
                          alerta.severidad === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                          alerta.severidad === 'success' ? 'border-green-500 bg-green-500/10' :
                          'border-blue-500 bg-blue-500/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant="outline"
                            className={
                              alerta.tipo === 'performance' ? 'border-red-400 text-red-400' :
                              alerta.tipo === 'estructura' ? 'border-blue-400 text-blue-400' :
                              alerta.tipo === 'proceso' ? 'border-purple-400 text-purple-400' :
                              'border-green-400 text-green-400'
                            }
                          >
                            {alerta.tipo}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(alerta.fechaCreada).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white text-sm mb-2">
                          {alerta.mensaje}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Afectados: {alerta.afectados.length} miembros
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={alerta.resuelta}
                          >
                            {alerta.resuelta ? 'Resuelta' : 'Resolver'}
                          </Button>
                        </div>
                      </div>
                    ))}
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
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Equipo
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <BookOpen className="h-4 w-4 mr-2" />
            Sesión Coaching
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}