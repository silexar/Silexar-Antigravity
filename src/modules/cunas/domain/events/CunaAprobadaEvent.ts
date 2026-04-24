/**
 * DOMAIN EVENT: CUÑA APROBADA — TIER 0
 *
 * Se dispara cuando una cuña pasa de pendiente_aprobacion → aprobada.
 * Kafka puede consumirlo para notificar al ejecutivo asignado,
 * habilitar la programación, y disparar alertas de vencimientos.
 */

export class CunaAprobadaEvent {
  readonly eventType = 'cunas.aprobada' as const;
  readonly occurredAt: Date;

  constructor(
    public readonly cunaId: string,
    public readonly tenantId: string,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly aprobadoPorId: string,
    public readonly anuncianteId: string,
    public readonly fechaFinVigencia: Date | null
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      cunaId: this.cunaId,
      tenantId: this.tenantId,
      codigo: this.codigo,
      nombre: this.nombre,
      aprobadoPorId: this.aprobadoPorId,
      anuncianteId: this.anuncianteId,
      fechaFinVigencia: this.fechaFinVigencia?.toISOString() ?? null,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
