import { logger } from '@/lib/observability';
/**
 * DOMAIN EVENT: DISPONIBILIDAD EVENT PUBLISHER - TIER 0 ENTERPRISE
 *
 * @description Publica eventos de cambios en disponibilidad de inventario:
 * ocupación, liberación, alertas de capacidad, semáforo de salud.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type DisponibilidadEventType =
  | 'OcupacionCambiada'
  | 'NivelAlertaAlcanzado'
  | 'SinCuposDisponibles'
  | 'CupoLiberadoParaListaEspera'
  | 'SemaforoSaludCambiado'
  | 'RevenuePerdidoActualizado'

export interface DisponibilidadEvent {
  id: string
  type: DisponibilidadEventType
  programaId: string
  emisoraId: string
  timestamp: Date
  payload: {
    ocupacionAnterior?: number
    ocupacionNueva?: number
    nivelAlerta?: string
    saludInventario?: string
    cuposDisponibles?: number
    revenuePerdido?: number
    [key: string]: unknown
  }
}

type DisponibilidadHandler = (event: DisponibilidadEvent) => Promise<void>

export class DisponibilidadEventPublisher {
  private handlers = new Map<string, DisponibilidadHandler[]>()
  private eventLog: DisponibilidadEvent[] = []

  subscribe(eventType: DisponibilidadEventType, handler: DisponibilidadHandler): () => void {
    const existing = this.handlers.get(eventType) || []
    existing.push(handler)
    this.handlers.set(eventType, existing)
    return () => {
      const h = this.handlers.get(eventType) || []
      this.handlers.set(eventType, h.filter(fn => fn !== handler))
    }
  }

  async publish(data: Omit<DisponibilidadEvent, 'id' | 'timestamp'>): Promise<void> {
    const event: DisponibilidadEvent = {
      ...data,
      id: `de_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date()
    }

    this.eventLog.push(event)
    logger.info(`[DisponibilidadEvent] ${data.type} | Programa: ${data.programaId}`)

    const handlers = this.handlers.get(data.type) || []
    await Promise.allSettled(handlers.map(h => h(event)))
  }

  getEventLog(limit = 50): DisponibilidadEvent[] {
    return this.eventLog.slice(-limit)
  }
}
