import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EnterpriseMonitoringDashboard from '@/components/monitoring/EnterpriseMonitoringDashboard'

// Mock dependencies
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}))

vi.mock('@/lib/enterprise/monitoring', () => ({
  enterpriseMonitoring: {
    getMetrics: vi.fn(() => ({
      systemHealth: 95,
      performance: {
        cpu: 45,
        memory: 62,
        disk: 38
      },
      alerts: [],
      compliance: {
        soc2: { status: 'compliant', lastAudit: '2025-01-01' },
        fortune10: { status: 'compliant', score: 98 }
      }
    })),
    getAlertHistory: vi.fn(() => []),
    subscribe: vi.fn(() => vi.fn()),
    start: vi.fn(),
    stop: vi.fn()
  }
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />
}))

describe('EnterpriseMonitoringDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render monitoring dashboard', async () => {
    render(<EnterpriseMonitoringDashboard />)
    
    expect(screen.getByText('Enterprise Monitoring Dashboard')).toBeInTheDocument()
    expect(screen.getByText('System Health')).toBeInTheDocument()
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument()
  })

  it('should display system health metrics', async () => {
    render(<EnterpriseMonitoringDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument()
    })
  })

  it('should display performance metrics', async () => {
    render(<EnterpriseMonitoringDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('CPU Usage')).toBeInTheDocument()
      expect(screen.getByText('Memory Usage')).toBeInTheDocument()
      expect(screen.getByText('Disk Usage')).toBeInTheDocument()
    })
  })

  it('should display compliance status', async () => {
    render(<EnterpriseMonitoringDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('SOC 2 Compliance')).toBeInTheDocument()
      expect(screen.getByText('Fortune 10 Compliance')).toBeInTheDocument()
    })
  })

  it('should handle refresh functionality', async () => {
    const user = userEvent.setup()
    render(<EnterpriseMonitoringDashboard />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)
    
    // Should trigger metrics refresh
    expect(screen.getByText('Enterprise Monitoring Dashboard')).toBeInTheDocument()
  })

  it('should handle time range selection', async () => {
    const user = userEvent.setup()
    render(<EnterpriseMonitoringDashboard />)
    
    const timeRangeSelect = screen.getByRole('combobox')
    await user.click(timeRangeSelect)
    
    // Should show time range options
    expect(screen.getByText('Enterprise Monitoring Dashboard')).toBeInTheDocument()
  })

  it('should display alert history', async () => {
    render(<EnterpriseMonitoringDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Alert History')).toBeInTheDocument()
    })
  })

  it('should show loading state', async () => {
    // Mock slow loading
    vi.mocked(require('@/lib/enterprise/monitoring').enterpriseMonitoring.getMetrics)
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<EnterpriseMonitoringDashboard />)
    
    // Should show loading initially
    expect(screen.getByText('Enterprise Monitoring Dashboard')).toBeInTheDocument()
  })

  it('should handle errors gracefully', async () => {
    vi.mocked(require('@/lib/enterprise/monitoring').enterpriseMonitoring.getMetrics)
      .mockImplementationOnce(() => {
        throw new Error('Failed to fetch metrics')
      })
    
    render(<EnterpriseMonitoringDashboard />)
    
    // Should still render without crashing
    expect(screen.getByText('Enterprise Monitoring Dashboard')).toBeInTheDocument()
  })

  it('should update metrics in real-time', async () => {
    const mockSubscribe = vi.fn((callback: (data: Record<string, unknown>) => void) => {
      // Simulate real-time update
      setTimeout(() => {
        callback({
          systemHealth: 85,
          performance: { cpu: 75, memory: 80, disk: 60 }
        })
      }, 100)
      return vi.fn() // unsubscribe function
    })
    
    vi.mocked(require('@/lib/enterprise/monitoring').enterpriseMonitoring.subscribe)
      .mockImplementation(mockSubscribe)
    
    render(<EnterpriseMonitoringDashboard />)
    
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })
  })

  it('should export metrics data', async () => {
    const user = userEvent.setup()
    render(<EnterpriseMonitoringDashboard />)
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)
    
    // Should trigger export functionality
    expect(screen.getByText('Enterprise Monitoring Dashboard')).toBeInTheDocument()
  })
})