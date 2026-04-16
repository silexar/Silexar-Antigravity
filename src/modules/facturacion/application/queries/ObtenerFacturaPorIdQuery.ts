export interface ObtenerFacturaPorIdQueryInput {
  id: string;
  tenantId: string;
}

export class ObtenerFacturaPorIdQuery {
  constructor(public readonly input: ObtenerFacturaPorIdQueryInput) {}
}
