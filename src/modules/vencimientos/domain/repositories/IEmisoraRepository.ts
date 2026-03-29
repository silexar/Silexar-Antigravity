/**
 * REPOSITORIO: EMISORA - TIER 0 ENTERPRISE
 */
import { Emisora } from '../entities/Emisora.js'

export interface IEmisoraRepository {
  save(emisora: Emisora): Promise<void>
  findById(id: string): Promise<Emisora | null>
  findAll(): Promise<Emisora[]>
  findByEstado(estado: string): Promise<Emisora[]>
  findByOperadorTrafico(operadorId: string): Promise<Emisora[]>
  delete(id: string): Promise<void>
  getMetricasGlobales(): Promise<{
    totalEmisoras: number
    totalProgramas: number
    ocupacionPromedio: number
    revenueTotal: number
    alertasCriticas: number
  }>
}
