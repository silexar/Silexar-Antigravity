/**
 * DOMAIN EVENT: CUÑA EN AIRE — TIER 0
 *
 * Se dispara cuando una cuña pasa a estado en_aire.
 * Kafka notifica al módulo de registro de emisión y al operador de tráfico.
 */

export class CunaEnAireEvent {
  readonly eventType = 'cunas.en_aire' as const;
  readonly occurredAt: Date;

  constructor(
    public readonly cunaId: string,
    public readonly tenantId: string,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly anuncianteId: string
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
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
