/**
 * MÓDULO 4.3: MOTOR DE METAS Y COMISIONES - TIER 0 Fortune 10
 * 
 * @description Sistema integral de incentivos con configuración flexible,
 * gamificación avanzada y automatización de cálculos de comisiones
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Trophy,
  Star,
  Award,
  Calculator,
  Settings,
  Zap,
  Crown,
  Gift,
  BarChart3,
  Calendar,
  Users,
  Percent,
  Plus,
  Edit,
  Save,
  RefreshCw,
  Brain,
  Gamepad2
} from 'lucide-react'

/**
 * Interfaces para Metas y Comisiones
 */
interface MetaVendedor {
  id: string
  vendedorId: string
  vendedorNombre: string
  periodo: string
  metaVentas: number
  metaClientes: number
  metaActividades: number
  ventasActuales: number
  clientesActuales: number
  actividadesActuales: number
  porcentajeVentas: number
  porcentajeClientes: number
  porcentajeActividades: number
  estado: 'en_progreso' | 'cumplida' | 'excedida' | 'no_cumplida'
  fechaInicio: string
  fechaFin: string
}

interface EsquemaComision {
  id: string
  nombre: string
  descripcion: string
  tipo: 'porcentaje' | 'fijo' | 'escalonado' | 'mixto'
  activo: boolean
  
  // Configuración Básica
  porcentajeBase: number
  montoFijo?: number
  
  // Escalones (para tipo escalonado)
  escalones: EscalonComision[]
  
  // Bonificaciones
  bonificaciones: Bonificacion[]
  
  // Condiciones
  ventaMinima?: number
  metaMinima?: number
  clientesMinimos?: number
  
  // Aplicabilidad
  aplicaA: 'todos' | 'equipo' | 'individual'
  vendedores?: string[]
  equipos?: string[]
  productos?: string[]
  
  fechaCreacion: string
  creadoPor: string
}

interface EscalonComision {
  id: string
  desde: number
  hasta: number
  porcentaje: number
  descripcion: string
}

interface Bonificacion {
  id: string
  nombre: string
  tipo: 'meta_cumplida' | 'nuevos_clientes' | 'producto_especifico' | 'periodo_especial'
  valor: number
  tipoValor: 'porcentaje' | 'fijo'
  condicion: string
  activa: boolean
}

interface CalculoComision {
  vendedorId: string
  vendedorNombre: string
  periodo: string
  ventasBrutas: number
  ventasNetas: number
  comisionBase: number
  bonificaciones: number
  deducciones: number
  comisionTotal: number
  esquemaAplicado: string
  detalleCalculo: DetalleCalculo[]
}

interface DetalleCalculo {
  concepto: string
  base: number
  porcentaje?: number
  monto: number
  tipo: 'comision' | 'bonificacion' | 'deduccion'
}

interface ElementoGamificacion {
  id: string
  tipo: 'insignia' | 'logro' | 'nivel' | 'reto'
  nombre: string
  descripcion: string
  icono: string
  condicion: string
  recompensa: string
  puntos: number
  rareza: 'comun' | 'raro' | 'epico' | 'legendario'
  activo: boolean
}

interface GoalsCommissionEngineProps {
  vendedores: Record<string, unknown>[]
  equipos: Record<string, unknown>[]
}

/**
 * Motor de Metas y Comisiones
 */
