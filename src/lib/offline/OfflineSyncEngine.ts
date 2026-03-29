/**
 * 📡 SILEXAR PULSE - Offline-First Sync Engine TIER 0
 * 
 * Sistema de sincronización offline-first con almacenamiento local,
 * cola de operaciones pendientes, y auto-sync al reconectar
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PendingOperation {
  id: string;
  timestamp: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'PATCH';
  entity: 'cuna' | 'activo_digital' | 'mencion' | 'presentacion' | 'distribucion';
  endpoint: string;
  method: string;
  payload: unknown;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  errorMessage?: string;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount: number;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  version: number;
  isStale: boolean;
}

type SyncEventCallback = (state: SyncState) => void;

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const DB_NAME = 'silexar_pulse_offline';
const DB_VERSION = 1;
const STORES = {
  PENDING_OPS: 'pending_operations',
  CUNAS_CACHE: 'cunas_cache',
  ACTIVOS_CACHE: 'activos_digitales_cache',
  USER_DRAFTS: 'user_drafts',
  SYNC_META: 'sync_metadata'
};

const SYNC_INTERVAL = 30000; // 30 segundos
const STALE_TIME = 5 * 60 * 1000; // 5 minutos
const MAX_RETRIES = 5;

// ═══════════════════════════════════════════════════════════════
// OFFLINE SYNC ENGINE
// ═══════════════════════════════════════════════════════════════

class OfflineSyncEngine {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private listeners: Set<SyncEventCallback> = new Set();
  private pendingCount: number = 0;
  private failedCount: number = 0;
  private lastSyncTime: number | null = null;

  // ─────────────────────────────────────────────────────────────
  // INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Inicializar IndexedDB
    await this.initDatabase();

    // Detectar estado de conexión
    this.isOnline = navigator.onLine;
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Cargar contadores
    await this.updateCounts();

    // Iniciar sincronización periódica
    this.startSyncInterval();

    // Sync inicial si hay conexión
    if (this.isOnline) {
      this.syncPendingOperations();
    }

    logger.info('🔄 OfflineSyncEngine initialized', { isOnline: this.isOnline });
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Pending operations store
        if (!db.objectStoreNames.contains(STORES.PENDING_OPS)) {
          const store = db.createObjectStore(STORES.PENDING_OPS, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('status', 'status');
          store.createIndex('entity', 'entity');
        }

        // Cuñas cache store
        if (!db.objectStoreNames.contains(STORES.CUNAS_CACHE)) {
          db.createObjectStore(STORES.CUNAS_CACHE, { keyPath: 'id' });
        }

        // Activos digitales cache store
        if (!db.objectStoreNames.contains(STORES.ACTIVOS_CACHE)) {
          db.createObjectStore(STORES.ACTIVOS_CACHE, { keyPath: 'id' });
        }

        // User drafts store
        if (!db.objectStoreNames.contains(STORES.USER_DRAFTS)) {
          const draftsStore = db.createObjectStore(STORES.USER_DRAFTS, { keyPath: 'id' });
          draftsStore.createIndex('entity', 'entity');
          draftsStore.createIndex('updatedAt', 'updatedAt');
        }

        // Sync metadata store
        if (!db.objectStoreNames.contains(STORES.SYNC_META)) {
          db.createObjectStore(STORES.SYNC_META, { keyPath: 'key' });
        }
      };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // MANEJO DE CONEXIÓN
  // ─────────────────────────────────────────────────────────────

  private handleOnline(): void {
    logger.info('🌐 Connection restored');
    this.isOnline = true;
    this.notifyListeners();
    
    // Auto-sync al reconectar
    this.syncPendingOperations();
  }

  private handleOffline(): void {
    logger.info('📴 Connection lost - Switching to offline mode');
    this.isOnline = false;
    this.notifyListeners();
  }

  // ─────────────────────────────────────────────────────────────
  // OPERACIONES PENDIENTES
  // ─────────────────────────────────────────────────────────────

  async addPendingOperation(
    type: PendingOperation['type'],
    entity: PendingOperation['entity'],
    endpoint: string,
    method: string,
    payload: unknown
  ): Promise<string> {
    const operation: PendingOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      entity,
      endpoint,
      method,
      payload,
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      status: 'pending'
    };

    await this.saveToStore(STORES.PENDING_OPS, operation);
    await this.updateCounts();
    this.notifyListeners();

    // Intentar sincronizar inmediatamente si hay conexión
    if (this.isOnline && !this.isSyncing) {
      this.syncPendingOperations();
    }

    return operation.id;
  }

  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.isSyncing || !this.db) return;

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const operations = await this.getPendingOperations();
      
      for (const op of operations) {
        if (op.status === 'completed') continue;

        try {
          // Marcar como syncing
          op.status = 'syncing';
          await this.saveToStore(STORES.PENDING_OPS, op);

          // Ejecutar operación
          const response = await fetch(op.endpoint, {
            method: op.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(op.payload)
          });

          if (response.ok) {
            // Éxito - eliminar de pendientes
            await this.deleteFromStore(STORES.PENDING_OPS, op.id);
            logger.info(`✅ Synced operation: ${op.id}`);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          // Error - incrementar retry count
          op.retryCount++;
          op.status = op.retryCount >= op.maxRetries ? 'failed' : 'pending';
          op.errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await this.saveToStore(STORES.PENDING_OPS, op);
          logger.warn(`⚠️ Failed to sync operation: ${op.id}`, error);
        }
      }

      this.lastSyncTime = Date.now();
      await this.saveSyncMeta('lastSyncTime', this.lastSyncTime);
    } finally {
      this.isSyncing = false;
      await this.updateCounts();
      this.notifyListeners();
    }
  }

  private async getPendingOperations(): Promise<PendingOperation[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);

      const transaction = this.db.transaction(STORES.PENDING_OPS, 'readonly');
      const store = transaction.objectStore(STORES.PENDING_OPS);
      const request = store.index('timestamp').getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────────────────────

  async cacheData<T>(storeName: string, data: T, id: string): Promise<void> {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      version: 1,
      isStale: false
    };
    await this.saveToStore(storeName, { id, ...cached });
  }

  async getCachedData<T>(storeName: string, id: string): Promise<CachedData<T> | null> {
    const result = await this.getFromStore<CachedData<T> & { id: string }>(storeName, id);
    if (!result) return null;

    const isStale = Date.now() - result.timestamp > STALE_TIME;
    return { ...result, isStale };
  }

  async getCachedList<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.map((r: CachedData<T> & { id: string }) => r.data));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // BORRADORES
  // ─────────────────────────────────────────────────────────────

  async saveDraft(entity: string, draftId: string, data: unknown): Promise<void> {
    const draft = {
      id: draftId,
      entity,
      data,
      updatedAt: Date.now()
    };
    await this.saveToStore(STORES.USER_DRAFTS, draft);
  }

  async getDraft<T>(draftId: string): Promise<T | null> {
    const result = await this.getFromStore<{ data: T }>(STORES.USER_DRAFTS, draftId);
    return result?.data || null;
  }

  async deleteDraft(draftId: string): Promise<void> {
    await this.deleteFromStore(STORES.USER_DRAFTS, draftId);
  }

  async getDrafts(entity: string): Promise<{ id: string; data: unknown; updatedAt: number }[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);

      const transaction = this.db.transaction(STORES.USER_DRAFTS, 'readonly');
      const store = transaction.objectStore(STORES.USER_DRAFTS);
      const index = store.index('entity');
      const request = index.getAll(entity);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private async saveToStore(storeName: string, data: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromStore<T>(storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(null);

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveSyncMeta(key: string, value: unknown): Promise<void> {
    await this.saveToStore(STORES.SYNC_META, { key, value });
  }

  private async updateCounts(): Promise<void> {
    const operations = await this.getPendingOperations();
    this.pendingCount = operations.filter(op => op.status === 'pending' || op.status === 'syncing').length;
    this.failedCount = operations.filter(op => op.status === 'failed').length;
  }

  // ─────────────────────────────────────────────────────────────
  // SYNC INTERVAL
  // ─────────────────────────────────────────────────────────────

  private startSyncInterval(): void {
    if (this.syncIntervalId) return;

    this.syncIntervalId = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncPendingOperations();
      }
    }, SYNC_INTERVAL);
  }

  stopSyncInterval(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // LISTENERS
  // ─────────────────────────────────────────────────────────────

  subscribe(callback: SyncEventCallback): () => void {
    this.listeners.add(callback);
    // Enviar estado actual inmediatamente
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(callback => callback(state));
  }

  getState(): SyncState {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingCount: this.pendingCount,
      failedCount: this.failedCount
    };
  }

  // ─────────────────────────────────────────────────────────────
  // MANUAL SYNC
  // ─────────────────────────────────────────────────────────────

  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      logger.warn('Cannot force sync while offline');
      return;
    }
    await this.syncPendingOperations();
  }

  async retryFailed(): Promise<void> {
    if (!this.db) return;

    const operations = await this.getPendingOperations();
    for (const op of operations) {
      if (op.status === 'failed') {
        op.status = 'pending';
        op.retryCount = 0;
        await this.saveToStore(STORES.PENDING_OPS, op);
      }
    }

    await this.updateCounts();
    this.notifyListeners();
    
    if (this.isOnline) {
      this.syncPendingOperations();
    }
  }

  async clearFailed(): Promise<void> {
    if (!this.db) return;

    const operations = await this.getPendingOperations();
    for (const op of operations) {
      if (op.status === 'failed') {
        await this.deleteFromStore(STORES.PENDING_OPS, op.id);
      }
    }

    await this.updateCounts();
    this.notifyListeners();
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const offlineSyncEngine = new OfflineSyncEngine();

export default offlineSyncEngine;
