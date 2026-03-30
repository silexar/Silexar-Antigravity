export class ObtenerMetricasCumplimientoQuery {
  constructor(
    public readonly emisoraId: string,
    public readonly periodo: 'DIARIO' | 'SEMANAL' | 'MENSUAL' = 'DIARIO'
  ) {}
}
