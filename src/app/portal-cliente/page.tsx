/**
 * 👤 Portal Cliente - Vista Restringida Enterprise 2050
 * 
 * Portal de acceso para clientes/anunciantes:
 * - Dashboard de campañas propias
 * - Estado de programación
 * - Descarga de confirmaciones
 * - Vista de reportes
 * - Sin acceso a otros clientes
 * 
 * @enterprise TIER0 Fortune 10
 * @security Client Portal Level
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, Radio, Calendar, DollarSign, Download,
  Eye, FileText, CheckCircle, Clock, AlertTriangle,
  BarChart3, Bell, RefreshCw, ExternalLink, Mail
} from 'lucide-react'

// ==================== INTERFACES ====================

interface CampanaCliente {
  id: string
  nombre: string
  periodo: string
  emisora: string
  estado: 'en_programacion' | 'ejecutando' | 'finalizada' | 'pendiente'
  progreso: number
  valorContratado: number
  spotsContratados: number
  spotsEmitidos: number
  confirmacionDisponible: boolean
}

interface ClienteInfo {
  id: string
  nombre: string
  rut: string
  logo?: string
  ejecutivoAsignado: string
  emailContacto: string
  telefono: string
}

interface NotificacionCliente {
  id: string
  tipo: 'confirmacion' | 'cambio' | 'reporte' | 'alerta'
  mensaje: string
  fecha: string
  leida: boolean
}

// ==================== DATOS MOCK ====================

const MOCK_CLIENTE: ClienteInfo = {
  id: 'cli_001',
  nombre: 'BANCO DE CHILE',
  rut: '97.004.000-5',
  ejecutivoAsignado: 'Ana García',
  emailContacto: 'marketing@bancochile.cl',
  telefono: '+56 2 2637 1234'
}

const MOCK_CAMPANAS: CampanaCliente[] = [
  {
    id: 'cmp_001',
    nombre: 'Promoción Navidad Premium 2025',
    periodo: '01/12/2025 - 31/12/2025',
    emisora: 'T13 Radio',
    estado: 'ejecutando',
    progreso: 45,
    valorContratado: 2500000,
    spotsContratados: 350,
    spotsEmitidos: 157,
    confirmacionDisponible: true
  },
  {
    id: 'cmp_002',
    nombre: 'Tarjeta Joven Verano 2026',
    periodo: '15/01/2026 - 28/02/2026',
    emisora: 'Play FM',
    estado: 'en_programacion',
    progreso: 80,
    valorContratado: 1800000,
    spotsContratados: 220,
    spotsEmitidos: 0,
    confirmacionDisponible: true
  },
  {
    id: 'cmp_003',
    nombre: 'Cuenta Corriente Black Friday',
    periodo: '20/11/2025 - 30/11/2025',
    emisora: 'T13 Radio',
    estado: 'finalizada',
    progreso: 100,
    valorContratado: 980000,
    spotsContratados: 150,
    spotsEmitidos: 150,
    confirmacionDisponible: true
  }
]

const MOCK_NOTIFICACIONES: NotificacionCliente[] = [
  {
    id: 'not_001',
    tipo: 'confirmacion',
    mensaje: 'Nueva confirmación horaria disponible para Navidad Premium',
    fecha: '2025-12-19',
    leida: false
  },
  {
    id: 'not_002',
    tipo: 'reporte',
    mensaje: 'Reporte semanal de emisiones disponible',
    fecha: '2025-12-18',
    leida: true
  },
  {
    id: 'not_003',
    tipo: 'cambio',
    mensaje: 'Se reubicaron 2 spots del bloque 08:26 al 09:26',
    fecha: '2025-12-17',
    leida: true
  }
]

// ==================== COMPONENTE PRINCIPAL ====================

export function PortalCliente() {
  const [cliente] = useState<ClienteInfo>(MOCK_CLIENTE)
  const [campanas] = useState<CampanaCliente[]>(MOCK_CAMPANAS)
  const [notificaciones] = useState<NotificacionCliente[]>(MOCK_NOTIFICACIONES)
  const [campanasSeleccionada, setCampanaSeleccionada] = useState<string | null>(null)

  const stats = useMemo(() => ({
    totalCampanas: campanas.length,
    enEjecucion: campanas.filter(c => c.estado === 'ejecutando').length,
    valorTotal: campanas.reduce((sum, c) => sum + c.valorContratado, 0),
    spotsTotal: campanas.reduce((sum, c) => sum + c.spotsContratados, 0),
    notificacionesPendientes: notificaciones.filter(n => !n.leida).length
  }), [campanas, notificaciones])

  const formatMoney = (valor: number) => `$${(valor / 1000000).toFixed(2)}M`

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ejecutando': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'en_programacion': return <Clock className="h-4 w-4 text-blue-600" />
      case 'finalizada': return <CheckCircle className="h-4 w-4 text-gray-600" />
      case 'pendiente': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return null
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ejecutando': return <Badge className="bg-green-100 text-green-700">Ejecutando</Badge>
      case 'en_programacion': return <Badge className="bg-blue-100 text-blue-700">En Programación</Badge>
      case 'finalizada': return <Badge className="bg-gray-100 text-gray-700">Finalizada</Badge>
      case 'pendiente': return <Badge className="bg-yellow-100 text-yellow-700">Pendiente</Badge>
      default: return null
    }
  }

  const campanaSel = campanas.find(c => c.id === campanasSeleccionada)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
                <p className="text-blue-200">RUT: {cliente.rut}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 cursor-pointer" />
                {stats.notificacionesPendientes > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {stats.notificacionesPendientes}
                  </span>
                )}
              </div>
              <Button variant="secondary" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.totalCampanas}</div>
              <div className="text-blue-200 text-sm">Campañas</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.enEjecucion}</div>
              <div className="text-blue-200 text-sm">En Ejecución</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{formatMoney(stats.valorTotal)}</div>
              <div className="text-blue-200 text-sm">Valor Total</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.spotsTotal}</div>
              <div className="text-blue-200 text-sm">Spots Contratados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista campañas */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Radio className="h-5 w-5" />
              📻 MIS CAMPAÑAS
            </h2>

            {campanas.map(campana => (
              <Card 
                key={campana.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  campanasSeleccionada === campana.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setCampanaSeleccionada(campana.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(campana.estado)}
                        <h3 className="font-semibold">{campana.nombre}</h3>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {campana.periodo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Radio className="h-3 w-3" />
                          {campana.emisora}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        {getEstadoBadge(campana.estado)}
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${campana.progreso}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{campana.progreso}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">{formatMoney(campana.valorContratado)}</div>
                      <div className="text-sm text-gray-500">
                        {campana.spotsEmitidos}/{campana.spotsContratados} spots
                      </div>
                      {campana.confirmacionDisponible && (
                        <Button size="sm" variant="outline" className="mt-2 gap-1">
                          <Download className="h-3 w-3" />
                          Confirmación
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            {/* Detalle campaña */}
            {campanaSel && (
              <Card className="border-2 border-blue-100">
                <CardHeader className="pb-2 bg-blue-50">
                  <CardTitle className="text-base">📊 Detalle Campaña</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">{campanaSel.nombre}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Valor:</span>
                      <div className="font-bold text-green-700">{formatMoney(campanaSel.valorContratado)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Spots:</span>
                      <div className="font-bold">{campanaSel.spotsContratados}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Emitidos:</span>
                      <div className="font-bold text-blue-700">{campanaSel.spotsEmitidos}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Pendientes:</span>
                      <div className="font-bold text-orange-700">
                        {campanaSel.spotsContratados - campanaSel.spotsEmitidos}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <Button className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      📄 Descargar Confirmación
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <BarChart3 className="h-4 w-4" />
                      📊 Ver Reporte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notificaciones */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  🔔 Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {notificaciones.slice(0, 3).map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 border-b last:border-b-0 ${
                      !notif.leida ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {notif.tipo === 'confirmacion' && <FileText className="h-4 w-4 text-green-600 mt-0.5" />}
                      {notif.tipo === 'reporte' && <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5" />}
                      {notif.tipo === 'cambio' && <RefreshCw className="h-4 w-4 text-orange-600 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm">{notif.mensaje}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.fecha}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="bg-slate-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📞 Su Ejecutivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-semibold">{cliente.ejecutivoAsignado}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  ana.garcia@silexar.com
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-3 w-3" />
                  {cliente.telefono}
                </div>
                <Button variant="outline" className="w-full mt-2 gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Contactar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortalCliente
