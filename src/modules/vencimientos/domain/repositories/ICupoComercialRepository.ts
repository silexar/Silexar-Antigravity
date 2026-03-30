/**
 * REPOSITORIO: CUPO COMERCIAL - TIER 0 ENTERPRISE
 */
import { CupoComercial } from '../entities/CupoComercial.js'

export interface CupoBusquedaCriteria {
  programaId?: string
  emisoraId?: string
  clienteId?: string
  ejecutivoId?: string
  rubro?: string
  estado?: string
  tipoAuspicio?: string
  fechaDesde?: Date
  fechaHasta?: Date
  pagina: number
  tamanoPagina: number
}

export interface ICupoComercialRepository {
  save(cupo: CupoComercial): Promise<void>
  findById(id: string): Promise<CupoComercial | null>
  findByPrograma(programaId: string): Promise<CupoComercial[]>
  findByEmisora(emisoraId: string): Promise<CupoComercial[]>
  findByCliente(clienteId: string): Promise<CupoComercial[]>
  findByEjecutivo(ejecutivoId: string): Promise<CupoComercial[]>
  findByEstado(estado: string): Promise<CupoComercial[]>
  findNoIniciados(): Promise<CupoComercial[]>
  findPorVencer(dias: number): Promise<CupoComercial[]>
  findTerminanManana(): Promise<CupoComercial[]>
  findTerminanHoy(): Promise<CupoComercial[]>
  search(criteria: CupoBusquedaCriteria): Promise<{ cupos: CupoComercial[]; total: number }>
  delete(id: string): Promise<void>
  saveMany(cupos: CupoComercial[]): Promise<void>
}
