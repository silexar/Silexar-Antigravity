'use client'

/**
 * CunaStatusBadge — Displays cuna lifecycle state as a colored badge
 *
 * Covers the full cuna lifecycle:
 * CARGA → TRANSCRIPCION → REVISION → APROBACION → WATERMARKING →
 * DISPONIBLE → ASIGNADA → EMITIDA → NO_EMITIDA
 */

type CunaEstado =
  | 'CARGA'
  | 'TRANSCRIPCION'
  | 'REVISION_HUMANA'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'WATERMARKING'
  | 'DISPONIBLE'
  | 'ASIGNADA'
  | 'EMITIDA'
  | 'NO_EMITIDA'
  | 'ARCHIVADA'

interface CunaStatusBadgeProps {
  estado: CunaEstado
  size?: 'sm' | 'md'
  showDot?: boolean
  className?: string
}

const ESTADO_CONFIG: Record<CunaEstado, { label: string; color: string; bgColor: string }> = {
  CARGA:          { label: 'Carga',          color: '#888780', bgColor: '#88878018' },
  TRANSCRIPCION:  { label: 'Transcripción',  color: '#1D5AE8', bgColor: '#1D5AE818' },
  REVISION_HUMANA:{ label: 'Revisión',       color: '#EF9F27', bgColor: '#EF9F2718' },
  APROBADA:       { label: 'Aprobada',       color: '#3B6D11', bgColor: '#3B6D1118' },
  RECHAZADA:      { label: 'Rechazada',      color: '#A32D2D', bgColor: '#A32D2D18' },
  WATERMARKING:   { label: 'Watermark',      color: '#534AB7', bgColor: '#534AB718' },
  DISPONIBLE:     { label: 'Disponible',     color: '#3B6D11', bgColor: '#3B6D1118' },
  ASIGNADA:       { label: 'Asignada',       color: '#1D5AE8', bgColor: '#1D5AE818' },
  EMITIDA:        { label: 'Emitida',        color: '#3B6D11', bgColor: '#3B6D1118' },
  NO_EMITIDA:     { label: 'No emitida',     color: '#A32D2D', bgColor: '#A32D2D18' },
  ARCHIVADA:      { label: 'Archivada',      color: '#888780', bgColor: '#88878018' },
}

export function CunaStatusBadge({
  estado,
  size = 'md',
  showDot = true,
  className = '',
}: CunaStatusBadgeProps) {
  const config = ESTADO_CONFIG[estado]
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold
        ${isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}
        ${className}`}
      style={{ color: config.color, backgroundColor: config.bgColor }}
      title={config.label}
    >
      {showDot && (
        <span
          className={`rounded-full flex-shrink-0 ${isSmall ? 'h-1 w-1' : 'h-1.5 w-1.5'}`}
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  )
}

export type { CunaEstado }