export function GoalsCommissionEngine({ vendedores, equipos }: GoalsCommissionEngineProps) {
  const [activeTab, setActiveTab] = useState('metas')
  const [selectedPeriodo, setSelectedPeriodo] = useState('2025-02')

  // Mock data
  const [metas] = useState<MetaVendedor[]>([
    {
      id: 'meta_001',
      vendedorId: 'vend_001',
      vendedorNombre: 'Juan Pérez',
      periodo: '2025-02',
      metaVentas: 50000000,
      metaClientes: 15,
      metaActividades: 100,
      ventasActuales: 67500000,
      clientesActuales: 18,
      actividadesActuales: 95,
      porcentajeVentas: 135,
      porcentajeClientes: 120,
      porcentajeActividades: 95,
      estado: 'excedida',
      fechaInicio: '2025-02-01',
      fechaFin: '2025-02-28'
    },
    {
      id: 'meta_002',
      vendedorId: 'vend_002',
      vendedorNombre: 'Ana Silva',
      periodo: '2025-02',
      metaVentas: 45000000,
      metaClientes: 12,
      metaActividades: 80,
      ventasActuales: 52000000,
      clientesActuales: 14,
      actividadesActuales: 85,
      porcentajeVentas: 115.6,
      porcentajeClientes: 116.7,
      porcentajeActividades: 106.3,
      estado: 'excedida',
      fechaInicio: '2025-02-01',
      fechaFin: '2025-02-28'
    }
  ])

  const [esquemasComision] = useState<EsquemaComision[]>([
    {
      id: 'esquema_001',
      nombre: 'Comisión Estándar',
      descripcion: 'Esquema base para vendedores regulares',
      tipo: 'escalonado',
      activo: true,
      porcentajeBase: 3,
      escalones: [
        { id: 'esc_001', desde: 0, hasta: 30000000, porcentaje: 3, descripcion: 'Base' },
        { id: 'esc_002', desde: 30000001, hasta: 50000000, porcentaje: 4, descripcion: 'Intermedio' },
        { id: 'esc_003', desde: 50000001, hasta: 999999999, porcentaje: 5, descripcion: 'Premium' }
      ],
      bonificaciones: [
        {
          id: 'bon_001',
          nombre: 'Meta Cumplida',
          tipo: 'meta_cumplida',
          valor: 10,
          tipoValor: 'porcentaje',
          condicion: 'Cumplir 100% de meta mensual',
          activa: true
        }
      ],
      ventaMinima: 10000000,
      metaMinima: 80,
      aplicaA: 'todos',
      fechaCreacion: '2025-01-01',
      creadoPor: 'admin'
    }
  ])

  const [calculosComision] = useState<CalculoComision[]>([
    {
      vendedorId: 'vend_001',
      vendedorNombre: 'Juan Pérez',
      periodo: '2025-02',
      ventasBrutas: 67500000,
      ventasNetas: 67500000,
      comisionBase: 2700000,
      bonificaciones: 270000,
      deducciones: 0,
      comisionTotal: 2970000,
      esquemaAplicado: 'Comisión Estándar',
      detalleCalculo: [
        { concepto: 'Base (0-30M)', base: 30000000, porcentaje: 3, monto: 900000, tipo: 'comision' },
        { concepto: 'Intermedio (30M-50M)', base: 20000000, porcentaje: 4, monto: 800000, tipo: 'comision' },
        { concepto: 'Premium (+50M)', base: 17500000, porcentaje: 5, monto: 875000, tipo: 'comision' },
        { concepto: 'Bonif. Meta Cumplida', base: 2575000, porcentaje: 10, monto: 270000, tipo: 'bonificacion' }
      ]
    }
  ])

  const [elementosGamificacion] = useState<ElementoGamificacion[]>([
    {
      id: 'gam_001',
      tipo: 'insignia',
      nombre: 'Vendedor del Mes',
      descripcion: 'Primer lugar en ventas mensuales',
      icono: '🏆',
      condicion: 'Ranking #1 en ventas del mes',
      recompensa: 'Insignia dorada + 1000 puntos',
      puntos: 1000,
      rareza: 'legendario',
      activo: true
    },
    {
      id: 'gam_002',
      tipo: 'logro',
      nombre: 'Meta Destroyer',
      descripcion: 'Superar meta mensual por 150%',
      icono: '💥',
      condicion: 'Ventas >= 150% de meta mensual',
      recompensa: 'Título especial + 500 puntos',
      puntos: 500,
      rareza: 'epico',
      activo: true
    }
  ])

  /**
   * Obtener color por estado de meta
   */
  const getEstadoMetaColor = (estado: string) => {
    switch (estado) {
      case 'excedida': return 'border-green-500 text-green-400 bg-green-500/10'
      case 'cumplida': return 'border-blue-500 text-blue-400 bg-blue-500/10'
      case 'en_progreso': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
      default: return 'border-red-500 text-red-400 bg-red-500/10'
    }
  }

  /**
   * Obtener color por rareza
   */
  const getRarezaColor = (rareza: string) => {
    switch (rareza) {
      case 'legendario': return 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
      case 'epico': return 'border-purple-400 bg-purple-400/10 text-purple-400'
      case 'raro': return 'border-blue-400 bg-blue-400/10 text-blue-400'
      default: return 'border-gray-400 bg-gray-400/10 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            🎯 Motor de Metas y Comisiones
          </h2>
          <p className="text-slate-300">
            Sistema integral de incentivos con gamificación avanzada
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-02">Febrero 2025</SelectItem>
              <SelectItem value="2025-01">Enero 2025</SelectItem>
              <SelectItem value="2024-12">Diciembre 2024</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            GAMIFICATION ACTIVE
          </Badge>
        </div>
      </div>

      {/* KPIs Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Metas Cumplidas</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metas.filter(m => m.estado === 'cumplida' || m.estado === 'excedida').length}
            </div>
            <p className="text-xs text-slate-400">
              de {metas.length} vendedores
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Comisiones Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${calculosComision.reduce((sum, c) => sum + c.comisionTotal, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">
              Período actual
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Performance Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.round(metas.reduce((sum, m) => sum + m.porcentajeVentas, 0) / metas.length)}%
            </div>
            <p className="text-xs text-slate-400">
              Cumplimiento de metas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Esquemas Activos</CardTitle>
            <Settings className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {esquemasComision.filter(e => e.activo).length}
            </div>
            <p className="text-xs text-slate-400">
              Configuraciones activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="metas" className="data-[state=active]:bg-green-600">
            Metas
          </TabsTrigger>
          <TabsTrigger value="comisiones" className="data-[state=active]:bg-blue-600">
            Comisiones
          </TabsTrigger>
          <TabsTrigger value="gamificacion" className="data-[state=active]:bg-purple-600">
            Gamificación
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="data-[state=active]:bg-orange-600">
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Tab Metas */}
        <TabsContent value="metas" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Seguimiento de Metas
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Performance individual vs objetivos establecidos
                  </CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Meta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metas.map((meta) => (
                  <div 
                    key={meta.id}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-medium text-lg">
                          {meta.vendedorNombre}
                        </h3>
                        <Badge 
                          variant="outline"
                          className={getEstadoMetaColor(meta.estado)}
                        >
                          {meta.estado.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Detalles
                        </Button>
                      </div>
                    </div>

                    {/* Métricas de Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Meta de Ventas */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Ventas</span>
                          <span className="text-white font-bold">
                            {meta.porcentajeVentas.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={meta.porcentajeVentas} className="h-3" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>${meta.ventasActuales.toLocaleString()}</span>
                          <span>Meta: ${meta.metaVentas.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Meta de Clientes */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Clientes</span>
                          <span className="text-white font-bold">
                            {meta.porcentajeClientes.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={meta.porcentajeClientes} className="h-3" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{meta.clientesActuales} clientes</span>
                          <span>Meta: {meta.metaClientes}</span>
                        </div>
                      </div>

                      {/* Meta de Actividades */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Actividades</span>
                          <span className="text-white font-bold">
                            {meta.porcentajeActividades.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={meta.porcentajeActividades} className="h-3" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{meta.actividadesActuales} actividades</span>
                          <span>Meta: {meta.metaActividades}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Comisiones */}
        <TabsContent value="comisiones" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-400" />
                    Cálculo de Comisiones
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Detalle automático de comisiones por vendedor
                  </CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recalcular
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {calculosComision.map((calculo) => (
                  <div 
                    key={calculo.vendedorId}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-medium text-lg">
                          {calculo.vendedorNombre}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Esquema: {calculo.esquemaAplicado}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          ${calculo.comisionTotal.toLocaleString()}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Comisión total
                        </p>
                      </div>
                    </div>

                    {/* Resumen de Cálculo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Ventas Netas</p>
                        <p className="text-white font-bold">
                          ${calculo.ventasNetas.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Comisión Base</p>
                        <p className="text-white font-bold">
                          ${calculo.comisionBase.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Bonificaciones</p>
                        <p className="text-green-400 font-bold">
                          +${calculo.bonificaciones.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm">Deducciones</p>
                        <p className="text-red-400 font-bold">
                          -${calculo.deducciones.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Detalle de Cálculo */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Detalle de Cálculo:</h4>
                      {calculo.detalleCalculo.map((detalle, index) => (
                        <div 
                          key={`${detalle}-${index}`}
                          className="flex items-center justify-between p-2 bg-slate-800/30 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline"
                              className={
                                detalle.tipo === 'comision' ? 'border-blue-400 text-blue-400' :
                                detalle.tipo === 'bonificacion' ? 'border-green-400 text-green-400' :
                                'border-red-400 text-red-400'
                              }
                            >
                              {detalle.tipo}
                            </Badge>
                            <span className="text-slate-300">{detalle.concepto}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-medium">
                              ${detalle.monto.toLocaleString()}
                            </span>
                            {detalle.porcentaje && (
                              <span className="text-slate-400 text-sm ml-2">
                                ({detalle.porcentaje}%)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Gamificación */}
        <TabsContent value="gamificacion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Elementos de Gamificación */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-purple-400" />
                      Elementos de Gamificación
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Insignias, logros y recompensas activas
                    </CardDescription>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Elemento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {elementosGamificacion.map((elemento) => (
                    <div 
                      key={elemento.id}
                      className={`p-4 rounded-lg border ${getRarezaColor(elemento.rareza)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{elemento.icono}</span>
                          <div>
                            <h4 className="text-white font-medium">
                              {elemento.nombre}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {elemento.descripcion}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline"
                            className={getRarezaColor(elemento.rareza)}
                          >
                            {elemento.rareza}
                          </Badge>
                          <p className="text-sm text-slate-400 mt-1">
                            {elemento.puntos} puntos
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-400">Condición: </span>
                          <span className="text-white">{elemento.condicion}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Recompensa: </span>
                          <span className="text-green-400">{elemento.recompensa}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <Badge 
                          variant="outline"
                          className={
                            elemento.tipo === 'insignia' ? 'border-yellow-400 text-yellow-400' :
                            elemento.tipo === 'logro' ? 'border-green-400 text-green-400' :
                            elemento.tipo === 'nivel' ? 'border-blue-400 text-blue-400' :
                            'border-purple-400 text-purple-400'
                          }
                        >
                          {elemento.tipo}
                        </Badge>
                        <div className="flex space-x-2">
                          <Switch checked={elemento.activo} />
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Leaderboard
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ranking de puntos y logros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendedores.slice(0, 5).map((v, index) => {
                    const vendedor = v as { id?: string; nombre?: string; nivel?: number; puntos?: number; insignias?: unknown[] }
                    return (<div
                      key={(vendedor.id as string) ?? index}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-500 text-black' :
                          'bg-slate-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {vendedor.nombre}
                          </h4>
                          <p className="text-slate-400 text-sm">
                            Nivel {vendedor.nivel || 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {(vendedor.puntos || 0).toLocaleString()} pts
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(Math.min(vendedor.insignias?.length || 0, 3))].map((_, i) => (
                            <Star key={`${_}-${i}`} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>)
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Configuración */}
        <TabsContent value="configuracion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Esquemas de Comisión */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-orange-400" />
                      Esquemas de Comisión
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Configuración de estructuras de comisiones
                    </CardDescription>
                  </div>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Esquema
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {esquemasComision.map((esquema) => (
                    <div 
                      key={esquema.id}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">
                            {esquema.nombre}
                          </h4>
                          <p className="text-slate-400 text-sm">
                            {esquema.descripcion}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={
                              esquema.tipo === 'escalonado' ? 'border-blue-400 text-blue-400' :
                              esquema.tipo === 'porcentaje' ? 'border-green-400 text-green-400' :
                              esquema.tipo === 'fijo' ? 'border-yellow-400 text-yellow-400' :
                              'border-purple-400 text-purple-400'
                            }
                          >
                            {esquema.tipo}
                          </Badge>
                          <Switch checked={esquema.activo} />
                        </div>
                      </div>
                      
                      {esquema.tipo === 'escalonado' && (
                        <div className="space-y-2">
                          <h5 className="text-slate-300 text-sm font-medium">Escalones:</h5>
                          {esquema.escalones.map((escalon) => (
                            <div 
                              key={escalon.id}
                              className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-sm"
                            >
                              <span className="text-slate-400">
                                ${escalon.desde.toLocaleString()} - ${escalon.hasta.toLocaleString()}
                              </span>
                              <span className="text-white font-medium">
                                {escalon.porcentaje}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-slate-400 text-sm">
                          Aplica a: {esquema.aplicaA}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <Calculator className="h-4 w-4 mr-1" />
                            Simular
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuración Global */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-400" />
                  Configuración Global
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Parámetros generales del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuración de Períodos */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Período de Evaluación</Label>
                  <Select defaultValue="mensual">
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Configuración de Gamificación */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Gamificación Activa</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Notificaciones Push</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Leaderboard Público</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                {/* Configuración de Cálculos */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Frecuencia de Cálculo</Label>
                  <Select defaultValue="diario">
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiempo_real">Tiempo Real</SelectItem>
                      <SelectItem value="diario">Diario</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botones de Acción */}
                <div className="flex space-x-3 pt-4">
                  <Button className="bg-green-600 hover:bg-green-700 flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}