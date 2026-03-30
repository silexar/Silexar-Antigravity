'use client'

/**
 * MobileOfflineIndicator — Shows connection status + pending sync count
 *
 * Connects to the IndexedDB offline queue (OfflineSyncEngine) to show
 * how many operations are pending sync when back online.
 *
 * Displays a non-blocking banner when offline (not a modal/blocker).
 */

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, CloudUpload } from 'lucide-react'

interface MobileOfflineIndicatorProps {
  pendingCount?: number
  className?: string
}

export function MobileOfflineIndicator({
  pendingCount = 0,
  className = '',
}: MobileOfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setJustReconnected(true)
      setTimeout(() => setJustReconnected(false), 3000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setJustReconnected(false)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Online and stable — nothing to show
  if (isOnline && !justReconnected && pendingCount === 0) return null

  // Reconnected with pending sync
  if (justReconnected && pendingCount > 0) {
    return (
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm
        bg-[#F0EDE8] shadow-[3px_3px_8px_#D4D1CC,-3px_-3px_8px_#FFFFFF] ${className}`}>
        <CloudUpload size={16} className="text-[#1D5AE8] animate-pulse flex-shrink-0" />
        <span className="text-[#2C2C2A] font-medium">
          Sincronizando {pendingCount} {pendingCount === 1 ? 'cambio' : 'cambios'}…
        </span>
      </div>
    )
  }

  // Reconnected, no pending
  if (justReconnected) {
    return (
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm
        bg-[#F0EDE8] shadow-[3px_3px_8px_#D4D1CC,-3px_-3px_8px_#FFFFFF] ${className}`}>
        <Wifi size={16} className="text-[#3B6D11] flex-shrink-0" />
        <span className="text-[#3B6D11] font-medium">Conexión restaurada</span>
      </div>
    )
  }

  // Offline
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm
        bg-[#F0EDE8] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF] ${className}`}
    >
      <WifiOff size={16} className="text-[#EF9F27] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-[#2C2C2A] font-medium">Sin conexión</span>
        {pendingCount > 0 && (
          <span className="ml-1 text-[#888780]">
            — {pendingCount} {pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
          </span>
        )}
      </div>
    </div>
  )
}
