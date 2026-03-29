'use client'

/**
 * MobileStatsGrid — KPI grid optimized for mobile dashboard
 *
 * Shows 2-column (or 1-column) grid of key metrics.
 * Neumorphic raised cards per stat. Skeleton loading state.
 */

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatItem {
  id: string
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: LucideIcon
  color?: string
}

interface MobileStatsGridProps {
  stats: StatItem[]
  columns?: 1 | 2
  isLoading?: boolean
  className?: string
}

function TrendArrow({ trend, value }: { trend: 'up' | 'down' | 'neutral'; value?: string }) {
  if (trend === 'neutral' || !value) return null
  const isUp = trend === 'up'
  return (
    <span className={`text-[10px] font-medium ${isUp ? 'text-[#3B6D11]' : 'text-[#A32D2D]'}`}>
      {isUp ? '↑' : '↓'} {value}
    </span>
  )
}

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon
  const color = stat.color ?? '#1D5AE8'

  return (
    <div className="rounded-2xl p-3 bg-[#F0EDE8]
      shadow-[5px_5px_12px_#D4D1CC,-5px_-5px_12px_#FFFFFF]">
      {/* Icon */}
      <div
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={16} style={{ color }} />
      </div>

      {/* Value */}
      <p className="text-xl font-bold text-[#2C2C2A] leading-tight">
        {stat.value}
      </p>

      {/* Sub value + trend */}
      <div className="mt-0.5 flex items-center gap-1.5">
        {stat.subValue && (
          <span className="text-[10px] text-[#888780]">{stat.subValue}</span>
        )}
        {stat.trend && (
          <TrendArrow trend={stat.trend} value={stat.trendValue} />
        )}
      </div>

      {/* Label */}
      <p className="mt-1 text-xs text-[#5F5E5A]">{stat.label}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-3 bg-[#F0EDE8]
      shadow-[5px_5px_12px_#D4D1CC,-5px_-5px_12px_#FFFFFF] animate-pulse">
      <div className="mb-2 h-8 w-8 rounded-xl bg-[#E8E5E0]" />
      <div className="h-7 w-16 rounded-lg bg-[#E8E5E0]" />
      <div className="mt-1 h-3 w-10 rounded bg-[#E8E5E0]" />
      <div className="mt-1 h-3 w-20 rounded bg-[#E8E5E0]" />
    </div>
  )
}

export function MobileStatsGrid({
  stats,
  columns = 2,
  isLoading = false,
  className = '',
}: MobileStatsGridProps) {
  const gridClass = columns === 2
    ? 'grid grid-cols-2 gap-3'
    : 'grid grid-cols-1 gap-3'

  if (isLoading) {
    return (
      <div className={`${gridClass} ${className}`} aria-busy="true" aria-label="Cargando métricas">
        {Array.from({ length: columns === 2 ? 4 : 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (stats.length === 0) return null

  return (
    <div className={`${gridClass} ${className}`}>
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )
}
