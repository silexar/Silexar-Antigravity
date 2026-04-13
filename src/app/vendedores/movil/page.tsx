'use client'

/**
 * Vendedores Mobile — field sales team view.
 * Neumorphic design, bottom navigation, optimized for touch.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Search, RefreshCw, TrendingUp, Target,
  Star, ChevronRight, Award, BarChart3,
} from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendedor {
  id: string
  codigo: string
  nombreCompleto: string
  tipoVendedor: string
  equipoNombre: string | null
  equipoColor: string
  activo: boolean
  cumplimientoActual: number
  ventasRealizadas: number
  clientesAsignados: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cumplimientoColor(pct: number): string {
  if (pct >= 100) return '#3B6D11'
  if (pct >= 75)  return '#1D5AE8'
  if (pct >= 50)  return '#EF9F27'
  return '#A32D2D'
}

function formatPct(n: number) {
  return `${Math.round(n)}%`
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function VendedorCard({ v, onPress }: { v: Vendedor; onPress: (id: string) => void }) {
  const pctColor = cumplimientoColor(v.cumplimientoActual)

  return (
    <button
      onClick={() => onPress(v.id)}
      className="w-full text-left rounded-2xl p-4 bg-[#F0EDE8]
        shadow-[6px_6px_14px_#D4D1CC,-6px_-6px_14px_#FFFFFF]
        active:shadow-[inset_2px_2px_6px_#D4D1CC,inset_-2px_-2px_6px_#FFFFFF]
        transition-all duration-150"
      aria-label={`Vendedor ${v.nombreCompleto}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar badge */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
          bg-[#E8E5E0] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]">
          <Users size={18} className="text-[#1D5AE8]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#888780]">{v.codigo}</span>
            {v.activo ? (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ color: '#3B6D11', backgroundColor: '#3B6D1118' }}>
                <Star size={9} />Activo
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ color: '#888780', backgroundColor: '#88878018' }}>
                Inactivo
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-sm font-semibold text-[#2C2C2A]">{v.nombreCompleto}</p>

          <div className="mt-1 flex items-center gap-3 text-xs text-[#888780]">
            <span>{v.tipoVendedor}</span>
            {v.equipoNombre && <span>· {v.equipoNombre}</span>}
            <span>· {v.clientesAsignados} clientes</span>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#888780]">Cumplimiento meta</span>
              <span className="text-[10px] font-semibold" style={{ color: pctColor }}>
                {formatPct(v.cumplimientoActual)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#E8E5E0] shadow-[inset_1px_1px_3px_#D4D1CC]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(v.cumplimientoActual, 100)}%`,
                  backgroundColor: pctColor,
                }}
              />
            </div>
          </div>
        </div>

        <ChevronRight size={16} className="mt-1 flex-shrink-0 text-[#D4D1CC]" />
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendedoresMovilPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const fetchVendedores = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...(debouncedSearch && { search: debouncedSearch }) })
      const res = await fetch(`/api/vendedores?${params}`)
      const data = await res.json()
      if (data.success) setVendedores(data.data ?? [])
    } catch {
      // fail silently — field operators may be offline
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => { fetchVendedores() }, [fetchVendedores])

  const filtered = vendedores.filter(v =>
    !debouncedSearch ||
    v.nombreCompleto.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    v.codigo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    v.equipoNombre?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const activos = vendedores.filter(v => v.activo).length
  const cumplimientoPromedio = vendedores.length
    ? Math.round(vendedores.reduce((s, v) => s + v.cumplimientoActual, 0) / vendedores.length)
    : 0

  return (
    <div className="min-h-screen bg-[#F0EDE8] pb-20">
      {/* Header */}
      <div className="bg-[#F0EDE8] shadow-[0_4px_12px_#D4D1CC] px-4 pt-safe-top pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-[#2C2C2A]">Vendedores</h1>
            <p className="text-xs text-[#888780]">{activos} activos · meta promedio {cumplimientoPromedio}%</p>
          </div>
          <button
            onClick={fetchVendedores}
            disabled={loading}
            className="flex items-center justify-center w-10 h-10 rounded-xl
              bg-[#E8E5E0] shadow-[3px_3px_8px_#D4D1CC,-3px_-3px_8px_#FFFFFF]
              active:shadow-[inset_2px_2px_5px_#D4D1CC] transition-all"
            aria-label="Actualizar"
          >
            <RefreshCw size={16} className={`text-[#5F5E5A] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {[
            { icon: Users, label: 'Total', value: vendedores.length, color: '#1D5AE8' },
            { icon: Star, label: 'Activos', value: activos, color: '#3B6D11' },
            { icon: Target, label: 'Meta prom.', value: `${cumplimientoPromedio}%`, color: '#EF9F27' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 flex-shrink-0
                bg-[#E8E5E0] shadow-[inset_2px_2px_4px_#D4D1CC,inset_-2px_-2px_4px_#FFFFFF]">
              <Icon size={12} style={{ color }} />
              <span className="text-[10px] text-[#888780]">{label}</span>
              <span className="text-xs font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888780]" />
          <input
            type="search"
            placeholder="Buscar vendedor o equipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#E8E5E0] text-sm text-[#2C2C2A]
              shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]
              placeholder:text-[#ABAAA6] border-none outline-none focus:ring-2 focus:ring-[#1D5AE8]/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#E8E5E0] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-[#D4D1CC] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#5F5E5A]">
              {search ? 'No se encontraron vendedores' : 'No hay vendedores registrados'}
            </p>
          </div>
        ) : (
          filtered.map(v => (
            <VendedorCard
              key={v.id}
              v={v}
              onPress={(id) => { window.location.href = `/vendedores/${id}` }}
            />
          ))
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F0EDE8]
        shadow-[0_-4px_12px_#D4D1CC] px-6 pb-safe-bottom pt-3 flex justify-around">
        <a href="/vendedores/movil" className="flex flex-col items-center gap-1" aria-current="page">
          <Users size={22} className="text-[#1D5AE8]" />
          <span className="text-[10px] font-medium text-[#1D5AE8]">Vendedores</span>
        </a>
        <a href="/equipos-ventas/movil" className="flex flex-col items-center gap-1">
          <Award size={22} className="text-[#888780]" />
          <span className="text-[10px] text-[#888780]">Equipos</span>
        </a>
        <a href="/dashboard/movil" className="flex flex-col items-center gap-1">
          <BarChart3 size={22} className="text-[#888780]" />
          <span className="text-[10px] text-[#888780]">Dashboard</span>
        </a>
      </nav>
    </div>
  )
}
