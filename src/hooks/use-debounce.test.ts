/**
 * Tests unitarios para useDebounce hook
 * @module use-debounce.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'changed', delay: 300 });
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(200);
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(100);
    await waitFor(() => {
      expect(result.current).toBe('changed');
    });
  });

  it('should reset timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: '', delay: 300 } }
    );

    rerender({ value: 'a', delay: 300 });
    vi.advanceTimersByTime(200);

    rerender({ value: 'ab', delay: 300 });
    vi.advanceTimersByTime(200);

    rerender({ value: 'abc', delay: 300 });
    vi.advanceTimersByTime(100);

    expect(result.current).toBe('');

    vi.advanceTimersByTime(200);
    await waitFor(() => {
      expect(result.current).toBe('abc');
    });
  });

  it('should use default delay of 300ms', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'test' } }
    );

    rerender({ value: 'updated' });
    
    vi.advanceTimersByTime(299);
    expect(result.current).toBe('test');

    vi.advanceTimersByTime(1);
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should handle number values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });
    
    vi.advanceTimersByTime(100);
    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('should handle object values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { id: 1 } } }
    );

    const newValue = { id: 2 };
    rerender({ value: newValue });
    
    vi.advanceTimersByTime(100);
    await waitFor(() => {
      expect(result.current).toEqual({ id: 2 });
    });
  });

  it('should cleanup timer on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('test', 300));
    
    expect(() => unmount()).not.toThrow();
  });
});
