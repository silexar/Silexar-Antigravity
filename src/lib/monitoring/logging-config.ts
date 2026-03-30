/**
 * Optimized Logging Configuration
 * Reduces log frequency and improves performance
 */

export interface LoggingConfig {
  enabled: boolean
  environment: 'development' | 'production' | 'test'
  levels: {
    initialization: boolean
    routine: boolean
    critical: boolean
  }
  throttling: {
    enabled: boolean
    initializationInterval: number // ms
    routineInterval: number // ms
    criticalInterval: number // ms
  }
  batching: {
    enabled: boolean
    batchSize: number
    flushInterval: number // ms
  }
}

export const defaultLoggingConfig: LoggingConfig = {
  enabled: true,
  environment: (process.env.NODE_ENV as unknown) || 'development',
  levels: {
    initialization: process.env.ENABLE_AI_INITIALIZATION_LOGS === 'true' || process.env.NODE_ENV === 'development',
    routine: process.env.ENABLE_AI_ROUTINE_LOGS === 'true' || false,
    critical: process.env.ENABLE_AI_CRITICAL_LOGS !== 'false'
  },
  throttling: {
    enabled: true,
    initializationInterval: parseInt(process.env.AI_INIT_LOG_INTERVAL || '60000'),
    routineInterval: parseInt(process.env.AI_ROUTINE_LOG_INTERVAL || '300000'),
    criticalInterval: parseInt(process.env.AI_CRITICAL_LOG_INTERVAL || '1000')
  },
  batching: {
    enabled: process.env.ENABLE_LOG_BATCHING !== 'false',
    batchSize: parseInt(process.env.LOG_BATCH_SIZE || '10'),
    flushInterval: parseInt(process.env.LOG_FLUSH_INTERVAL || '30000')
  }
}

/**
 * Log throttling manager
 */
class LogThrottleManager {
  private lastLogTimes = new Map<string, number>()
  private config: LoggingConfig

  constructor(config: LoggingConfig) {
    this.config = config
  }

  shouldLog(eventType: string, category: 'initialization' | 'routine' | 'critical'): boolean {
    if (!this.config.enabled || !this.config.levels[category]) {
      return false
    }

    if (!this.config.throttling.enabled) {
      return true
    }

    const now = Date.now()
    const lastTime = this.lastLogTimes.get(eventType) || 0
    const intervalMap: Record<'initialization' | 'routine' | 'critical', number> = {
      initialization: this.config.throttling.initializationInterval,
      routine: this.config.throttling.routineInterval,
      critical: this.config.throttling.criticalInterval,
    }
    const interval = intervalMap[category]

    if (now - lastTime >= interval) {
      this.lastLogTimes.set(eventType, now)
      return true
    }

    return false
  }

  updateConfig(config: Partial<LoggingConfig>) {
    this.config = { ...this.config, ...config }
  }
}

export const logThrottleManager = new LogThrottleManager(defaultLoggingConfig)