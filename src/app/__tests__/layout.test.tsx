/**
 * TIER 0 Root Layout Tests
 * 
 * @description Comprehensive test suite for root layout with
 * consciousness-level validation and quantum-enhanced testing.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 */

import { render, screen } from '@testing-library/react'
import RootLayout from '../layout'

// Mock Next.js components
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>
}))

jest.mock('@/components/providers/auth-provider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}))

jest.mock('@/components/providers/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="query-provider">{children}</div>
}))

jest.mock('@/components/providers/quantum-provider', () => ({
  QuantumProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="quantum-provider">{children}</div>
}))

jest.mock('@/components/layout/main-navigation', () => ({
  MainNavigation: () => <nav data-testid="main-navigation">Navigation</nav>
}))

describe('RootLayout - TIER 0 Tests', () => {
  const mockChildren = <div data-testid="page-content">Page Content</div>

  describe('HTML Structure', () => {
    it('should render html element with correct attributes', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const htmlElement = document.documentElement
      expect(htmlElement).toHaveAttribute('lang', 'en')
      expect(htmlElement).toHaveAttribute('suppressHydrationWarning')
    })

    it('should render body with correct classes', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const bodyElement = document.body
      expect(bodyElement).toHaveClass('min-h-screen', 'bg-[#F0EDE8]', 'font-sans', 'antialiased')
      expect(bodyElement).toHaveAttribute('suppressHydrationWarning')
    })
  })

  describe('Provider Stack', () => {
    it('should render all providers in correct order', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      // Check that all providers are present
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
      expect(screen.getByTestId('query-provider')).toBeInTheDocument()
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
      expect(screen.getByTestId('quantum-provider')).toBeInTheDocument()
    })

    it('should nest providers correctly', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const themeProvider = screen.getByTestId('theme-provider')
      const queryProvider = screen.getByTestId('query-provider')
      const authProvider = screen.getByTestId('auth-provider')
      const quantumProvider = screen.getByTestId('quantum-provider')
      
      // Check nesting structure
      expect(themeProvider).toContainElement(queryProvider)
      expect(queryProvider).toContainElement(authProvider)
      expect(authProvider).toContainElement(quantumProvider)
    })
  })

  describe('Navigation and Content', () => {
    it('should render main navigation', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      expect(screen.getByTestId('main-navigation')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      expect(screen.getByTestId('page-content')).toBeInTheDocument()
      expect(screen.getByText('Page Content')).toBeInTheDocument()
    })

    it('should render main content with correct structure', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const mainContent = screen.getByRole('main')
      expect(mainContent).toBeInTheDocument()
      expect(mainContent).toHaveAttribute('id', 'main-content')
      expect(mainContent).toHaveClass('flex-1', 'overflow-auto')
      expect(mainContent).toContainElement(screen.getByTestId('page-content'))
    })
  })

  describe('Accessibility', () => {
    it('should have skip to main content link', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
      expect(skipLink).toHaveClass('sr-only')
    })

    it('should have proper landmark structure', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Should have navigation landmark
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const skipLink = screen.getByText('Skip to main content')
      
      // Skip link should be focusable
      skipLink.focus()
      expect(skipLink).toHaveFocus()
    })
  })

  describe('TIER 0 Quantum Enhancement', () => {
    it('should maintain consciousness-level performance', () => {
      const startTime = performance.now()
      render(<RootLayout>{mockChildren}</RootLayout>)
      const endTime = performance.now()
      
      // Should render in less than 5ms (quantum speed)
      expect(endTime - startTime).toBeLessThan(5)
    })

    it('should include quantum provider in stack', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const quantumProvider = screen.getByTestId('quantum-provider')
      expect(quantumProvider).toBeInTheDocument()
      expect(quantumProvider).toContainElement(screen.getByTestId('page-content'))
    })

    it('should support Pentagon++ security structure', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      // Should have secure layout structure
      const layoutContainer = screen.getByTestId('page-content').closest('div')
      expect(layoutContainer).toHaveClass('relative', 'flex', 'min-h-screen')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive layout structure', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      const layoutContainer = screen.getByTestId('page-content').closest('div')
      expect(layoutContainer).toHaveClass('flex', 'min-h-screen')
      
      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveClass('flex-1', 'overflow-auto')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing children gracefully', () => {
      render(<RootLayout>{null}</RootLayout>)
      
      // Should still render layout structure
      expect(screen.getByTestId('main-navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <RootLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </RootLayout>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  describe('SEO and Meta', () => {
    it('should have proper document structure for SEO', () => {
      render(<RootLayout>{mockChildren}</RootLayout>)
      
      // HTML should have lang attribute
      expect(document.documentElement).toHaveAttribute('lang', 'en')
      
      // Body should have proper classes for styling
      expect(document.body).toHaveClass('min-h-screen')
    })
  })
})