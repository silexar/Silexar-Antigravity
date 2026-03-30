export class ObtenerSpotsNoEmitidosQuery {
  constructor(
    public readonly emisoraId?: string,
    public readonly soloPendientes: boolean = true
  ) {}
}
