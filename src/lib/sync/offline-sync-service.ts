/**
 * 📱 SERVICE: Offline Sync Service
 * 
 * Maneja la sincronización entre datos offline y el servidor.
 * Almacena operaciones pendientes en localStorage y las
 * sincroniza cuando hay conexión.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type OperationType = 'create' | 'update' | 'delete';
export type EntityType = 'contrato' | 'notificacion' | 'borrador' | 'captura';

export interface PendingOperation {
    id: string;
    type: OperationType;
    entity: EntityType;
    entityId: string;
    data: Record<string, unknown>;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
    status: 'pending' | 'syncing' | 'failed' | 'completed';
    error?: string;
}

export interface SyncStatus {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    lastSyncAt: number | null;
    errors: string[];
}

export interface SyncResult {
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'silexar_pending_operations';
const SYNC_INTERVAL = 30_000; // 30 segundos
const MAX_RETRIES = 3;
const BATCH_SIZE = 10;

// ═══════════════════════════════════════════════════════════════
// HELPERS DE STORAGE
// ═══════════════════════════════════════════════════════════════

function getStoredOperations(): PendingOperation[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveOperations(operations: PendingOperation[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
    } catch (error) {
        console.error('Error saving operations to localStorage:', error);
    }
}

function removeOperation(id: string): void {
    const operations = getStoredOperations().filter(op => op.id !== id);
    saveOperations(operations);
}

function updateOperation(id: string, updates: Partial<PendingOperation>): void {
    const operations = getStoredOperations().map(op =>
        op.id === id ? { ...op, ...updates } : op
    );
    saveOperations(operations);
}

function clearCompletedOperations(): void {
    const operations = getStoredOperations().filter(op => op.status !== 'completed');
    saveOperations(operations);
}

// ═══════════════════════════════════════════════════════════════
// API CALLS
// ═══════════════════════════════════════════════════════════════

async function executeOperation(operation: PendingOperation): Promise<boolean> {
    const { type, entity, entityId, data } = operation;

    try {
        switch (entity) {
            case 'contrato':
                return await executeContratoOperation(type, entityId, data);
            case 'notificacion':
                return await executeNotificacionOperation(type, entityId, data);
            case 'borrador':
                return await executeBorradorOperation(type, entityId, data);
            case 'captura':
                return await executeCapturaOperation(type, entityId, data);
            default:
                return false;
        }
    } catch {
        return false;
    }
}

async function executeContratoOperation(
    type: OperationType,
    entityId: string,
    data: Record<string, unknown>
): Promise<boolean> {
    const baseUrl = '/api/contratos';

    switch (type) {
        case 'create': {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return response.ok;
        }
        case 'update': {
            const response = await fetch(`${baseUrl}/${entityId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return response.ok;
        }
        case 'delete': {
            const response = await fetch(`${baseUrl}/${entityId}`, {
                method: 'DELETE'
            });
            return response.ok;
        }
        default:
            return false;
    }
}

async function executeNotificacionOperation(
    type: OperationType,
    entityId: string,
    data: Record<string, unknown>
): Promise<boolean> {
    const baseUrl = '/api/notificaciones';

    switch (type) {
        case 'update': {
            const response = await fetch(`${baseUrl}/${entityId}/leida`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return response.ok;
        }
        default:
            return true; //其他操作不支持，静默成功
    }
}

async function executeBorradorOperation(
    type: OperationType,
    entityId: string,
    data: Record<string, unknown>
): Promise<boolean> {
    const baseUrl = '/api/contratos/draft';

    switch (type) {
        case 'create':
        case 'update': {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: entityId, ...data })
            });
            return response.ok;
        }
        case 'delete': {
            const response = await fetch(`${baseUrl}?id=${entityId}`, {
                method: 'DELETE'
            });
            return response.ok;
        }
        default:
            return false;
    }
}

async function executeCapturaOperation(
    type: OperationType,
    entityId: string,
    data: Record<string, unknown>
): Promise<boolean> {
    const baseUrl = '/api/contratos/smart-capture';

    switch (type) {
        case 'create': {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return response.ok;
        }
        default:
            return true;
    }
}

// ═══════════════════════════════════════════════════════════════
// SERVICE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const offlineSyncService = {
    /**
     * Agrega una operación pendiente
     */
    addOperation(
        type: OperationType,
        entity: EntityType,
        entityId: string,
        data: Record<string, unknown>
    ): PendingOperation {
        const operation: PendingOperation = {
            id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type,
            entity,
            entityId,
            data,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: MAX_RETRIES,
            status: 'pending'
        };

        const operations = getStoredOperations();
        operations.push(operation);
        saveOperations(operations);

        return operation;
    },

    /**
     * Obtiene todas las operaciones pendientes
     */
    getPendingOperations(): PendingOperation[] {
        return getStoredOperations().filter(op => op.status === 'pending');
    },

    /**
     * Obtiene el conteo de operaciones pendientes
     */
    getPendingCount(): number {
        return getStoredOperations().filter(op => op.status === 'pending').length;
    },

    /**
     * Sincroniza todas las operaciones pendientes
     */
    async syncAll(): Promise<SyncResult> {
        const operations = getStoredOperations().filter(
            op => op.status === 'pending' && op.retryCount < op.maxRetries
        );

        if (operations.length === 0) {
            return { success: true, synced: 0, failed: 0, errors: [] };
        }

        const result: SyncResult = {
            success: true,
            synced: 0,
            failed: 0,
            errors: []
        };

        // Procesar en lotes
        for (let i = 0; i < operations.length; i += BATCH_SIZE) {
            const batch = operations.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(async (operation) => {
                    updateOperation(operation.id, { status: 'syncing' });

                    const success = await executeOperation(operation);

                    if (success) {
                        updateOperation(operation.id, { status: 'completed' });
                        result.synced++;
                    } else {
                        const newRetryCount = operation.retryCount + 1;
                        if (newRetryCount >= operation.maxRetries) {
                            updateOperation(operation.id, {
                                status: 'failed',
                                retryCount: newRetryCount,
                                error: 'Max retries exceeded'
                            });
                            result.failed++;
                            result.errors.push(`Operation ${operation.id} failed permanently`);
                        } else {
                            updateOperation(operation.id, {
                                status: 'pending',
                                retryCount: newRetryCount
                            });
                            result.failed++;
                        }
                    }
                })
            );
        }

        result.success = result.failed === 0;
        clearCompletedOperations();

        return result;
    },

    /**
     * Reintenta operaciones fallidas
     */
    async retryFailed(): Promise<SyncResult> {
        const failedOps = getStoredOperations().filter(op => op.status === 'failed');

        // Resetear estados para reintentar
        failedOps.forEach(op => {
            updateOperation(op.id, { status: 'pending', retryCount: 0, error: undefined });
        });

        return this.syncAll();
    },

    /**
     * Limpia todas las operaciones
     */
    clearAll(): void {
        saveOperations([]);
    },

    /**
     * Elimina una operación específica
     */
    removeOperation(id: string): void {
        removeOperation(id);
    },

    /**
     * Obtiene operaciones por entidad
     */
    getOperationsByEntity(entity: EntityType): PendingOperation[] {
        return getStoredOperations().filter(op => op.entity === entity);
    }
};

