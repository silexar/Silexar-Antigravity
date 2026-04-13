import { toast } from '@/components/ui/use-toast'
import { logger } from '@/lib/observability';

export interface SystemMetrics {
  timestamp: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  performance: {
    loadTime: number
    renderTime: number
    apiResponseTime: number
  }
  errors: {
    count: number
    recent: Array<{
      message: string
      stack?: string
      timestamp: number
      type: 'error' | 'warning' | 'info'
    }>
  }
  user: {
    activeSessions: number
    totalInteractions: number
    averageResponseTime: number
  }
}

export interface MonitoringConfig {
  enabled: boolean
  sampleInterval: number // milliseconds
  maxErrors: number
  alertThresholds: {
    memoryUsage: number // percentage
    responseTime: number // milliseconds
    errorRate: number // errors per minute
  }
}

class SystemMonitor {
  private config: MonitoringConfig = {
    enabled: true,
    sampleInterval: 5000, // 5 seconds
    maxErrors: 100,
    alertThresholds: {
      memoryUsage: 85,
      responseTime: 2000,
      errorRate: 5
    }
  }

  private metrics: SystemMetrics | null = null
  private sampleInterval: NodeJS.Timeout | null = null
  private errorLog: SystemMetrics['errors']['recent'] = []
  private listeners: Array<(metrics: SystemMetrics) => void> = []
  private startTime: number = Date.now()
  private interactionTimes: number[] = []

  constructor(config?: Partial<MonitoringConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    this.initializeMetrics()
  }

  private initializeMetrics(): void {
    this.metrics = {
      timestamp: Date.now(),
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      performance: {
        loadTime: 0,
        renderTime: 0,
        apiResponseTime: 0
      },
      errors: {
        count: 0,
        recent: []
      },
      user: {
        activeSessions: 0,
        totalInteractions: 0,
        averageResponseTime: 0
      }
    }
  }

  start(): void {
    if (!this.config.enabled || this.sampleInterval) {
      return
    }

    this.sampleInterval = setInterval(() => {
      this.collectMetrics()
    }, this.config.sampleInterval)

    this.collectMetrics() // Collect initial metrics
  }

  stop(): void {
    if (this.sampleInterval) {
      clearInterval(this.sampleInterval)
      this.sampleInterval = null
    }
  }

  private collectMetrics(): void {
    try {
      const memoryInfo = this.collectMemoryMetrics()
      const performanceInfo = this.collectPerformanceMetrics()
      const userInfo = this.collectUserMetrics()

      this.metrics = {
        timestamp: Date.now(),
        memory: memoryInfo,
        performance: performanceInfo,
        errors: {
          count: this.errorLog.length,
          recent: [...this.errorLog].slice(-10) // Keep last 10 errors
        },
        user: userInfo
      }

      this.checkAlertThresholds()
      this.notifyListeners()
    } catch (error) {
      this.logError('Error collecting metrics', error as Error)
    }
  }

  private collectMemoryMetrics(): SystemMetrics['memory'] {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ('memory' in performance && typeof (performance as unknown).memory === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memory = (performance as unknown).memory
        const used = memory.usedJSHeapSize || 0
        const total = memory.totalJSHeapSize || 0
        const limit = memory.jsHeapSizeLimit || 0
        
        return {
          used,
          total: total || limit,
          percentage: total > 0 ? (used / total) * 100 : 0
        }
      }
    } catch (error) {
      logger.warn('Memory metrics not available')
    }

