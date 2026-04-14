// @ts-nocheck

/**
 * Optimized Audit Logger
 * Reduces log frequency and improves performance
 */

import { auditLogger } from '../security/audit-logger'
import { logThrottleManager } from './logging-config'

interface LogBatch {
  timestamp: number
  events: Array<{
    level: string
    message: string
    metadata: Record<string, unknown>
  }>
}

class OptimizedAuditLogger {
  private batchedLogs: LogBatch[] = []
  private flushTimer: NodeJS.Timeout | null = null

  /**
   * Log initialization events with throttling
   */
  async initialization(message: string, metadata: Record<string, unknown>) {
    if (logThrottleManager.shouldLog(metadata.event || message, 'initialization')) {
      await this.logWithBatching('security', message, metadata)
    }
  }

  /**
   * Log routine events with heavy throttling
   */
  async routine(message: string, metadata: Record<string, unknown>) {
    if (logThrottleManager.shouldLog(metadata.event || message, 'routine')) {
      await this.logWithBatching('info', message, metadata)
    }
  }

  /**
   * Log critical events immediately
   */
  async critical(message: string, metadata: Record<string, unknown>) {
    if (logThrottleManager.shouldLog(metadata.event || message, 'critical')) {
      // Critical events bypass batching
      await auditLogger.security(message, metadata)
    }
  }

  /**
   * Batch non-critical logs for efficiency
   */
  private async logWithBatching(level: string, message: string, metadata: Record<string, unknown>) {
    const currentBatch = this.getCurrentBatch()
    currentBatch.events.push({ level, message, metadata })

    // Flush if batch is full
    if (currentBatch.events.length >= 10) {
      await this.flushBatch(currentBatch)
    }

    // Set flush timer if not already set
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushAllBatches()
      }, 30000) // 30 seconds
    }
  }

  private getCurrentBatch(): LogBatch {
    const now = Date.now()
    let currentBatch = this.batchedLogs[this.batchedLogs.length - 1]

    if (!currentBatch || now - currentBatch.timestamp > 30000) {
      currentBatch = { timestamp: now, events: [] }
      this.batchedLogs.push(currentBatch)
    }

    return currentBatch
  }

  private async flushBatch(batch: LogBatch) {
    if (batch.events.length === 0) return

    // Group similar events
    const groupedEvents = this.groupSimilarEvents(batch.events)
    
    for (const [eventType, events] of Array.from(groupedEvents.entries())) {
      if (events.length === 1) {
        const event = events[0]
        await auditLogger.security(event.message, event.metadata)
      } else {
        // Batch similar events into one log
        await auditLogger.security(`${eventType} (${events.length} events)`, {
          event: 'BATCHED_EVENTS',
          eventType,
          count: events.length,
          timeRange: {
            start: new Date(batch.timestamp).toISOString(),
            end: new Date().toISOString()
          },
          sample: events[0].metadata
        })
      }
    }

    // Remove flushed batch
    const index = this.batchedLogs.indexOf(batch)
    if (index > -1) {
      this.batchedLogs.splice(index, 1)
    }
  }

  private async flushAllBatches() {
    const batches = [...this.batchedLogs]
    this.batchedLogs = []
    
    for (const batch of batches) {
      await this.flushBatch(batch)
    }

    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
  }

  private groupSimilarEvents(events: Array<{ level: string; message: string; metadata: Record<string, unknown> }>) {
    const groups = new Map<string, typeof events>()

    for (const event of events) {
      const eventType = event.metadata.event || event.message
      if (!groups.has(eventType)) {
        groups.set(eventType, [])
      }
      groups.get(eventType)!.push(event)
    }

    return groups
  }
}

export const optimizedAuditLogger = new OptimizedAuditLogger()