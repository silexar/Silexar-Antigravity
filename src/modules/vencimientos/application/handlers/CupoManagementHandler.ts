/**
 * HANDLER: CUPO MANAGEMENT - TIER 0 ENTERPRISE
 *
 * @description CRUD de cupos con validación de disponibilidad, alertas automáticas,
 * R1 (48h no-inicio, extensiones) y R2 (alertas tráfico).
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { EstadoAuspicio } from '../../domain/value-objects/EstadoAuspicio.js'
import { logger } from '@/lib/observability';
import { SolicitudExtension } from '../../domain/entities/SolicitudExtension.js'
import type { ICupoComercialRepository } from '../../domain/repositories/ICupoComercialRepository.js'
import type { IVencimientosRepository } from '../../domain/repositories/IVencimientosRepository.js'
import type { IEmisoraRepository } from '../../domain/repositories/IEmisoraRepository.js'
import type {
  ActivarAuspicioCommand,
  FinalizarAuspicioCommand,
  SolicitarExtensionCommand,
  EliminarAuspicioNoIniciadoCommand
} from '../commands/index.js'
import type { ReservarCupoTemporalCommand } from '../commands/fase4.js'
import type { ConfirmarPreCierreCommand } from '../commands/fase5.js'

export class CupoManagementHandler {
  constructor(
    private readonly cupoRepo: ICupoComercialRepository,
    private readonly vencimientosRepo: IVencimientosRepository,
    private readonly emisoraRepo: IEmisoraRepository
  ) {}

  async activarAuspicio(command: ActivarAuspicioCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      cupo.cambiarEstado(EstadoAuspicio.activo(), command.payload.confirmadoPor)
      await this.cupoRepo.save(cupo)

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  async finalizarAuspicio(command: FinalizarAuspicioCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      const estado = command.payload.motivo === 'cancelacion'
        ? EstadoAuspicio.cancelado()
        : EstadoAuspicio.vencido()
      cupo.cambiarEstado(estado, command.payload.finalizadoPor)
      await this.cupoRepo.save(cupo)

      // Notificar lista de espera si existe
      const listaEspera = await this.vencimientosRepo.findListaEsperaByPrograma(cupo.programaId)
      if (listaEspera?.tieneClientes) {
        const siguiente = listaEspera.notificarSiguiente()
        if (siguiente) {
          await this.vencimientosRepo.saveListaEspera(listaEspera)
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** R1: Solicitar extensión de fecha con cadena de aprobación escalonada */
  async solicitarExtension(command: SolicitarExtensionCommand): Promise<{
    success: boolean
    extensionId?: string
    autoAprobada?: boolean
    nivelRequerido?: string
    error?: string
  }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      // Contar extensiones previas
      const extensionesPrevias = await this.vencimientosRepo.countExtensiones(cupo.id)

      // Crear solicitud (se auto-aprueba si es la primera)
      const solicitud = SolicitudExtension.create({
        cupoComercialId: cupo.id,
        programaId: cupo.programaId,
        emisoraId: cupo.emisoraId,
        clienteId: cupo.clienteId,
        clienteNombre: cupo.clienteNombre,
        ejecutivoId: command.payload.ejecutivoId,
        ejecutivoNombre: command.payload.ejecutivoNombre,
        periodoOriginal: cupo.periodoVigencia,
        nuevaFechaInicio: command.payload.nuevaFechaInicio,
        nuevaFechaFin: command.payload.nuevaFechaFin,
        motivoSolicitud: command.payload.motivoSolicitud,
        extensionesPrevias
      })

      await this.vencimientosRepo.saveExtension(solicitud)

      // Si fue auto-aprobada, registrar en el cupo
      const autoAprobada = solicitud.nivelAprobacion.esAprobado()
      if (autoAprobada) {
        cupo.registrarExtension(solicitud.id, command.payload.ejecutivoNombre)
        cupo.cambiarEstado(EstadoAuspicio.confirmado(), command.payload.ejecutivoNombre)
        await this.cupoRepo.save(cupo)
      } else {
        cupo.cambiarEstado(EstadoAuspicio.enExtension(), command.payload.ejecutivoNombre)
        await this.cupoRepo.save(cupo)
      }

      return {
        success: true,
        extensionId: solicitud.id,
        autoAprobada,
        nivelRequerido: solicitud.nivelAprobacion.descripcionNivel
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** R1: Eliminar auspicio no iniciado tras 48h */
  async eliminarAuspicioNoIniciado(command: EliminarAuspicioNoIniciadoCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      cupo.eliminarPorNoInicio(command.payload.ejecutadoPor)
      await this.cupoRepo.save(cupo)

      // Notificar lista de espera
      const listaEspera = await this.vencimientosRepo.findListaEsperaByPrograma(cupo.programaId)
      if (listaEspera?.tieneClientes) {
        const siguiente = listaEspera.notificarSiguiente()
        if (siguiente) {
          await this.vencimientosRepo.saveListaEspera(listaEspera)
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** FASE 4: Reserva temporal rápida (4h max) para ejecutivos */
  async reservarCupoTemporal(command: ReservarCupoTemporalCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      // Solo permitir si está libre
      // if (cupo.estado !== 'disponible') return { success: false, error: 'Cupo no disponible para reserva' }
      
      const limiteHoras = Math.min(command.payload.horasBloqueo, 4) // Max 4 horas
      logger.info(`[CupoManagement] Bloqueo temporal por ${limiteHoras} hrs`)
      cupo.cambiarEstado(EstadoAuspicio.bloqueadoTemporal(), command.payload.ejecutivoId)
      await this.cupoRepo.save(cupo)

      // El watchdog (NoInicioWatchdogService) se encargará de liberar si pasan 4h

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** FASE 5: Reservar como Pre-Cierre (Checkout pending) */
  async reservarPreCierre(cupoId: string, ejecutivoId: string, clienteNombre: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(cupoId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      // Transición a pre_cierre
      cupo.cambiarEstado(EstadoAuspicio.preCierre(), ejecutivoId)
      
      logger.info(`[CupoManagement] Pre-cierre reservado para cliente: ${clienteNombre}`)
      // Podríamos actualizar clienteNombre aquí si el método existiera (suponiendo que viene del payload)
      // cupo.asignarCliente(clienteNombre)
      
      await this.cupoRepo.save(cupo)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** FASE 5: Confirmar Cierre Definitivo desde Pre-Cierre */
  async confirmarPreCierre(command: ConfirmarPreCierreCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const cupo = await this.cupoRepo.findById(command.payload.cupoComercialId)
      if (!cupo) return { success: false, error: 'Cupo no encontrado' }

      if (!cupo.estado.esPreCierre()) {
        return { success: false, error: 'El cupo no está en estado de Pre-Cierre' }
      }

      // Consolidar el cierre
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), command.payload.ejecutivoId)
      await this.cupoRepo.save(cupo)

      // TODO: Activar Publisher `CierreConsolidado` con la `Matriz Notificaciones`
      logger.info(`[Email Trigger] 📧 Enviando PDF de Cierre a: ${command.payload.notificarA.join(', ')}`)

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }
}
