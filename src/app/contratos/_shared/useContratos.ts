/**
 * 🔗 HOOKS: Contratos Mobile
 * 
 * Hooks conectados al Mobile API Controller existente (/api/mobile/contratos).
 * Centralizan todas las llamadas API para desktop y mobile.
 * 
 * @tier TIER_0_ENTERPRISE
 * @module contratos
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  ContratoMobile,
  DashboardMobile,
  AlertaContrato,
  MobileAPIResponse,
  FiltroUrgencia,
} from './types';

// ═══════════════════════════════════════════════════════════════
// AUTH HEADER (mock — en producción sería un JWT real)
// ═══════════════════════════════════════════════════════════════

const AUTH_HEADERS = {
  'Authorization': 'Bearer mock-token-silexar',
  'Content-Type': 'application/json',
};

// ═══════════════════════════════════════════════════════════════
// HOOK: DASHBOARD
// ═══════════════════════════════════════════════════════════════

export function useContratosDashboard() {
  const [dashboard, setDashboard] = useState<DashboardMobile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mobile/contratos?endpoint=dashboard', {
        headers: AUTH_HEADERS,
      });
      const data: MobileAPIResponse<DashboardMobile> = await response.json();
      if (data.success) {
        setDashboard(data.data);
      } else {
        setError(data.error || 'Error al obtener dashboard');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return { dashboard, loading, error, refresh: fetchDashboard };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: LISTA DE CONTRATOS
// ═══════════════════════════════════════════════════════════════

export function useContratosLista() {
  const [contratos, setContratos] = useState<ContratoMobile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filtroUrgencia, setFiltroUrgencia] = useState<FiltroUrgencia>('todos');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchContratos = useCallback(async (resetPage = true) => {
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        endpoint: 'contratos',
        page: String(currentPage),
        limit: '20',
      });
      if (search) params.set('search', search);
      if (filtroUrgencia !== 'todos') params.set('urgencia', filtroUrgencia);

      const response = await fetch(`/api/mobile/contratos?${params}`, {
        headers: AUTH_HEADERS,
      });
      const data: MobileAPIResponse<ContratoMobile[]> = await response.json();
      if (data.success) {
        setContratos(resetPage ? data.data : [...contratos, ...data.data]);
        setHasMore(data.meta?.hasMore || false);
      } else {
        setError(data.error || 'Error al obtener contratos');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [search, filtroUrgencia, page, contratos]);

  useEffect(() => { fetchContratos(true); }, [search, filtroUrgencia]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    setPage(p => p + 1);
    fetchContratos(false);
  }, [fetchContratos]);

  return {
    contratos, loading, error, search, filtroUrgencia, hasMore,
    setSearch, setFiltroUrgencia, loadMore, refresh: () => fetchContratos(true),
  };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: ALERTAS
// ═══════════════════════════════════════════════════════════════

export function useContratosAlertas() {
  const [alertas, setAlertas] = useState<AlertaContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mobile/contratos?endpoint=alertas', {
        headers: AUTH_HEADERS,
      });
      const data: MobileAPIResponse<AlertaContrato[]> = await response.json();
      if (data.success) {
        setAlertas(data.data);
      } else {
        setError(data.error || 'Error al obtener alertas');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlertas(); }, [fetchAlertas]);

  const marcarLeida = useCallback(async (alertaId: string) => {
    try {
      await fetch('/api/mobile/contratos', {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({ accion: 'marcar_leida', alertaId }),
      });
      setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, leida: true } : a));
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  }, []);

  const noLeidas = alertas.filter(a => !a.leida).length;

  return { alertas, loading, error, noLeidas, marcarLeida, refresh: fetchAlertas };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: ACCIONES
// ═══════════════════════════════════════════════════════════════

export function useContratosAcciones() {
  const [processing, setProcessing] = useState(false);

  const ejecutarAccion = useCallback(async (
    accion: 'aprobar' | 'rechazar' | 'firmar' | 'comentar',
    contratoId: string,
    datos?: Record<string, string>
  ) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/mobile/contratos', {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({ accion, contratoId, ...datos }),
      });
      const data = await response.json();
      setProcessing(false);
      return { success: data.success, error: data.error };
    } catch {
      setProcessing(false);
      return { success: false, error: 'Error de conexión' };
    }
  }, []);

  const aprobar = useCallback((id: string, comentario?: string) =>
    ejecutarAccion('aprobar', id, comentario ? { comentario } : undefined), [ejecutarAccion]);

  const rechazar = useCallback((id: string, motivo: string) =>
    ejecutarAccion('rechazar', id, { motivo }), [ejecutarAccion]);

  const firmar = useCallback((id: string) =>
    ejecutarAccion('firmar', id, { firma: 'digital-signature' }), [ejecutarAccion]);

  const comentar = useCallback((id: string, comentario: string) =>
    ejecutarAccion('comentar', id, { comentario }), [ejecutarAccion]);

  return { processing, aprobar, rechazar, firmar, comentar };
}

// ═══════════════════════════════════════════════════════════════
// HELPER: FORMAT CURRENCY
// ═══════════════════════════════════════════════════════════════

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}
