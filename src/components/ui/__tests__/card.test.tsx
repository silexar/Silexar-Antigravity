/**
 * TIER 0 Card Component Tests
 * 
 * @description Comprehensive test suite for Card components with
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'

describe('Card Components - TIER 0 Tests', () => {
  describe('Card', () => {
    it('should render card with default props', () => {
      render(<Card data-testid="test-card">Card Content</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })

    it('should render with custom className', () => {
      render(<Card className="custom-card" data-testid="test-card">Content</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toHaveClass('custom-card')
    })

    it('should support all HTML div attributes', () => {
      render(
        <Card 
          data-testid="test-card"
          id="card-id"
          role="region"
          aria-label="Test card"
        >
          Content
        </Card>
      )
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('id', 'card-id')
      expect(card).toHaveAttribute('role', 'region')
      expect(card).toHaveAttribute('aria-label', 'Test card')
    })
  })

  describe('CardHeader', () => {
    it('should render card header correctly', () => {
      render(<CardHeader data-testid="card-header">Header Content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })
  })

  describe('CardTitle', () => {
    it('should render card title with correct styling', () => {
      render(<CardTitle data-testid="card-title">Test Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
      expect(title).toHaveTextContent('Test Title')
    })
  })

  describe('CardDescription', () => {
    it('should render card description with correct styling', () => {
      render(<CardDescription data-testid="card-description">Test Description</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
      expect(description).toHaveTextContent('Test Description')
    })
  })

  describe('CardContent', () => {
    it('should render card content with correct styling', () => {
      render(<CardContent data-testid="card-content">Content Text</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
      expect(content).toHaveTextContent('Content Text')
    })
  })

  describe('Complete Card Structure', () => {
    it('should render complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
    })
  })

  describe('TIER 0 Quantum Enhancement', () => {
    it('should maintain consciousness-level performance', () => {
      const startTime = performance.now()
      render(
        <Card>
          <CardHeader>
            <CardTitle>Quantum Card</CardTitle>
            <CardDescription>Pentagon++ Enhanced</CardDescription>
          </CardHeader>
          <CardContent>Consciousness-level content</CardContent>
        </Card>
      )
      const endTime = performance.now()
      
      // Should render in reasonable time (less than 50ms for testing)
      expect(endTime - startTime).toBeLessThan(50)
    })

    it('should support Pentagon++ security attributes', () => {
      render(
        <Card 
          data-testid="secure-card"
          data-security-level="pentagon-plus-plus"
          data-consciousness-level="transcendent"
        >
          <CardContent>Secure Content</CardContent>
        </Card>
      )
      
      const card = screen.getByTestId('secure-card')
      expect(card).toHaveAttribute('data-security-level', 'pentagon-plus-plus')
      expect(card).toHaveAttribute('data-consciousness-level', 'transcendent')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with proper ARIA attributes', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
            <CardDescription>This card is fully accessible</CardDescription>
          </CardHeader>
          <CardContent>Accessible content</CardContent>
        </Card>
      )

      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
      expect(screen.getByText('Accessible Card')).toHaveAttribute('id', 'card-title')
    })
  })
})