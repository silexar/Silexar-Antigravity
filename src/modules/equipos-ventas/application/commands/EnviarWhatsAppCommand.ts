/**
 * COMMAND ENVIAR WHATSAPP - TIER 0 ENTERPRISE
 * 
 * @description Envío de mensajes transaccionales o promocionales vía WhatsApp Business API.
 * Soporta templates aprobados y adjuntos (PDF propuestas).
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export class EnviarWhatsAppCommand {
  constructor(
    public readonly destinatarioId: string, // Anunciante o Contacto
    public readonly telefonoDestino: string,
    public readonly templateId: string, // ID de plantilla aprobada
    public readonly variables: Record<string, string>, // {{1}}, {{2}}
    public readonly adjuntoUrl?: string, // URL de PDF propuesta
    public readonly contextoId?: string // DealId, PropuestaId
  ) {
    if (!telefonoDestino || telefonoDestino.length < 8) throw new Error('Teléfono inválido');
    if (!templateId) throw new Error('Template requerido');
  }
}
