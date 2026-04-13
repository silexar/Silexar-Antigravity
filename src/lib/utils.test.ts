/**
 * Tests unitarios para utilidades
 * @module utils.test
 */

import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate } from './utils';

describe('cn (tailwind merge)', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional-true')).toBe('base-class conditional-true');
    expect(cn('base-class', false && 'conditional-false')).toBe('base-class');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base-class', undefined, 'another-class')).toBe('base-class another-class');
    expect(cn('base-class', null, 'another-class')).toBe('base-class another-class');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should merge complex class combinations', () => {
    const result = cn(
      'px-4 py-2 rounded-lg',
      'hover:bg-blue-500',
      'px-6',
      'focus:ring-2'
    );
    expect(result).toContain('py-2');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('hover:bg-blue-500');
    expect(result).toContain('focus:ring-2');
  });
});

describe('formatCurrency', () => {
  it('should format numbers as CLP currency', () => {
    expect(formatCurrency(1000)).toBe('$1.000');
    expect(formatCurrency(1000000)).toBe('$1.000.000');
    expect(formatCurrency(1234567)).toBe('$1.234.567');
  });

  it('should handle string numbers', () => {
    expect(formatCurrency('1000')).toBe('$1.000');
    expect(formatCurrency('50000.50')).toBe('$50.001');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-$1.000');
  });

  it('should handle invalid strings', () => {
    expect(formatCurrency('invalid')).toBe('$0');
    expect(formatCurrency('')).toBe('$0');
  });
});

describe('formatDate', () => {
  it('should format ISO dates to DD/MM/YYYY', () => {
    expect(formatDate('2025-04-09')).toBe('09/04/2025');
    expect(formatDate('2024-12-25')).toBe('25/12/2024');
  });

  it('should format datetime strings', () => {
    expect(formatDate('2025-04-09T14:30:00.000Z')).toBe('09/04/2025');
  });

  it('should handle empty strings', () => {
    expect(formatDate('')).toBe('');
  });

  it('should handle invalid dates gracefully', () => {
    expect(formatDate('invalid-date')).toBe('Invalid Date');
  });
});
