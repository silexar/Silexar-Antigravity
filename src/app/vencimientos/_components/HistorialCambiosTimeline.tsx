'use client'

/**
 * COMPONENTE: HISTORIAL DE CAMBIOS TIMELINE (Mejora 5)
 * TIER 0 ENTERPRISE FASE 2
 */

import { useState } from 'react'

interface EventoTimeline {
  id: string
  fecha: string
  hora: string
  tipo: 'creacion' | 'extension' | 'cambio_estado' | 'cambio_fecha' | 'cambio_valor' | 'cancelacion' | 'confirmacion'
  titulo: string
  descripcion: string
  realizadoPor: string
  valorAnterior?: string
  valorNuevo?: string
}

const MOCK_EVENTOS: EventoTimeline[] = [
  { id: 'e1', fecha: '2026-03-05', hora: '09:30', tipo: 'confirmacion', titulo: 'Inicio confirmado', descripcion: 'Programador confirmó inicio del auspicio', realizadoPor: 'Ana García' },
  { id: 'e2', fecha: '2026-03-04', hora: '16:45', tipo: 'extension', titulo: 'Extensión aprobada (#1)', descripcion: 'Auto-aprobada: ajuste de fecha de inicio', realizadoPor: 'Pedro Soto', valorAnterior: '01/Mar/2026', valorNuevo: '05/Mar/2026' },
  { id: 'e3', fecha: '2026-03-03', hora: '11:20', tipo: 'cambio_estado', titulo: 'Estado: Pendiente → Confirmado', descripcion: 'Ejecutivo confirmó reserva de material', realizadoPor: 'María Ruiz', valorAnterior: 'Pendiente', valorNuevo: 'Confirmado' },
  { id: 'e4', fecha: '2026-03-01', hora: '14:00', tipo: 'cambio_valor', titulo: 'Ajuste de tarifa', descripcion: 'Descuento pack 10 menciones aplicado', realizadoPor: 'Juan Torres', valorAnterior: '$850,000', valorNuevo: '$807,500' },
  { id: 'e5', fecha: '2026-02-28', hora: '10:15', tipo: 'creacion', titulo: 'Cupo creado', descripcion: 'Coca-Cola asignado a Buenos Días Radio - Tipo A', realizadoPor: 'Pedro Soto' }
]

const TIPO_CONFIG: Record<string, { icon: string; color: string }> = {
  'creacion': { icon: '🆕', color: 'border-emerald-500' },
  'extension': { icon: '🔄', color: 'border-amber-500' },
  'cambio_estado': { icon: '🔀', color: 'border-blue-500' },
  'cambio_fecha': { icon: '📅', color: 'border-purple-500' },
  'cambio_valor': { icon: '💰', color: 'border-cyan-500' },
  'cancelacion': { icon: '❌', color: 'border-red-500' },
  'confirmacion': { icon: '✅', color: 'border-green-500' }
}

export default function HistorialCambiosTimeline({ titulo = 'Coca-Cola — Buenos Días Radio' }: { titulo?: string }) {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  const filtrados = filtroTipo === 'todos' ? MOCK_EVENTOS : MOCK_EVENTOS.filter(e => e.tipo === filtroTipo)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-6" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">📜 Historial de Cambios (Mejora 5)</h3>
          <p className="text-xs text-gray-400 mt-1">{titulo}</p>
        </div>
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="bg-white/70 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-1.5 outline-none"
        >
          <option value="todos" className="bg-white/80">Todos</option>
          <option value="creacion" className="bg-white/80">Creación</option>
          <option value="extension" className="bg-white/80">Extensiones</option>
          <option value="cambio_estado" className="bg-white/80">Cambios estado</option>
          <option value="cambio_valor" className="bg-white/80">Cambios valor</option>
          <option value="confirmacion" className="bg-white/80">Confirmaciones</option>
        </select>
      </div>

      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/60" />

        <div className="space-y-4">
          {filtrados.map(ev => {
            const config = TIPO_CONFIG[ev.tipo] || { icon: '📌', color: 'border-white' }
            return (
              <div key={ev.id} className="relative pl-14">
                {/* Dot */}
                <div className={`absolute left-4 top-2 w-5 h-5 rounded-full bg-white/80 border-2 ${config.color} flex items-center justify-center text-xs`}>
                  {config.icon}
                </div>
                <div className="rounded-xl border border-gray-200/50 bg-white/3 p-4 hover:bg-white/90 transition-all">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">{ev.titulo}</h4>
                    <span className="text-xs text-gray-400">{ev.fecha} {ev.hora}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{ev.descripcion}</p>
                  {ev.valorAnterior && ev.valorNuevo && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 line-through">{ev.valorAnterior}</span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">{ev.valorNuevo}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Por: {ev.realizadoPor}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
