export interface ObtenerAnunciantePorIdQueryInput {
  id: string;
  tenantId: string;
}

export class ObtenerAnunciantePorIdQuery {
  constructor(public readonly input: ObtenerAnunciantePorIdQueryInput) {}
}
