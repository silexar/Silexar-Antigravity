/**
 * 🎯 CENTRO DE COMANDO CAMPAÑAS — SILEXAR PULSE ENTERPRISE
 * Reconstruido con Neumorphism Design System TIER 0
 * Fondo #dfeaff | sombras #bec8de / #ffffff | acento #6888ff
 */

'use client'

import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import {
  Target, Play, AlertTriangle, Clock, BarChart3,
  Search, Plus, FileText, Brain, User, Bell,
  Download, RefreshCw, Settings,
  Building2, DollarSign, Radio, Star, Eye,
  ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, LayoutList,
  X, Columns, Save, Bookmark, History, Keyboard, Copy,
  Trash2, UserPlus, CheckSquare, ExternalLink,
  TrendingUp, Moon, Sun, CheckCircle2,
  ArrowLeft, LayoutDashboard,
  CalendarDays, MessageSquare, Zap, FileCheck2, Map, Receipt
} from 'lucide-react'
import { ModuleNavMenu } from '@/components/module-nav-menu'
import { useTheme } from '@/hooks/useTheme'
import { ContextMenuCampana, useContextMenu } from '@/components/campanas/ContextMenuCampana'
import { ExportManager } from '@/components/campanas/ExportManager'
import { useNotifications, NotificationCenter } from '@/components/campanas/NotificationSystem'

import type { CampanaListado, SortField } from './_lib/types'
import { formatFecha, formatMoney, getEstadoBadge } from './_lib/helpers'
import { useCampanas } from './_lib/useCampanas'

// ─── Neumorphism Tokens ──────────────────────────────────────
const neo = {
  base:    '#dfeaff',
  dark:    '#bec8de',
  light:   '#ffffff',
  accent:  '#6888ff',
  text:    '#69738c',
  textSub: '#9aa3b8',
}

// ─── Helper Components Neumórficos ───────────────────────────
function NeoCard({ children, className = '', padding = 'normal', style }: {
  children: React.ReactNode; className?: string; padding?: 'none' | 'small' | 'normal'; style?: React.CSSProperties
}) {
  const p = padding === 'none' ? '' : padding === 'small' ? 'p-3' : 'p-5'
  return (
    <div className={`rounded-3xl ${p} ${className}`} style={{ background: neo.base, boxShadow: `8px 8px 16px ${neo.dark},-8px -8px 16px ${neo.light}`, ...style }}>
      {children}
    </div>
  )
}

function NeoButton({ children, onClick, variant = 'secondary', size = 'md', className = '', disabled = false, title }: {
  children: React.ReactNode; onClick?: React.MouseEventHandler<HTMLButtonElement>; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'icon'; className?: string; disabled?: boolean; title?: string
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
  const sizes = {
    sm: "px-3 py-1.5 rounded-full text-[11px]",
    md: "px-4 py-2 rounded-full text-xs",
    icon: "w-8 h-8 rounded-xl",
  }
  const variants = {
    primary: { background: neo.accent, color: '#fff', boxShadow: `4px 4px 8px ${neo.dark},-2px -2px 6px ${neo.light}` },
    secondary: { background: neo.base, color: neo.text, boxShadow: `4px 4px 8px ${neo.dark},-4px -4px 8px ${neo.light}` },
    ghost: { background: 'transparent', color: neo.textSub, boxShadow: 'none' },
    danger: { background: neo.base, color: '#ef4444', boxShadow: `4px 4px 8px ${neo.dark},-4px -4px 8px ${neo.light}` },
  }
  const v = variants[variant]
  const s = sizes[size]
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`${base} ${s} ${className}`} style={v}
      onMouseEnter={e => {
        if (variant === 'secondary' || variant === 'danger') {
          (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 4px ${neo.dark},-2px -2px 4px ${neo.light}`
        }
      }}
      onMouseLeave={e => {
        if (variant === 'secondary' || variant === 'danger') {
          (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 8px ${neo.dark},-4px -4px 8px ${neo.light}`
        }
      }}
    >
      {children}
    </button>
  )
}

const NeoInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function NeoInput({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium placeholder-[#9aa3b8] border-none focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 ${className}`}
        style={{ background: neo.base, boxShadow: `inset 4px 4px 8px ${neo.dark},inset -4px -4px 8px ${neo.light}`, color: neo.text, ...(props.style || {}) }}
      />
    )
  }
)

