/**
 * 🎯 SILEXAR PULSE — Campañas: Tipos e Interfaces
 * 
 * Tipos compartidos para el módulo de campañas.
 * Extraído de page.tsx para modularización.
 * 
 * @module campanas/types
 * @version 2026.3.0
 */

export interface CampanaListado {
  id: string
  numeroCampana: string
  numeroContrato: string
  estado: 'borrador' | 'planificando' | 'ejecutando' | 'completada' | 'conflictos'
  anunciante: string
  referencia: string
  nombreCampana: string
  nombreProducto: string
  valorNeto: number
  fechaInicio: string
  fechaTermino: string
  cantidadCunas: number
  tipoPedido: string
  vendedor: string
  agenciaCreativa: string
  agenciaMedios: string
  usuario: string
  alertas: number
  cumplimiento: number
  favorito?: boolean
}

export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  width: string
}

export interface FiltroGuardado {
  id: string
  nombre: string
  filtros: { searchTerm: string; filtroActivo: string }
}

export type SortDirection = 'asc' | 'desc' | null
export type SortField = keyof CampanaListado | null

export interface CampanasStats {
  total: number
  activas: number
  planificando: number
  alertas: number
  valorTotal: number
  favoritos: number
  cumplimientoPromedio: number
}
