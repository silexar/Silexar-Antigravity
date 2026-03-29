import { logger } from '@/lib/observability';
/**
 * 📱 SILEXAR PULSE - Mobile Offline SDK TIER 0
 * 
 * @description SDK de sincronización offline para apps móviles nativas.
 * Compatible con React Native, Flutter (vía bridge), iOS y Android nativos.
 * 
 * Este archivo define la lógica que debe implementarse en la app móvil
 * para el correcto funcionamiento del modo offline.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN MOBILE OFFLINE
// ═══════════════════════════════════════════════════════════════

export const OFFLINE_CONFIG = {
  // Storage keys
  STORAGE_KEYS: {
    CONTRATOS: 'silexar_contratos',
    OPERACIONES: 'silexar_operaciones_queue',
    SYNC_TOKEN: 'silexar_sync_token',
    ULTIMO_SYNC: 'silexar_ultimo_sync',
    ARCHIVOS_PENDIENTES: 'silexar_archivos_queue'
  },

  // Límites
  LIMITS: {
    MAX_QUEUE_SIZE: 100,
    MAX_STORAGE_MB: 100,
    MAX_RETRIES: 5,
    BATCH_SIZE: 10
  },

  // Intervalos (ms)
  INTERVALS: {
    SYNC_CHECK: 30000,          // Verificar si hay pendientes cada 30 seg
    RETRY_DELAY: 5000,          // Esperar 5 seg antes de reintentar
    CONNECTIVITY_CHECK: 10000   // Verificar conexión cada 10 seg
  },

  // Endpoints
  ENDPOINTS: {
    SYNC_PULL: '/api/mobile/sync?accion=sync_pull',
    SYNC_PUSH: '/api/mobile/sync?accion=sync_push',
    UPLOAD_FILE: '/api/mobile/files/upload'
  }
} as const;

// ═══════════════════════════════════════════════════════════════
// TIPOS MOBILE
// ═══════════════════════════════════════════════════════════════

export interface MobileOperacion {
  id: string;
  tipo: string;
  entidad: 'contrato' | 'linea' | 'archivo' | 'pago' | 'comentario';
  entidadId: string;
  datos: Record<string, unknown>;
  timestamp: number; // Unix timestamp
  intentos: number;
  estado: 'PENDING' | 'SYNCING' | 'DONE' | 'ERROR' | 'CONFLICT';
  errorMsg?: string;
}

export interface MobileContratoCache {
  id: string;
  localId: string;
  datos: Record<string, unknown>;
  version: number;
  modifiedAt: number;
  syncedAt?: number;
  dirty: boolean;
}

export interface MobileSyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  newToken: string;
}

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'RECONNECTING';

// ═══════════════════════════════════════════════════════════════
// CLASE MOBILE OFFLINE MANAGER
// Este código debe adaptarse a la plataforma (React Native, Swift, Kotlin)
// ═══════════════════════════════════════════════════════════════

export abstract class MobileOfflineManager {
  protected queue: MobileOperacion[] = [];
  protected cache: Map<string, MobileContratoCache> = new Map();
  protected syncToken: string | null = null;
  protected connectionState: ConnectionState = 'ONLINE';
  protected listeners: ((state: ConnectionState) => void)[] = [];

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS ABSTRACTOS (Implementar en cada plataforma)
  // ═══════════════════════════════════════════════════════════════

  /** Guardar en almacenamiento local (AsyncStorage, SharedPreferences, UserDefaults) */
  protected abstract saveToStorage(key: string, value: string): Promise<void>;
  
  /** Leer de almacenamiento local */
  protected abstract loadFromStorage(key: string): Promise<string | null>;
  
  /** Verificar conexión a internet */
  protected abstract checkConnectivity(): Promise<boolean>;
  
  /** Hacer request HTTP */
  protected abstract httpRequest<T>(
    url: string, 
    method: 'GET' | 'POST', 
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<{ ok: boolean; data: T; status: number }>;

  // ═══════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════

  async initialize(): Promise<void> {
    // Cargar datos locales
    await this.loadQueue();
    await this.loadCache();
    await this.loadSyncToken();

    // Verificar conexión inicial
    this.connectionState = (await this.checkConnectivity()) ? 'ONLINE' : 'OFFLINE';

    // Iniciar monitoring de conexión
    this.startConnectivityMonitoring();

    // Si hay conexión y operaciones pendientes, sincronizar
    if (this.connectionState === 'ONLINE' && this.queue.length > 0) {
      this.sync();
    }

    logger.info(`[MobileOffline] Inicializado: ${this.queue.length} operaciones pendientes`);
  }

  private async loadQueue(): Promise<void> {
    const data = await this.loadFromStorage(OFFLINE_CONFIG.STORAGE_KEYS.OPERACIONES);
    if (data) {
      this.queue = JSON.parse(data);
    }
  }

  private async loadCache(): Promise<void> {
    const data = await this.loadFromStorage(OFFLINE_CONFIG.STORAGE_KEYS.CONTRATOS);
    if (data) {
      const parsed: MobileContratoCache[] = JSON.parse(data);
      parsed.forEach(c => this.cache.set(c.localId, c));
    }
  }

  private async loadSyncToken(): Promise<void> {
    this.syncToken = await this.loadFromStorage(OFFLINE_CONFIG.STORAGE_KEYS.SYNC_TOKEN);
  }

  private async saveQueue(): Promise<void> {
    await this.saveToStorage(
      OFFLINE_CONFIG.STORAGE_KEYS.OPERACIONES,
      JSON.stringify(this.queue)
    );
  }

  private async saveCache(): Promise<void> {
    await this.saveToStorage(
      OFFLINE_CONFIG.STORAGE_KEYS.CONTRATOS,
      JSON.stringify(Array.from(this.cache.values()))
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GUARDADO LOCAL
  // ═══════════════════════════════════════════════════════════════

  async saveContrato(datos: Record<string, unknown>, localId?: string): Promise<string> {
    const id = localId || `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const existing = this.cache.get(id);

    const contrato: MobileContratoCache = {
      id: datos.id as string || '',
      localId: id,
      datos,
      version: existing ? existing.version + 1 : 1,
      modifiedAt: Date.now(),
      dirty: true
    };

    this.cache.set(id, contrato);

    // Agregar operación a la cola
    this.enqueue({
      tipo: existing ? 'UPDATE_CONTRACT' : 'CREATE_CONTRACT',
      entidad: 'contrato',
      entidadId: id,
      datos
    });

    await this.saveCache();
    logger.info(`[MobileOffline] Contrato ${id} guardado localmente`);

    // Intentar sync si hay conexión
    if (this.connectionState === 'ONLINE') {
      this.sync();
    }

    return id;
  }

  getContrato(localId: string): MobileContratoCache | undefined {
    return this.cache.get(localId);
  }

  getAllContratos(): MobileContratoCache[] {
    return Array.from(this.cache.values());
  }

  getDirtyContratos(): MobileContratoCache[] {
    return this.getAllContratos().filter(c => c.dirty);
  }

  // ═══════════════════════════════════════════════════════════════
  // COLA DE OPERACIONES
  // ═══════════════════════════════════════════════════════════════

  private enqueue(params: Omit<MobileOperacion, 'id' | 'timestamp' | 'intentos' | 'estado'>): string {
    if (this.queue.length >= OFFLINE_CONFIG.LIMITS.MAX_QUEUE_SIZE) {
      // Eliminar la operación completada más antigua
      const doneIndex = this.queue.findIndex(o => o.estado === 'DONE');
      if (doneIndex >= 0) {
        this.queue.splice(doneIndex, 1);
      } else {
        logger.warn('[MobileOffline] Cola llena, descartando operación más antigua');
        this.queue.shift();
      }
    }

    const operacion: MobileOperacion = {
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...params,
      timestamp: Date.now(),
      intentos: 0,
      estado: 'PENDING'
    };

    this.queue.push(operacion);
    this.saveQueue();

    return operacion.id;
  }

  getPendingOperations(): MobileOperacion[] {
    return this.queue.filter(o => o.estado === 'PENDING' || o.estado === 'ERROR');
  }

  // ═══════════════════════════════════════════════════════════════
  // SINCRONIZACIÓN
  // ═══════════════════════════════════════════════════════════════

  async sync(): Promise<MobileSyncResult> {
    if (this.connectionState !== 'ONLINE') {
      return { success: false, synced: 0, failed: 0, conflicts: 0, newToken: '' };
    }

    const pending = this.getPendingOperations();
    if (pending.length === 0) {
      return { success: true, synced: 0, failed: 0, conflicts: 0, newToken: this.syncToken || '' };
    }

    logger.info(`[MobileOffline] Sincronizando ${pending.length} operaciones...`);

    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    // Procesar en batches
    const batches = this.chunkArray(pending, OFFLINE_CONFIG.LIMITS.BATCH_SIZE);

    for (const batch of batches) {
      for (const op of batch) {
        op.estado = 'SYNCING';
        op.intentos++;

        try {
          const result = await this.httpRequest<{ success: boolean; id?: string; conflict?: boolean }>(
            OFFLINE_CONFIG.ENDPOINTS.SYNC_PUSH,
            'POST',
            {
              accion: 'sync_push',
              acciones: [op]
            }
          );

          if (result.ok && result.data.success) {
            op.estado = 'DONE';
            synced++;

            // Actualizar cache con ID del servidor
            if (result.data.id && op.entidad === 'contrato') {
              const cached = this.cache.get(op.entidadId);
              if (cached) {
                cached.id = result.data.id;
                cached.dirty = false;
                cached.syncedAt = Date.now();
              }
            }
          } else if (result.data.conflict) {
            op.estado = 'CONFLICT';
            conflicts++;
          } else {
            if (op.intentos >= OFFLINE_CONFIG.LIMITS.MAX_RETRIES) {
              op.estado = 'ERROR';
              op.errorMsg = 'Max retries exceeded';
              failed++;
            } else {
              op.estado = 'PENDING'; // Retry later
            }
          }
        } catch (error) {
          op.estado = 'ERROR';
          op.errorMsg = error instanceof Error ? error.message : 'Unknown error';
          failed++;
        }
      }

      await this.saveQueue();
      await this.saveCache();
    }

    // Obtener cambios del servidor
    const pullResult = await this.pullChanges();
    if (pullResult.newToken) {
      this.syncToken = pullResult.newToken;
      await this.saveToStorage(OFFLINE_CONFIG.STORAGE_KEYS.SYNC_TOKEN, pullResult.newToken);
    }

    logger.info(`[MobileOffline] Sync completado: ${synced} OK, ${failed} errores, ${conflicts} conflictos`);

    return { success: failed === 0, synced, failed, conflicts, newToken: this.syncToken || '' };
  }

  private async pullChanges(): Promise<{ newToken: string }> {
    try {
      const result = await this.httpRequest<{ syncToken: string; deltas: unknown[] }>(
        OFFLINE_CONFIG.ENDPOINTS.SYNC_PULL,
        'POST',
        {
          accion: 'sync_pull',
          ultimoSyncToken: this.syncToken
        }
      );

      if (result.ok) {
        // Procesar deltas (actualizaciones del servidor)
        // En producción: aplicar cambios al cache local
        return { newToken: result.data.syncToken };
      }
    } catch (error) {
      logger.error('[MobileOffline] Error en pull:', error instanceof Error ? error : undefined);
    }

    return { newToken: this.syncToken || '' };
  }

  // ═══════════════════════════════════════════════════════════════
  // MONITOREO DE CONEXIÓN
  // ═══════════════════════════════════════════════════════════════

  private startConnectivityMonitoring(): void {
    setInterval(async () => {
      const wasOnline = this.connectionState === 'ONLINE';
      const isOnline = await this.checkConnectivity();

      if (isOnline && !wasOnline) {
        // Reconectado
        this.connectionState = 'RECONNECTING';
        this.notifyListeners();

        // Sincronizar
        await this.sync();

        this.connectionState = 'ONLINE';
        this.notifyListeners();
        logger.info('[MobileOffline] ✅ Reconectado y sincronizado');
      } else if (!isOnline && wasOnline) {
        // Desconectado
        this.connectionState = 'OFFLINE';
        this.notifyListeners();
        logger.info('[MobileOffline] ❌ Desconectado - Modo offline');
      }
    }, OFFLINE_CONFIG.INTERVALS.CONNECTIVITY_CHECK);
  }

  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l(this.connectionState));
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async clearAll(): Promise<void> {
    this.queue = [];
    this.cache.clear();
    this.syncToken = null;
    await this.saveQueue();
    await this.saveCache();
    await this.saveToStorage(OFFLINE_CONFIG.STORAGE_KEYS.SYNC_TOKEN, '');
    logger.info('[MobileOffline] Cache limpiado');
  }

  getStats(): { queueSize: number; cacheSize: number; dirtyCount: number } {
    return {
      queueSize: this.queue.length,
      cacheSize: this.cache.size,
      dirtyCount: this.getDirtyContratos().length
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO DE IMPLEMENTACIÓN REACT NATIVE
// ═══════════════════════════════════════════════════════════════

/*
// En tu app React Native:

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class ReactNativeOfflineManager extends MobileOfflineManager {
  protected async saveToStorage(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  protected async loadFromStorage(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  protected async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  protected async httpRequest<T>(
    url: string,
    method: 'GET' | 'POST',
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<{ ok: boolean; data: T; status: number }> {
    const response = await fetch(API_BASE_URL + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    return { ok: response.ok, data, status: response.status };
  }
}

export const offlineManager = new ReactNativeOfflineManager();
*/
