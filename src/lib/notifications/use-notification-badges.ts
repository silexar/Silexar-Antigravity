/**
 * 🔔 HOOK: Notification Badge Counts
 * 
 * Proporciona conteos de notificaciones no leídas para
 * mostrar badges en sidebar, header, y mobile nav.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

export type TipoNotificacion = 'alerta' | 'aprobacion' | 'rechazo' | 'firma' | 'vencimientos' | 'pago' | 'mensaje' | 'sistema';

export interface BadgeCounts {
    total: number;
    noLeidas: number;
    porTipo: Record<TipoNotificacion, number>;
}

export interface NotificacionItem {
    id: string;
    tipo: TipoNotificacion;
    titulo: string;
    descripcion: string;
    leida: boolean;
    prioridad: 'alta' | 'media' | 'baja';
    createdAt: string;
    datos: Record<string, unknown>;
}

const DEFAULT_COUNTS: BadgeCounts = {
    total: 0,
    noLeidas: 0,
    porTipo: {
        alerta: 0,
        aprobacion: 0,
        rechazo: 0,
        firma: 0,
        vencimientos: 0,
        pago: 0,
        mensaje: 0,
        sistema: 0
    }
};

/**
 * Hook para obtener y mantener badge counts
 */
export function useBadgeCounts() {
    const [counts, setCounts] = useState<BadgeCounts>(DEFAULT_COUNTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCounts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/notificaciones?limite=1', {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Error fetching notifications');
            }

            const data = await response.json();

            if (data.success && data.resumen) {
                setCounts({
                    total: data.resumen.total || 0,
                    noLeidas: data.resumen.noLeidas || 0,
                    porTipo: {
                        alerta: data.resumen.porTipo?.alerta || 0,
                        aprobacion: data.resumen.porTipo?.aprobacion || 0,
                        rechazo: data.resumen.porTipo?.rechazo || 0,
                        firma: data.resumen.porTipo?.firma || 0,
                        vencimientos: data.resumen.porTipo?.vencimientos || 0,
                        pago: data.resumen.porTipo?.pago || 0,
                        mensaje: 0,
                        sistema: 0
                    }
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const decrementCount = useCallback((tipo: TipoNotificacion) => {
        setCounts(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
            noLeidas: Math.max(0, prev.noLeidas - 1),
            porTipo: {
                ...prev.porTipo,
                [tipo]: Math.max(0, prev.porTipo[tipo] - 1)
            }
        }));
    }, []);

    const incrementCount = useCallback((tipo: TipoNotificacion) => {
        setCounts(prev => ({
            ...prev,
            total: prev.total + 1,
            noLeidas: prev.noLeidas + 1,
            porTipo: {
                ...prev.porTipo,
                [tipo]: prev.porTipo[tipo] + 1
            }
        }));
    }, []);

    useEffect(() => {
        fetchCounts();

        // Polling cada 60 segundos
        const interval = setInterval(fetchCounts, 60_000);
        return () => clearInterval(interval);
    }, [fetchCounts]);

    return {
        counts,
        loading,
        error,
        refresh: fetchCounts,
        decrementCount,
        incrementCount
    };
}

/**
 * Hook para notificaciones con lista detallada
 */
export function useNotificaciones(options: {
    tipo?: TipoNotificacion;
    noLeidas?: boolean;
    limite?: number;
    autoRefresh?: boolean;
} = {}) {
    const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
    const [counts, setCounts] = useState<BadgeCounts>(DEFAULT_COUNTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotificaciones = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.tipo) params.set('tipo', options.tipo);
            if (options.noLeidas) params.set('noLeidas', 'true');
            params.set('limite', String(options.limite || 50));

            const response = await fetch(`/api/notificaciones?${params}`, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Error fetching notifications');
            }

            const data = await response.json();

            if (data.success) {
                setNotificaciones(data.data || []);
                if (data.resumen) {
                    setCounts({
                        total: data.resumen.total || 0,
                        noLeidas: data.resumen.noLeidas || 0,
                        porTipo: {
                            alerta: data.resumen.porTipo?.alerta || 0,
                            aprobacion: data.resumen.porTipo?.aprobacion || 0,
                            rechazo: data.resumen.porTipo?.rechazo || 0,
                            firma: data.resumen.porTipo?.firma || 0,
                            vencimientos: data.resumen.porTipo?.vencimientos || 0,
                            pago: data.resumen.porTipo?.pago || 0,
                            mensaje: 0,
                            sistema: 0
                        }
                    });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [options.tipo, options.noLeidas, options.limite]);

    const markAsRead = useCallback(async (notificacionId: string) => {
        try {
            const response = await fetch(`/api/notificaciones`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                // Actualizar estado local
                setNotificaciones(prev =>
                    prev.map(n =>
                        n.id === notificacionId ? { ...n, leida: true } : n
                    )
                );
                setCounts(prev => ({
                    ...prev,
                    noLeidas: Math.max(0, prev.noLeidas - 1)
                }));
            }
        } catch {
            // Silent fail
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            // En producción: endpoint batch para marcar todas
            const promises = notificaciones
                .filter(n => !n.leida)
                .map(n => markAsRead(n.id));

            await Promise.all(promises);
            fetchNotificaciones();
        } catch {
            // Silent fail
        }
    }, [notificaciones, markAsRead, fetchNotificaciones]);

    useEffect(() => {
        fetchNotificaciones();
    }, [fetchNotificaciones]);

    useEffect(() => {
        if (options.autoRefresh) {
            const interval = setInterval(fetchNotificaciones, 30_000);
            return () => clearInterval(interval);
        }
    }, [options.autoRefresh, fetchNotificaciones]);

    return {
        notificaciones,
        counts,
        loading,
        error,
        refresh: fetchNotificaciones,
        markAsRead,
        markAllAsRead
    };
}
