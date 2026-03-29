/**
 * SILEXAR PULSE - TIER0+ OFFLINE MANAGER
 * Gestor de Modo Offline para Móvil
 */

export interface OfflineData {
    readonly id: string;
    readonly type: string;
    readonly data: Record<string, unknown>;
    readonly timestamp: Date;
    readonly synced: boolean;
}

class OfflineManagerImpl {
    private pendingData: OfflineData[] = [];

    async save(type: string, data: Record<string, unknown>): Promise<string> {
        const item: OfflineData = {
            id: `offline_${Date.now()}`,
            type,
            data,
            timestamp: new Date(),
            synced: false,
        };
        this.pendingData.push(item);
        return item.id;
    }

    async getPending(): Promise<OfflineData[]> {
        return this.pendingData.filter(d => !d.synced);
    }

    async sync(): Promise<{ synced: number; failed: number }> {
        const pending = this.pendingData.filter(d => !d.synced);
        // Mark all as synced (mock)
        pending.forEach(item => {
            (item as { synced: boolean }).synced = true;
        });
        return { synced: pending.length, failed: 0 };
    }

    async clear(): Promise<void> {
        this.pendingData = [];
    }
}

export const OfflineManager = new OfflineManagerImpl();
export default OfflineManager;