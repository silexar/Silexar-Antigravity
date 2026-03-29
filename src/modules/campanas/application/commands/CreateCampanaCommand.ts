/**
 * CreateCampanaCommand — Command to create a new campaign
 */

import type { TipoCampana } from '../../domain/entities/Campana';
import type { PresupuestoData } from '../../domain/value-objects/PresupuestoCampana';

export interface CreateCampanaCommand {
  tenantId: string;
  nombre: string;
  tipo: TipoCampana;
  anuncianteId: string;
  contratoId?: string;
  presupuesto: PresupuestoData;
  fechaInicio: Date;
  fechaFin: Date;
  descripcion?: string;
  observaciones?: string;
  creadoPor: string;
}
