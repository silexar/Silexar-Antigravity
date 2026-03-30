/**
 * QUERY AI COPILOT - TIER 0 ENTERPRISE
 * 
 * @description Consulta al asistente IA de ventas.
 * Soporta conversaciones contextuales y generación de acciones.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export class AICopilotQuery {
  constructor(
    public readonly vendedorId: string,
    public readonly mensaje: string,
    public readonly contexto: {
      urlActual: string;
      dealId?: string;
      clienteId?: string;
      equipoId?: string;
    },
    public readonly historialConversacion: { role: 'user' | 'assistant', content: string }[] = []
  ) {
    if (!mensaje || mensaje.trim().length === 0) throw new Error('Mensaje vacío');
  }
}
