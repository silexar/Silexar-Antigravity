/**
 * QUERY: OBTENER PLAN COMPENSACIÓN
 *
 * @description Obtiene los detalles del plan de compensación asignado a un vendedor.
 * Incluye sueldo base, tabla de comisiones y aceleradores vigentes.
 */

import { IQuery } from '@/lib/cqrs';

export class ObtenerPlanCompensacionQuery implements IQuery {
  readonly _result?: unknown
  constructor(
    public readonly vendedorId: string
  ) {}
}
