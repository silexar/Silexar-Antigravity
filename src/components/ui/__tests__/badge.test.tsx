import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge Component', () => {
  it('renders default badge correctly', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    let badge = screen.getByText('Default')
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')

    rerender(<Badge variant="secondary">Secondary</Badge>)
    badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground')

    rerender(<Badge variant="outline">Outline</Badge>)
    badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-foreground')
    expect(badge).not.toHaveClass('bg-')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>)
    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Badge ref={ref}>Ref Badge</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('spreads additional props', () => {
    render(<Badge data-testid="test-badge" id="badge-id">Props Badge</Badge>)
    const badge = screen.getByTestId('test-badge')
    expect(badge).toHaveAttribute('id', 'badge-id')
  })

  it('renders with different content types', () => {
    const { rerender } = render(<Badge>Text Content</Badge>)
    expect(screen.getByText('Text Content')).toBeInTheDocument()

    rerender(<Badge>{123}</Badge>)
    expect(screen.getByText('123')).toBeInTheDocument()

    rerender(<Badge>{true && 'Conditional'}</Badge>)
    expect(screen.getByText('Conditional')).toBeInTheDocument()
  })

  it('maintains accessibility', () => {
    render(<Badge role="status" aria-label="Status badge">Accessible</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-label', 'Status badge')
  })
})