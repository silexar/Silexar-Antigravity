/**
 * REPOSITORIO: VENCIMIENTOS - TIER 0 ENTERPRISE
 */
import { VencimientosAuspicio } from '../entities/VencimientosAuspicio.js'
import { AlertaProgramador } from '../entities/AlertaProgramador.js'
import { SolicitudExtension } from '../entities/SolicitudExtension.js'
import { ListaEspera } from '../entities/ListaEspera.js'

export interface IVencimientosRepository {
  // Vencimientos
  saveVencimientos(vencimientos: VencimientosAuspicio): Promise<void>
  findVencimientosById(id: string): Promise<VencimientosAuspicio | null>
  findVencimientosByCupo(cupoId: string): Promise<VencimientosAuspicio | null>
  findVencimientosProximos(dias: number): Promise<VencimientosAuspicio[]>
  findVencimientosNoIniciados(): Promise<VencimientosAuspicio[]>
  findVencimientosCountdown(): Promise<VencimientosAuspicio[]>
  findVencimientosTerminanManana(): Promise<VencimientosAuspicio[]>
  findVencimientosTerminanHoy(): Promise<VencimientosAuspicio[]>

  // Alertas
  saveAlerta(alerta: AlertaProgramador): Promise<void>
  findAlertasByDestinatario(destinatarioId: string): Promise<AlertaProgramador[]>
  findAlertasByEmisora(emisoraId: string): Promise<AlertaProgramador[]>
  findAlertasPendientes(): Promise<AlertaProgramador[]>

  // Solicitudes de extensión (R1)
  saveExtension(extension: SolicitudExtension): Promise<void>
  findExtensionById(id: string): Promise<SolicitudExtension | null>
  findExtensionByCupo(cupoId: string): Promise<SolicitudExtension[]>
  findExtensionPendientes(): Promise<SolicitudExtension[]>
  countExtensiones(cupoId: string): Promise<number>

  // Lista de espera (Mejora 7)
  saveListaEspera(lista: ListaEspera): Promise<void>
  findListaEsperaByPrograma(programaId: string): Promise<ListaEspera | null>
}
