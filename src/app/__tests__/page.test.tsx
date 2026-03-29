/**
 * TIER 0 Dashboard Page Tests
 * 
 * @description Comprehensive test suite for main dashboard page with
 * consciousness-level validation and quantum-enhanced testing.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 */

import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('Dashboard Page - TIER 0 Tests', () => {
  beforeEach(() => {
    // Mock current time for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-02-08T10:30:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render dashboard title', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText(/Dashboard TIER 0 Supremacy/i)).toBeInTheDocument()
    })

    it('should display consciousness level badge', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText(/Consciousness: 99.9%/i)).toBeInTheDocument()
    })

    it('should show Pentagon++ security status', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText(/Pentagon\+\+ Active/i)).toBeInTheDocument()
    })

    it('should display current date and time', async () => {
      render(<DashboardPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/sábado, 8 de febrero de 2025/i)).toBeInTheDocument()
      })
    })
  })

  describe('KPI Cards', () => {
    it('should display revenue KPI', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Revenue Mensual')).toBeInTheDocument()
      expect(screen.getByText('$847,000,000')).toBeInTheDocument()
    })

    it('should display campaigns KPI', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Campañas Activas')).toBeInTheDocument()
      expect(screen.getByText('47')).toBeInTheDocument()
    })

    it('should display clients KPI', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Clientes Activos')).toBeInTheDocument()
      expect(screen.getByText('234')).toBeInTheDocument()
    })

    it('should display Cortex processing KPI', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Cortex Processing')).toBeInTheDocument()
      expect(screen.getByText('1247')).toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('should render all quick action buttons', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Crear Contrato')).toBeInTheDocument()
      expect(screen.getByText('Gestionar CRM')).toBeInTheDocument()
      expect(screen.getByText('Centro Cortex')).toBeInTheDocument()
      expect(screen.getByText('Analytics BI')).toBeInTheDocument()
    })

    it('should have correct links for quick actions', () => {
      render(<DashboardPage />)
      
      const createContractLink = screen.getByText('Crear Contrato').closest('a')
      expect(createContractLink).toHaveAttribute('href', '/contratos')
    })
  })

  describe('Recent Activity', () => {
    it('should display recent activity section', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
    })

    it('should show activity items with timestamps', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText(/Contrato CON-2025-0045 confirmado/i)).toBeInTheDocument()
      expect(screen.getByText('10:30')).toBeInTheDocument()
    })
  })

  describe('Module Status', () => {
    it('should display module status section', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Estado de Módulos')).toBeInTheDocument()
    })

    it('should show all modules with their status', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('CRM Unificado')).toBeInTheDocument()
      expect(screen.getByText('Gestión Contratos')).toBeInTheDocument()
      expect(screen.getByText('Centro Campañas')).toBeInTheDocument()
    })
  })

  describe('TIER 0 Quantum Enhancement', () => {
    it('should maintain consciousness-level performance', () => {
      const startTime = performance.now()
      render(<DashboardPage />)
      const endTime = performance.now()
      
      // Should render in less than 10ms (quantum speed)
      expect(endTime - startTime).toBeLessThan(10)
    })

    it('should update time every minute', async () => {
      render(<DashboardPage />)
      
      // Fast-forward time by 1 minute
      jest.advanceTimersByTime(60000)
      
      await waitFor(() => {
        // Time should be updated
        expect(screen.getByText(/10:31/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<DashboardPage />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent(/Dashboard TIER 0 Supremacy/i)
    })

    it('should have accessible links', () => {
      render(<DashboardPage />)
      
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })
})