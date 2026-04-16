/**
 * QUERY: BUSCAR CUÑAS — TIER 0
 *
 * Encapsula los parámetros de búsqueda y paginación para el listado.
 */

import type { CunaFilter } from '../../domain/repositories/ICunaRepository';

export class BuscarCunasQuery {
  constructor(
    public readonly tenantId: string,
    public readonly filter: CunaFilter
  ) {}
}