    return {
      used: 0,
      total: 0,
      percentage: 0
    }
  }

  private collectPerformanceMetrics(): SystemMetrics['performance'] {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation?.loadEventEnd - navigation?.loadEventStart || 0
      
      const paintEntries = performance.getEntriesByType('paint')
      const firstPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      const renderTime = firstPaint?.startTime || 0

      return {
        loadTime,
        renderTime,
        apiResponseTime: this.calculateAverageResponseTime()
      }
    } catch (error) {
      this.logError('Error collecting performance metrics', error as Error)
      return {
        loadTime: 0,
        renderTime: 0,
        apiResponseTime: 0
      }
    }
  }

  private collectUserMetrics(): SystemMetrics['user'] {
    try {
      const averageResponseTime = this.interactionTimes.length > 0
        ? this.interactionTimes.reduce((a, b) => a + b, 0) / this.interactionTimes.length
        : 0

      return {
        activeSessions: this.estimateActiveSessions(),
        totalInteractions: this.interactionTimes.length,
        averageResponseTime
      }
    } catch (error) {
      this.logError('Error collecting user metrics', error as Error)
      return {
        activeSessions: 0,
        totalInteractions: 0,
        averageResponseTime: 0
      }
    }
  }

  private calculateAverageResponseTime(): number {
    return this.interactionTimes.length > 0
      ? this.interactionTimes.reduce((a, b) => a + b, 0) / this.interactionTimes.length
      : 0
  }

  private estimateActiveSessions(): number {
    // Simple estimation based on recent interactions
    const recentInteractions = this.interactionTimes.filter(
      time => Date.now() - time < 300000 // Last 5 minutes
    )
    return Math.min(recentInteractions.length, 10) // Cap at 10
  }

  private checkAlertThresholds(): void {
    if (!this.metrics) return

    const { memory, performance } = this.metrics
    const { alertThresholds } = this.config

    // Check memory usage
    if (memory.percentage > alertThresholds.memoryUsage) {
      this.sendAlert('high_memory_usage', `Memory usage is at ${memory.percentage.toFixed(1)}%`)
    }

    // Check response time
    if (performance.apiResponseTime > alertThresholds.responseTime) {
      this.sendAlert('high_response_time', `Average response time is ${performance.apiResponseTime.toFixed(0)}ms`)
    }

    // Check error rate
    const errorRate = this.calculateErrorRate()
    if (errorRate > alertThresholds.errorRate) {
      this.sendAlert('high_error_rate', `Error rate is ${errorRate.toFixed(1)} errors/minute`)
    }
  }

  private calculateErrorRate(): number {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentErrors = this.errorLog.filter(error => error.timestamp > oneMinuteAgo)
    return recentErrors.length
  }

  private sendAlert(type: string, message: string): void {
    toast({
      title: 'System Alert',
      description: message,
      variant: 'destructive'
    })

    // Log to console for development
    logger.warn(`[System Monitor] ${type}: ${message}`)
  }

  logError(message: string, error?: Error): void {
    const errorEntry = {
      message,
      stack: error?.stack,
      timestamp: Date.now(),
      type: 'error' as const
    }

    this.errorLog.push(errorEntry)

    // Keep only the most recent errors
    if (this.errorLog.length > this.config.maxErrors) {
      this.errorLog = this.errorLog.slice(-this.config.maxErrors)
    }

    // Update metrics if they exist
    if (this.metrics) {
      this.metrics.errors = {
        count: this.errorLog.length,
        recent: [...this.errorLog].slice(-10)
      }
    }
  }

  logWarning(message: string): void {
    this.errorLog.push({
      message,
      timestamp: Date.now(),
      type: 'warning'
    })

    // Update metrics if they exist
    if (this.metrics) {
      this.metrics.errors = {
        count: this.errorLog.length,
        recent: [...this.errorLog].slice(-10)
      }
    }
  }

  logInfo(message: string): void {
    this.errorLog.push({
      message,
      timestamp: Date.now(),
      type: 'info'
    })

    // Update metrics if they exist
    if (this.metrics) {
      this.metrics.errors = {
        count: this.errorLog.length,
        recent: [...this.errorLog].slice(-10)
      }
    }
  }

  recordInteraction(responseTime: number): void {
    this.interactionTimes.push(responseTime)
    
    // Keep only recent interactions (last hour)
    const oneHourAgo = Date.now() - 3600000
    this.interactionTimes = this.interactionTimes.filter(
      time => time > oneHourAgo
    )

    // Update metrics if they exist
    if (this.metrics) {
      this.metrics.user = {
        activeSessions: this.estimateActiveSessions(),
        totalInteractions: this.interactionTimes.length,
        averageResponseTime: this.calculateAverageResponseTime()
      }
    }
  }

  recordAPICall(endpoint: string, responseTime: number, success: boolean): void {
    if (!success) {
      this.logError(`API call failed: ${endpoint}`)
    }
    
    this.recordInteraction(responseTime)
  }

  getMetrics(): SystemMetrics | null {
    return this.metrics
  }

  subscribe(listener: (metrics: SystemMetrics) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    if (!this.metrics) return
    
    this.listeners.forEach(listener => {
      try {
        listener(this.metrics!)
      } catch (error) {
        logger.error('Error in monitoring listener:', error instanceof Error ? error : undefined)
      }
    })
  }

  getUptime(): number {
    return Date.now() - this.startTime
  }

  reset(): void {
    this.errorLog = []
    this.interactionTimes = []
    this.initializeMetrics()
    this.startTime = Date.now()
  }
}

// Create singleton instance
export const systemMonitor = new SystemMonitor()

// Auto-start monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  systemMonitor.start()
}

export default SystemMonitor