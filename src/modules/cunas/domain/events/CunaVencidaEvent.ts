/**
 * DOMAIN EVENT: CUÑA VENCIDA — TIER 0
 *
 * Se dispara cuando una cuña alcanza su fecha de fin de vigencia.
 * Kafka notifica al ejecutivo asignado y activa alertas en dashboard.
 */

export class CunaVencidaEvent {
  readonly eventType = 'cunas.vencida' as const;
  readonly occurredAt: Date;

  constructor(
    public readonly cunaId: string,
    public readonly tenantId: string,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly anuncianteId: string,
    public readonly fechaVencimiento: Date
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
      anuncianteId: this.anuncianteId,
      fechaVencimiento: this.fechaVencimiento.toISOString(),
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
