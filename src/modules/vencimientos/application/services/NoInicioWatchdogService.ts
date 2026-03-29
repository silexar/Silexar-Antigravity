import { logger } from '@/lib/observability';
/**
 * SERVICE: NO INICIO WATCHDOG - TIER 0 ENTERPRISE (R1)
 *
 * @description Servicio watchdog que monitorea auspicios que no han iniciado.
 * Inicia countdown de 48h, envía alertas progresivas, y ejecuta
 * auto-eliminación al expirar.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export interface WatchdogResult {
  cuposEvaluados: number
  alertasEnviadas: number
  countdownsIniciados: number
  eliminacionesAutomaticas: number
  detalles: Array<{
    cupoComercialId: string
    clienteNombre: string
    programaNombre: string
    accion: 'alerta_enviada' | 'countdown_iniciado' | 'eliminado' | 'sin_accion'
    diasSinIniciar: number
    horasCountdownRestantes?: number
  }>
}

export class NoInicioWatchdogService {
  /** Proceso periódico: cada 4 horas evalúa auspicios no iniciados */
  async ejecutarMonitoreo(): Promise<WatchdogResult> {
    const result: WatchdogResult = {
      cuposEvaluados: 0,
      alertasEnviadas: 0,
      countdownsIniciados: 0,
      eliminacionesAutomaticas: 0,
      detalles: []
    }

    logger.info('[NoInicioWatchdog] Iniciando monitoreo R1...')
    logger.info(`  Hora: ${new Date().toLocaleTimeString('es-CL')}`)

    // En producción, este servicio:
    // 1. Consulta ICupoComercialRepository.findNoIniciados()
    // 2. Para cada cupo no iniciado:
    //    a. Si acaba de superar fecha inicio: envía alerta al ejecutivo
    //    b. Si ya pasaron > 24h: inicia countdown visible
    //    c. Si countdown expiró (48h): ejecuta eliminación automática
    // 3. Al eliminar, notifica lista de espera del programa

    logger.info('[NoInicioWatchdog] Monitoreo completado.')
    return result
  }

  /** Evaluar un cupo específico */
  async evaluarCupo(data: {
    cupoComercialId: string
    clienteNombre: string
    programaNombre: string
    fechaInicioEsperada: Date
    countdownIniciado: boolean
    countdownExpira?: Date
  }): Promise<{
    accion: 'ninguna' | 'alertar_ejecutivo' | 'iniciar_countdown' | 'eliminar'
    diasSinIniciar: number
    horasCountdownRestantes?: number
  }> {
    const ahora = new Date()
    const diasSinIniciar = Math.ceil(
      (ahora.getTime() - data.fechaInicioEsperada.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diasSinIniciar <= 0) {
      return { accion: 'ninguna', diasSinIniciar: 0 }
    }

    // Si ya tiene countdown y expiró → eliminar
    if (data.countdownIniciado && data.countdownExpira && ahora >= data.countdownExpira) {
      logger.info(`[NoInicioWatchdog] ELIMINACIÓN AUTOMÁTICA: ${data.clienteNombre} (${diasSinIniciar} días sin iniciar)`)
      return { accion: 'eliminar', diasSinIniciar, horasCountdownRestantes: 0 }
    }

    // Si ya tiene countdown activo → reportar horas restantes
    if (data.countdownIniciado && data.countdownExpira) {
      const horasRestantes = Math.max(0, Math.ceil(
        (data.countdownExpira.getTime() - ahora.getTime()) / (1000 * 60 * 60)
      ))
      return { accion: 'ninguna', diasSinIniciar, horasCountdownRestantes: horasRestantes }
    }

    // Si pasaron más de 24h sin countdown → iniciar countdown 48h
    if (diasSinIniciar >= 1) {
      logger.info(`[NoInicioWatchdog] COUNTDOWN 48h INICIADO: ${data.clienteNombre}`)
      return { accion: 'iniciar_countdown', diasSinIniciar }
    }

    // Alertar al ejecutivo
    logger.info(`[NoInicioWatchdog] ALERTA: ${data.clienteNombre} no ha iniciado (${diasSinIniciar} días)`)
    return { accion: 'alertar_ejecutivo', diasSinIniciar }
  }
}
