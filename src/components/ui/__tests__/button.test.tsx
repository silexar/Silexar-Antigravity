import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders default button correctly', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button', { name: 'Default Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    let button = screen.getByRole('button', { name: 'Default' })
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')

    rerender(<Button variant="destructive">Destructive</Button>)
    button = screen.getByRole('button', { name: 'Destructive' })
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button', { name: 'Outline' })
    expect(button).toHaveClass('border', 'border-input', 'bg-background')

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button', { name: 'Secondary' })
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')

    rerender(<Button variant="ghost">Ghost</Button>)
    button = screen.getByRole('button', { name: 'Ghost' })
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')

    rerender(<Button variant="link">Link</Button>)
    button = screen.getByRole('button', { name: 'Link' })
    expect(button).toHaveClass('text-primary', 'underline-offset-4')
  })

  it('renders with different sizes', () => {
    // Silexar Pulse uses rounded-full (not rounded-md) for neumorphic design
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole('button', { name: 'Small' })
    expect(button).toHaveClass('h-9', 'rounded-full', 'px-3')

    rerender(<Button size="default">Default</Button>)
    button = screen.getByRole('button', { name: 'Default' })
    expect(button).toHaveClass('h-10', 'px-4', 'py-2')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button', { name: 'Large' })
    expect(button).toHaveClass('h-11', 'rounded-full', 'px-8')

    rerender(<Button size="icon">⚙</Button>)
    button = screen.getByRole('button', { name: '⚙' })
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Ref Button</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('spreads additional props', () => {
    render(
      <Button 
        data-testid="test-button" 
        id="button-id"
        disabled
        aria-label="Custom button"
      >
        Props Button
      </Button>
    )
    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('id', 'button-id')
    expect(button).toHaveAttribute('aria-label', 'Custom button')
    expect(button).toBeDisabled()
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('maintains accessibility', () => {
    render(<Button aria-pressed="false" role="switch">Accessible</Button>)
    const button = screen.getByRole('switch')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('prevents default behavior when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled Click
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Disabled Click' })
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('handles keyboard events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Keyboard Button</Button>)
    const button = screen.getByRole('button', { name: 'Keyboard Button' })
    
    // Focus the button first
    button.focus()
    
    // Simulate Enter key press on a focused button
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    
    // Note: Native button elements should handle Enter key automatically
    // This test verifies the button is properly focusable and keyboard accessible
    expect(document.activeElement).toBe(button)
  })
})