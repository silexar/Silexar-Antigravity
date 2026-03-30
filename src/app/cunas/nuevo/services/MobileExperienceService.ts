import { logger } from '@/lib/observability';
export interface OfflineAction {
  id: string;
  type: 'SAVE_CUNA' | 'UPLOAD_FILE' | 'APPROVE_WORKFLOW';
  payload: unknown;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
}

export class MobileExperienceService {
  
  private static readonly QUEUE_KEY = 'spx_offline_queue';

  /**
   * Detecta capacidades del dispositivo móvil
   */
  static getCapabilities() {
    const isBrowser = typeof window !== 'undefined';
    return {
      hasCamera: isBrowser && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasMicrophone: isBrowser && 'mediaDevices' in navigator,
      isTouch: isBrowser && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
      isPWA: isBrowser && (window.matchMedia('(display-mode: standalone)').matches)
    };
  }

  /**
   * Verifica el estado de la conexión
   */
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Cola de acciones offline
   */
  static queueAction(type: OfflineAction['type'], payload: unknown) {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    const queue = this.getQueue();
    queue.push(action);
    this.saveQueue(queue);
    
    logger.info(`[Mobile] Acción encolada offline: ${type}`);
    return action.id;
  }

  static getQueue(): OfflineAction[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private static saveQueue(queue: OfflineAction[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    }
  }

  /**
   * Sincronización al reconectar
   */
  static async syncOnReconnect() {
    if (!this.isOnline()) return { synced: 0, errors: 0 };
    
    const queue = this.getQueue();
    if (queue.length === 0) return { synced: 0, errors: 0 };

    logger.info(`[Mobile] Iniciando sincronización de ${queue.length} acciones pendientes...`);
    
    const results = { synced: 0, errors: 0 };
    const remainingQueue: OfflineAction[] = [];

    for (const action of queue) {
      try {
        await this.executeAction(action);
        results.synced++;
      } catch (error) {
        logger.error(`[Mobile] Error sincronizando acción ${action.id}`, error instanceof Error ? error : undefined);
        results.errors++;
        remainingQueue.push(action); // Keep in queue to retry
      }
    }

    this.saveQueue(remainingQueue);
    return results;
  }

  private static async executeAction(action: OfflineAction) {
    // Mock execution simulation
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    logger.info(`[Mobile] Acción sincronizada exitosamente: ${action.type}`);
    return true;
  }
}
