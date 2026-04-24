/**
 * SILEXAR PULSE - useVencimientosSSE Hook
 * 
 * @description Custom hook for Server-Sent Events real-time updates.
 * 
 * @version 2026.1.0
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface SSEMessage {
    type: string;
    data: Record<string, unknown>;
    timestamp: number;
}

interface UseVencimientosSSEOptions {
    onVencimientosUpdate?: (data: Record<string, unknown>) => void;
    onAlertasUpdate?: (data: Record<string, unknown>) => void;
    onProgramasUpdate?: (data: Record<string, unknown>) => void;
    onHeartbeat?: () => void;
    onError?: (error: Event) => void;
    reconnectInterval?: number;
    enabled?: boolean;
}

export function useVencimientosSSE(options: UseVencimientosSSEOptions = {}) {
    const {
        onVencimientosUpdate,
        onAlertasUpdate,
        onProgramasUpdate,
        onHeartbeat,
        onError,
        reconnectInterval = 5000,
        enabled = true,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (typeof window === 'undefined') return;

        try {
            const eventSource = new EventSource('/api/vencimientos/sse');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                console.log('[useVencimientosSSE] Connected to SSE stream');
            };

            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastMessage({
                        type: event.type,
                        data: message,
                        timestamp: Date.now(),
                    });
                } catch {
                    console.error('[useVencimientosSSE] Failed to parse message');
                }
            };

            eventSource.addEventListener('heartbeat', () => {
                onHeartbeat?.();
            });

            eventSource.addEventListener('vencimientos-update', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onVencimientosUpdate?.(data);
                } catch {
                    console.error('[useVencimientosSSE] Failed to parse vencimientos update');
                }
            });

            eventSource.addEventListener('alertas-update', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onAlertasUpdate?.(data);
                } catch {
                    console.error('[useVencimientosSSE] Failed to parse alertas update');
                }
            });

            eventSource.addEventListener('programas-update', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onProgramasUpdate?.(data);
                } catch {
                    console.error('[useVencimientosSSE] Failed to parse programas update');
                }
            });

            eventSource.onerror = (error) => {
                console.error('[useVencimientosSSE] SSE error:', error);
                setIsConnected(false);
                onError?.(error);

                // Attempt reconnection
                eventSource.close();
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (enabled) {
                        console.log('[useVencimientosSSE] Attempting reconnection...');
                        connect();
                    }
                }, reconnectInterval);
            };
        } catch (error) {
            console.error('[useVencimientosSSE] Failed to connect:', error);
        }
    }, [onVencimientosUpdate, onAlertasUpdate, onProgramasUpdate, onHeartbeat, onError, reconnectInterval, enabled]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setIsConnected(false);
    }, []);

    useEffect(() => {
        if (enabled) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [enabled, connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        reconnect: connect,
        disconnect,
    };
}

export default useVencimientosSSE;