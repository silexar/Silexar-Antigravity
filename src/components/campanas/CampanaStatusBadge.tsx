'use client'

/**
 * CampanaStatusBadge — Displays campaign lifecycle state
 *
 * Covers all campaign estados: BORRADOR → ACTIVA → PAUSADA → FINALIZADA → CANCELADA
 * Independent component — no side effects, pure display.
 */

type CampanaEstado = 'BORRADOR' | 'ACTIVA' | 'PAUSADA' | 'FINALIZADA' | 'CANCELADA'

interface CampanaStatusBadgeProps {
  estado: CampanaEstado
  size?: 'sm' | 'md' | 'lg'
  variant?: 'pill' | 'dot-only'
  className?: string
}

const ESTADO_CONFIG: Record<CampanaEstado, {
  label: string
  color: string
  bgColor: string
  pulseColor?: string
}> = {
  BORRADOR:   { label: 'Borrador',   color: '#888780', bgColor: '#88878018' },
  ACTIVA:     { label: 'Activa',     color: '#3B6D11', bgColor: '#3B6D1118', pulseColor: '#3B6D11' },
  PAUSADA:    { label: 'Pausada',    color: '#EF9F27', bgColor: '#EF9F2718' },
  FINALIZADA: { label: 'Finalizada', color: '#5F5E5A', bgColor: '#5F5E5A18' },
  CANCELADA:  { label: 'Cancelada', color: '#A32D2D', bgColor: '#A32D2D18' },
}

const SIZE_CLASS = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
}

const DOT_SIZE = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
}

export function CampanaStatusBadge({
  estado,
  size = 'md',
  variant = 'pill',
  className = '',
}: CampanaStatusBadgeProps) {
  const config = ESTADO_CONFIG[estado]
  const isActive = estado === 'ACTIVA'

  if (variant === 'dot-only') {
    return (
      <span
        className={`relative inline-flex rounded-full ${DOT_SIZE[size]} ${className}`}
        style={{ backgroundColor: config.color }}
        title={config.label}
        aria-label={config.label}
      >
        {isActive && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60`}
            style={{ backgroundColor: config.pulseColor }}
          />
        )}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold
        ${SIZE_CLASS[size]} ${className}`}
      style={{ color: config.color, backgroundColor: config.bgColor }}
      aria-label={config.label}
    >
      {/* Animated dot for ACTIVA */}
      <span className={`relative inline-flex rounded-full flex-shrink-0 ${DOT_SIZE[size]}`}
        style={{ backgroundColor: config.color }}>
        {isActive && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: config.pulseColor }}
          />
        )}
      </span>
      {config.label}
    </span>
  )
}

export type { CampanaEstado }
