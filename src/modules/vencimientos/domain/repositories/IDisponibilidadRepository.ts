/**
 * REPOSITORIO: DISPONIBILIDAD - TIER 0 ENTERPRISE
 */
import { DisponibilidadCupo } from '../entities/DisponibilidadCupo.js'
import { HistorialOcupacion } from '../entities/HistorialOcupacion.js'

export interface IDisponibilidadRepository {
  saveDisponibilidad(disp: DisponibilidadCupo): Promise<void>
  findByProgramaYFecha(programaId: string, fecha: Date): Promise<DisponibilidadCupo | null>
  findByEmisora(emisoraId: string): Promise<DisponibilidadCupo[]>
  findByPrograma(programaId: string): Promise<DisponibilidadCupo[]>
  getResumenEmisora(emisoraId: string): Promise<{
    ocupacionPromedio: number
    revenueTotal: number
    revenuePerdido: number
    programasCriticos: number
    programasSaludables: number
  }>

  // Historial
  saveHistorial(historial: HistorialOcupacion): Promise<void>
  findHistorialByPrograma(programaId: string): Promise<HistorialOcupacion | null>
  findHistorialByEmisora(emisoraId: string): Promise<HistorialOcupacion[]>
}
