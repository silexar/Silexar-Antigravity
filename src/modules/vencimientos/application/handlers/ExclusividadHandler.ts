/**
 * HANDLER: EXCLUSIVIDAD - TIER 0 ENTERPRISE FASE 2
 *
 * @description Gestión de exclusividades por rubro, detección de conflictos,
 * validación de brand safety.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { ExclusividadRubro } from '../../domain/entities/ExclusividadRubro.js'
import type { IProgramaAuspicioRepository } from '../../domain/repositories/IProgramaAuspicioRepository.js'
import type { GestionarExclusividadCommand } from '../commands/advanced.js'
import type { ValidarConflictoRubroQuery, ConflictoRubroResult } from '../queries/advanced.js'

// Almacén temporal de exclusividades (en producción usaría su propio repositorio)
const exclusividadesMap = new Map<string, ExclusividadRubro[]>()

export class ExclusividadHandler {
  constructor(
    private readonly programaRepo: IProgramaAuspicioRepository
  ) {}

  async gestionarExclusividad(command: GestionarExclusividadCommand): Promise<{ success: boolean; exclusividadId?: string; error?: string }> {
    try {
      const programa = await this.programaRepo.findById(command.payload.programaId)
      if (!programa) return { success: false, error: 'Programa no encontrado' }

      const exclusividad = ExclusividadRubro.create({
        programaId: command.payload.programaId,
        emisoraId: command.payload.emisoraId,
        rubro: command.payload.rubro,
        politica: command.payload.politica,
        maxClientesPorPrograma: command.payload.maxClientes,
        clientesActuales: [],
        requiereSeparacionMinutos: command.payload.requiereSeparacionMinutos,
        validarBrandSafety: true,
        notas: '',
        estado: 'activa'
      })

      const key = `${command.payload.programaId}_${command.payload.emisoraId}`
      const existing = exclusividadesMap.get(key) || []
      existing.push(exclusividad)
      exclusividadesMap.set(key, existing)

      return { success: true, exclusividadId: exclusividad.id }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  async validarConflictoRubro(query: ValidarConflictoRubroQuery): Promise<ConflictoRubroResult> {
    const key = `${query.payload.programaId}_${query.payload.emisoraId}`
    const exclusividades = exclusividadesMap.get(key) || []

    // Buscar regla de exclusividad para este rubro
    const regla = exclusividades.find(e => e.rubro.toLowerCase() === query.payload.clienteRubro.toLowerCase())

    if (!regla) {
      return { tieneConflicto: false, competidoresActuales: [], politicaVigente: 'sin_restriccion', espaciosDisponibles: -1 }
    }

    const resultado = regla.puedeIngresarCliente(
      query.payload.clienteRubro,
      query.payload.clienteNombre,
      query.payload.subcategoria
    )

    return {
      tieneConflicto: !resultado.permitido,
      razon: resultado.razon,
      competidoresActuales: (resultado.conflictos || regla.clientesActuales).map(c => ({
        clienteNombre: c.clienteNombre,
        subcategoria: c.subcategoria
      })),
      politicaVigente: regla.politicaLabel,
      espaciosDisponibles: regla.espaciosDisponibles
    }
  }
}
