/**
 * QUERY: OBTENER PERFORMANCE EQUIPO
 *
 * @description Obtiene el detalle de rendimiento de un equipo específico.
 * Desglose por miembro, cumplimiento de metas y KPI operativos.
 */

import { IQuery } from '@/lib/cqrs';

export class ObtenerPerformanceEquipoQuery implements IQuery {
  readonly _result?: unknown
  constructor(
    public readonly equipoId: string,
    public readonly periodo: string
  ) {}
}
