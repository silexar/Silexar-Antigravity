/**
 * UpdateCampanaCommand — Commands for mutating an existing campaign
 */

import type { PresupuestoData } from '../../domain/value-objects/PresupuestoCampana';

export interface ActivarCampanaCommand {
  campanaId: string;
  tenantId: string;
  activadoPor: string;
}

export interface PausarCampanaCommand {
  campanaId: string;
  tenantId: string;
  motivo: string;
  pausadoPor: string;
}

export interface FinalizarCampanaCommand {
  campanaId: string;
  tenantId: string;
  finalizadoPor: string;
}

export interface CancelarCampanaCommand {
  campanaId: string;
  tenantId: string;
  motivo: string;
  canceladoPor: string;
}

export interface ActualizarNombreCampanaCommand {
  campanaId: string;
  tenantId: string;
  nuevoNombre: string;
}

export interface ActualizarPresupuestoCampanaCommand {
  campanaId: string;
  tenantId: string;
  presupuesto: PresupuestoData;
}
