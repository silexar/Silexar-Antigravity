/**
 * ❌ Gestión Cuñas Rechazadas - Enterprise 2050
 * 
 * Centro de gestión para spots no programables:
 * - Resumen por tipo de rechazo
 * - Tabla detallada con motivos
 * - Planificación forzada
 * - Reubicación inteligente IA
 * - Mapa visual de bloques disponibles
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  XCircle, Clock, AlertTriangle, Zap, Target, 
  Brain, BarChart3, CheckCircle,
  MapPin, Loader2
} from 'lucide-react'

// ==================== INTERFACES ====================

interface CunaRechazada {
  id: string
  fecha: string
  bloque: string
  bloqueHora: string
  materialId: string
  materialNombre: string
  duracion: number
  motivoRechazo: 'limite_tiempo' | 'conflicto' | 'posicion_ocupada' | 'saturacion'
  detalleRechazo: string
  segundosFaltantes?: number
}

interface BloqueDisponible {
  id: string
  hora: string
  tipo: string
  capacidadSegundos: number
  disponibleSegundos: number
  spotsDisponibles: number
}

// ==================== DATOS MOCK ====================

const MOCK_RECHAZADAS: CunaRechazada[] = [
  {
    id: 'rej_001',
    fecha: '2025-08-11',
    bloque: 'Prime Matinal',
    bloqueHora: '07:26',
    materialId: 'SP00262',
    materialNombre: 'Banco Scotiabank',
    duracion: 30,
    motivoRechazo: 'limite_tiempo',
    detalleRechazo: 'Excede límite en 5 segundos',
    segundosFaltantes: 5
  },
  {
    id: 'rej_002',
    fecha: '2025-08-11',
    bloque: 'Prime Matinal',
    bloqueHora: '07:29',
    materialId: 'SP00263',
    materialNombre: 'MEV Café',
    duracion: 15,
    motivoRechazo: 'limite_tiempo',
    detalleRechazo: 'Excede límite en 2 segundos',
    segundosFaltantes: 2
  },
  {
    id: 'rej_003',
    fecha: '2025-08-12',
    bloque: 'Auspicio',
    bloqueHora: '08:26',
    materialId: 'SP00314',
    materialNombre: 'Toyota Chile',
    duracion: 30,
    motivoRechazo: 'conflicto',
    detalleRechazo: 'Conflicto categoría: Toyota existente'
  },
  {
    id: 'rej_004',
    fecha: '2025-08-12',
    bloque: 'Prime Matinal',
    bloqueHora: '07:26',
    materialId: 'SP00315',
    materialNombre: 'Banco Estado',
    duracion: 30,
    motivoRechazo: 'limite_tiempo',
    detalleRechazo: 'Excede límite en 8 segundos',
    segundosFaltantes: 8
  },
  {
    id: 'rej_005',
    fecha: '2025-08-13',
    bloque: 'Repartido',
    bloqueHora: '10:26',
    materialId: 'SP00320',
    materialNombre: 'Falabella',
    duracion: 30,
    motivoRechazo: 'saturacion',
    detalleRechazo: 'Bloque 100% saturado'
  }
]

const MOCK_BLOQUES_DISPONIBLES: BloqueDisponible[] = [
  { id: 'blq_0826', hora: '08:26:00', tipo: 'PRIME', capacidadSegundos: 300, disponibleSegundos: 33, spotsDisponibles: 1 },
  { id: 'blq_0926', hora: '09:26:00', tipo: 'AUSPICIO', capacidadSegundos: 300, disponibleSegundos: 120, spotsDisponibles: 4 },
  { id: 'blq_1126', hora: '11:26:00', tipo: 'REPARTIDO', capacidadSegundos: 300, disponibleSegundos: 90, spotsDisponibles: 3 },
  { id: 'blq_1426', hora: '14:26:00', tipo: 'PRIME', capacidadSegundos: 300, disponibleSegundos: 60, spotsDisponibles: 2 }
]

// ==================== COMPONENTE ====================

export function GestionCunasRechazadas() {
  const [rechazadas, setRechazadas] = useState<CunaRechazada[]>(MOCK_RECHAZADAS)
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [reubicando, setReubicando] = useState(false)
  const [mostrarMapa, setMostrarMapa] = useState(false)
  const [bloqueDestino, setBloqueDestino] = useState<string | null>(null)

  // Estadísticas
  const stats = useMemo(() => {
    const porLimite = rechazadas.filter(r => r.motivoRechazo === 'limite_tiempo').length
    const porConflicto = rechazadas.filter(r => r.motivoRechazo === 'conflicto').length
    const porSaturacion = rechazadas.filter(r => r.motivoRechazo === 'saturacion').length
    const porPosicion = rechazadas.filter(r => r.motivoRechazo === 'posicion_ocupada').length
    
    return {
      total: rechazadas.length,
      porLimite,
      porConflicto,
      porSaturacion,
      porPosicion,
      porcentajeLimite: rechazadas.length > 0 ? Math.round((porLimite / rechazadas.length) * 100) : 0
    }
  }, [rechazadas])

  const getMotivoIcon = (motivo: string) => {
    switch (motivo) {
      case 'limite_tiempo': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'conflicto': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'saturacion': return <XCircle className="h-4 w-4 text-orange-600" />
      case 'posicion_ocupada': return <MapPin className="h-4 w-4 text-purple-600" />
      default: return <XCircle className="h-4 w-4" />
    }
  }

  const getMotivoBadge = (motivo: string) => {
    switch (motivo) {
      case 'limite_tiempo': return <Badge className="bg-yellow-100 text-yellow-700">Límite Tiempo</Badge>
      case 'conflicto': return <Badge className="bg-red-100 text-red-700">Conflicto</Badge>
      case 'saturacion': return <Badge className="bg-orange-100 text-orange-700">Saturación</Badge>
      case 'posicion_ocupada': return <Badge className="bg-purple-100 text-purple-700">Posición</Badge>
      default: return null
    }
  }

  const toggleSeleccion = (id: string) => {
    setSeleccionadas(prev => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  const toggleTodas = () => {
    if (seleccionadas.size === rechazadas.length) {
      setSeleccionadas(new Set())
    } else {
      setSeleccionadas(new Set(rechazadas.map(r => r.id)))
    }
  }

  const handlePlanificarForzado = async () => {
    if (seleccionadas.size === 0) return
    setReubicando(true)
    await new Promise(r => setTimeout(r, 2000))
    setRechazadas(prev => prev.filter(r => !seleccionadas.has(r.id)))
    setSeleccionadas(new Set())
    setReubicando(false)
  }

  const handleReubicacionIA = async () => {
    setReubicando(true)
    setMostrarMapa(true)
    await new Promise(r => setTimeout(r, 1500))
    setReubicando(false)
  }

  const handleAplicarReubicacion = async () => {
    if (!bloqueDestino || seleccionadas.size === 0) return
    setReubicando(true)
    await new Promise(r => setTimeout(r, 1500))
    setRechazadas(prev => prev.filter(r => !seleccionadas.has(r.id)))
    setSeleccionadas(new Set())
    setBloqueDestino(null)
    setMostrarMapa(false)
    setReubicando(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-red-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-600" />
            ❌ GESTIÓN CUÑAS RECHAZADAS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Resumen estadístico */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
              <div className="text-xs text-slate-500">Total Rechazadas</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.porLimite}</div>
              <div className="text-xs text-yellow-600">Por Límite Tiempo</div>
              <div className="text-xs text-yellow-500">{stats.porcentajeLimite}%</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{stats.porConflicto}</div>
              <div className="text-xs text-red-600">Por Conflictos</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-700">{stats.porSaturacion}</div>
              <div className="text-xs text-orange-600">Por Saturación</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{stats.porPosicion}</div>
              <div className="text-xs text-purple-600">Por Posición</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de rechazadas */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              📋 DETALLE CUÑAS RECHAZADAS
            </CardTitle>
            <div className="text-sm text-gray-500">
              {seleccionadas.size} seleccionadas
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-3 py-2 w-10">
                    <Checkbox 
                      checked={seleccionadas.size === rechazadas.length && rechazadas.length > 0}
                      onCheckedChange={toggleTodas}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Bloque</th>
                  <th className="px-3 py-2 text-left">Material</th>
                  <th className="px-3 py-2 text-center">Duración</th>
                  <th className="px-3 py-2 text-center">Motivo</th>
                  <th className="px-3 py-2 text-left">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {rechazadas.map(cuna => (
                  <tr key={cuna.id} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Checkbox 
                        checked={seleccionadas.has(cuna.id)}
                        onCheckedChange={() => toggleSeleccion(cuna.id)}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{cuna.fecha}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{cuna.bloque}</span>
                      <span className="text-gray-500 ml-1">{cuna.bloqueHora}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-blue-600">{cuna.materialId}</span>
                      <span className="text-gray-600 ml-2">{cuna.materialNombre}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono">{cuna.duracion}s</td>
                    <td className="px-3 py-2 text-center">
                      {getMotivoBadge(cuna.motivoRechazo)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {cuna.detalleRechazo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button 
          className="gap-2 bg-yellow-600 hover:bg-yellow-700"
          onClick={handlePlanificarForzado}
          disabled={seleccionadas.size === 0 || reubicando}
        >
          {reubicando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          🔄 PLANIFICAR FORZADO
        </Button>
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={handleReubicacionIA}
          disabled={reubicando}
        >
          {reubicando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          🎯 REUBICAR INTELIGENTE IA
        </Button>
        <Button variant="outline" className="gap-2">
          <Target className="h-4 w-4" />
          📊 ANÁLISIS CONFLICTOS
        </Button>
      </div>

      {/* Mapa de reubicación */}
      {mostrarMapa && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              🗺️ MAPA DE REUBICACIÓN
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Bloques disponibles */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">BLOQUES DISPONIBLES:</h4>
                <div className="space-y-2">
                  {MOCK_BLOQUES_DISPONIBLES.map(bloque => (
                    <div 
                      key={bloque.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        bloqueDestino === bloque.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => setBloqueDestino(bloque.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-semibold">⏰ {bloque.hora}</span>
                          <Badge className="ml-2 bg-slate-100 text-slate-600">{bloque.tipo}</Badge>
                        </div>
                        {bloqueDestino === bloque.id && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        📊 {bloque.disponibleSegundos}s libres | 🟢 {bloque.spotsDisponibles} spots disponibles
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuñas a reubicar */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">CUÑAS A REUBICAR ({seleccionadas.size}):</h4>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {rechazadas.filter(r => seleccionadas.has(r.id)).map(cuna => (
                    <div key={cuna.id} className="p-2 bg-slate-50 rounded-lg border flex items-center gap-2">
                      {getMotivoIcon(cuna.motivoRechazo)}
                      <span className="font-mono text-sm">{cuna.materialId}</span>
                      <span className="text-gray-600 text-xs">({cuna.duracion}s)</span>
                    </div>
                  ))}
                  {seleccionadas.size === 0 && (
                    <p className="text-gray-400 text-sm">Selecciona cuñas de la tabla</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button 
                className="flex-1 gap-2"
                onClick={handleAplicarReubicacion}
                disabled={!bloqueDestino || seleccionadas.size === 0 || reubicando}
              >
                {reubicando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                ✅ APLICAR REUBICACIÓN
              </Button>
              <Button variant="outline" onClick={() => setBloqueDestino(null)}>
                🔄 Reset
              </Button>
              <Button variant="ghost" onClick={() => setMostrarMapa(false)}>
                ❌ Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GestionCunasRechazadas
