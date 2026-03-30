/**
 * 🎯 SILEXAR PULSE — Campañas: Hook useCampanas
 * 
 * Hook personalizado que encapsula toda la lógica de estado,
 * filtrado, ordenamiento y acciones del módulo de campañas.
 * 
 * @module campanas/hooks
 * @version 2026.3.0
 */

'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import type {
  CampanaListado, ColumnConfig, FiltroGuardado,
  SortDirection, SortField, CampanasStats
} from './types'
import { mockCampanas, defaultColumns, defaultFiltrosGuardados } from './mock-data'
import apiClient from '@/lib/api/client'

export function useCampanas() {
  // Estado de datos — mock data como fallback hasta que lleguen datos reales
  const [campanas, setCampanas] = useState<CampanaListado[]>(mockCampanas)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // Fetch desde API real al montar
  const fetchCampanas = useCallback(async (params?: Record<string, string>) => {
    setIsLoading(true)
    setIsError(false)
    const { data, error } = await apiClient.get<CampanaListado[]>('/api/campanas', { params })
    setIsLoading(false)
    if (data && Array.isArray(data) && data.length > 0) {
      setCampanas(data)
    } else if (error && error.code !== 'SERVICE_UNAVAILABLE') {
      // Only set error for real errors, not "DB not connected" (expected in dev)
      setIsError(true)
    }
    // If 503 (no DB) or empty array: keep mock data in place silently
  }, [])

  useEffect(() => { fetchCampanas() }, [fetchCampanas])
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<string>('todas')
  
  // Estado de vista
  const [vistaActiva, setVistaActiva] = useState<'tabla' | 'cards'>('tabla')
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [columnas, setColumnas] = useState<ColumnConfig[]>(defaultColumns)
  const [filtrosGuardados, setFiltrosGuardados] = useState<FiltroGuardado[]>(defaultFiltrosGuardados)
  const [historialReciente, setHistorialReciente] = useState<string[]>(['cam-001', 'cam-004', 'cam-006'])

  // Filtrado y ordenamiento
  const campanasFiltradas = useMemo(() => {
    let resultado = [...campanas]

    // Favoritos primero
    resultado.sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0))

    // Filtro por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (term.startsWith('>$')) {
        const valor = parseFloat(term.replace('>$', '').replace('m', '')) * 1000000
        resultado = resultado.filter(c => c.valorNeto > valor)
      } else {
        resultado = resultado.filter(c =>
          c.numeroCampana.toLowerCase().includes(term) ||
          c.numeroContrato.toLowerCase().includes(term) ||
          c.anunciante.toLowerCase().includes(term) ||
          c.nombreCampana.toLowerCase().includes(term) ||
          c.vendedor.toLowerCase().includes(term) ||
          c.estado.toLowerCase().includes(term)
        )
      }
    }

    // Filtro por estado
    if (filtroActivo === 'mis') {
      resultado = resultado.filter(c => c.usuario === 'agarcia')
    } else if (filtroActivo === 'activas') {
      resultado = resultado.filter(c => c.estado === 'ejecutando' || c.estado === 'planificando')
    } else if (filtroActivo === 'atencion') {
      resultado = resultado.filter(c => c.alertas > 0)
    } else if (filtroActivo === 'favoritos') {
      resultado = resultado.filter(c => c.favorito)
    }

    // Ordenamiento
    if (sortField && sortDirection) {
      resultado.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        return 0
      })
    }

    return resultado
  }, [campanas, searchTerm, filtroActivo, sortField, sortDirection])

  // Estadísticas
  const stats: CampanasStats = useMemo(() => ({
    total: campanas.length,
    activas: campanas.filter(c => c.estado === 'ejecutando').length,
    planificando: campanas.filter(c => c.estado === 'planificando').length,
    alertas: campanas.filter(c => c.alertas > 0).length,
    valorTotal: campanas.reduce((sum, c) => sum + c.valorNeto, 0),
    favoritos: campanas.filter(c => c.favorito).length,
    cumplimientoPromedio: Math.round(campanas.reduce((sum, c) => sum + c.cumplimiento, 0) / campanas.length)
  }), [campanas])

  // Handlers
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null) }
      else setSortDirection('asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField, sortDirection])

  const toggleSeleccion = useCallback((id: string) => {
    setSeleccionados(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }, [])

  const toggleSeleccionarTodos = useCallback(() => {
    if (seleccionados.size === campanasFiltradas.length) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(campanasFiltradas.map(c => c.id)))
    }
  }, [seleccionados.size, campanasFiltradas])

  const toggleFavorito = useCallback((id: string) => {
    setCampanas(prev => prev.map(c => 
      c.id === id ? { ...c, favorito: !c.favorito } : c
    ))
  }, [])

  const toggleColumna = useCallback((id: string) => {
    setColumnas(prev => prev.map(col => 
      col.id === id ? { ...col, visible: !col.visible } : col
    ))
  }, [])

  const aplicarFiltroGuardado = useCallback((filtro: FiltroGuardado) => {
    setSearchTerm(filtro.filtros.searchTerm)
    setFiltroActivo(filtro.filtros.filtroActivo)
  }, [])

  const guardarFiltroActual = useCallback(() => {
    const nuevoFiltro: FiltroGuardado = {
      id: `fg-${Date.now()}`,
      nombre: `Filtro ${new Date().toLocaleDateString()}`,
      filtros: { searchTerm, filtroActivo }
    }
    setFiltrosGuardados(prev => [...prev, nuevoFiltro])
  }, [searchTerm, filtroActivo])

  const agregarHistorial = useCallback((id: string) => {
    setHistorialReciente(prev => [id, ...prev.filter(x => x !== id)].slice(0, 5))
  }, [])

  const columnasVisibles = columnas.filter(c => c.visible)

  return {
    // Datos
    campanas,
    campanasFiltradas,
    stats,
    columnas,
    columnasVisibles,
    filtrosGuardados,
    historialReciente,
    isLoading,
    isError,
    refresh: fetchCampanas,
    
    // Estado de búsqueda/filtro
    searchTerm,
    setSearchTerm,
    filtroActivo,
    setFiltroActivo,
    sortField,
    sortDirection,
    
    // Estado de vista
    vistaActiva,
    setVistaActiva,
    seleccionados,
    setSeleccionados,
    
    // Handlers
    handleSort,
    toggleSeleccion,
    toggleSeleccionarTodos,
    toggleFavorito,
    toggleColumna,
    aplicarFiltroGuardado,
    guardarFiltroActual,
    agregarHistorial,
  }
}
