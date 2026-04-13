'use client'

/**
 * Emisoras Mobile — field operators access to broadcast stations.
 * Neumorphic design, bottom navigation, optimized for touch.
 */

import { useState, useEffect, useCallback } from 'react'
import { Radio, Search, RefreshCw, Signal, Wifi, WifiOff, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Emisora {
  id: string
  nombre: string
  frecuencia: string
  ciudad: string
  estado: 'activa' | 'inactiva' | 'mantenimiento'
  sistemaEmision: string
  potenciaW?: number
}

// ─── Estado badge ─────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  activa:        { label: 'En vivo', color: '#3B6D11', Icon: Signal },
  inactiva:      { label: 'Inactiva', color: '#888780', Icon: WifiOff },
  mantenimiento: { label: 'Mantenimiento', color: '#EF9F27', Icon: Wifi },
} as const

// ─── Card ─────────────────────────────────────────────────────────────────────

function EmisoraCard({ emisora, onPress }: { emisora: Emisora; onPress: (id: string) => void }) {
  const cfg = ESTADO_CONFIG[emisora.estado]
  const { Icon } = cfg

  return (
    <button
      onClick={() => onPress(emisora.id)}
      className="w-full text-left rounded-2xl p-4 bg-[#F0EDE8]
        shadow-[6px_6px_14px_#D4D1CC,-6px_-6px_14px_#FFFFFF]
        active:shadow-[inset_2px_2px_6px_#D4D1CC,inset_-2px_-2px_6px_#FFFFFF]
        transition-all duration-150"
      aria-label={`Emisora ${emisora.nombre}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
          bg-[#E8E5E0] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]">
          <Radio size={18} className="text-[#534AB7]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#888780]">{emisora.frecuencia}</span>
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
            >
              <Icon size={10} />
              {cfg.label}
            </span>
          </div>

          <p className="mt-0.5 truncate text-sm font-semibold text-[#2C2C2A]">{emisora.nombre}</p>

          <div className="mt-1 flex items-center gap-3 text-xs text-[#888780]">
            <span>{emisora.ciudad}</span>
            {emisora.potenciaW && <span>· {emisora.potenciaW.toLocaleString()}W</span>}
            <span>· {emisora.sistemaEmision}</span>
          </div>
        </div>

        <ChevronRight size={16} className="mt-1 flex-shrink-0 text-[#D4D1CC]" />
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmisorasMovilPage() {
  const [emisoras, setEmisoras] = useState<Emisora[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const fetchEmisoras = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...(debouncedSearch && { search: debouncedSearch }) })
      const res = await fetch(`/api/emisoras?${params}`)
      const data = await res.json()
      if (data.success) setEmisoras(data.data ?? [])
    } catch {
      // fail silently — field operators may be offline
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => { fetchEmisoras() }, [fetchEmisoras])

  const filtered = emisoras.filter(e =>
    !debouncedSearch ||
    e.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    e.frecuencia.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    e.ciudad?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const activas = emisoras.filter(e => e.estado === 'activa').length

  return (
    <div className="min-h-screen bg-[#F0EDE8] pb-20">
      {/* Header */}
      <div className="bg-[#F0EDE8] shadow-[0_4px_12px_#D4D1CC] px-4 pt-safe-top pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#2C2C2A]">Emisoras</h1>
            <p className="text-xs text-[#888780]">{activas} de {emisoras.length} en vivo</p>
          </div>
          <button
            onClick={fetchEmisoras}
            disabled={loading}
            className="flex items-center justify-center w-10 h-10 rounded-xl
              bg-[#E8E5E0] shadow-[3px_3px_8px_#D4D1CC,-3px_-3px_8px_#FFFFFF]
              active:shadow-[inset_2px_2px_5px_#D4D1CC] transition-all"
            aria-label="Actualizar"
          >
            <RefreshCw size={16} className={`text-[#5F5E5A] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888780]" />
          <input
            type="search"
            placeholder="Buscar emisora o frecuencia..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#E8E5E0] text-sm text-[#2C2C2A]
              shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]
              placeholder:text-[#ABAAA6] border-none outline-none focus:ring-2 focus:ring-[#534AB7]/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#E8E5E0] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Radio size={48} className="text-[#D4D1CC] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#5F5E5A]">
              {search ? 'No se encontraron emisoras' : 'No hay emisoras registradas'}
            </p>
          </div>
        ) : (
          filtered.map(emisora => (
            <EmisoraCard
              key={emisora.id}
              emisora={emisora}
              onPress={(id) => window.location.href = `/emisoras/${id}`}
            />
          ))
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F0EDE8]
        shadow-[0_-4px_12px_#D4D1CC] px-6 pb-safe-bottom pt-3 flex justify-around">
        <a href="/emisoras/movil" className="flex flex-col items-center gap-1" aria-current="page">
          <Radio size={22} className="text-[#534AB7]" />
          <span className="text-[10px] font-medium text-[#534AB7]">Emisoras</span>
        </a>
        <a href="/dashboard/movil" className="flex flex-col items-center gap-1">
          <Signal size={22} className="text-[#888780]" />
          <span className="text-[10px] text-[#888780]">Dashboard</span>
        </a>
      </nav>
    </div>
  )
}
