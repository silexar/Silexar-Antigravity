'use client'

/**
 * CunaListItem — Row component for cuna lists and tables
 *
 * Compact row format with status badge, audio info, and quick actions.
 * Used in cunas list views, inbox, and scheduling screens.
 * Independent component — receives data via props, no internal fetching.
 */

import { Music, Clock, Calendar, MoreHorizontal } from 'lucide-react'
import { CunaStatusBadge, type CunaEstado } from './CunaStatusBadge'

interface CunaListItemProps {
  id: string
  nombre: string
  nombreAnunciante: string
  estado: CunaEstado
  duracionSegundos?: number
  fechaCreacion: Date
  version?: number
  onPress?: (id: string) => void
  onMenuPress?: (id: string) => void
  className?: string
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function CunaListItem({
  id,
  nombre,
  nombreAnunciante,
  estado,
  duracionSegundos,
  fechaCreacion,
  version,
  onPress,
  onMenuPress,
  className = '',
}: CunaListItemProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 bg-[#F0EDE8]
        shadow-[4px_4px_10px_#D4D1CC,-4px_-4px_10px_#FFFFFF] ${className}`}
    >
      {/* Audio icon */}
      <button
        onClick={() => onPress?.(id)}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
          bg-[#E8E5E0] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]
          active:bg-[#D8D5D0] transition-colors"
        aria-label={`Ver cuña ${nombre}`}
      >
        <Music size={18} className="text-[#534AB7]" />
      </button>

      {/* Content */}
      <button
        onClick={() => onPress?.(id)}
        className="flex-1 min-w-0 text-left"
        aria-label={nombre}
      >
        <p className="truncate text-sm font-semibold text-[#2C2C2A]">{nombre}</p>
        <p className="truncate text-xs text-[#888780]">{nombreAnunciante}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <CunaStatusBadge estado={estado} size="sm" />

          {duracionSegundos !== undefined && (
            <span className="flex items-center gap-1 text-[10px] text-[#888780]">
              <Clock size={9} />
              {formatDuration(duracionSegundos)}
            </span>
          )}

          <span className="flex items-center gap-1 text-[10px] text-[#888780]">
            <Calendar size={9} />
            {formatDate(fechaCreacion)}
          </span>

          {version !== undefined && version > 1 && (
            <span className="text-[10px] text-[#888780]">v{version}</span>
          )}
        </div>
      </button>

      {/* Menu button */}
      {onMenuPress && (
        <button
          onClick={() => onMenuPress(id)}
          aria-label="Más opciones"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
            bg-[#E8E5E0] shadow-[2px_2px_5px_#D4D1CC,-2px_-2px_5px_#FFFFFF]
            active:shadow-[inset_1px_1px_3px_#D4D1CC] transition-all"
        >
          <MoreHorizontal size={16} className="text-[#888780]" />
        </button>
      )}
    </div>
  )
}
