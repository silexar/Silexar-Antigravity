/**
 * COMMANDS: EQUIPO VENTAS — Aggregated command interfaces
 *
 * Defines the data contracts for all state-changing operations on the
 * equipos-ventas domain. These are plain-data objects (no behaviour) that
 * are validated and executed by EquipoVentasCommandHandler.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoEquipo } from '../../domain/value-objects/TipoEquipo'

export interface CreateEquipoCommand {
  nombre: string
  tipo: TipoEquipo
  liderId: string
  metaAnual: number
  tenantId: string
  createdBy: string
  territorioId?: string
  padreId?: string
  tags?: string[]
  moneda?: string
}

export interface UpdateEquipoCommand {
  id: string
  tenantId: string
  updatedBy: string
  nombre?: string
  tipo?: TipoEquipo
  liderId?: string
  metaAnual?: number
  territorioId?: string
  tags?: string[]
  moneda?: string
}

export interface AssignVendedorCommand {
  equipoId: string
  vendedorId: string
  tenantId: string
  assignedBy: string
  rolEnEquipo?: string
}

export interface RemoveVendedorCommand {
  equipoId: string
  vendedorId: string
  tenantId: string
  removedBy: string
}
