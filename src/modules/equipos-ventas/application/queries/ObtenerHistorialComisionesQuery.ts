/**
 * QUERY: OBTENER HISTORIAL COMISIONES
 *
 * @description Listado histórico de comisiones pagadas o pendientes.
 * Detalla ventas base, porcentaje aplicado y bonos extra.
 */

import { IQuery } from '@/lib/cqrs';

export class ObtenerHistorialComisionesQuery implements IQuery {
  readonly _result?: unknown
  constructor(
    public readonly vendedorId: string,
    public readonly anio: number
  ) {}
}
