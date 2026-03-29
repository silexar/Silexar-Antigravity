import { useEffect, useRef } from 'react'
import type { StoreApi } from 'zustand'

export function useZustandSelector<TState, TSelected>(
  store: StoreApi<TState>,
  selector: (state: TState) => TSelected,
  equalityFn: (a: TSelected, b: TSelected) => boolean = Object.is
): TSelected {
  const selectedRef = useRef<TSelected>(selector(store.getState()))
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const unsubscribe = store.subscribe((nextState: TState) => {
      const nextSelected = selector(nextState)
      if (!equalityFn(selectedRef.current, nextSelected)) {
        selectedRef.current = nextSelected
      }
    })
    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [store, selector, equalityFn])

  return selectedRef.current
}

export const shallowEqual = (a: Record<string, unknown>, b: Record<string, unknown>): boolean => {
  if (Object.is(a, b)) return true
  if (!a || !b) return false
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (!Object.is(a[key], b[key])) return false
  }
  return true
}