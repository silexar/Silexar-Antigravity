/**
 * HOOK: useAnimatedCounter — Smooth Animated Number Counter
 * 
 * @description Hook de React para animar contadores numéricos.
 * Utilizado en KPIs, dashboards, y métricas para dar sensación premium.
 * Usa requestAnimationFrame para animaciones fluidas de 60fps.
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterOptions {
  /** Duration in ms (default: 1500) */
  duration?: number;
  /** Start value (default: 0) */
  from?: number;
  /** Decimal places (default: 0) */
  decimals?: number;
  /** Prefix (e.g., '$') */
  prefix?: string;
  /** Suffix (e.g., '%') */
  suffix?: string;
  /** Whether to use locale formatting (default: true) */
  useLocale?: boolean;
  /** Easing function: 'linear' | 'easeOut' | 'easeInOut' */
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

function easingFunctions(type: string, t: number): number {
  switch (type) {
    case 'easeOut':
      return 1 - Math.pow(1 - t, 3);
    case 'easeInOut':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    default: // linear
      return t;
  }
}

/**
 * Animate a number from `from` to `to` over `duration` ms.
 * 
 * @example
 * const revenue = useAnimatedCounter(4200000, { prefix: '$', duration: 2000 });
 * // Returns "$4,200,000" after animation
 */
export function useAnimatedCounter(
  to: number,
  options: AnimatedCounterOptions = {}
): string {
  const {
    duration = 1500,
    from = 0,
    decimals = 0,
    prefix = '',
    suffix = '',
    useLocale = true,
    easing = 'easeOut',
  } = options;

  const [displayValue, setDisplayValue] = useState(from);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startValue = from;
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions(easing, progress);
      const currentValue = startValue + (to - startValue) * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [to, from, duration, easing]);

  const formatted = useLocale
    ? displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : displayValue.toFixed(decimals);

  return `${prefix}${formatted}${suffix}`;
}
