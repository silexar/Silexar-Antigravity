import { useState, useCallback } from 'react';
interface Notification { id: string; message: string; type: 'INFO' | 'WARNING' | 'ERROR'; }
export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const add = useCallback((message: string, type: Notification['type'] = 'INFO') => {
        setNotifications(prev => [...prev, { id: `n_${Date.now()}`, message, type }]);
    }, []);
    const dismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);
    return { notifications, add, dismiss };
};
export default useNotifications;