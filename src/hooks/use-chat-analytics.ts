import { useState, useCallback } from 'react';
export interface ChatAnalytics { messagesCount: number; avgResponseTime: number; satisfaction: number; }
export const useChatAnalytics = () => {
    const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
    const refresh = useCallback(() => { setAnalytics({ messagesCount: 0, avgResponseTime: 0, satisfaction: 0 }); }, []);
    return { analytics, refresh };
};
export default useChatAnalytics;