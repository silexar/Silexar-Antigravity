import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSystemMonitor } from '../use-system-monitor'

// Create mock functions outside the mock factory
const mockStart = vi.fn()
const mockStop = vi.fn()
const mockGetMetrics = vi.fn()
const mockSubscribe = vi.fn()
const mockReset = vi.fn()
const mockLogError = vi.fn()
const mockLogWarning = vi.fn()
const mockLogInfo = vi.fn()
const mockRecordInteraction = vi.fn()
const mockRecordAPICall = vi.fn()

// Mock the system monitor
vi.mock('@/lib/monitoring/system-monitor', () => {
  const mockMetrics = {
    timestamp: Date.now(),
    memory: { used: 1024, total: 2048, percentage: 50 },
    performance: { loadTime: 100, renderTime: 50, apiResponseTime: 75 },
    errors: { count: 0, recent: [] },
    user: { activeSessions: 1, totalInteractions: 5, averageResponseTime: 100 }
  }

  mockGetMetrics.mockReturnValue(mockMetrics)
  mockSubscribe.mockImplementation((callback) => {
    // Simulate immediate callback with initial metrics
    callback(mockMetrics)
    return vi.fn() // Return unsubscribe function
  })

  const mockSystemMonitor = {
    start: mockStart,
    stop: mockStop,
    getMetrics: mockGetMetrics,
    subscribe: mockSubscribe,
    reset: mockReset,
    logError: mockLogError,
    logWarning: mockLogWarning,
    logInfo: mockLogInfo,
    recordInteraction: mockRecordInteraction,
    recordAPICall: mockRecordAPICall
  }

  return {
    systemMonitor: mockSystemMonitor,
    SystemMonitor: vi.fn(() => mockSystemMonitor)
  }
})

describe('useSystemMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with metrics', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    expect(result.current.metrics).not.toBeNull()
    expect(result.current.metrics?.memory.percentage).toBe(50)
    expect(result.current.isMonitoring).toBe(true)
  })

  it('should not auto-start when autoStart is false', () => {
    const { result } = renderHook(() => useSystemMonitor(false))
    
    expect(result.current.isMonitoring).toBe(false)
  })

  it('should start monitoring', () => {
    const { result } = renderHook(() => useSystemMonitor(false))
    
    expect(result.current.isMonitoring).toBe(false)
    
    act(() => {
      result.current.startMonitoring()
    })
    
    expect(result.current.isMonitoring).toBe(true)
    expect(mockStart).toHaveBeenCalled()
  })

  it('should stop monitoring', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    expect(result.current.isMonitoring).toBe(true)
    
    act(() => {
      result.current.stopMonitoring()
    })
    
    expect(result.current.isMonitoring).toBe(false)
    expect(mockStop).toHaveBeenCalled()
  })

  it('should reset metrics', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    act(() => {
      result.current.resetMetrics()
    })
    
    expect(mockReset).toHaveBeenCalled()
  })

  it('should record errors', () => {
    const { result } = renderHook(() => useSystemMonitor())
    const error = new Error('Test error')
    
    act(() => {
      result.current.recordError('Test error message', error)
    })
    
    expect(mockLogError).toHaveBeenCalledWith('Test error message', error)
  })

  it('should record warnings', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    act(() => {
      result.current.recordWarning('Test warning')
    })
    
    expect(mockLogWarning).toHaveBeenCalledWith('Test warning')
  })

  it('should record info messages', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    act(() => {
      result.current.recordInfo('Test info')
    })
    
    expect(mockLogInfo).toHaveBeenCalledWith('Test info')
  })

  it('should record interactions', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    act(() => {
      result.current.recordInteraction(150)
    })
    
    expect(mockRecordInteraction).toHaveBeenCalledWith(150)
  })

  it('should record API calls', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    act(() => {
      result.current.recordAPICall('/api/test', 200, true)
    })
    
    expect(mockRecordAPICall).toHaveBeenCalledWith('/api/test', 200, true)
  })

  it('should handle subscription cleanup', () => {
    const { unmount } = renderHook(() => useSystemMonitor())
    
    const unsubscribeMock = mockSubscribe.mock.results[0].value
    
    unmount()
    
    expect(unsubscribeMock).toHaveBeenCalled()
  })

  it('should update metrics when system monitor publishes new metrics', () => {
    const { result } = renderHook(() => useSystemMonitor())
    
    // Get the subscribe callback
    const subscribeCallback = mockSubscribe.mock.calls[0][0]
    
    // Simulate new metrics
    const newMetrics = {
      timestamp: Date.now() + 1000,
      memory: { used: 1536, total: 2048, percentage: 75 },
      performance: { loadTime: 120, renderTime: 60, apiResponseTime: 90 },
      errors: { count: 1, recent: [{ message: 'New error', timestamp: Date.now(), type: 'error' as const }] },
      user: { activeSessions: 2, totalInteractions: 10, averageResponseTime: 120 }
    }
    
    act(() => {
      subscribeCallback(newMetrics)
    })
    
    expect(result.current.metrics?.memory.percentage).toBe(75)
    expect(result.current.metrics?.errors.count).toBe(1)
  })
})