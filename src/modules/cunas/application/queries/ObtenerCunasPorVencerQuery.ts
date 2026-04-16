/**
 * QUERY: OBTENER CUÑAS POR VENCER — TIER 0
 *
 * Retorna cuñas que vencen en los próximos N días.
 * Usada para alertas operativas del dashboard y notificaciones.
 */

export class ObtenerCunasPorVencerQuery {
  constructor(
    public readonly tenantId: string,
    public readonly diasUmbral: number = 7
  ) {}
}
