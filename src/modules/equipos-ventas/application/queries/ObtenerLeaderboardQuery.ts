/**
 * QUERY: OBTENER LEADERBOARD
 *
 * @description Recupera el ranking actual de vendedores basado en gamificación.
 * Soporta diferentes criterios de ordenamiento (Ventas, Deals, Puntos).
 */

import { IQuery } from '@/lib/cqrs';

export class ObtenerLeaderboardQuery implements IQuery {
  constructor(
    public readonly criterio: 'VENTAS' | 'PUNTOS' | 'DEALS_CERRADOS',
    public readonly periodoInicio: Date,
    public readonly periodoFin: Date,
    public readonly limite: number = 10
  ) {}
}
