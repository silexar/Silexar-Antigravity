export class ObtenerHistorialRecuperacionesQuery {
  constructor(
    public readonly emisoraId?: string,
    public readonly limit: number = 20,
    public readonly offset: number = 0
  ) {}
}
