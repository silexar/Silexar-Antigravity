export interface ObtenerEspecificacionDigitalInput {
  id?: string;
  campanaId?: string;
  contratoId?: string;
  tenantId: string;
}

export class ObtenerEspecificacionDigitalQuery {
  constructor(public readonly input: ObtenerEspecificacionDigitalInput) {
    if (!input.id && !input.campanaId && !input.contratoId) {
      throw new Error('Debe proporcionar id, campanaId o contratoId');
    }
  }
}
