import { useState, useCallback } from 'react';
export interface AutomationTask { id: string; status: string; }
export const useAutomation = () => {
    const [tasks, setTasks] = useState<AutomationTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const run = useCallback(async () => { setLoading(true); setError(null); setTasks([]); setLoading(false); }, []);
    return { tasks, loading, error, run };
};
export default useAutomation;