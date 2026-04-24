/**
 * QUERY: OBTENER HISTORIAL DE USO — TIER 0
 *
 * Consulta el historial de emisiones y envíos de una cuña.
 * Se usa para trazabilidad y reportes de facturación de pauta.
 */

export interface ObtenerHistorialUsoInput {
  tenantId: string;
  cunaId: string;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  limit?: number;
  offset?: number;
}

export class ObtenerHistorialUsoQuery {
  constructor(public readonly input: ObtenerHistorialUsoInput) {}
}
