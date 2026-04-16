export class ListarPublicacionesRrssQuery {
  constructor(public readonly input: {
    tenantId: string;
    campanaId?: string;
    contratoId?: string;
    connectionId?: string;
    estado?: string;
    limit?: number;
    offset?: number;
  }) {}
}
