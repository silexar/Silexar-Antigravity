/**
 * 📱 Campañas Mobile - Dashboard Móvil Enterprise 2050
 * 
 * Interfaz móvil optimizada con:
 * - Dashboard campañas activas
 * - Acciones rápidas
 * - Alertas urgentes
 * - Lista campañas con estados
 * - Navegación bottom tabs
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Home, Target, BarChart3, MessageSquare, Settings,
  Bell, RefreshCw, AlertTriangle, CheckCircle, Clock,
  ChevronRight, Radio, Mail, FileText, Eye, Wrench,
  Users
} from 'lucide-react'

// ==================== INTERFACES ====================

interface CampanaMovil {
  id: string
  nombre: string
  cliente: string
  estado: 'ejecutando' | 'planificando' | 'conflictos' | 'pendiente'
  progreso: number
  alertas: number
}

interface AlertaUrgente {
  id: string
  campanaId: string
  campanaNombre: string
  tipo: 'conflicto' | 'cambio' | 'vencimiento'
  mensaje: string
}

interface AccionRapida {
  id: string
  icon: React.ReactNode
  label: string
  color: string
}

// ==================== DATOS MOCK ====================

const MOCK_CAMPANAS: CampanaMovil[] = [
  { id: 'cmp_1', nombre: 'Promoción Navidad', cliente: 'Banco Chile', estado: 'ejecutando', progreso: 85, alertas: 0 },
  { id: 'cmp_2', nombre: 'Verano 2026', cliente: 'Coca Cola', estado: 'planificando', progreso: 45, alertas: 1 },
  { id: 'cmp_3', nombre: 'Lanzamiento SUV', cliente: 'Toyota', estado: 'conflictos', progreso: 60, alertas: 3 },
  { id: 'cmp_4', nombre: 'Black Friday', cliente: 'Falabella', estado: 'pendiente', progreso: 20, alertas: 0 },
  { id: 'cmp_5', nombre: 'Fiestas Patrias', cliente: 'CCU', estado: 'ejecutando', progreso: 100, alertas: 0 }
]

const MOCK_ALERTAS: AlertaUrgente[] = [
  { id: 'alr_1', campanaId: 'cmp_3', campanaNombre: 'CMP-25-003', tipo: 'conflicto', mensaje: 'Conflicto detectado con categoría automotriz' },
  { id: 'alr_2', campanaId: 'cmp_2', campanaNombre: 'CMP-25-002', tipo: 'cambio', mensaje: 'Cliente solicita cambio de horarios prime' }
]

const ACCIONES_RAPIDAS: AccionRapida[] = [
  { id: 'acc_1', icon: <Target className="h-5 w-5" />, label: 'Mis Campañas Activas', color: 'bg-blue-500' },
  { id: 'acc_2', icon: <BarChart3 className="h-5 w-5" />, label: 'Estado Programación', color: 'bg-green-500' },
  { id: 'acc_3', icon: <AlertTriangle className="h-5 w-5" />, label: 'Alertas y Conflictos', color: 'bg-red-500' },
  { id: 'acc_4', icon: <Mail className="h-5 w-5" />, label: 'Generar Confirmación', color: 'bg-purple-500' },
  { id: 'acc_5', icon: <RefreshCw className="h-5 w-5" />, label: 'Sincronizar Datos', color: 'bg-orange-500' }
]

// ==================== COMPONENTE ====================

export function CampanasMobile() {
  const [tabActiva, setTabActiva] = useState<'home' | 'campanas' | 'stats' | 'chat' | 'config'>('home')

  const campanas = MOCK_CAMPANAS
  const alertas = MOCK_ALERTAS

  const stats = {
    activas: campanas.filter(c => c.estado === 'ejecutando').length,
    enProgramacion: campanas.filter(c => c.estado === 'planificando').length,
    ejecutandose: campanas.filter(c => c.estado === 'ejecutando').length,
    requierenAtencion: campanas.filter(c => c.alertas > 0).length
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ejecutando': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'planificando': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'conflictos': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'pendiente': return <Clock className="h-4 w-4 text-gray-400" />
      default: return null
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ejecutando': return <Badge className="bg-green-100 text-green-700">Ejecutando</Badge>
      case 'planificando': return <Badge className="bg-yellow-100 text-yellow-700">Planificando</Badge>
      case 'conflictos': return <Badge className="bg-red-100 text-red-700">Conflictos</Badge>
      case 'pendiente': return <Badge className="bg-gray-100 text-gray-700">Pendiente</Badge>
      default: return null
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen flex flex-col">
      {/* Header - Neuromorphic */}
      <div className="neo-mobile-header text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6" />
            <span className="font-bold text-lg neo-text-gradient">📱 SILEXAR MÓVIL</span>
          </div>
          <div className="relative neo-glow-blue rounded-full p-1">
            <Bell className="h-6 w-6" />
            {alertas.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center neo-glow-red">
                {alertas.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20">
        {tabActiva === 'home' && (
          <div className="space-y-4">
            {/* Dashboard stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  🏠 Dashboard Campañas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="neo-mobile-stat p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700 neo-text-gradient">{stats.activas}</div>
                    <div className="text-xs text-blue-600">Activas</div>
                  </div>
                  <div className="neo-mobile-stat p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{stats.enProgramacion}</div>
                    <div className="text-xs text-yellow-600">En Programación</div>
                  </div>
                  <div className="neo-mobile-stat p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{stats.ejecutandose}</div>
                    <div className="text-xs text-green-600">Ejecutándose</div>
                  </div>
                  <div className="neo-mobile-stat p-3 text-center neo-glow-red">
                    <div className="text-2xl font-bold text-red-700">{stats.requierenAtencion}</div>
                    <div className="text-xs text-red-600">Req. Atención</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">⚡ ACCIONES RÁPIDAS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ACCIONES_RAPIDAS.map(accion => (
                  <Button 
                    key={accion.id}
                    variant="outline" 
                    className="w-full justify-start gap-3 h-12"
                  >
                    <div className={`p-1.5 rounded-lg ${accion.color} text-white`}>
                      {accion.icon}
                    </div>
                    {accion.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Alertas urgentes */}
            {alertas.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-2 bg-red-50">
                  <CardTitle className="text-base flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    🚨 ALERTAS URGENTES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                  {alertas.map(alerta => (
                    <div key={alerta.id} className="bg-white border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-sm text-blue-600">{alerta.campanaNombre}</span>
                          <p className="text-sm text-gray-600 mt-1">{alerta.mensaje}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Wrench className="h-3 w-3 mr-1" /> Resolver
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" /> Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Próximas acciones */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">🎯 PRÓXIMAS ACCIONES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Confirmar horarios Toyota</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Enviar confirmación Banco Chile</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Revisar programación Coca Cola</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tabActiva === 'campanas' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              📊 MIS CAMPAÑAS
            </h3>
            {campanas.map(campana => (
              <Card key={campana.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(campana.estado)}
                        <span className="font-semibold text-sm">{campana.nombre}</span>
                        {campana.alertas > 0 && (
                          <Badge className="bg-red-100 text-red-700 text-xs">{campana.alertas}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{campana.cliente}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {getEstadoBadge(campana.estado)}
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${campana.progreso}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{campana.progreso}%</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tabActiva === 'stats' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              📈 ESTADÍSTICAS
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Campañas este mes</span>
                    <span className="font-bold text-xl">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Valor total</span>
                    <span className="font-bold text-xl text-green-600">$28.5M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Spots programados</span>
                    <span className="font-bold text-xl">1,250</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tasa de éxito</span>
                    <span className="font-bold text-xl text-blue-600">98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tabActiva === 'chat' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              💬 MENSAJES
            </h3>
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Sin mensajes nuevos</p>
              </CardContent>
            </Card>
          </div>
        )}

        {tabActiva === 'config' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              ⚙️ CONFIGURACIÓN
            </h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" /> Mi Perfil
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Bell className="h-4 w-4" /> Notificaciones
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <RefreshCw className="h-4 w-4" /> Sincronización
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Neuromorphic */}
      <div className="fixed bottom-0 left-0 right-0 neo-mobile-nav">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {[
            { id: 'home', icon: Home, label: '🏠' },
            { id: 'campanas', icon: Target, label: '🎯' },
            { id: 'stats', icon: BarChart3, label: '📊' },
            { id: 'chat', icon: MessageSquare, label: '💬' },
            { id: 'config', icon: Settings, label: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id as 'home' | 'campanas' | 'stats' | 'chat' | 'config')}
              className={`neo-mobile-nav-item flex flex-col items-center p-2 transition-all ${
                tabActiva === tab.id 
                  ? 'active text-blue-600 neo-glow-blue' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CampanasMobile
