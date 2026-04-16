/**
 * QUERY: OBTENER DETALLE CUÑA — TIER 0
 */

export class ObtenerDetalleCunaQuery {
  constructor(
    public readonly id: string,
    public readonly tenantId: string
  ) {}
}
