'use client'

/**
 * MobileContractCard — Contract card optimized for field salespeople
 *
 * Shows key contract info at a glance: client, amount, expiry urgency.
 * Compact format for mobile screens. Tap to expand details.
 * Used in /mobile and /vencimientos pages.
 */

import { memo } from 'react'
import { ChevronRight, Clock, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type EstadoContrato = 'VIGENTE' | 'VENCIDO' | 'PENDIENTE_APROBACION' | 'BORRADOR'

interface MobileContractCardProps {
  id: string
  numeroContrato: string
  nombreAnunciante: string
  montoNeto: number
  moneda?: string
  estado: EstadoContrato
  fechaVencimientos: Date
  diasRestantes?: number
  onPress?: (id: string) => void
  className?: string
}

const ESTADO_CONFIG: Record<EstadoContrato, {
  label: string
  color: string
  Icon: typeof CheckCircle
}> = {
  VIGENTE:              { label: 'Vigente',    color: '#3B6D11', Icon: CheckCircle },
  VENCIDO:              { label: 'Vencido',    color: '#A32D2D', Icon: AlertTriangle },
  PENDIENTE_APROBACION: { label: 'Pendiente',  color: '#EF9F27', Icon: Clock },
  BORRADOR:             { label: 'Borrador',   color: '#888780', Icon: Clock },
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getUrgencyClass(diasRestantes?: number): string {
  if (diasRestantes === undefined) return ''
  if (diasRestantes < 0) return 'text-[#A32D2D]'
  if (diasRestantes <= 2) return 'text-[#A32D2D] font-semibold'
  if (diasRestantes <= 7) return 'text-[#EF9F27] font-medium'
  return 'text-[#888780]'
}

function MobileContractCardBase({
  id,
  numeroContrato,
  nombreAnunciante,
  montoNeto,
  moneda = 'CLP',
  estado,
  fechaVencimientos,
  diasRestantes,
  onPress,
  className = '',
}: MobileContractCardProps) {
  const config = ESTADO_CONFIG[estado]
  const { Icon } = config

  return (
    <button
      onClick={() => onPress?.(id)}
      className={`w-full text-left rounded-2xl p-4 bg-[#F0EDE8]
        shadow-[6px_6px_14px_#D4D1CC,-6px_-6px_14px_#FFFFFF]
        active:shadow-[inset_2px_2px_6px_#D4D1CC,inset_-2px_-2px_6px_#FFFFFF]
        transition-all duration-150 ${className}`}
      aria-label={`Contrato ${numeroContrato} — ${nombreAnunciante}`}
    >
      <div className="flex items-start gap-3">
        {/* Amount badge */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
          bg-[#E8E5E0] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]">
          <DollarSign size={18} className="text-[#1D5AE8]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#888780] font-mono">{numeroContrato}</span>
            {/* Estado badge */}
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                color: config.color,
                backgroundColor: `${config.color}18`,
              }}
            >
              <Icon size={10} />
              {config.label}
            </span>
          </div>

          <p className="mt-0.5 truncate text-sm font-semibold text-[#2C2C2A]">
            {nombreAnunciante}
          </p>

          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-base font-bold text-[#2C2C2A]">
              {formatCurrency(montoNeto)}
            </span>

            <div className="flex items-center gap-1 text-xs">
              <Clock size={11} className={getUrgencyClass(diasRestantes)} />
              <span className={getUrgencyClass(diasRestantes)}>
                {diasRestantes !== undefined
                  ? diasRestantes < 0
                    ? 'Vencido'
                    : diasRestantes === 0
                      ? 'Vence hoy'
                      : diasRestantes === 1
                        ? 'Vence mañana'
                        : `${diasRestantes}d`
                  : formatDate(fechaVencimientos)}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight size={16} className="mt-1 flex-shrink-0 text-[#D4D1CC]" />
      </div>
    </button>
  )
}

export const MobileContractCard = memo(MobileContractCardBase)
