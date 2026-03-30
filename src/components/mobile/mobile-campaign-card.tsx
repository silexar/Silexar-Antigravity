'use client'

/**
 * MobileCampaignCard — Campaign card for mobile field views
 *
 * Displays campaign status, schedule, and key metrics in a compact format.
 * Supports tap to expand and swipe-friendly action layout.
 */

import { Radio, Calendar, ChevronRight, Pause, Play, XCircle, Edit3 } from 'lucide-react'

type EstadoCampana = 'ACTIVA' | 'PAUSADA' | 'BORRADOR' | 'FINALIZADA' | 'CANCELADA'

interface MobileCampaignCardProps {
  id: string
  nombre: string
  nombreAnunciante: string
  estado: EstadoCampana
  tipoBloque: string
  fechaInicio: Date
  fechaFin: Date
  emisorasCount?: number
  cunasCount?: number
  onPress?: (id: string) => void
  onEdit?: (id: string) => void
  className?: string
}

const ESTADO_CONFIG: Record<EstadoCampana, { label: string; color: string; dotColor: string }> = {
  ACTIVA:     { label: 'Activa',     color: '#3B6D11', dotColor: '#3B6D11' },
  PAUSADA:    { label: 'Pausada',    color: '#EF9F27', dotColor: '#EF9F27' },
  BORRADOR:   { label: 'Borrador',  color: '#888780', dotColor: '#888780' },
  FINALIZADA: { label: 'Finalizada', color: '#5F5E5A', dotColor: '#5F5E5A' },
  CANCELADA:  { label: 'Cancelada', color: '#A32D2D', dotColor: '#A32D2D' },
}

function formatDateRange(inicio: Date, fin: Date): string {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(d)
  return `${fmt(inicio)} — ${fmt(fin)}`
}

export function MobileCampaignCard({
  id,
  nombre,
  nombreAnunciante,
  estado,
  tipoBloque,
  fechaInicio,
  fechaFin,
  emisorasCount = 0,
  cunasCount = 0,
  onPress,
  onEdit,
  className = '',
}: MobileCampaignCardProps) {
  const config = ESTADO_CONFIG[estado]

  return (
    <div
      className={`rounded-2xl bg-[#F0EDE8]
        shadow-[6px_6px_14px_#D4D1CC,-6px_-6px_14px_#FFFFFF] ${className}`}
    >
      {/* Main tap area */}
      <button
        onClick={() => onPress?.(id)}
        className="w-full p-4 text-left active:bg-[#E8E5E0] rounded-2xl transition-colors"
        aria-label={`Campaña ${nombre}`}
      >
        <div className="flex items-start gap-3">
          {/* Radio icon badge */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
            bg-[#E8E5E0] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]">
            <Radio size={18} className="text-[#534AB7]" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Status + tipo */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-semibold"
                style={{ color: config.color }}>
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.dotColor }}
                />
                {config.label}
              </span>
              <span className="rounded-full bg-[#E8E5E0] px-1.5 py-0.5 text-[10px] text-[#888780]">
                {tipoBloque}
              </span>
            </div>

            <p className="mt-0.5 truncate text-sm font-semibold text-[#2C2C2A]">{nombre}</p>
            <p className="truncate text-xs text-[#888780]">{nombreAnunciante}</p>

            {/* Date range + stats */}
            <div className="mt-2 flex items-center gap-3 text-xs text-[#888780]">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {formatDateRange(fechaInicio, fechaFin)}
              </span>
              {emisorasCount > 0 && (
                <span className="flex items-center gap-1">
                  <Radio size={10} />
                  {emisorasCount} emisora{emisorasCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <ChevronRight size={16} className="mt-1 flex-shrink-0 text-[#D4D1CC]" />
        </div>
      </button>

      {/* Action strip */}
      {(onEdit || estado === 'ACTIVA' || estado === 'PAUSADA') && (
        <div className="border-t border-[#E8E5E0] px-4 py-2 flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs
                font-medium text-[#5F5E5A] bg-[#E8E5E0]
                shadow-[2px_2px_5px_#D4D1CC,-2px_-2px_5px_#FFFFFF]
                active:shadow-[inset_1px_1px_3px_#D4D1CC] transition-all"
            >
              <Edit3 size={12} />
              Editar
            </button>
          )}

          {estado === 'ACTIVA' && (
            <button
              aria-label="Pausar campaña"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs
                font-medium text-[#EF9F27] bg-[#EF9F2715]
                active:bg-[#EF9F2730] transition-colors"
            >
              <Pause size={12} />
              Pausar
            </button>
          )}

          {estado === 'PAUSADA' && (
            <button
              aria-label="Reanudar campaña"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs
                font-medium text-[#3B6D11] bg-[#3B6D1115]
                active:bg-[#3B6D1130] transition-colors"
            >
              <Play size={12} />
              Reanudar
            </button>
          )}

          <span className="ml-auto text-[10px] text-[#888780]">
            {cunasCount} cuña{cunasCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
