/**
 * QUERY: OBTENER PRESENTACIONES FALTANTES — TIER 0
 *
 * Busca programas o bloques en la pauta que requieren una presentación
 * (entrada/salida) pero no la tienen asignada o la actual está vencida.
 * Se integra con el módulo de Vencimientos/Pauta.
 */

export interface ObtenerPresentacionesFaltantesInput {
  tenantId: string;
  emisoraId?: string | null;
  fechaEmision: Date; // Fecha a consultar (ej: pauta de mañana)
}

export class ObtenerPresentacionesFaltantesQuery {
  constructor(public readonly input: ObtenerPresentacionesFaltantesInput) {}
}
