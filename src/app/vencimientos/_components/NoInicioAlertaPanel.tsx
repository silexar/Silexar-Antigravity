'use client'

/**
 * COMPONENTE: PANEL DE ALERTAS NO INICIADOS (R1) + EXTENSIONES
 * TIER 0 ENTERPRISE FASE 2
 *
 * @description Panel con countdown 48h, solicitudes de extensión
 * con cadena de aprobación escalonada, y timeline de historial.
 */

import { useState } from 'react'

interface AuspicioNoIniciado {
  id: string
  clienteNombre: string
  programaNombre: string
  ejecutivoNombre: string
  fechaInicioEsperada: string
  diasSinIniciar: number
  countdownActivo: boolean
  horasRestantes: number
  extensionesPrevias: number
  estado: 'alertado' | 'countdown' | 'eliminado' | 'extendido'
}

interface SolicitudExtensionUI {
  id: string
  clienteNombre: string
  programaNombre: string
  ejecutivoNombre: string
  numeroExtension: number
  nivelRequerido: 'automatico' | 'jefe_comercial' | 'gerente_comercial'
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  motivo: string
  fechaSolicitud: string
}

const MOCK_NO_INICIADOS: AuspicioNoIniciado[] = [
  { id: 'ni1', clienteNombre: 'Entel', programaNombre: 'Tarde Deportiva', ejecutivoNombre: 'Juan Torres', fechaInicioEsperada: '2026-03-03', diasSinIniciar: 2, countdownActivo: true, horasRestantes: 22, extensionesPrevias: 0, estado: 'countdown' },
  { id: 'ni2', clienteNombre: 'WOM', programaNombre: 'Buenos Días Radio', ejecutivoNombre: 'María Ruiz', fechaInicioEsperada: '2026-03-04', diasSinIniciar: 1, countdownActivo: false, horasRestantes: 0, extensionesPrevias: 1, estado: 'alertado' },
  { id: 'ni3', clienteNombre: 'Claro', programaNombre: 'Drive Time PM', ejecutivoNombre: 'Pedro Soto', fechaInicioEsperada: '2026-02-28', diasSinIniciar: 5, countdownActivo: false, horasRestantes: 0, extensionesPrevias: 2, estado: 'eliminado' }
]

const MOCK_EXTENSIONES: SolicitudExtensionUI[] = [
  { id: 'ext1', clienteNombre: 'Samsung', programaNombre: 'Buenos Días Radio', ejecutivoNombre: 'Pedro Soto', numeroExtension: 2, nivelRequerido: 'jefe_comercial', estado: 'pendiente', motivo: 'Material de campaña retrasado por proveedor', fechaSolicitud: '2026-03-04' },
  { id: 'ext2', clienteNombre: 'Falabella', programaNombre: 'Magazine AM', ejecutivoNombre: 'Ana Torres', numeroExtension: 3, nivelRequerido: 'gerente_comercial', estado: 'pendiente', motivo: 'Renegociación de contrato en curso', fechaSolicitud: '2026-03-03' },
  { id: 'ext3', clienteNombre: 'Paris', programaNombre: 'Noche Digital', ejecutivoNombre: 'Luis Vega', numeroExtension: 1, nivelRequerido: 'automatico', estado: 'aprobada', motivo: 'Ajuste de fecha de lanzamiento de campaña', fechaSolicitud: '2026-03-02' }
]

