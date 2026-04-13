/**
 * 🎯 CENTRO DE COMANDO CAMPAÑAS - SILEXAR PULSE ENTERPRISE 2050
 * 
 * Listado Inteligente de Campañas con características Enterprise.
 * Lógica de negocio extraída a _lib/ para modularización.
 * 
 * @version 2050.3.0 — Refactorizado
 * @tier TIER_0_FORTUNE_10
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Target, Play, AlertTriangle, Clock, BarChart3,
  Search, Plus, FileText, Brain, User, Bell, 
  Download, RefreshCw, Settings,
  Building2, DollarSign, Radio, Star, Eye,
  ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, LayoutList,
  X, Columns, Save, Bookmark, History, Keyboard, Copy,
  Trash2, UserPlus, CheckSquare, ExternalLink,
  TrendingUp, Moon, Sun
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { ContextMenuCampana, useContextMenu } from '@/components/campanas/ContextMenuCampana'
import { ExportManager } from '@/components/campanas/ExportManager'
import { useNotifications, NotificationCenter } from '@/components/campanas/NotificationSystem'

// Módulos extraídos
import type { CampanaListado, SortField } from './_lib/types'
import { formatFecha, formatMoney, getEstadoBadge } from './_lib/helpers'
import { useCampanas } from './_lib/useCampanas'


// ============================================================================
// COMPONENT
// ============================================================================

export default function CampanasPage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Hook centralizado — toda la lógica de estado extraída a _lib/useCampanas
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

  // Estado UI (paneles, modales, notificaciones)
  const [mostrarColumnas, setMostrarColumnas] = useState(false)
  const [quickViewCampana, setQuickViewCampana] = useState<CampanaListado | null>(null)
  const [mostrarFiltrosGuardados, setMostrarFiltrosGuardados] = useState(false)
  const [mostrarShortcuts, setMostrarShortcuts] = useState(false)
  const [statsExpandido, setStatsExpandido] = useState<string | null>(null)
  const [mostrarExport, setMostrarExport] = useState(false)
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  
  // Hooks Enterprise
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

  // Helper de navegación
  const navegarACampana = (id: string) => { agregarHistorial(id); router.push(`/campanas/${id}`) }

  // Sort Icon helper
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    if (sortDirection === 'asc') return <ArrowUp className="h-3 w-3 text-blue-600" />
    return <ArrowDown className="h-3 w-3 text-blue-600" />
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) return (
    <div className="min-h-screen bg-[#F0EDE8] p-6">
      <div className="max-w-[1900px] mx-auto space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={`skeleton-${i}`} className="h-16 animate-pulse bg-[#E8E5E0] rounded-xl shadow-[inset_3px_3px_8px_#D4D1CC,inset_-3px_-3px_8px_#FFFFFF]" />
        ))}
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 flex items-center justify-center">
      <div className="text-center p-8 bg-[#F5F2EE] rounded-2xl shadow-[6px_6px_14px_#D4D1CC,-6px_-6px_14px_#FFFFFF]">
        <AlertTriangle className="h-12 w-12 text-[#A32D2D] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#2C2C2A] mb-2">Error al cargar campañas</h2>
        <p className="text-[#5F5E5A] mb-4">No fue posible obtener los datos. Por favor intenta nuevamente.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl font-medium text-white bg-[#1D5AE8] shadow-[4px_4px_10px_#D4D1CC,-4px_-4px_10px_#FFFFFF] hover:brightness-105 transition-all duration-150"
        >
          Reintentar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 p-6">
      <div className="max-w-[1900px] mx-auto space-y-4">
        
        {/* ================================================================
            HEADER CON ACCIONES ENTERPRISE
        ================================================================ */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    🎯 CENTRO DE COMANDO CAMPAÑAS
                  </CardTitle>
                  <p className="text-gray-500 text-sm">TIER0 Enterprise 2050 • Cortex-Scheduler • <kbd className="px-1 bg-gray-100 rounded text-xs">?</kbd> Atajos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Historial Reciente */}
                <div className="flex items-center gap-1 mr-4">
                  <History className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Recientes:</span>
                  {historialReciente.slice(0, 3).map(id => {
                    const c = campanas.find(x => x.id === id)
                    return c ? (
                      <Button 
                        key={id} 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => navegarACampana(id)}
                      >
                        {c.numeroCampana}
                      </Button>
                    ) : null
                  })}
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Real-Time
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Botones de Acción */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => router.push('/campanas/crear')}>
                <Plus className="h-4 w-4" /> Nueva <kbd className="ml-1 text-[10px] opacity-70">Ctrl+N</kbd>
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => router.push('/campanas/crear?from=contrato')}>
                <FileText className="h-4 w-4" /> Desde Contrato
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => router.push('/campanas/dashboard-ejecutivo')}>
                <Brain className="h-4 w-4" /> Dashboard IA
              </Button>
              
              <div className="h-6 w-px bg-gray-200 mx-2" />
              
              {/* Toggle Vista */}
              <div className="flex items-center gap-1 bg-white/50 p-1 rounded-xl shadow-inner border border-white/60">
                <Button 
                  variant={vistaActiva === 'tabla' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`rounded-lg ${vistaActiva === 'tabla' ? 'bg-blue-600 shadow-md shadow-blue-200/50' : ''}`}
                  onClick={() => setVistaActiva('tabla')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button 
                  variant={vistaActiva === 'cards' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`rounded-lg ${vistaActiva === 'cards' ? 'bg-blue-600 shadow-md shadow-blue-200/50' : ''}`}
                  onClick={() => setVistaActiva('cards')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              {/* Columnas */}
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setMostrarColumnas(!mostrarColumnas)}>
                  <Columns className="h-4 w-4 mr-1" /> Columnas
                </Button>
                {mostrarColumnas && (
                  <div className="absolute top-full mt-1 left-0 bg-white border rounded-lg shadow-xl z-50 p-3 w-64">
                    <h4 className="font-semibold text-sm mb-2">Columnas visibles</h4>
                    <div className="space-y-1 max-h-64 overflow-auto">
                      {columnas.map(col => (
                        <label key={col.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <Checkbox checked={col.visible} onCheckedChange={() => toggleColumna(col.id)} />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filtros Guardados */}
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setMostrarFiltrosGuardados(!mostrarFiltrosGuardados)}>
                  <Bookmark className="h-4 w-4 mr-1" /> Filtros
                </Button>
                {mostrarFiltrosGuardados && (
                  <div className="absolute top-full mt-1 left-0 bg-white border rounded-lg shadow-xl z-50 p-3 w-72">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Filtros guardados</h4>
                      <Button variant="ghost" size="sm" onClick={guardarFiltroActual}>
                        <Save className="h-3 w-3 mr-1" /> Guardar actual
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {filtrosGuardados.map(f => (
                        <Button 
                          key={f.id} 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => aplicarFiltroGuardado(f)}
                        >
                          {f.nombre}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1" />
              
              <Button variant="ghost" size="icon" onClick={() => setMostrarShortcuts(true)}>
                <Keyboard className="h-4 w-4" />
              </Button>
              
              {/* Toggle Dark Mode */}
              <Button variant="ghost" size="icon" onClick={toggleTheme} title="Cambiar tema">
                {isDark ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {/* Notificaciones */}
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}>
                  <Bell className="h-4 w-4" />
                  {noLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {noLeidas}
                    </span>
                  )}
                </Button>
              </div>
              
              <Button variant="ghost" size="icon" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" /></Button>
              
              {/* Export */}
              <Button variant="ghost" size="icon" onClick={() => setMostrarExport(true)} title="Exportar">
                <Download className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => router.push('/configuracion')}><Settings className="h-4 w-4" /></Button>
            </div>

            {/* Búsqueda Inteligente */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="🔍 Buscar: 'Banco Chile', '>$3M', 'ejecutando', 'Ana García'... (Ctrl+F)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-11 text-base border-2 border-gray-200 focus:border-blue-400"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filtros IA + Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">🤖 Filtros:</span>
                {[
                  { id: 'todas', label: 'Todas', icon: null },
                  { id: 'mis', label: 'Mis Campañas', icon: User },
                  { id: 'activas', label: 'Activas', icon: Play },
                  { id: 'atencion', label: 'Atención', icon: Bell },
                  { id: 'favoritos', label: 'Favoritos', icon: Star }
                ].map(f => (
                  <Button 
                    key={f.id}
                    variant={filtroActivo === f.id ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFiltroActivo(f.id)}
                    className={filtroActivo === f.id ? 'bg-blue-600' : ''}
                  >
                    {f.icon && <f.icon className="h-3 w-3 mr-1" />}
                    {f.label}
                  </Button>
                ))}
              </div>

              {/* Stats Clickeables */}
              <div className="flex items-center gap-3 text-sm">
                {[
                  { id: 'total', label: 'Total', value: stats.total, icon: Target, color: 'blue' },
                  { id: 'activas', label: 'Activas', value: stats.activas, icon: Play, color: 'green' },
                  { id: 'planificando', label: 'Planificando', value: stats.planificando, icon: Clock, color: 'yellow' },
                  { id: 'alertas', label: 'Alertas', value: stats.alertas, icon: AlertTriangle, color: 'red' },
                  { id: 'valor', label: 'Valor', value: formatMoney(stats.valorTotal), icon: DollarSign, color: 'emerald' }
                ].map(s => (
                  <div 
                    key={s.id}
                    className={`flex items-center gap-1 cursor-pointer hover:opacity-80 ${statsExpandido === s.id ? 'ring-2 ring-blue-300 rounded px-1' : ''}`}
                    onClick={() => setStatsExpandido(statsExpandido === s.id ? null : s.id)}
                  >
                    <s.icon className={`h-4 w-4 text-${s.color}-600`} />
                    <span className={`font-semibold text-${s.color}-600`}>{s.value}</span>
                    <span className="text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Expandido */}
            {statsExpandido && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">📊 Detalle: {statsExpandido}</h4>
                    <p className="text-sm text-blue-700">
                      {statsExpandido === 'valor' && `Valor total: ${formatMoney(stats.valorTotal)} • Promedio: ${formatMoney(stats.valorTotal / stats.total)}`}
                      {statsExpandido === 'activas' && `${stats.activas} campañas ejecutando actualmente • Cumplimiento promedio: ${stats.cumplimientoPromedio}%`}
                      {statsExpandido === 'alertas' && `${stats.alertas} campañas requieren atención inmediata`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-semibold">+12%</span>
                    <span className="text-gray-500 text-sm">vs mes anterior</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================
            ACCIONES EN LOTE (cuando hay seleccionados)
        ================================================================ */}
        {seleccionados.size > 0 && (
          <Card className="border-2 border-purple-200 bg-purple-50 animate-in fade-in slide-in-from-top-2">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">{seleccionados.size} seleccionadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setMostrarExport(true)}>
                    <Download className="h-4 w-4" /> Exportar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => alert('Duplicando campañas seleccionadas...')}>
                    <Copy className="h-4 w-4" /> Duplicar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => alert('Modal de asignación de usuarios...')}>
                    <UserPlus className="h-4 w-4" /> Asignar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700" onClick={() => { if(confirm('¿Seguro que desea eliminar las campañas seleccionadas?')) setSeleccionados(new Set()); }}>
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                  <div className="h-6 w-px bg-purple-200 mx-2" />
                  <Button variant="ghost" size="sm" onClick={() => setSeleccionados(new Set())}>
                    <X className="h-4 w-4" /> Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================================================================
            CONTENIDO PRINCIPAL - TABLA O CARDS
        ================================================================ */}
        <div className="flex gap-4">
          {/* Tabla/Cards Principal */}
          <Card className={`shadow-lg flex-1 ${quickViewCampana ? 'w-2/3' : 'w-full'}`}>
            <CardHeader className="border-b bg-slate-50/50 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  {vistaActiva === 'tabla' ? '📊 Tabla' : '📇 Cards'} • {campanasFiltradas.length} resultados
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={seleccionados.size === campanasFiltradas.length && campanasFiltradas.length > 0}
                    onCheckedChange={() => toggleSeleccionarTodos()}
                  />
                  <span className="text-sm text-gray-500">Seleccionar todos</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {vistaActiva === 'tabla' ? (
                /* ================ VISTA TABLA ================ */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b-2 border-slate-200">
                      <tr>
                        <th className="px-2 py-3 w-10">
                          <Checkbox 
                            checked={seleccionados.size === campanasFiltradas.length && campanasFiltradas.length > 0}
                            onCheckedChange={() => toggleSeleccionarTodos()}
                          />
                        </th>
                        <th className="px-2 py-3 w-10">⭐</th>
                        {columnasVisibles.map(col => (
                          <th 
                            key={col.id}
                            className="px-3 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-slate-200 transition-colors"
                            style={{ width: col.width }}
                            onClick={() => handleSort(col.id as SortField)}
                          >
                            <div className="flex items-center gap-1">
                              {col.label}
                              {getSortIcon(col.id)}
                            </div>
                          </th>
                        ))}
                        <th className="px-2 py-3 w-20">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campanasFiltradas.map((campana, index) => (
                        <tr 
                          key={campana.id}
                          className={`
                            border-b hover:bg-blue-50/50 transition-colors cursor-pointer
                            ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}
                            ${campana.alertas > 0 ? 'border-l-4 border-l-red-400' : ''}
                            ${seleccionados.has(campana.id) ? 'bg-purple-50 dark:bg-purple-900/30' : ''}
                          `}
                          onContextMenu={(e) => handleContextMenu(e, campana.id)}
                        >
                          <td className="px-2 py-3">
                            <Checkbox 
                              checked={seleccionados.has(campana.id)}
                              onCheckedChange={() => toggleSeleccion(campana.id)}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => toggleFavorito(campana.id)}
                            >
                              <Star className={`h-4 w-4 ${campana.favorito ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </Button>
                          </td>
                          
                          {columnasVisibles.map(col => (
                            <td key={col.id} className="px-3 py-3" style={{ maxWidth: col.width }}>
                              {col.id === 'numeroCampana' && (
                                <div>
                                  <span 
                                    className="font-mono font-semibold text-blue-700 cursor-pointer hover:underline"
                                    onClick={() => navegarACampana(campana.id)}
                                  >
                                    {campana.numeroCampana}
                                  </span>
                                  {campana.alertas > 0 && (
                                    <Badge variant="destructive" className="text-xs ml-1">🔔{campana.alertas}</Badge>
                                  )}
                                </div>
                              )}
                              {col.id === 'numeroContrato' && (
                                <a href={`/contratos/${campana.numeroContrato}`} className="font-mono text-purple-600 hover:underline">
                                  {campana.numeroContrato}
                                </a>
                              )}
                              {col.id === 'estado' && getEstadoBadge(campana.estado)}
                              {col.id === 'anunciante' && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-gray-400" />
                                  <span className="font-semibold truncate">{campana.anunciante}</span>
                                </div>
                              )}
                              {col.id === 'referencia' && <span className="text-gray-500 font-mono text-xs">{campana.referencia}</span>}
                              {col.id === 'nombreCampana' && (
                                <div>
                                  <div className="font-medium truncate">{campana.nombreCampana}</div>
                                  <div className="text-xs text-gray-500">{campana.tipoPedido}</div>
                                </div>
                              )}
                              {col.id === 'nombreProducto' && <span className="text-gray-600 truncate">{campana.nombreProducto}</span>}
                              {col.id === 'valorNeto' && <span className="font-bold text-green-700">{formatMoney(campana.valorNeto)}</span>}
                              {col.id === 'fechaInicio' && <span className="text-sm">{formatFecha(campana.fechaInicio)}</span>}
                              {col.id === 'fechaTermino' && <span className="text-sm">{formatFecha(campana.fechaTermino)}</span>}
                              {col.id === 'cantidadCunas' && <Badge variant="secondary"><Radio className="h-3 w-3 mr-1" />{campana.cantidadCunas}</Badge>}
                              {col.id === 'tipoPedido' && <span className="text-sm">{campana.tipoPedido}</span>}
                              {col.id === 'vendedor' && <span className="text-sm">👤 {campana.vendedor}</span>}
                              {col.id === 'agenciaCreativa' && <span className="text-sm">{campana.agenciaCreativa}</span>}
                              {col.id === 'agenciaMedios' && <span className="text-sm">{campana.agenciaMedios}</span>}
                              {col.id === 'usuario' && <Badge variant="outline" className="text-xs">{campana.usuario}</Badge>}
                            </td>
                          ))}
                          
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); setQuickViewCampana(campana) }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => navegarACampana(campana.id)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* ================ VISTA CARDS ================ */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {campanasFiltradas.map(campana => (
                    <Card 
                      key={campana.id} 
                      className={`cursor-pointer hover:shadow-lg transition-all ${seleccionados.has(campana.id) ? 'ring-2 ring-purple-400' : ''} ${campana.alertas > 0 ? 'border-l-4 border-l-red-400' : ''}`}
                      onClick={() => navegarACampana(campana.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={seleccionados.has(campana.id)}
                              onCheckedChange={() => toggleSeleccion(campana.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-mono font-bold text-blue-700">{campana.numeroCampana}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleFavorito(campana.id) }}>
                              <Star className={`h-4 w-4 ${campana.favorito ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </Button>
                            {getEstadoBadge(campana.estado)}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{campana.nombreCampana}</h3>
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {campana.anunciante}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-green-700">{formatMoney(campana.valorNeto)}</span>
                          <span className="text-gray-500">👤 {campana.vendedor}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <span>📅 {formatFecha(campana.fechaInicio)} - {formatFecha(campana.fechaTermino)}</span>
                          <Badge variant="secondary" className="text-xs"><Radio className="h-2 w-2 mr-1" />{campana.cantidadCunas}</Badge>
                        </div>
                        {campana.alertas > 0 && (
                          <Badge variant="destructive" className="mt-2">🔔 {campana.alertas} alertas</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {campanasFiltradas.length === 0 && (
                <div className="text-center py-16">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No se encontraron campañas</h3>
                  <Button onClick={() => { setSearchTerm(''); setFiltroActivo('todas') }}>Limpiar filtros</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================================================================
              QUICK VIEW PANEL
          ================================================================ */}
          {quickViewCampana && (
            <Card className="w-96 shadow-xl animate-in slide-in-from-right-4 border-2 border-blue-200">
              <CardHeader className="border-b bg-blue-50 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Vista Rápida
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setQuickViewCampana(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-blue-700 text-lg">{quickViewCampana.numeroCampana}</span>
                    {getEstadoBadge(quickViewCampana.estado)}
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900">{quickViewCampana.nombreCampana}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Anunciante</div>
                    <div className="font-semibold">{quickViewCampana.anunciante}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Producto</div>
                    <div className="font-semibold">{quickViewCampana.nombreProducto}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Valor Neto</div>
                    <div className="font-bold text-green-700 text-lg">{formatMoney(quickViewCampana.valorNeto)}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Cuñas</div>
                    <div className="font-bold text-blue-700 text-lg">{quickViewCampana.cantidadCunas}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Contrato:</span><a href="#" className="text-purple-600">{quickViewCampana.numeroContrato}</a></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tipo:</span><span>{quickViewCampana.tipoPedido}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Vendedor:</span><span>👤 {quickViewCampana.vendedor}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Inicio:</span><span>📅 {formatFecha(quickViewCampana.fechaInicio)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Término:</span><span>📅 {formatFecha(quickViewCampana.fechaTermino)}</span></div>
                </div>

                {quickViewCampana.cumplimiento > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Cumplimiento</span>
                      <span className="font-semibold">{quickViewCampana.cumplimiento}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${quickViewCampana.cumplimiento >= 80 ? 'bg-green-500' : quickViewCampana.cumplimiento >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${quickViewCampana.cumplimiento}%` }}
                      />
                    </div>
                  </div>
                )}

                {quickViewCampana.alertas > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-semibold">{quickViewCampana.alertas} Alertas activas</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => navegarACampana(quickViewCampana.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" /> Abrir
                  </Button>
                  <Button variant="outline" onClick={() => toggleFavorito(quickViewCampana.id)}>
                    <Star className={`h-4 w-4 ${quickViewCampana.favorito ? 'fill-yellow-400' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ================================================================
            MODAL ATAJOS DE TECLADO
        ================================================================ */}
        {mostrarShortcuts && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setMostrarShortcuts(false)}>
            <Card className="w-96 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Atajos de Teclado
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setMostrarShortcuts(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { keys: 'Ctrl + N', desc: 'Nueva campaña' },
                  { keys: 'Ctrl + F', desc: 'Buscar' },
                  { keys: 'Ctrl + A', desc: 'Seleccionar todos' },
                  { keys: 'Esc', desc: 'Limpiar / Cerrar' },
                  { keys: '?', desc: 'Mostrar atajos' }
                ].map(s => (
                  <div key={s.keys} className="flex items-center justify-between">
                    <span className="text-gray-600">{s.desc}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{s.keys}</kbd>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================================================================
            COMPONENTES ENTERPRISE 250+
        ================================================================ */}
        
        {/* Context Menu */}
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

        {/* Export Manager */}
        <ExportManager
          items={seleccionados.size > 0 
            ? campanasFiltradas.filter(c => seleccionados.has(c.id))
            : campanasFiltradas
          }
          isOpen={mostrarExport}
          onClose={() => setMostrarExport(false)}
        />

        {/* Notification Center - posición relativa al botón Bell */}
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
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
          <p>🎯 CENTRO DE COMANDO CAMPAÑAS ENTERPRISE 250+ • Powered by Cortex-Scheduler</p>
          <p className="text-xs mt-1">
            Dark Mode: {isDark ? '🌙' : '☀️'} | Context Menu: Click Derecho | Notificaciones: {noLeidas} sin leer
          </p>
        </div>
      </div>
    </div>
  )
}
