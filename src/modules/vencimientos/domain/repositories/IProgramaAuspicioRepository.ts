/**
 * REPOSITORIO: PROGRAMA AUSPICIO - TIER 0 ENTERPRISE
 */
import { ProgramaAuspicio } from '../entities/ProgramaAuspicio.js'

export interface ProgramaBusquedaCriteria {
  emisoraId?: string
  estado?: string
  tieneDisponibilidad?: boolean
  franjaHoraria?: string
  busquedaTexto?: string
  ordenarPor?: 'nombre' | 'ocupacion' | 'revenue' | 'fecha'
  direccionOrden?: 'asc' | 'desc'
  pagina: number
  tamanoPagina: number
}

export interface ProgramaResultadoBusqueda {
  programas: ProgramaAuspicio[]
  total: number
  pagina: number
  totalPaginas: number
}

export interface IProgramaAuspicioRepository {
  save(programa: ProgramaAuspicio): Promise<void>
  findById(id: string): Promise<ProgramaAuspicio | null>
  findByEmisora(emisoraId: string): Promise<ProgramaAuspicio[]>
  findByEstado(estado: string): Promise<ProgramaAuspicio[]>
  findConDisponibilidad(emisoraId: string): Promise<ProgramaAuspicio[]>
  findSinCupos(emisoraId: string): Promise<ProgramaAuspicio[]>
  search(criteria: ProgramaBusquedaCriteria): Promise<ProgramaResultadoBusqueda>
  delete(id: string): Promise<void>
  getTopPerformers(emisoraId: string, limit: number): Promise<ProgramaAuspicio[]>
  getRankingOcupacion(emisoraId: string): Promise<Array<{ programaId: string; nombre: string; ocupacion: number; revenue: number }>>
}
