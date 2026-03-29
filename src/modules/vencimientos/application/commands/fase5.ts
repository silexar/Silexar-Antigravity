/**
 * COMMAND: CONFIRMAR PRE CIERRE - TIER 0 FASE 5
 *
 * @description Confirma un cierre provisorio de venta (Pre-Cierre) en firme,
 * activando la regla de notificaciones.
 */

export interface ConfirmarPreCierreCommand {
  type: 'ConfirmarPreCierre'
  payload: {
    cupoComercialId: string
    ejecutivoId: string
    clienteNombre: string
    notificarA: string[] // Opciones sacadas de la matriz de notificaciones
  }
}
