'use client'

/**
 * Facturación Mobile — billing overview for field staff and finance team.
 * Neumorphic design, bottom navigation, optimized for touch.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Receipt, Search, RefreshCw, DollarSign, AlertTriangle,
  Clock, ChevronRight, FileText, TrendingUp,
} from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Factura {
  id: string
  numero: number
  folio: number | null
  tipoDocumento: string
  razonSocialReceptor: string
  rutReceptor: string
  fechaVencimientos: string
  total: number
  montoPagado: number
  estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada'
  diasMora: number
}

// ─── Estado config ────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', color: '#EF9F27', Icon: Clock },
  pagada:    { label: 'Pagada',    color: '#3B6D11', Icon: TrendingUp },
  vencida:   { label: 'Vencida',   color: '#A32D2D', Icon: AlertTriangle },
  anulada:   { label: 'Anulada',   color: '#888780', Icon: FileText },
} as const

function formatCLP(n: number): string {
  return `$${n.toLocaleString('es-CL')}`
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function FacturaCard({ f, onPress }: { f: Factura; onPress: (id: string) => void }) {
  const cfg = ESTADO_CONFIG[f.estado] ?? ESTADO_CONFIG.pendiente
  const { Icon } = cfg
  const saldo = f.total - f.montoPagado

  return (
    <button
      onClick={() => onPress(f.id)}
      className="w-full text-left rounded-2xl p-4 bg-[#F0EDE8]
        shadow-[6px_6px_14px_#D4D1CC,-6px_-6px_14px_#FFFFFF]
        active:shadow-[inset_2px_2px_6px_#D4D1CC,inset_-2px_-2px_6px_#FFFFFF]
        transition-all duration-150"
      aria-label={`Factura ${f.numero}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
          bg-[#E8E5E0] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF]">
          <Receipt size={18} className="text-[#1D5AE8]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#888780]">
              #{f.numero}{f.folio ? ` · F${f.folio}` : ''}
            </span>
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
            >
              <Icon size={9} />
              {cfg.label}
            </span>
          </div>

          <p className="mt-0.5 truncate text-sm font-semibold text-[#2C2C2A]">
            {f.razonSocialReceptor}
          </p>

          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[#888780]">
            <span>{f.rutReceptor}</span>
            <span className="font-semibold text-[#2C2C2A]">{formatCLP(f.total)}</span>
          </div>

          {saldo > 0 && f.estado !== 'anulada' && (
            <div className="mt-1 text-xs" style={{ color: f.estado === 'vencida' ? '#A32D2D' : '#EF9F27' }}>
              Saldo: {formatCLP(saldo)}
              {f.diasMora > 0 && ` · ${f.diasMora}d mora`}
            </div>
          )}
        </div>

        <ChevronRight size={16} className="mt-1 flex-shrink-0 text-[#D4D1CC]" />
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FacturacionMovilPage() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('all')
  const debouncedSearch = useDebounce(search, 300)

  const fetchFacturas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filterEstado !== 'all' && { estado: filterEstado }),
        limit: '40',
      })
      const res = await fetch(`/api/facturacion?${params}`)
      const data = await res.json()
      if (data.success) setFacturas(data.data ?? [])
    } catch {
      // fail silently — field operators may be offline
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterEstado])

  useEffect(() => { fetchFacturas() }, [fetchFacturas])

  const pendiente = facturas.filter(f => f.estado === 'pendiente').length
  const vencida   = facturas.filter(f => f.estado === 'vencida').length
  const totalPendiente = facturas
    .filter(f => f.estado === 'pendiente' || f.estado === 'vencida')
    .reduce((s, f) => s + (f.total - f.montoPagado), 0)

  const ESTADOS = [
    { key: 'all',       label: 'Todas' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'vencida',   label: 'Vencidas' },
    { key: 'pagada',    label: 'Pagadas' },
  ]

  return (
    <div className="min-h-screen bg-[#F0EDE8] pb-20">
      {/* Header */}
      <div className="bg-[#F0EDE8] shadow-[0_4px_12px_#D4D1CC] px-4 pt-safe-top pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-[#2C2C2A]">Facturación</h1>
            <p className="text-xs text-[#888780]">
              {vencida > 0 && <span className="text-[#A32D2D] font-semibold">{vencida} vencidas · </span>}
              {pendiente} pendientes
            </p>
          </div>
          <button
            onClick={fetchFacturas}
            disabled={loading}
            className="flex items-center justify-center w-10 h-10 rounded-xl
              bg-[#E8E5E0] shadow-[3px_3px_8px_#D4D1CC,-3px_-3px_8px_#FFFFFF]
              active:shadow-[inset_2px_2px_5px_#D4D1CC] transition-all"
            aria-label="Actualizar"
          >
            <RefreshCw size={16} className={`text-[#5F5E5A] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary pill */}
        {totalPendiente > 0 && (
          <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2
            bg-[#E8E5E0] shadow-[inset_2px_2px_4px_#D4D1CC,inset_-2px_-2px_4px_#FFFFFF]">
            <DollarSign size={14} className="text-[#EF9F27] flex-shrink-0" />
            <span className="text-xs text-[#5F5E5A]">Por cobrar:</span>
            <span className="text-sm font-bold text-[#2C2C2A]">{formatCLP(totalPendiente)}</span>
          </div>
        )}

        {/* Estado filter chips */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {ESTADOS.map(({ key, label }) => {
            const active = filterEstado === key
            return (
              <button
                key={key}
                onClick={() => setFilterEstado(key)}
                className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#1D5AE8] text-white shadow-[3px_3px_8px_#D4D1CC,-3px_-3px_8px_#FFFFFF]'
                    : 'bg-[#E8E5E0] text-[#5F5E5A] shadow-[inset_2px_2px_4px_#D4D1CC,inset_-2px_-2px_4px_#FFFFFF]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888780]" />
          <input
            type="search"
            placeholder="Buscar por razón social o RUT..."
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
        ) : facturas.length === 0 ? (
          <div className="text-center py-16">
            <Receipt size={48} className="text-[#D4D1CC] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#5F5E5A]">
              {search || filterEstado !== 'all' ? 'No se encontraron facturas' : 'No hay facturas registradas'}
            </p>
          </div>
        ) : (
          facturas.map(f => (
            <FacturaCard
              key={f.id}
              f={f}
              onPress={(id) => { window.location.href = `/facturacion/${id}` }}
            />
          ))
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F0EDE8]
        shadow-[0_-4px_12px_#D4D1CC] px-6 pb-safe-bottom pt-3 flex justify-around">
        <a href="/facturacion/movil" className="flex flex-col items-center gap-1" aria-current="page">
          <Receipt size={22} className="text-[#1D5AE8]" />
          <span className="text-[10px] font-medium text-[#1D5AE8]">Facturas</span>
        </a>
        <a href="/contratos/movil" className="flex flex-col items-center gap-1">
          <FileText size={22} className="text-[#888780]" />
          <span className="text-[10px] text-[#888780]">Contratos</span>
        </a>
        <a href="/dashboard/movil" className="flex flex-col items-center gap-1">
          <TrendingUp size={22} className="text-[#888780]" />
          <span className="text-[10px] text-[#888780]">Dashboard</span>
        </a>
      </nav>
    </div>
  )
}
