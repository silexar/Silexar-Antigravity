/**
 * Hook para debounce de valores
 * @module use-debounce
 */

import { useState, useEffect } from 'react';

/**
 * Retorna el valor debounced — solo se actualiza cuando el valor
 * no cambia durante el intervalo `delay` (por defecto 300ms).
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
