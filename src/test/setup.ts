import '@testing-library/jest-dom'
import { vi } from 'vitest'

const isJsdom = typeof window !== 'undefined'

// Mock de window.matchMedia (jsdom only)
if (isJsdom) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock de IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock de ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock de scrollTo
  window.scrollTo = vi.fn()
}

// Configuración global de tests
vi.mock('zustand')
vi.mock('@supabase/supabase-js')

// Utilidades de testing
export const createMockStore = (initialState = {}) => {
  return {
    getState: vi.fn(() => initialState),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    destroy: vi.fn(),
  }
}

// Mock de URL.createObjectURL
if (isJsdom) {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()
}

// Mock de fecha consistente para tests
export const mockDate = (date: string) => {
  const mockedDate = new Date(date)
  vi.setSystemTime(mockedDate)
  return mockedDate
}
