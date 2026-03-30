/**
 * COMMAND: AUDITAR CAMBIO PERFORMANCE
 *
 * @description Registra manualmente un cambio o ajuste en las métricas de performance.
 * Útil para correcciones administrativas o excepciones aprobadas.
 */

export class AuditarCambioPerformanceCommand {
  constructor(
    public readonly entidadId: string,
    public readonly tipoEntidad: 'VENDEDOR' | 'EQUIPO',
    public readonly metrica: string,
    public readonly valorAnterior: string | number,
    public readonly valorNuevo: string | number,
    public readonly motivo: string,
    public readonly responsableId: string
  ) {}
}
