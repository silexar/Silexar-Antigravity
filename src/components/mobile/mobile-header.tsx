'use client'

/**
 * MobileHeader — Top header for mobile views
 *
 * Neumorphic design, supports back navigation, title, and optional actions.
 * Used across all mobile pages for consistent UX.
 */

import { ArrowLeft, Bell, RefreshCw } from 'lucide-react'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  onRefresh?: () => void
  notificationCount?: number
  onNotifications?: () => void
  isRefreshing?: boolean
}

export function MobileHeader({
  title,
  subtitle,
  onBack,
  onRefresh,
  notificationCount = 0,
  onNotifications,
  isRefreshing = false,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F0EDE8] px-4 py-3 shadow-[0_2px_8px_#D4D1CC]">
      <div className="flex items-center gap-3">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Volver"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl
              bg-[#F0EDE8] shadow-[3px_3px_7px_#D4D1CC,-3px_-3px_7px_#FFFFFF]
              active:shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]
              transition-all duration-150"
          >
            <ArrowLeft size={18} className="text-[#5F5E5A]" />
          </button>
        )}

        {/* Title area */}
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-base font-semibold text-[#2C2C2A] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-[#888780] leading-tight">{subtitle}</p>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Actualizar"
              className="flex h-9 w-9 items-center justify-center rounded-xl
                bg-[#F0EDE8] shadow-[3px_3px_7px_#D4D1CC,-3px_-3px_7px_#FFFFFF]
                active:shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]
                transition-all duration-150 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={`text-[#5F5E5A] ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          )}

          {onNotifications && (
            <button
              onClick={onNotifications}
              aria-label={`Notificaciones${notificationCount > 0 ? ` (${notificationCount})` : ''}`}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl
                bg-[#F0EDE8] shadow-[3px_3px_7px_#D4D1CC,-3px_-3px_7px_#FFFFFF]
                active:shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]
                transition-all duration-150"
            >
              <Bell size={16} className="text-[#5F5E5A]" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center
                  justify-center rounded-full bg-[#A32D2D] px-1 text-[9px] font-bold text-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
