import { logger } from '@/lib/observability';
/**
 * DOMAIN EVENT: TARIFARIO CHANGE PUBLISHER - TIER 0 ENTERPRISE
 *
 * @description Publica eventos cuando se modifican tarifas, factores,
 * paquetes de descuento, o configuración de pricing.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type TarifarioChangeType =
  | 'PrecioBaseModificado'
  | 'FactorAgregado'
  | 'FactorEliminado'
  | 'PaqueteDescuentoCreado'
  | 'PaqueteDescuentoModificado'
  | 'TarifarioActivado'
  | 'TarifarioDesactivado'
  | 'AjusteInflacionAplicado'
  | 'RevisionAutomaticaEjecutada'

export interface TarifarioChangeEvent {
  id: string
  type: TarifarioChangeType
  programaId: string
  emisoraId: string
  timestamp: Date
  payload: {
    valorAnterior?: number
    valorNuevo?: number
    moneda?: string
    motivo?: string
    responsable?: string
    [key: string]: unknown
  }
}

type TarifarioHandler = (event: TarifarioChangeEvent) => Promise<void>

export class TarifarioChangePublisher {
  private handlers = new Map<string, TarifarioHandler[]>()
  private eventLog: TarifarioChangeEvent[] = []

  subscribe(eventType: TarifarioChangeType, handler: TarifarioHandler): () => void {
    const existing = this.handlers.get(eventType) || []
    existing.push(handler)
    this.handlers.set(eventType, existing)
    return () => {
      const h = this.handlers.get(eventType) || []
      this.handlers.set(eventType, h.filter(fn => fn !== handler))
    }
  }

  async publish(data: Omit<TarifarioChangeEvent, 'id' | 'timestamp'>): Promise<void> {
    const event: TarifarioChangeEvent = {
      ...data,
      id: `tc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date()
    }

    this.eventLog.push(event)
    logger.info(`[TarifarioChange] ${data.type} | Programa: ${data.programaId} | ${data.payload.motivo || ''}`)

    const handlers = this.handlers.get(data.type) || []
    await Promise.allSettled(handlers.map(h => h(event)))
  }

  getEventLog(limit = 50): TarifarioChangeEvent[] {
    return this.eventLog.slice(-limit)
  }

  getChangesByPrograma(programaId: string): TarifarioChangeEvent[] {
    return this.eventLog.filter(e => e.programaId === programaId)
  }
}
