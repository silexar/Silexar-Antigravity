/**
 * COMMAND AJUSTAR PRECIO DINAMICO - TIER 0 ENTERPRISE
 * 
 * @description Solicita un ajuste de precio (descuento) sobre la Rate Card.
 * Valida autorizaciones por rol y dispara flujos de aprobación si es necesario.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export class AjustarPrecioDinamicoCommand {
  constructor(
    public readonly propuestaId: string,
    public readonly lineaId: string, // Item específico
    public readonly vendedorId: string,
    public readonly descuentoSolicitado: number, // % 0-100
    public readonly justificacion: string,
    public readonly esUrgente: boolean = false
  ) {
    if (descuentoSolicitado < 0 || descuentoSolicitado > 100) throw new Error('Descuento inválido');
    if (!justificacion || justificacion.length < 10) throw new Error('Justificación requerida');
  }
}