function NeoBadge({ children, color = 'blue', className = '' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'emerald' | 'gray'; className?: string }) {
  const colorMap: Record<string, string> = {
    blue: neo.accent, green: '#22c55e', red: '#ef4444', yellow: '#f59e0b', purple: '#a855f7', emerald: '#14b8a6', gray: neo.textSub,
  }
  const c = colorMap[color] || neo.accent
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${className}`}
      style={{ background: neo.base, boxShadow: `inset 2px 2px 4px ${neo.dark}, inset -2px -2px 4px ${neo.light}`, color: c }}>
      {children}
    </span>
  )
}

function NeoCheckbox({ checked, onCheckedChange, ...props }: {
  checked: boolean | 'indeterminate'; onCheckedChange: (v: boolean) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'>) {
  const isChecked = checked === true
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only" checked={isChecked}
        onChange={e => onCheckedChange(e.target.checked)} {...props} />
      <span className="w-4 h-4 rounded flex items-center justify-center transition-all"
        style={{
          background: isChecked ? neo.accent : neo.base,
          boxShadow: isChecked
            ? `inset 2px 2px 4px ${neo.dark}, inset -2px -2px 4px ${neo.light}`
            : `2px 2px 4px ${neo.dark}, -2px -2px 4px ${neo.light}`,
        }}>
        {isChecked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
      </span>
    </label>
  )
}

function FloatWindow({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  const dragControls = useDragControls()
  return (
    <motion.div
      drag dragControls={dragControls} dragListener={false}
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="fixed z-50 rounded-2xl overflow-hidden flex flex-col"
      style={{ width: 420, maxHeight: '80vh', top: 80, right: 24, background: neo.base, boxShadow: `12px 12px 24px ${neo.dark},-12px -12px 24px ${neo.light}` }}>
      <div onPointerDown={e => dragControls.start(e)}
        className="h-10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0"
        style={{ borderBottom: `1px solid ${neo.dark}40` }}>
        <span className="text-xs font-black uppercase tracking-wider" style={{ color: neo.text }}>{title}</span>
        <div className="flex gap-2 items-center">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] hover:brightness-110 transition-all" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" />
    </motion.div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CampanasPage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const {
    campanas, campanasFiltradas, stats, columnas, columnasVisibles,
    filtrosGuardados, historialReciente,
    isLoading, isError,
    searchTerm, setSearchTerm, filtroActivo, setFiltroActivo,
    sortField, sortDirection,
    vistaActiva, setVistaActiva, seleccionados, setSeleccionados,
    handleSort, toggleSeleccion, toggleSeleccionarTodos,
    toggleFavorito, toggleColumna, aplicarFiltroGuardado,
    guardarFiltroActual, agregarHistorial,
  } = useCampanas()

  const [mostrarColumnas, setMostrarColumnas] = useState(false)
  const [quickViewCampana, setQuickViewCampana] = useState<CampanaListado | null>(null)
  const [mostrarFiltrosGuardados, setMostrarFiltrosGuardados] = useState(false)
  const [mostrarShortcuts, setMostrarShortcuts] = useState(false)
  const [statsExpandido, setStatsExpandido] = useState<string | null>(null)
  const [mostrarExport, setMostrarExport] = useState(false)
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)

  const { isDark, toggleTheme } = useTheme()
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu()
  const { notifications, noLeidas, enviarNotificacion, marcarLeida, marcarTodasLeidas, eliminar } = useNotifications()

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); router.push('/campanas/crear') }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); searchInputRef.current?.focus() }
      if (e.key === 'Escape') {
        setSearchTerm(''); setFiltroActivo('todas'); setQuickViewCampana(null)
        setMostrarColumnas(false); setMostrarFiltrosGuardados(false)
        setMostrarShortcuts(false); setSeleccionados(new Set())
      }
      if (e.ctrlKey && e.key === 'a' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        setSeleccionados(new Set(campanas.map(c => c.id)))
      }
      if (e.key === '?' && !e.ctrlKey) setMostrarShortcuts(true)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, campanas, setSearchTerm, setFiltroActivo, setSeleccionados])

  const navegarACampana = (id: string) => { agregarHistorial(id); router.push(`/campanas/${id}`) }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" style={{ color: neo.textSub }} />
    if (sortDirection === 'asc') return <ArrowUp className="h-3 w-3" style={{ color: neo.accent }} />
    return <ArrowDown className="h-3 w-3" style={{ color: neo.accent }} />
  }

  const estadoBadgeNeo = (estado: string) => {
    const map: Record<string, { color: string; label: string }> = {
      activa:       { color: 'green', label: 'Activa' },
      planificando: { color: 'blue', label: 'Planificando' },
      ejecutando:   { color: 'emerald', label: 'Ejecutando' },
      pausada:      { color: 'yellow', label: 'Pausada' },
      finalizada:   { color: 'gray', label: 'Finalizada' },
      cancelada:    { color: 'red', label: 'Cancelada' },
    }
    const e = map[estado] || { color: 'gray', label: estado }
    return <NeoBadge color={e.color as any}>{e.label}</NeoBadge>
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) return (
    <div className="min-h-screen p-6" style={{ background: neo.base }}>
      <div className="max-w-[1900px] mx-auto space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={`skeleton-${i}`} className="h-16 rounded-2xl animate-pulse"
            style={{ background: neo.base, boxShadow: `inset 3px 3px 8px ${neo.dark},inset -3px -3px 8px ${neo.light}` }} />
        ))}
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: neo.base }}>
      <NeoCard className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
        <h2 className="text-xl font-black mb-2" style={{ color: neo.text }}>Error al cargar campañas</h2>
        <p className="text-sm mb-4" style={{ color: neo.textSub }}>No fue posible obtener los datos. Por favor intenta nuevamente.</p>
        <NeoButton variant="primary" onClick={() => window.location.reload()}>Reintentar</NeoButton>
      </NeoCard>
    </div>
  )

  return (
    <div className="min-h-screen p-6" style={{ background: neo.base }}>
      <div className="max-w-[1900px] mx-auto space-y-5">

        {/* ================================================================
            HEADER CON ACCIONES ENTERPRISE — Neumórfico
        ================================================================ */}
        <NeoCard padding="normal">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <NeoButton variant="secondary" size="icon" onClick={() => router.push('/dashboard')} title="Volver al Dashboard">
                <ArrowLeft className="w-4 h-4" style={{ color: neo.textSub }} />
              </NeoButton>
              <ModuleNavMenu />
              <div className="p-3 rounded-xl" style={{ background: neo.accent, boxShadow: `4px 4px 8px ${neo.dark},-2px -2px 6px ${neo.light}` }}>
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: neo.text }}>
                  CENTRO DE COMANDO CAMPAÑAS
                </h1>
                <p className="text-xs font-bold" style={{ color: neo.textSub }}>
                  TIER 0 Enterprise · Cortex-Scheduler · <kbd className="px-1 rounded text-[10px]" style={{ background: neo.base, boxShadow: `inset 2px 2px 4px ${neo.dark},inset -2px -2px 4px ${neo.light}` }}>?</kbd> Atajos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1 mr-4">
                <History className="h-4 w-4" style={{ color: neo.textSub }} />
                <span className="text-[11px] font-bold" style={{ color: neo.textSub }}>Recientes:</span>
                {historialReciente.slice(0, 3).map(id => {
                  const c = campanas.find(x => x.id === id)
                  return c ? (
                    <NeoButton key={id} variant="ghost" size="sm" onClick={() => navegarACampana(id)}>{c.numeroCampana}</NeoButton>
                  ) : null
                })}
              </div>
              <NeoBadge color="green">
                <span className="w-2 h-2 rounded-full mr-1 animate-pulse" style={{ background: '#22c55e', boxShadow: `0 0 6px #22c55e88` }} />
                Real-Time
              </NeoBadge>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <NeoButton variant="primary" size="md" onClick={() => router.push('/campanas/crear')}>
              <Plus className="h-4 w-4" /> Nueva <kbd className="ml-1 text-[10px] opacity-70">Ctrl+N</kbd>
            </NeoButton>
            <NeoButton variant="secondary" size="md" onClick={() => router.push('/campanas/crear?from=contrato')}>
              <FileText className="h-4 w-4" /> Desde Contrato
            </NeoButton>
            <NeoButton variant="secondary" size="md" onClick={() => router.push('/campanas/dashboard-ejecutivo')}>
              <Brain className="h-4 w-4" /> Dashboard IA
            </NeoButton>

            <div className="h-6 w-px mx-1" style={{ background: neo.dark }} />

            {/* Toggle Vista */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: neo.base, boxShadow: `inset 3px 3px 6px ${neo.dark},inset -3px -3px 6px ${neo.light}` }}>
              <NeoButton variant={vistaActiva === 'tabla' ? 'primary' : 'ghost'} size="icon" onClick={() => setVistaActiva('tabla')}>
                <LayoutList className="h-4 w-4" />
              </NeoButton>
              <NeoButton variant={vistaActiva === 'cards' ? 'primary' : 'ghost'} size="icon" onClick={() => setVistaActiva('cards')}>
                <LayoutGrid className="h-4 w-4" />
              </NeoButton>
            </div>

            {/* Columnas */}
            <div className="relative">
              <NeoButton variant="secondary" size="sm" onClick={() => setMostrarColumnas(!mostrarColumnas)}>
                <Columns className="h-4 w-4 mr-1" /> Columnas
              </NeoButton>
              {mostrarColumnas && (
                <div className="absolute top-full mt-2 left-0 z-50 rounded-2xl overflow-hidden w-64 p-3"
                  style={{ background: neo.base, boxShadow: `8px 8px 20px ${neo.dark},-4px -4px 12px ${neo.light}` }}>
                  <h4 className="font-black text-xs uppercase tracking-wider mb-2" style={{ color: neo.text }}>Columnas visibles</h4>
                  <div className="space-y-1 max-h-64 overflow-auto">
                    {columnas.map(col => (
                      <label key={col.id} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded-xl"
                        style={{ color: neo.text }}>
                        <NeoCheckbox checked={col.visible} onCheckedChange={() => toggleColumna(col.id)} />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtros Guardados */}
            <div className="relative">
              <NeoButton variant="secondary" size="sm" onClick={() => setMostrarFiltrosGuardados(!mostrarFiltrosGuardados)}>
                <Bookmark className="h-4 w-4 mr-1" /> Filtros
              </NeoButton>
              {mostrarFiltrosGuardados && (
                <div className="absolute top-full mt-2 left-0 z-50 rounded-2xl overflow-hidden w-72 p-3"
                  style={{ background: neo.base, boxShadow: `8px 8px 20px ${neo.dark},-4px -4px 12px ${neo.light}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs uppercase tracking-wider" style={{ color: neo.text }}>Filtros guardados</h4>
                    <NeoButton variant="ghost" size="sm" onClick={guardarFiltroActual}>
                      <Save className="h-3 w-3 mr-1" /> Guardar
                    </NeoButton>
                  </div>
                  <div className="space-y-1">
                    {filtrosGuardados.map(f => (
                      <NeoButton key={f.id} variant="ghost" size="sm" className="w-full justify-start text-left"
                        onClick={() => aplicarFiltroGuardado(f)}>{f.nombre}</NeoButton>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1" />

            <NeoButton variant="secondary" size="icon" onClick={() => setMostrarShortcuts(true)} title="Atajos">
              <Keyboard className="h-4 w-4" />
            </NeoButton>
            <NeoButton variant="secondary" size="icon" onClick={toggleTheme} title="Cambiar tema">
              {isDark ? <Sun className="h-4 w-4" style={{ color: '#f59e0b' }} /> : <Moon className="h-4 w-4" style={{ color: neo.textSub }} />}
            </NeoButton>
            <div className="relative">
              <NeoButton variant="secondary" size="icon" onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)} title="Notificaciones">
                <Bell className="h-4 w-4" style={{ color: neo.textSub }} />
                {noLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-black"
                    style={{ background: '#ef4444' }}>{noLeidas}</span>
                )}
              </NeoButton>
            </div>
            <NeoButton variant="secondary" size="icon" onClick={() => window.location.reload()} title="Actualizar">
              <RefreshCw className="h-4 w-4" style={{ color: neo.textSub }} />
            </NeoButton>
            <NeoButton variant="secondary" size="icon" onClick={() => setMostrarExport(true)} title="Exportar">
              <Download className="h-4 w-4" style={{ color: neo.textSub }} />
            </NeoButton>
            <NeoButton variant="secondary" size="icon" onClick={() => router.push('/configuracion')} title="Configuración">
              <Settings className="h-4 w-4" style={{ color: neo.textSub }} />
            </NeoButton>
          </div>

          {/* Búsqueda Inteligente */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: neo.textSub }} />
            <NeoInput ref={searchInputRef as any}
              placeholder="Buscar: 'Banco Chile', '>$3M', 'ejecutando', 'Ana García'... (Ctrl+F)"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-11 text-base" />
            {searchTerm && (
              <NeoButton variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setSearchTerm('')}><X className="h-4 w-4" /></NeoButton>
            )}
          </div>

          {/* Filtros IA + Stats */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: neo.textSub }}>Filtros:</span>
              {[
                { id: 'todas', label: 'Todas', icon: null },
                { id: 'mis', label: 'Mis Campañas', icon: User },
                { id: 'activas', label: 'Activas', icon: Play },
                { id: 'atencion', label: 'Atención', icon: Bell },
                { id: 'favoritos', label: 'Favoritos', icon: Star }
              ].map(f => (
                <NeoButton key={f.id} variant={filtroActivo === f.id ? 'primary' : 'secondary'} size="sm"
                  onClick={() => setFiltroActivo(f.id)}>
                  {f.icon && <f.icon className="h-3 w-3" />}{f.label}
                </NeoButton>
              ))}
            </div>

            {/* Stats Clickeables */}
            <div className="flex items-center gap-3 text-sm">
              {[
                { id: 'total', label: 'Total', value: stats.total, icon: Target, color: neo.accent },
                { id: 'activas', label: 'Activas', value: stats.activas, icon: Play, color: '#22c55e' },
                { id: 'planificando', label: 'Planificando', value: stats.planificando, icon: Clock, color: '#f59e0b' },
                { id: 'alertas', label: 'Alertas', value: stats.alertas, icon: AlertTriangle, color: '#ef4444' },
                { id: 'valor', label: 'Valor', value: formatMoney(stats.valorTotal), icon: DollarSign, color: '#14b8a6' }
              ].map(s => (
                <button key={s.id} onClick={() => setStatsExpandido(statsExpandido === s.id ? null : s.id)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all"
                  style={statsExpandido === s.id
                    ? { background: neo.base, boxShadow: `inset 2px 2px 5px ${neo.dark},inset -2px -2px 5px ${neo.light}` }
                    : { background: neo.base, boxShadow: `2px 2px 5px ${neo.dark},-2px -2px 5px ${neo.light}` }
                  }>
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                  <span className="font-black" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[11px] font-bold" style={{ color: neo.textSub }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Expandido */}
          <AnimatePresence>
            {statsExpandido && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="mt-3 p-4 rounded-2xl" style={{ background: `${neo.accent}10`, border: `1px solid ${neo.accent}30` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wider" style={{ color: neo.accent }}>Detalle: {statsExpandido}</h4>
                      <p className="text-xs font-semibold mt-1" style={{ color: neo.text }}>
                        {statsExpandido === 'valor' && `Valor total: ${formatMoney(stats.valorTotal)} • Promedio: ${formatMoney(stats.valorTotal / stats.total)}`}
                        {statsExpandido === 'activas' && `${stats.activas} campañas ejecutando • Cumplimiento promedio: ${stats.cumplimientoPromedio}%`}
                        {statsExpandido === 'alertas' && `${stats.alertas} campañas requieren atención inmediata`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" style={{ color: '#22c55e' }} />
                      <span className="font-black" style={{ color: '#22c55e' }}>+12%</span>
                      <span className="text-xs font-bold" style={{ color: neo.textSub }}>vs mes anterior</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </NeoCard>

        {/* ================================================================
            ACCESOS RÁPIDOS A SUB-MÓDULOS
        ================================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Nueva', icon: Plus, href: '/campanas/crear', color: neo.accent },
            { label: 'Programación', icon: CalendarDays, href: '/campanas/programacion-tier0', color: '#22c55e' },
            { label: 'Rechazadas', icon: Zap, href: '/campanas/rechazadas', color: '#ef4444' },
            { label: 'Confirmaciones', icon: FileCheck2, href: '/campanas/confirmaciones', color: '#3b82f6' },
            { label: 'Historial', icon: History, href: '/campanas/historial', color: '#a855f7' },
            { label: 'Observaciones', icon: MessageSquare, href: '/campanas/observaciones', color: '#f59e0b' },
            { label: 'Facturación', icon: Receipt, href: '/campanas/facturacion', color: '#14b8a6' },
            { label: 'Dashboard IA', icon: Brain, href: '/campanas/dashboard-ejecutivo', color: '#ec4899' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{ background: neo.base, boxShadow: `6px 6px 12px ${neo.dark},-6px -6px 12px ${neo.light}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${neo.dark},-3px -3px 6px ${neo.light}` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `6px 6px 12px ${neo.dark},-6px -6px 12px ${neo.light}` }}
            >
              <div className="p-2 rounded-xl" style={{ background: neo.base, boxShadow: `4px 4px 8px ${neo.dark},-4px -4px 8px ${neo.light}` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: neo.text }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ================================================================
            ACCIONES EN LOTE
        ================================================================ */}
        <AnimatePresence>
          {seleccionados.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <NeoCard className="border-l-4" style={{ borderLeftColor: '#a855f7' }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5" style={{ color: '#a855f7' }} />
                    <span className="font-black text-sm" style={{ color: neo.text }}>{seleccionados.size} seleccionadas</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <NeoButton variant="secondary" size="sm" onClick={() => setMostrarExport(true)}>
                      <Download className="h-4 w-4" /> Exportar
                    </NeoButton>
                    <NeoButton variant="secondary" size="sm" onClick={() => alert('Duplicando campañas seleccionadas...')}>
                      <Copy className="h-4 w-4" /> Duplicar
                    </NeoButton>
                    <NeoButton variant="secondary" size="sm" onClick={() => alert('Modal de asignación de usuarios...')}>
                      <UserPlus className="h-4 w-4" /> Asignar
                    </NeoButton>
                    <NeoButton variant="danger" size="sm" onClick={() => { if(confirm('¿Seguro que desea eliminar las campañas seleccionadas?')) setSeleccionados(new Set()); }}>
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </NeoButton>
                    <div className="h-6 w-px" style={{ background: neo.dark }} />
                    <NeoButton variant="ghost" size="sm" onClick={() => setSeleccionados(new Set())}>
                      <X className="h-4 w-4" /> Cancelar
                    </NeoButton>
                  </div>
                </div>
              </NeoCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================
            CONTENIDO PRINCIPAL — TABLA O CARDS
        ================================================================ */}
        <div className="flex gap-4 relative">
          {/* Tabla/Cards Principal */}
          <NeoCard padding="none" className={`flex-1 transition-all duration-300 ${quickViewCampana ? 'mr-[440px]' : ''}`}>
            <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: `${neo.dark}40` }}>
              <h3 className="flex items-center gap-2 text-sm font-black" style={{ color: neo.text }}>
                <BarChart3 className="h-5 w-5" style={{ color: neo.accent }} />
                {vistaActiva === 'tabla' ? 'Tabla' : 'Cards'} · {campanasFiltradas.length} resultados
              </h3>
              <div className="flex items-center gap-2">
                <NeoCheckbox
                  checked={seleccionados.size === campanasFiltradas.length && campanasFiltradas.length > 0 ? true : false}
                  onCheckedChange={() => toggleSeleccionarTodos()}
                />
                <span className="text-xs font-bold" style={{ color: neo.textSub }}>Seleccionar todos</span>
              </div>
            </div>

            {vistaActiva === 'tabla' ? (
              /* ================ VISTA TABLA ================ */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${neo.dark}40` }}>
                      <th className="px-3 py-3 w-10">
                        <NeoCheckbox
                          checked={seleccionados.size === campanasFiltradas.length && campanasFiltradas.length > 0 ? true : false}
                          onCheckedChange={() => toggleSeleccionarTodos()}
                        />
                      </th>
                      <th className="px-2 py-3 w-10">⭐</th>
                      {columnasVisibles.map(col => (
                        <th key={col.id}
                          className="px-3 py-3 text-left font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
                          style={{ color: neo.text, width: col.width }}
                          onClick={() => handleSort(col.id as SortField)}>
                          <div className="flex items-center gap-1">
                            {col.label}{getSortIcon(col.id)}
                          </div>
                        </th>
                      ))}
                      <th className="px-2 py-3 w-20 text-xs font-black uppercase" style={{ color: neo.text }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campanasFiltradas.map((campana, index) => (
                      <tr key={campana.id}
                        className="border-b transition-colors cursor-pointer"
                        style={{
                          background: index % 2 === 0 ? 'transparent' : `${neo.dark}10`,
                          borderColor: `${neo.dark}25`,
                          borderLeft: campana.alertas > 0 ? `4px solid #ef4444` : '4px solid transparent',
                        }}
                        onContextMenu={e => handleContextMenu(e, campana.id)}>
                        <td className="px-3 py-3">
                          <NeoCheckbox checked={seleccionados.has(campana.id)} onCheckedChange={() => toggleSeleccion(campana.id)} />
                        </td>
                        <td className="px-2 py-3">
                          <button onClick={() => toggleFavorito(campana.id)}
                            className="p-1 rounded-lg transition-all"
                            style={{ background: neo.base, boxShadow: `2px 2px 4px ${neo.dark},-2px -2px 4px ${neo.light}` }}>
                            <Star className={`h-4 w-4 ${campana.favorito ? 'fill-yellow-400 text-yellow-400' : ''}`} style={{ color: campana.favorito ? '#f59e0b' : neo.textSub }} />
                          </button>
                        </td>
                        {columnasVisibles.map(col => (
                          <td key={col.id} className="px-3 py-3" style={{ maxWidth: col.width }}>
                            {col.id === 'numeroCampana' && (
                              <div>
                                <span className="font-mono font-black cursor-pointer hover:underline"
                                  style={{ color: neo.accent }}
                                  onClick={() => navegarACampana(campana.id)}>{campana.numeroCampana}</span>
                                {campana.alertas > 0 && <NeoBadge color="red">🔔{campana.alertas}</NeoBadge>}
                              </div>
                            )}
                            {col.id === 'numeroContrato' && (
                              <a href={`/contratos/${campana.numeroContrato}`} className="font-mono hover:underline" style={{ color: '#a855f7' }}>{campana.numeroContrato}</a>
                            )}
                            {col.id === 'estado' && estadoBadgeNeo(campana.estado)}
                            {col.id === 'anunciante' && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 shrink-0" style={{ color: neo.textSub }} />
                                <span className="font-bold truncate" style={{ color: neo.text }}>{campana.anunciante}</span>
                              </div>
                            )}
                            {col.id === 'referencia' && <span className="font-mono text-[11px]" style={{ color: neo.textSub }}>{campana.referencia}</span>}
                            {col.id === 'nombreCampana' && (
                              <div>
                                <div className="font-bold truncate" style={{ color: neo.text }}>{campana.nombreCampana}</div>
                                <div className="text-[11px] font-semibold" style={{ color: neo.textSub }}>{campana.tipoPedido}</div>
                              </div>
                            )}
                            {col.id === 'nombreProducto' && <span className="truncate" style={{ color: neo.text }}>{campana.nombreProducto}</span>}
                            {col.id === 'valorNeto' && <span className="font-black" style={{ color: '#22c55e' }}>{formatMoney(campana.valorNeto)}</span>}
                            {col.id === 'fechaInicio' && <span className="text-xs font-semibold" style={{ color: neo.text }}>{formatFecha(campana.fechaInicio)}</span>}
                            {col.id === 'fechaTermino' && <span className="text-xs font-semibold" style={{ color: neo.text }}>{formatFecha(campana.fechaTermino)}</span>}
                            {col.id === 'cantidadCunas' && <NeoBadge color="purple"><Radio className="h-3 w-3 mr-1" />{campana.cantidadCunas}</NeoBadge>}
                            {col.id === 'tipoPedido' && <span className="text-xs" style={{ color: neo.text }}>{campana.tipoPedido}</span>}
                            {col.id === 'vendedor' && <span className="text-xs font-semibold" style={{ color: neo.text }}>👤 {campana.vendedor}</span>}
                            {col.id === 'agenciaCreativa' && <span className="text-xs" style={{ color: neo.text }}>{campana.agenciaCreativa}</span>}
                            {col.id === 'agenciaMedios' && <span className="text-xs" style={{ color: neo.text }}>{campana.agenciaMedios}</span>}
                            {col.id === 'usuario' && <NeoBadge color="gray">{campana.usuario}</NeoBadge>}
                          </td>
                        ))}
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <NeoButton variant="secondary" size="icon" className="!w-7 !h-7"
                              onClick={e => { e.stopPropagation(); setQuickViewCampana(campana) }}>
                              <Eye className="h-4 w-4" style={{ color: neo.textSub }} />
                            </NeoButton>
                            <NeoButton variant="secondary" size="icon" className="!w-7 !h-7"
                              onClick={() => navegarACampana(campana.id)}>
                              <ExternalLink className="h-4 w-4" style={{ color: neo.textSub }} />
                            </NeoButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ================ VISTA CARDS ================ */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {campanasFiltradas.map(campana => (
                  <div key={campana.id}
                    className="cursor-pointer transition-all rounded-2xl p-4"
                    style={{
                      background: neo.base,
                      boxShadow: seleccionados.has(campana.id) ? `inset 3px 3px 6px ${neo.dark},inset -3px -3px 6px ${neo.light}` : `4px 4px 8px ${neo.dark},-4px -4px 8px ${neo.light}`,
                      borderLeft: campana.alertas > 0 ? `4px solid #ef4444` : undefined,
                    }}
                    onClick={() => navegarACampana(campana.id)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <NeoCheckbox checked={seleccionados.has(campana.id)} onCheckedChange={() => toggleSeleccion(campana.id)} />
                        <span className="font-mono font-black" style={{ color: neo.accent }}>{campana.numeroCampana}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); toggleFavorito(campana.id) }}
                          className="p-1 rounded-lg transition-all"
                          style={{ background: neo.base, boxShadow: `2px 2px 4px ${neo.dark},-2px -2px 4px ${neo.light}` }}>
                          <Star className={`h-4 w-4 ${campana.favorito ? 'fill-yellow-400 text-yellow-400' : ''}`} style={{ color: campana.favorito ? '#f59e0b' : neo.textSub }} />
                        </button>
                        {estadoBadgeNeo(campana.estado)}
                      </div>
                    </div>
                    <h3 className="font-bold mb-1" style={{ color: neo.text }}>{campana.nombreCampana}</h3>
                    <p className="text-sm mb-2 flex items-center gap-1" style={{ color: neo.textSub }}>
                      <Building2 className="h-3 w-3" /> {campana.anunciante}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black" style={{ color: '#22c55e' }}>{formatMoney(campana.valorNeto)}</span>
                      <span className="text-xs font-semibold" style={{ color: neo.textSub }}>👤 {campana.vendedor}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span style={{ color: neo.textSub }}>📅 {formatFecha(campana.fechaInicio)} - {formatFecha(campana.fechaTermino)}</span>
                      <NeoBadge color="purple"><Radio className="h-2 w-2 mr-1" />{campana.cantidadCunas}</NeoBadge>
                    </div>
                    {campana.alertas > 0 && (
                      <NeoBadge color="red" className="mt-2">🔔 {campana.alertas} alertas</NeoBadge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {campanasFiltradas.length === 0 && (
              <div className="text-center py-16">
                <Target className="h-16 w-16 mx-auto mb-4" style={{ color: neo.textSub }} />
                <h3 className="text-xl font-black mb-2" style={{ color: neo.textSub }}>No se encontraron campañas</h3>
                <NeoButton variant="primary" onClick={() => { setSearchTerm(''); setFiltroActivo('todas') }}>Limpiar filtros</NeoButton>
              </div>
            )}
          </NeoCard>

          {/* ================================================================
              QUICK VIEW — Ventana Flotante OS
          ================================================================ */}
          <AnimatePresence>
            {quickViewCampana && (
              <FloatWindow title="Vista Rápida" onClose={() => setQuickViewCampana(null)}>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-lg" style={{ color: neo.accent }}>{quickViewCampana.numeroCampana}</span>
                      {estadoBadgeNeo(quickViewCampana.estado)}
                    </div>
                    <h3 className="font-black text-xl" style={{ color: neo.text }}>{quickViewCampana.nombreCampana}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl" style={{ background: neo.base, boxShadow: `inset 3px 3px 6px ${neo.dark},inset -3px -3px 6px ${neo.light}` }}>
                      <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: neo.textSub }}>Anunciante</div>
                      <div className="font-bold" style={{ color: neo.text }}>{quickViewCampana.anunciante}</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: neo.base, boxShadow: `inset 3px 3px 6px ${neo.dark},inset -3px -3px 6px ${neo.light}` }}>
                      <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: neo.textSub }}>Producto</div>
                      <div className="font-bold" style={{ color: neo.text }}>{quickViewCampana.nombreProducto}</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: neo.base, boxShadow: `inset 3px 3px 6px ${neo.dark},inset -3px -3px 6px ${neo.light}` }}>
                      <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: neo.textSub }}>Valor Neto</div>
                      <div className="font-black text-lg" style={{ color: '#22c55e' }}>{formatMoney(quickViewCampana.valorNeto)}</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: neo.base, boxShadow: `inset 3px 3px 6px ${neo.dark},inset -3px -3px 6px ${neo.light}` }}>
                      <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: neo.textSub }}>Cuñas</div>
                      <div className="font-black text-lg" style={{ color: neo.accent }}>{quickViewCampana.cantidadCunas}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span style={{ color: neo.textSub }}>Contrato:</span><a href="#" className="font-mono" style={{ color: '#a855f7' }}>{quickViewCampana.numeroContrato}</a></div>
                    <div className="flex justify-between"><span style={{ color: neo.textSub }}>Tipo:</span><span style={{ color: neo.text }}>{quickViewCampana.tipoPedido}</span></div>
                    <div className="flex justify-between"><span style={{ color: neo.textSub }}>Vendedor:</span><span style={{ color: neo.text }}>👤 {quickViewCampana.vendedor}</span></div>
                    <div className="flex justify-between"><span style={{ color: neo.textSub }}>Inicio:</span><span style={{ color: neo.text }}>📅 {formatFecha(quickViewCampana.fechaInicio)}</span></div>
                    <div className="flex justify-between"><span style={{ color: neo.textSub }}>Término:</span><span style={{ color: neo.text }}>📅 {formatFecha(quickViewCampana.fechaTermino)}</span></div>
                  </div>

                  {quickViewCampana.cumplimiento > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: neo.textSub }}>Cumplimiento</span>
                        <span className="font-black">{quickViewCampana.cumplimiento}%</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ background: neo.base, boxShadow: `inset 2px 2px 4px ${neo.dark},inset -2px -2px 4px ${neo.light}` }}>
                        <div className="h-2 rounded-full transition-all"
                          style={{
                            width: `${quickViewCampana.cumplimiento}%`,
                            background: quickViewCampana.cumplimiento >= 80 ? '#22c55e' : quickViewCampana.cumplimiento >= 50 ? '#f59e0b' : '#ef4444',
                          }} />
                      </div>
                    </div>
                  )}

                  {quickViewCampana.alertas > 0 && (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" style={{ color: '#ef4444' }} />
                        <span className="font-black text-sm" style={{ color: '#ef4444' }}>{quickViewCampana.alertas} Alertas activas</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <NeoButton variant="primary" className="flex-1" onClick={() => navegarACampana(quickViewCampana.id)}>
                      <ExternalLink className="h-4 w-4 mr-2" /> Abrir
                    </NeoButton>
                    <NeoButton variant="secondary" onClick={() => toggleFavorito(quickViewCampana.id)}>
                      <Star className={`h-4 w-4 ${quickViewCampana.favorito ? 'fill-yellow-400 text-yellow-400' : ''}`} style={{ color: quickViewCampana.favorito ? '#f59e0b' : neo.textSub }} />
                    </NeoButton>
                  </div>
                </div>
              </FloatWindow>
            )}
          </AnimatePresence>
        </div>

        {/* ================================================================
            MODAL ATAJOS DE TECLADO — Ventana Flotante OS
        ================================================================ */}
        <AnimatePresence>
          {mostrarShortcuts && (
            <FloatWindow title="Atajos de Teclado" onClose={() => setMostrarShortcuts(false)}>
              <div className="space-y-3">
                {[
                  { keys: 'Ctrl + N', desc: 'Nueva campaña' },
                  { keys: 'Ctrl + F', desc: 'Buscar' },
                  { keys: 'Ctrl + A', desc: 'Seleccionar todos' },
                  { keys: 'Esc', desc: 'Limpiar / Cerrar' },
                  { keys: '?', desc: 'Mostrar atajos' }
                ].map(s => (
                  <div key={s.keys} className="flex items-center justify-between py-1">
                    <span className="text-xs font-bold" style={{ color: neo.text }}>{s.desc}</span>
                    <kbd className="px-2 py-1 rounded-lg text-xs font-mono font-black"
                      style={{ background: neo.base, boxShadow: `inset 2px 2px 4px ${neo.dark},inset -2px -2px 4px ${neo.light}`, color: neo.accent }}>{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </FloatWindow>
          )}
        </AnimatePresence>

        {/* ================================================================
            COMPONENTES ENTERPRISE
        ================================================================ */}
        <ContextMenuCampana
          campanaId={contextMenu?.id || null}
          position={contextMenu?.pos || null}
          onClose={closeContextMenu}
          onAction={(action, id) => {
            if (action === 'open') navegarACampana(id)
            if (action === 'quickview') {
              const c = campanas.find(x => x.id === id)
              if (c) setQuickViewCampana(c)
            }
            if (action === 'favorite') toggleFavorito(id)
            if (action === 'duplicate') {
              enviarNotificacion({ type: 'success', title: 'Duplicado', message: `Campaña ${id} duplicada` })
            }
          }}
          isFavorito={campanas.find(c => c.id === contextMenu?.id)?.favorito}
        />

        <ExportManager
          items={seleccionados.size > 0
            ? campanasFiltradas.filter(c => seleccionados.has(c.id))
            : campanasFiltradas
          }
          isOpen={mostrarExport}
          onClose={() => setMostrarExport(false)}
        />

        {mostrarNotificaciones && (
          <div className="fixed top-20 right-8 z-50">
            <NotificationCenter
              notifications={notifications}
              onMarkRead={marcarLeida}
              onMarkAllRead={marcarTodasLeidas}
              onDelete={eliminar}
              isOpen={mostrarNotificaciones}
              onClose={() => setMostrarNotificaciones(false)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs font-bold" style={{ color: neo.textSub }}>
            CENTRO DE COMANDO CAMPAÑAS ENTERPRISE 250+ · Powered by Cortex-Scheduler
          </p>
          <p className="text-[10px] mt-1 font-semibold" style={{ color: neo.textSub }}>
            Tema: {isDark ? '🌙 Oscuro' : '☀️ Claro'} · Click Derecho: Menú Contextual · Notificaciones: {noLeidas} sin leer
          </p>
        </div>
      </div>
    </div>
  )
}
