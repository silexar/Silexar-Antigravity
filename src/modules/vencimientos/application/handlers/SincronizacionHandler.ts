/**
 * HANDLER: SINCRONIZACIÓN - TIER 0 ENTERPRISE FASE 2
 *
 * @description Orquesta la sincronización entre contratos y vencimientos,
 * incluyendo operador de tráfico R2.
 */

import type { IEmisoraRepository } from '../../domain/repositories/IEmisoraRepository.js'
import type { AsignarOperadorTraficoCommand, SincronizarContratoCommand } from '../commands/advanced.js'
import { ContratoSyncService } from '../services/ContratoSyncService.js'

export class SincronizacionHandler {
  constructor(
    private readonly emisoraRepo: IEmisoraRepository,
    private readonly contratoSync: ContratoSyncService
  ) {}

  /** R2: Asignar operador de tráfico a emisora */
  async asignarOperadorTrafico(command: AsignarOperadorTraficoCommand): Promise<{ success: boolean; error?: string }> {
    try {
      const emisora = await this.emisoraRepo.findById(command.payload.emisoraId)
      if (!emisora) return { success: false, error: 'Emisora no encontrada' }

      emisora.asignarOperadorTrafico(command.payload.operadorTraficoId, command.payload.operadorTraficoNombre, command.payload.asignadoPor)
      await this.emisoraRepo.save(emisora)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  /** Sincronizar cupo con contrato */
  async sincronizarContrato(command: SincronizarContratoCommand): Promise<{ success: boolean; cuposSincronizados: number; error?: string }> {
    try {
      if (command.payload.direccion === 'bidireccional') {
        const result = await this.contratoSync.sincronizacionCompleta(command.payload.cupoComercialId, command.payload.contratoId)
        return { success: result.success, cuposSincronizados: result.cuposSincronizados }
      }
      const result = command.payload.direccion === 'contrato_a_vencimiento'
        ? await this.contratoSync.sincronizarDesdeContrato({
            contratoId: command.payload.contratoId,
            numeroContrato: '', clienteId: '', clienteNombre: '',
            ejecutivoId: '', ejecutivoNombre: '',
            fechaInicio: new Date(), fechaFin: new Date(),
            valorTotal: 0, estado: 'activo'
          })
        : await this.contratoSync.sincronizarHaciaContrato(command.payload.cupoComercialId, command.payload.contratoId)

      return { success: result.success, cuposSincronizados: result.cuposSincronizados }
    } catch (err) {
      return { success: false, cuposSincronizados: 0, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }
}