// ═══════════════════════════════════════════════════════════════
// HOOK: USE OFFLINE SYNC
// ═══════════════════════════════════════════════════════════════

export function useOfflineSync(onSyncComplete?: (result: SyncResult) => void) {
    const isOnlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleOnline = useCallback(async () => {
        isOnlineRef.current = true;

        // Sincronizar cuando vuelve online
        const result = await offlineSyncService.syncAll();
        onSyncComplete?.(result);
    }, [onSyncComplete]);

    const handleOffline = useCallback(() => {
        isOnlineRef.current = false;
    }, []);

    const syncNow = useCallback(async () => {
        if (isOnlineRef.current) {
            const result = await offlineSyncService.syncAll();
            onSyncComplete?.(result);
            return result;
        }
        return { success: false, synced: 0, failed: 0, errors: ['Offline'] };
    }, [onSyncComplete]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Escuchar eventos de online/offline
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Sincronización periódica cuando está online
        syncIntervalRef.current = setInterval(async () => {
            if (navigator.onLine) {
                const pendingCount = offlineSyncService.getPendingCount();
                if (pendingCount > 0) {
                    const result = await offlineSyncService.syncAll();
                    onSyncComplete?.(result);
                }
            }
        }, SYNC_INTERVAL);

        // Sincronización inicial
        if (navigator.onLine) {
            offlineSyncService.syncAll().then(onSyncComplete).catch(() => { });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [handleOnline, handleOffline, onSyncComplete]);

    return {
        syncNow,
        getPendingCount: offlineSyncService.getPendingCount,
        getPendingOperations: offlineSyncService.getPendingOperations,
        retryFailed: offlineSyncService.retryFailed,
        clearAll: offlineSyncService.clearAll,
        isOnline: isOnlineRef.current
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: USE OFFLINE CONTRACTS (especializado para contratos)
// ═══════════════════════════════════════════════════════════════

export function useOfflineContratos() {
    const saveContratoOffline = useCallback(
        (contratoData: Record<string, unknown>): PendingOperation => {
            return offlineSyncService.addOperation(
                'create',
                'contrato',
                `temp_${Date.now()}`,
                contratoData
            );
        },
        []
    );

    const updateContratoOffline = useCallback(
        (contratoId: string, changes: Record<string, unknown>): PendingOperation => {
            return offlineSyncService.addOperation(
                'update',
                'contrato',
                contratoId,
                changes
            );
        },
        []
    );

    const deleteContratoOffline = useCallback(
        (contratoId: string): PendingOperation => {
            return offlineSyncService.addOperation(
                'delete',
                'contrato',
                contratoId,
                {}
            );
        },
        []
    );

    return {
        saveContratoOffline,
        updateContratoOffline,
        deleteContratoOffline,
        syncNow: () => offlineSyncService.syncAll(),
        pendingCount: offlineSyncService.getPendingCount(),
        pendingContratos: offlineSyncService.getOperationsByEntity('contrato')
    };
}
