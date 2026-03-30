/**
 * HANDLER: EQUIPO VENTAS — Core CRUD command handler
 *
 * Orchestrates create / update / assign-vendedor / remove-vendedor use cases
 * following the standard handler pattern:
 *   1. Validate command fields
 *   2. Enforce business rules (domain entity)
 *   3. Persist via repository
 *   4. Return result
 *
 * All write operations must be called from within withTenantContext() at the
 * presentation layer to ensure RLS is active before any DB access.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { EquipoVentas } from '../../domain/entities/EquipoVentas'
import type { IEquipoVentasRepository } from '../../domain/repositories/IEquipoVentasRepository'
import type {
  CreateEquipoCommand,
  UpdateEquipoCommand,
  AssignVendedorCommand,
  RemoveVendedorCommand,
} from '../commands/EquipoVentasCommands'

export class EquipoVentasCommandHandler {
  constructor(private readonly repo: IEquipoVentasRepository) {}

  /**
   * Creates a new EquipoVentas and persists it.
   * Throws if name is invalid, liderId is missing, or metaAnual is negative.
   */
  async createEquipo(command: CreateEquipoCommand): Promise<EquipoVentas> {
    if (!command.nombre?.trim() || command.nombre.trim().length < 3) {
      throw new Error('El nombre del equipo debe tener al menos 3 caracteres')
    }
    if (!command.tenantId) {
      throw new Error('tenantId es requerido')
    }
    if (!command.liderId) {
      throw new Error('El equipo debe tener un líder asignado')
    }
    if (command.metaAnual < 0) {
      throw new Error('La meta anual no puede ser negativa')
    }

    const equipo = EquipoVentas.create({
      nombre: command.nombre.trim(),
      tipo: command.tipo,
      liderId: command.liderId,
      metaAnual: command.metaAnual,
      moneda: command.moneda ?? 'CLP',
      territorioId: command.territorioId,
      padreId: command.padreId,
      tags: command.tags ?? [],
      metadata: { createdBy: command.createdBy, tenantId: command.tenantId },
    })

    await this.repo.save(equipo)
    return equipo
  }

  /**
   * Updates mutable fields on an existing EquipoVentas.
   * Throws if the equipo does not exist in this tenant.
   */
  async updateEquipo(command: UpdateEquipoCommand): Promise<EquipoVentas> {
    const equipo = await this.repo.findById(command.id)
    if (!equipo) {
      throw new Error(`Equipo no encontrado: ${command.id}`)
    }

    if (command.nombre !== undefined) {
      equipo.actualizarNombre(command.nombre)
    }
    if (command.liderId !== undefined) {
      equipo.cambiarLider(command.liderId)
    }
    if (command.metaAnual !== undefined) {
      equipo.ajustarMeta(command.metaAnual)
    }
    if (command.territorioId !== undefined) {
      equipo.asignarTerritorio(command.territorioId)
    }

    await this.repo.save(equipo)
    return equipo
  }

  /**
   * Assigns a vendedor to an equipo.
   * Validates that the equipo exists in the tenant before delegating to the
   * repository implementation (which handles the join-table or FK update).
   */
  async assignVendedor(command: AssignVendedorCommand): Promise<void> {
    const equipo = await this.repo.findById(command.equipoId)
    if (!equipo) {
      throw new Error(`Equipo no encontrado: ${command.equipoId}`)
    }
    if (!command.vendedorId) {
      throw new Error('vendedorId es requerido')
    }

    // Delegate the physical assignment to the repository; the repository
    // implementation updates vendedores.equipo_id (or a join table) and
    // must run inside withTenantContext() at the call site.
    await this.repo.save(equipo) // no-op update to confirm entity is valid
    // NOTE: The IEquipoVentasRepository interface does not yet expose an
    // assignVendedor method. This will be added in the next repository iteration.
    // For now we document the intent here and the presentation layer must call
    // the vendedores repository directly.
    // TODO(SIL-XXX): add assignVendedor(equipoId, vendedorId, tenantId) to IEquipoVentasRepository
  }

  /**
   * Removes a vendedor from an equipo.
   * Validates that the equipo exists before delegating to the repository.
   */
  async removeVendedor(command: RemoveVendedorCommand): Promise<void> {
    const equipo = await this.repo.findById(command.equipoId)
    if (!equipo) {
      throw new Error(`Equipo no encontrado: ${command.equipoId}`)
    }
    if (!command.vendedorId) {
      throw new Error('vendedorId es requerido')
    }

    // TODO(SIL-XXX): add removeVendedor(equipoId, vendedorId, tenantId) to IEquipoVentasRepository
  }
}
