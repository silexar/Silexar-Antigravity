import { memo, useMemo, useCallback, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

// Interfaz para props de componentes optimizados
interface OptimizedComponentProps {
  children?: React.ReactNode
  className?: string
  onRender?: () => void
  priority?: 'high' | 'medium' | 'low'
}

// Componente memoizado de alto rendimiento
export const Fortune10OptimizedComponent = memo<OptimizedComponentProps>(
  ({ children, className = '', onRender, priority = 'medium' }) => {
    const renderCount = useRef(0)
    const startTime = useRef(performance.now())

    useEffect(() => {
      renderCount.current += 1
      const renderTime = performance.now() - startTime.current
      
      // Monitoreo de rendimiento para Fortune 10
      if (renderTime > 16.67) { // Más de 60fps
        console.warn(`[Fortune10] Slow render: ${renderTime.toFixed(2)}ms`)
      }

      if (onRender) {
        onRender()
      }
    })

    return (
      <div 
        className={`fortune10-optimized ${className}`}
        data-priority={priority}
        data-render-count={renderCount.current}
      >
        {children}
      </div>
    )
  }
)

Fortune10OptimizedComponent.displayName = 'Fortune10OptimizedComponent'

// Hook para optimización de listas virtuales
export function useVirtualList<T>(items: T[], itemHeight: number) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // Renderizar 5 items adicionales para suavidad
  })

  return {
    virtualizer,
    parentRef,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize()
  }
}

// Hook para memoización profunda de objetos
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const prevDeps = useRef<React.DependencyList | undefined>(undefined)
  const prevResult = useRef<T | undefined>(undefined)

  if (!prevDeps.current || !areEqual(prevDeps.current, deps)) {
    prevDeps.current = deps
    prevResult.current = factory()
  }

  return prevResult.current as T
}

// Comparador profundo para objetos
function areEqual(prevDeps: React.DependencyList, nextDeps: React.DependencyList): boolean {
  if (prevDeps.length !== nextDeps.length) return false
  
  for (let i = 0; i < prevDeps.length; i++) {
    if (!isDeepEqual(prevDeps[i], nextDeps[i])) {
      return false
    }
  }
  
  return true
}

function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true
  
  if (obj1 == null || obj2 == null) return false
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false
  
  const o1 = obj1 as Record<string, unknown>
  const o2 = obj2 as Record<string, unknown>
  const keys1 = Object.keys(o1)
  const keys2 = Object.keys(o2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(o1[key], o2[key])) {
      return false
    }
  }
  
  return true
}

// Optimizador de event handlers
export function useOptimizedCallback<T extends (...args: unknown[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  })
  
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args)
  }, deps) as T
}

// Componente de lista virtualizada para Fortune 10
interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  className?: string
  onScroll?: (offset: number) => void
}

export function Fortune10VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  className = '',
  onScroll
}: VirtualListProps<T>) {
  const { virtualizer, parentRef, virtualItems, totalSize } = useVirtualList(items, itemHeight)
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      onScroll(e.currentTarget.scrollTop)
    }
  }, [onScroll])

  return (
    <div
      ref={parentRef}
      className={`fortune10-virtual-list ${className}`}
      style={{ height: '100%', overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index]
          return (
            <div
              key={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
              className="fortune10-virtual-item"
            >
              {renderItem(item, virtualItem.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Sistema de precarga de componentes críticos
export class Fortune10Preloader {
  private static instance: Fortune10Preloader
  private preloadedComponents: Set<string> = new Set()
  private preloadQueue: string[] = []

  static getInstance(): Fortune10Preloader {
    if (!Fortune10Preloader.instance) {
      Fortune10Preloader.instance = new Fortune10Preloader()
    }
    return Fortune10Preloader.instance
  }

  async preloadComponent(componentPath: string): Promise<void> {
    if (this.preloadedComponents.has(componentPath)) {
      return
    }

    try {
      const startTime = performance.now()
      await import(componentPath)
      const loadTime = performance.now() - startTime
      
      this.preloadedComponents.add(componentPath)

      // WHY: console.warn is kept intentionally — slow preload is a genuine performance warning.
      // console.log removed (was debug noise in production builds).
      if (loadTime > 1000) {
        console.warn(`[Fortune10] Slow preload: ${componentPath} (${loadTime.toFixed(2)}ms)`)
      }
    } catch (error) {
      // WHY: console.error is kept intentionally — failed import is a genuine error
      // that should surface in browser devtools and error monitoring.
      console.error(`[Fortune10] Failed to preload: ${componentPath}`, error)
    }
  }

  preloadCriticalComponents(): void {
    const criticalComponents = [
      '@/components/dashboard/Dashboard',
      '@/components/facturacion/FacturacionDashboard',
      '@/components/monitoring/EnterpriseMonitoringDashboard',
      '@/components/ci-cd/CICDDashboard'
    ]

    criticalComponents.forEach(path => {
      this.preloadQueue.push(path)
    })

    // Precargar en segundo plano
    this.processPreloadQueue()
  }

  private async processPreloadQueue(): Promise<void> {
    for (const componentPath of this.preloadQueue) {
      await this.preloadComponent(componentPath)
    }
    this.preloadQueue = []
  }
}

// Inicializar precargador al cargar la aplicación
if (typeof window !== 'undefined') {
  Fortune10Preloader.getInstance().preloadCriticalComponents()
}