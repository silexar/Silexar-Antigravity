import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with default props', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('should render with custom text content', () => {
      render(<Button>Submit</Button>)
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    it('should render with children elements', () => {
      render(
        <Button>
          <span data-testid="icon">🚀</span>
          <span>Launch</span>
        </Button>
      )
      
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Launch')).toBeInTheDocument()
    })

    it('should apply default variant classes', () => {
      render(<Button>Default</Button>)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('bg-primary')
      expect(button).toHaveClass('text-primary-foreground')
    })

    it('should apply variant classes correctly', () => {
      const { rerender } = render(<Button variant="default">Test</Button>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')

      rerender(<Button variant="destructive">Test</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')

      rerender(<Button variant="outline">Test</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('border')

      rerender(<Button variant="ghost">Test</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')

      rerender(<Button variant="link">Test</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('underline-offset-4')
    })

    it('should apply size classes correctly', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')

      rerender(<Button size="default">Default</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')

      rerender(<Button size="lg">Large</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')

      rerender(<Button size="icon">Icon</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
    })
  })

  describe('Click Handler', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClick with mouse event', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object))
    })

    it('should handle multiple clicks', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should not call onClick when button is disabled', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Click me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:pointer-events-none')
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('should prevent click when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should have disabled attribute', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('asChild Prop', () => {
    it('should render as anchor when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      
      const link = screen.getByRole('link', { name: 'Link Button' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should apply button styles to child element', () => {
      render(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('should render as custom component when asChild is true', () => {
      const CustomComponent = ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
        <div data-testid="custom" {...props}>{children}</div>
      )
      
      render(
        <Button asChild>
          <CustomComponent>Custom</CustomComponent>
        </Button>
      )
      
      expect(screen.getByTestId('custom')).toBeInTheDocument()
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null }
      render(<Button ref={ref}>Ref Test</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('should forward ref to child element when asChild is true', () => {
      const ref = { current: null as HTMLAnchorElement | null }
      render(
        <Button asChild ref={ref}>
          <a href="/test">Link</a>
        </Button>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
    })
  })

  describe('Additional Props', () => {
    it('should pass through data attributes', () => {
      render(<Button data-testid="test-button" data-custom="value">Test</Button>)
      
      const button = screen.getByTestId('test-button')
      expect(button).toHaveAttribute('data-custom', 'value')
    })

    it('should pass through aria attributes', () => {
      render(<Button aria-label="Custom label" aria-pressed="false">Test</Button>)
      
      const button = screen.getByRole('button', { name: 'Custom label' })
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('should pass through id and name attributes', () => {
      render(<Button id="submit-btn" name="submit">Test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'submit-btn')
      expect(button).toHaveAttribute('name', 'submit')
    })

    it('should handle type attribute', () => {
      const { rerender } = render(<Button type="button">Button</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')

      rerender(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

      rerender(<Button type="reset">Reset</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
    })
  })

  describe('ClassName Merging', () => {
    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class">Test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('inline-flex') // Clase por defecto
    })

    it('should allow overriding styles with className', () => {
      render(<Button className="bg-red-500">Test</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-500')
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<Button>Focusable</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('should have button role', () => {
      render(<Button>Role Test</Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should support keyboard interaction', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Keyboard</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      expect(document.activeElement).toBe(button)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeEmptyDOMElement()
    })

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000)
      render(<Button>{longText}</Button>)
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      render(<Button>Special &lt;chars&gt; &amp; symbols ©</Button>)
      
      expect(screen.getByText('Special <chars> & symbols ©')).toBeInTheDocument()
    })
  })
})
