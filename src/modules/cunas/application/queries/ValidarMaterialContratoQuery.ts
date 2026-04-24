/**
 * QUERY: VALIDAR MATERIAL CONTRATO — TIER 0
 *
 * Dado un contrato publicitario, verifica si se han cargado todas
 * las cuñas/menciones estipuladas y si están vigentes.
 */

export interface ValidarMaterialContratoInput {
  tenantId: string;
  contratoId: string;
}

export class ValidarMaterialContratoQuery {
  constructor(public readonly input: ValidarMaterialContratoInput) {}
}
