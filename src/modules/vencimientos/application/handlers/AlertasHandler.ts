/**
 * HANDLER: ALERTAS - TIER 0 ENTERPRISE FASE 2
 *
 * @description Generación de alertas, confirmación de auspicios,
 * consulta de alertas de programador, R1 aprobación de extensiones.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { AlertaProgramador } from '../../domain/entities/AlertaProgramador.js'
import { EstadoAuspicio } from '../../domain/value-objects/EstadoAuspicio.js'
import { ConfirmacionProgramador } from '../../domain/value-objects/ConfirmacionProgramador.js'
import type { IVencimientoRepository } from '../../domain/repositories/IVencimientoRepository.js'
import type { ICupoComercialRepository } from '../../domain/repositories/ICupoComercialRepository.js'
import type { IEmisoraRepository } from '../../domain/repositories/IEmisoraRepository.js'
import type {
  GenerarAlertaVencimientoCommand,
  ConfirmarInicioAuspicioCommand,
  AprobarExtensionCommand
} from '../commands/advanced.js'
import type { ObtenerAlertasProgramadorQuery, AlertaProgramadorResult } from '../queries/advanced.js'

export class AlertasHandler {
  constructor(
    private readonly vencimientoRepo: IVencimientoRepository,
    private readonly cupoRepo: ICupoComercialRepository,
    private readonly emisoraRepo: IEmisoraRepository
  ) {}

  /** Generar alerta manual o programada */
  async generarAlerta(command: GenerarAlertaVencimientoCommand): Promise<{ success: boolean; alertaId?: string; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      const alerta = AlertaProgramador.create({
        emisoraId: cupo.emisoraId,
        programaId: cupo.programaId,
        programaNombre: cupo.programaNombre,
        cupoComercialId: cupo.id,
        clienteNombre: cupo.clienteNombre,
        tipo: command.payload.tipo,
        titulo: `Alerta: ${cupo.clienteNombre}`,
        mensaje: `Alerta de tipo ${command.payload.tipo} para ${cupo.clienteNombre} en ${cupo.programaNombre}`,
        prioridad: command.payload.prioridad,
        destinatarioId: command.payload.destinatarioId,
        destinatarioNombre: command.payload.destinatarioNombre,
        canalesNotificacion: command.payload.canales,
        confirmacion: ConfirmacionProgramador.pendiente(command.payload.destinatarioId, command.payload.destinatarioNombre),
        leida: false
      })

      await this.vencimientoRepo.saveAlerta(alerta)
      return { success: true, alertaId: alerta.id }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** Confirmar inicio de auspicio por programador de tráfico */
  async confirmarInicioAuspicio(command: ConfirmarInicioAuspicioCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      cupo.cambiarEstado(EstadoAuspicio.activo(), command.payload.programadorNombre)
      await this.cupoRepo.save(cupo)

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** R1: Aprobar o rechazar extensión por jefe/gerente comercial */
  async aprobarExtension(command: AprobarExtensionCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const solicitud = await this.vencimientoRepo.findExtensionById(command.payload.solicitudExtensionId)
      if (!solicitud) return { success: false, error: 'Solicitud de extensión no encontrada' }

      if (command.payload.decision === 'aprobada') {
        solicitud.aprobar(command.payload.aprobadorId, command.payload.aprobadorNombre)
        // Registrar extensión en el cupo
        const cupo = await this.cupoRepo.findById(solicitud.cupoComercialId)
        if (cupo) {
          cupo.registrarExtension(solicitud.id, command.payload.aprobadorNombre)
          cupo.cambiarEstado(EstadoAuspicio.confirmado(), command.payload.aprobadorNombre)
          await this.cupoRepo.save(cupo)
        }
      } else {
        solicitud.rechazar(command.payload.aprobadorId, command.payload.aprobadorNombre, command.payload.motivoRechazo || 'Sin motivo')
      }

      await this.vencimientoRepo.saveExtension(solicitud)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** Obtener alertas para un programador */
  async obtenerAlertasProgramador(query: ObtenerAlertasProgramadorQuery): Promise<AlertaProgramadorResult> {
    const alertas = await this.vencimientoRepo.findAlertasByDestinatario(query.payload.programadorId)
    let filtradas = alertas
    if (query.payload.emisoraId) filtradas = filtradas.filter(a => a.emisoraId === query.payload.emisoraId)
    if (query.payload.soloNoLeidas) filtradas = filtradas.filter(a => !a.leida)
    if (query.payload.soloPendientes) filtradas = filtradas.filter(a => a.requiereAccion)

    const offset = (query.payload.pagina - 1) * query.payload.tamanoPagina
    const paginated = filtradas.slice(offset, offset + query.payload.tamanoPagina)

    return {
      total: filtradas.length,
      noLeidas: alertas.filter(a => !a.leida).length,
      pendientesConfirmacion: alertas.filter(a => a.requiereAccion).length,
      alertas: paginated.map(a => ({
        id: a.id, tipo: a.tipo, titulo: a.titulo, mensaje: a.mensaje,
        prioridad: a.prioridad, clienteNombre: a.clienteNombre,
        programaNombre: a.programaNombre,
        estadoConfirmacion: a.confirmacion.estado,
        fechaCreacion: new Date()
      }))
    }
  }
}