export default function NoInicioAlertaPanel() {
  const [vistaActiva, setVistaActiva] = useState<'no_iniciados' | 'extensiones'>('no_iniciados')

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-6" style={{ backdropFilter: 'blur(10px)' }}>
      {/* Header con tabs */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">⏱️ Control de No-Inicio (R1)</h2>
          <p className="text-xs text-gray-400">Monitoreo 48h + Cadena de aprobación escalonada</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setVistaActiva('no_iniciados')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'no_iniciados' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:text-white/80'}`}
          >
            ⏱️ No iniciados ({MOCK_NO_INICIADOS.filter(n => n.estado !== 'eliminado').length})
          </button>
          <button
            onClick={() => setVistaActiva('extensiones')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'extensiones' ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:text-white/80'}`}
          >
            🔄 Extensiones ({MOCK_EXTENSIONES.filter(e => e.estado === 'pendiente').length})
          </button>
        </div>
      </div>

      {vistaActiva === 'no_iniciados' && (
        <div className="space-y-4">
          {MOCK_NO_INICIADOS.map(ni => (
            <div key={ni.id} className={`rounded-xl p-5 border transition-all ${ni.estado === 'countdown' ? 'border-red-500/30 bg-red-500/5 animate-pulse-slow' : ni.estado === 'eliminado' ? 'border-gray-600/30 bg-gray-500/5 opacity-60' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ni.estado === 'countdown' ? '🚨' : ni.estado === 'eliminado' ? '🗑️' : '⚠️'}</span>
                    <h3 className="font-bold text-gray-800">{ni.clienteNombre}</h3>
                    {ni.countdownActivo && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/30 text-red-600 text-xs font-bold animate-pulse">
                        ⏱️ {ni.horasRestantes}h RESTANTES
                      </span>
                    )}
                    {ni.estado === 'eliminado' && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/30 text-gray-400 text-xs font-bold">ELIMINADO</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{ni.programaNombre} | Ejecutivo: {ni.ejecutivoNombre}</p>
                  <p className="text-xs text-gray-400">Inicio esperado: {ni.fechaInicioEsperada} | {ni.diasSinIniciar} días sin iniciar</p>
                  {ni.extensionesPrevias > 0 && (
                    <p className="text-xs text-amber-600 mt-1">📋 {ni.extensionesPrevias} extensión(es) previa(s)</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {ni.estado !== 'eliminado' && (
                    <>
                      <button className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-500/30 transition-all">
                        🔄 Solicitar extensión
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-500/30 transition-all">
                        ✅ Confirmar inicio
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Countdown progress bar */}
              {ni.countdownActivo && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Countdown 48h</span>
                    <span className="text-red-600 font-bold">{ni.horasRestantes}h restantes</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                      style={{ width: `${((48 - ni.horasRestantes) / 48) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {vistaActiva === 'extensiones' && (
        <div className="space-y-4">
          {MOCK_EXTENSIONES.map(ext => {
            const nivelColors: Record<string, string> = {
              'automatico': 'bg-green-500/20 text-green-300',
              'jefe_comercial': 'bg-amber-50 text-amber-600',
              'gerente_comercial': 'bg-red-50 text-red-600'
            }
            const nivelLabels: Record<string, string> = {
              'automatico': '✅ Auto-aprobada',
              'jefe_comercial': '👔 Jefe Comercial',
              'gerente_comercial': '🏛️ Gerente Comercial'
            }
            const estadoColors: Record<string, string> = {
              'pendiente': 'text-yellow-600',
              'aprobada': 'text-green-400',
              'rechazada': 'text-red-600'
            }

            return (
              <div key={ext.id} className="rounded-xl p-5 border border-gray-200 bg-white/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{ext.clienteNombre}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${nivelColors[ext.nivelRequerido]}`}>
                        {nivelLabels[ext.nivelRequerido]}
                      </span>
                      <span className={`text-xs font-bold ${estadoColors[ext.estado]}`}>
                        {ext.estado === 'pendiente' ? '⏳ Pendiente' : ext.estado === 'aprobada' ? '✅ Aprobada' : '❌ Rechazada'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{ext.programaNombre} | Extensión #{ext.numeroExtension}</p>
                    <p className="text-xs text-gray-400">Solicitada: {ext.fechaSolicitud} | Ejecutivo: {ext.ejecutivoNombre}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{ext.motivo}&rdquo;</p>
                  </div>
                  {ext.estado === 'pendiente' && (
                    <div className="flex flex-col gap-2">
                      <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-all">
                        ✅ Aprobar
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-500/30 transition-all">
                        ❌ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
