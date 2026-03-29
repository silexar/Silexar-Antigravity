/**
 * REPOSITORIO: VENCIMIENTO - TIER 0 ENTERPRISE
 */
import { VencimientoAuspicio } from '../entities/VencimientoAuspicio.js'
import { AlertaProgramador } from '../entities/AlertaProgramador.js'
import { SolicitudExtension } from '../entities/SolicitudExtension.js'
import { ListaEspera } from '../entities/ListaEspera.js'

export interface IVencimientoRepository {
  // Vencimientos
  saveVencimiento(vencimiento: VencimientoAuspicio): Promise<void>
  findVencimientoById(id: string): Promise<VencimientoAuspicio | null>
  findVencimientoByCupo(cupoId: string): Promise<VencimientoAuspicio | null>
  findVencimientosProximos(dias: number): Promise<VencimientoAuspicio[]>
  findVencimientosNoIniciados(): Promise<VencimientoAuspicio[]>
  findVencimientosCountdown(): Promise<VencimientoAuspicio[]>
  findVencimientosTerminanManana(): Promise<VencimientoAuspicio[]>
  findVencimientosTerminanHoy(): Promise<VencimientoAuspicio[]>

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
