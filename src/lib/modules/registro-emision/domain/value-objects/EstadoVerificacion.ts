/**
 * 🏷️ DOMAIN TYPE: EstadoVerificacion
 * 
 * Ciclo de vida estricto de una verificación de emisión.
 * 
 * @tier TIER_0_ENTERPRISE
 */

export type EstadoVerificacion = 
  | 'pendiente'               // Creado, aun no iniciado
  | 'en_cola_procesamiento'   // Encolado en sistema de mensajería
  | 'analizando_audio'        // Cortex-Sense trabajando
  | 'consultando_blockchain'  // Generando prueba de existencia
  | 'completada_con_exito'    // Finalizado correctamente
  | 'completada_con_alertas'  // Finalizado pero con discrepancias
  | 'fallida_error_sistema';  // Error técnico
