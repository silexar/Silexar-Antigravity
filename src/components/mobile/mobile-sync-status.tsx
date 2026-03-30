'use client'

/**
 * MobileSyncStatus — Shows the sync state of the offline queue
 *
 * Shows pending/syncing/done states for IndexedDB offline operations.
 * Used in mobile layouts to give field salespeople feedback on data sync.
 */

import { CloudUpload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type SyncState = 'idle' | 'pending' | 'syncing' | 'done' | 'error'

interface MobileSyncStatusProps {
  state: SyncState
  pendingCount?: number
  errorMessage?: string
  onRetry?: () => void
  compact?: boolean
  className?: string
}

const STATE_CONFIG: Record<SyncState, {
  label: (count?: number) => string
  color: string
  bgColor: string
  Icon: typeof CheckCircle | typeof Loader2
  animate?: boolean
}> = {
  idle:    { label: () => 'Sincronizado',        color: '#3B6D11', bgColor: '#3B6D1118', Icon: CheckCircle },
  done:    { label: () => 'Sincronización lista', color: '#3B6D11', bgColor: '#3B6D1118', Icon: CheckCircle },
  pending: {
    label: (c) => c ? `${c} cambio${c !== 1 ? 's' : ''} pendiente${c !== 1 ? 's' : ''}` : 'Pendiente',
    color: '#EF9F27', bgColor: '#EF9F2718', Icon: CloudUpload,
  },
  syncing: {
    label: () => 'Sincronizando…',
    color: '#1D5AE8', bgColor: '#1D5AE818', Icon: Loader2, animate: true,
  },
  error:   { label: () => 'Error de sincronización', color: '#A32D2D', bgColor: '#A32D2D18', Icon: AlertCircle },
}

export function MobileSyncStatus({
  state,
  pendingCount,
  errorMessage,
  onRetry,
  compact = false,
  className = '',
}: MobileSyncStatusProps) {
  const config = STATE_CONFIG[state]
  const { Icon } = config

  // In compact mode, just show the icon
  if (compact) {
    return (
      <span
        title={config.label(pendingCount)}
        className={`flex h-6 w-6 items-center justify-center rounded-full ${className}`}
        style={{ backgroundColor: config.bgColor }}
      >
        <Icon
          size={14}
          style={{ color: config.color }}
          className={config.animate ? 'animate-spin' : ''}
        />
      </span>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2
        bg-[#F0EDE8] shadow-[3px_3px_8px_#D4D1CC,-3px_-3px_8px_#FFFFFF] ${className}`}
    >
      <span
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: config.bgColor }}
      >
        <Icon
          size={15}
          style={{ color: config.color }}
          className={config.animate ? 'animate-spin' : ''}
        />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: config.color }}>
          {config.label(pendingCount)}
        </p>
        {state === 'error' && errorMessage && (
          <p className="truncate text-[10px] text-[#888780]">{errorMessage}</p>
        )}
      </div>

      {state === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg px-2 py-1 text-xs font-medium text-[#1D5AE8]
            bg-[#1D5AE818] hover:bg-[#1D5AE830] transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
