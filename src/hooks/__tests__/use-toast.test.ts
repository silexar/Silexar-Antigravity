import { renderHook, act } from '@testing-library/react';
import { useToast } from '../use-toast';

describe('useToast', () => {
    it('should add toast', () => {
        const { result } = renderHook(() => useToast());
        act(() => { result.current.toast('Test message'); });
        expect(result.current.toasts.length).toBeGreaterThan(0);
    });

    it('should auto-dismiss toasts', async () => {
        jest.useFakeTimers();
        const { result } = renderHook(() => useToast());
        act(() => { result.current.toast('Test'); });
        expect(result.current.toasts.length).toBe(1);
        act(() => { jest.advanceTimersByTime(4000); });
        expect(result.current.toasts.length).toBe(0);
        jest.useRealTimers();
    });
});