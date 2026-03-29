/**
 * VALUE OBJECT ESTADO ORDEN PAUTA - TIER 0 ENTERPRISE
 * 
 * @description Estados del ciclo de vida de una orden de pauta en el puente
 * Ventas <-> Programación.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export enum EstadoOrdenPauta {
  VENDIDO = 'VENDIDO', // Confirmado por ventas
  EN_COLA = 'EN_COLA', // Recibido por programación
  PROGRAMADO = 'PROGRAMADO', // Asignado a grilla
  AL_AIRE = 'AL_AIRE', // En emisión actual
  EMITIDO = 'EMITIDO', // Finalizado correctamente
  CONFLICTO = 'CONFLICTO', // Problema de inventario post-venta
  CANCELADO = 'CANCELADO'
}

export const EstadoOrdenLabels: Record<EstadoOrdenPauta, string> = {
  [EstadoOrdenPauta.VENDIDO]: '✅ Vendido',
  [EstadoOrdenPauta.EN_COLA]: '⏳ En Cola',
  [EstadoOrdenPauta.PROGRAMADO]: '📅 Programado',
  [EstadoOrdenPauta.AL_AIRE]: '📡 Al Aire',
  [EstadoOrdenPauta.EMITIDO]: '🏁 Emitido',
  [EstadoOrdenPauta.CONFLICTO]: '⚠️ Conflicto',
  [EstadoOrdenPauta.CANCELADO]: '❌ Cancelado'
};
