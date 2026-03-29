import { useState, useCallback } from 'react';
interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = `t_${Date.now()}`;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);
    return { toasts, toast };
};
export default useToast;