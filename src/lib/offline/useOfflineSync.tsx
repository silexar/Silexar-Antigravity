/**
 * 🪝 SILEXAR PULSE - useOfflineSync Hook TIER 0
 * 
 * React hook para integrar el sistema offline-first
 * con estados reactivos y helpers de sincronización
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineSyncEngine, type SyncState, type PendingOperation } from './OfflineSyncEngine';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface UseOfflineSyncReturn {
  // Estado
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncTime: Date | null;
  
  // Operaciones
  saveOffline: <T>(
    type: 'CREATE' | 'UPDATE' | 'DELETE' | 'PATCH',
    entity: PendingOperation['entity'],
    endpoint: string,
    method: string,
    payload: T
  ) => Promise<string>;
  
  // Cache
  getCached: <T>(key: string) => Promise<T | null>;
  setCached: <T>(key: string, data: T) => Promise<void>;
  
  // Drafts
  saveDraft: <T>(entity: string, id: string, data: T) => Promise<void>;
  getDraft: <T>(id: string) => Promise<T | null>;
  deleteDraft: (id: string) => Promise<void>;
  
  // Sync control
  forceSync: () => Promise<void>;
  retryFailed: () => Promise<void>;
  clearFailed: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useOfflineSync(): UseOfflineSyncReturn {
  const [state, setState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    failedCount: 0
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Inicializar engine
    offlineSyncEngine.initialize().catch(console.error);

    // Suscribirse a cambios de estado
    const unsubscribe = offlineSyncEngine.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // OPERACIONES
  // ─────────────────────────────────────────────────────────────

  const saveOffline = useCallback(async <T,>(
    type: 'CREATE' | 'UPDATE' | 'DELETE' | 'PATCH',
    entity: PendingOperation['entity'],
    endpoint: string,
    method: string,
    payload: T
  ): Promise<string> => {
    return offlineSyncEngine.addPendingOperation(type, entity, endpoint, method, payload);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────────────────────

  const getCached = useCallback(async <T,>(key: string): Promise<T | null> => {
    const cached = await offlineSyncEngine.getCachedData<T>('cunas_cache', key);
    return cached?.data || null;
  }, []);

  const setCached = useCallback(async <T,>(key: string, data: T): Promise<void> => {
    await offlineSyncEngine.cacheData('cunas_cache', data, key);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // DRAFTS
  // ─────────────────────────────────────────────────────────────

  const saveDraft = useCallback(async <T,>(entity: string, id: string, data: T): Promise<void> => {
    await offlineSyncEngine.saveDraft(entity, id, data);
  }, []);

  const getDraft = useCallback(async <T,>(id: string): Promise<T | null> => {
    return offlineSyncEngine.getDraft<T>(id);
  }, []);

  const deleteDraft = useCallback(async (id: string): Promise<void> => {
    await offlineSyncEngine.deleteDraft(id);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // SYNC CONTROL
  // ─────────────────────────────────────────────────────────────

  const forceSync = useCallback(async (): Promise<void> => {
    await offlineSyncEngine.forcSync();
  }, []);

  const retryFailed = useCallback(async (): Promise<void> => {
    await offlineSyncEngine.retryFailed();
  }, []);

  const clearFailed = useCallback(async (): Promise<void> => {
    await offlineSyncEngine.clearFailed();
  }, []);

  return {
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingCount: state.pendingCount,
    failedCount: state.failedCount,
    lastSyncTime: state.lastSyncTime ? new Date(state.lastSyncTime) : null,
    saveOffline,
    getCached,
    setCached,
    saveDraft,
    getDraft,
    deleteDraft,
    forceSync,
    retryFailed,
    clearFailed
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE STATUS
// ═══════════════════════════════════════════════════════════════

export function OfflineStatusIndicator() {
  const { isOnline, isSyncing, pendingCount, failedCount } = useOfflineSync();

  if (isOnline && pendingCount === 0 && failedCount === 0) {
    return null; // No mostrar nada si todo está en orden
  }

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg
      ${!isOnline 
        ? 'bg-amber-500 text-white' 
        : isSyncing 
          ? 'bg-blue-500 text-white'
          : failedCount > 0
            ? 'bg-red-500 text-white'
            : 'bg-emerald-500 text-white'
      }
    `}>
      {!isOnline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-medium">Modo Offline</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
              {pendingCount} pendientes
            </span>
          )}
        </>
      ) : isSyncing ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm font-medium">Sincronizando...</span>
        </>
      ) : failedCount > 0 ? (
        <>
          <span className="text-sm font-medium">⚠️ {failedCount} fallidos</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-medium">{pendingCount} por sincronizar</span>
        </>
      ) : null}
    </div>
  );
}

export default useOfflineSync;
