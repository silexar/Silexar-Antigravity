import { useState, useEffect, useCallback } from 'react'
import { systemMonitor, SystemMetrics } from '@/lib/monitoring/system-monitor'

interface UseSystemMonitorReturn {
  metrics: SystemMetrics | null
  isMonitoring: boolean
  startMonitoring: () => void
  stopMonitoring: () => void
  resetMetrics: () => void
  recordError: (message: string, error?: Error) => void
  recordWarning: (message: string) => void
  recordInfo: (message: string) => void
  recordInteraction: (responseTime: number) => void
  recordAPICall: (endpoint: string, responseTime: number, success: boolean) => void
}

export function useSystemMonitor(autoStart = true): UseSystemMonitorReturn {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = systemMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics)
    })

    // Get initial metrics
    const initialMetrics = systemMonitor.getMetrics()
    setMetrics(initialMetrics)

    // Auto-start monitoring if requested
    if (autoStart && typeof window !== 'undefined') {
      systemMonitor.start()
      setIsMonitoring(true)
    }

    return () => {
      unsubscribe()
    }
  }, [autoStart])

  const startMonitoring = useCallback(() => {
    systemMonitor.start()
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    systemMonitor.stop()
    setIsMonitoring(false)
  }, [])

  const resetMetrics = useCallback(() => {
    systemMonitor.reset()
  }, [])

  const recordError = useCallback((message: string, error?: Error) => {
    systemMonitor.logError(message, error)
  }, [])

  const recordWarning = useCallback((message: string) => {
    systemMonitor.logWarning(message)
  }, [])

  const recordInfo = useCallback((message: string) => {
    systemMonitor.logInfo(message)
  }, [])

  const recordInteraction = useCallback((responseTime: number) => {
    systemMonitor.recordInteraction(responseTime)
  }, [])

  const recordAPICall = useCallback((endpoint: string, responseTime: number, success: boolean) => {
    systemMonitor.recordAPICall(endpoint, responseTime, success)
  }, [])

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    recordError,
    recordWarning,
    recordInfo,
    recordInteraction,
    recordAPICall
  }
}