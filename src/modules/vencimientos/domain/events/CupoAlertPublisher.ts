import { logger } from '@/lib/observability';
/**
 * DOMAIN EVENT: CUPO ALERT PUBLISHER - TIER 0 ENTERPRISE
 *
 * @description Publica eventos cuando un cupo comercial cambia de estado,
 * se asigna, libera, o requiere acción inmediata.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type CupoAlertType =
  | 'CupoAsignado'
  | 'CupoLiberado'
  | 'CupoReservado'
  | 'ReservaExpirada'
  | 'CupoSinDisponibilidad'
  | 'CupoExtendido'
  | 'CupoCancelado'
  | 'ListaEsperaNotificada'
  | 'ConflictoExclusividadDetectado'

export interface CupoAlertEvent {
  id: string
  type: CupoAlertType
  cupoComercialId: string
  programaId: string
  emisoraId: string
  clienteNombre: string
  timestamp: Date
  payload: Record<string, unknown>
  severity: 'info' | 'warning' | 'error' | 'critical'
}

type AlertHandler = (event: CupoAlertEvent) => Promise<void>

export class CupoAlertPublisher {
  private handlers = new Map<string, AlertHandler[]>()
  private alertLog: CupoAlertEvent[] = []

  subscribe(alertType: CupoAlertType, handler: AlertHandler): () => void {
    const existing = this.handlers.get(alertType) || []
    existing.push(handler)
    this.handlers.set(alertType, existing)
    return () => {
      const handlers = this.handlers.get(alertType) || []
      this.handlers.set(alertType, handlers.filter(h => h !== handler))
    }
  }

  async publish(data: {
    type: CupoAlertType
    cupoComercialId: string
    programaId: string
    emisoraId: string
    clienteNombre: string
    payload: Record<string, unknown>
    severity: CupoAlertEvent['severity']
  }): Promise<void> {
    const event: CupoAlertEvent = {
      id: `ca_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ...data,
      timestamp: new Date()
    }

    this.alertLog.push(event)
    logger.info(`[CupoAlert] ${data.type} | ${data.clienteNombre} | Severity: ${data.severity}`)

    const handlers = this.handlers.get(data.type) || []
    await Promise.allSettled(handlers.map(h => h(event)))
  }

  getAlertLog(limit = 50): CupoAlertEvent[] {
    return this.alertLog.slice(-limit)
  }

  getAlertsByType(type: CupoAlertType): CupoAlertEvent[] {
    return this.alertLog.filter(e => e.type === type)
  }

  getCriticalAlerts(): CupoAlertEvent[] {
    return this.alertLog.filter(e => e.severity === 'critical')
  }
}
