import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BusinessIntelligenceDashboard } from '../BusinessIntelligenceDashboard'

// Mock de datos
const mockMetrics = {
  totalAttention: 1250000,
  averageUtility: 8.7,
  completionRate: 0.85,
  activeContracts: 45,
  monthlyGrowth: 12.5,
  revenue: 987500
}

const mockBillingData = [
  { model: 'CPVI', revenue: 450000, percentage: 45 },
  { model: 'CPCN', revenue: 350000, percentage: 35 },
  { model: 'CPC', revenue: 187500, percentage: 20 }
]

// Mock de hooks y servicios
vi.mock('@/lib/billing', () => ({
  getBillingMetrics: vi.fn(() => Promise.resolve(mockMetrics)),
  getBillingModelsData: vi.fn(() => Promise.resolve(mockBillingData))
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() }))
    }))
  }))
}))

describe('BusinessIntelligenceDashboard', () => {
  it('renders dashboard header correctly', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Inteligencia de Negocios')).toBeInTheDocument()
    })
  })

  it('renders all main tabs', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /atención/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /utilidad/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /flujo narrativo/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /modelos de facturación/i })).toBeInTheDocument()
    })
  })

  it('renders metric cards', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete and data to load
    await waitFor(() => {
      expect(screen.getByText('Ingresos Totales')).toBeInTheDocument()
      expect(screen.getByText('Interacciones Totales')).toBeInTheDocument()
      expect(screen.getByText('Tiempo de Atención Promedio')).toBeInTheDocument()
      expect(screen.getByText('Tasa de Conversión')).toBeInTheDocument()
    })
  })

  it('renders date range picker', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Seleccionar rango de fechas')).toBeInTheDocument()
    })
  })

  it('renders contract selector', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('renders export and refresh buttons', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument()
    })
  })

  it('renders real-time status indicator', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Tiempo Real')).toBeInTheDocument()
    })
  })

  it('handles tab switching', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      const utilityTab = screen.getByRole('tab', { name: /utilidad/i })
      
      // Click on utility tab
      utilityTab.click()
      
      // Should show utility content
      expect(screen.getByText(/ingresos por modelo de facturación/i)).toBeInTheDocument()
    })
  })

  it('renders with proper accessibility', async () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('handles loading states gracefully', () => {
    render(<BusinessIntelligenceDashboard />)
    
    // Should show loading indicators initially
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('renders responsive layout', async () => {
    const { container } = render(<BusinessIntelligenceDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      // Check for responsive grid classes
      expect(container.querySelector('.grid')).toBeInTheDocument()
      expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument()
      expect(container.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument()
    })
  })
})