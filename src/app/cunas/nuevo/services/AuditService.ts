export interface AuditEntry {
  id: string;
  cunaId: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'process' | 'validate' | 'distribute' | 'view';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  status?: 'success' | 'warning' | 'error';
}

export class AuditService {
  
  // Mock Storage
  private static logs: AuditEntry[] = [];

  /**
   * Registra una acción en el historial inmutable
   */
  static async logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    this.logs.unshift(newEntry); // Add to top
    return newEntry;
  }

  /**
   * Obtiene el timeline completo de una cuña
   */
  static getTimeline(cunaId: string): AuditEntry[] {
    // Si no hay logs reales para este mock ID, generar fake history para demo
    const realLogs = this.logs.filter(l => l.cunaId === cunaId);
    
    if (realLogs.length === 0) {
       return this.generateMockHistory(cunaId);
    }
    return realLogs;
  }

  private static generateMockHistory(cunaId: string): AuditEntry[] {
    const now = new Date();
    return [
      {
        id: 'evt-1', cunaId, timestamp: now,
        userId: 'usr-1', userName: 'Carlos Mendoza',
        action: 'distribute',
        title: 'ENVÍO DISTRIBUIDO',
        description: 'Sistema envió a 6 destinatarios. 4 confirmados, 2 pendientes.',
        status: 'success'
      },
      {
        id: 'evt-2', cunaId, timestamp: new Date(now.getTime() - 1000 * 60 * 5), // 5 min ago
        userId: 'sys-1', userName: 'Sistema Automático',
        action: 'validate',
        title: 'VALIDACIÓN COMPLETADA',
        description: 'Todas las validaciones pasaron exitosamente. Score técnico: 96/100.',
        status: 'success'
      },
      {
        id: 'evt-3', cunaId, timestamp: new Date(now.getTime() - 1000 * 60 * 15), // 15 min ago
        userId: 'usr-1', userName: 'Carlos Mendoza',
        action: 'process',
        title: 'AUDIO PROCESADO',
        description: 'Audio editado y exportado en calidad broadcast. Duración final: 28.5s.',
        status: 'success'
      },
      {
        id: 'evt-4', cunaId, timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 min ago
        userId: 'usr-1', userName: 'Carlos Mendoza',
        action: 'update',
        title: 'ARCHIVO SUBIDO',
        description: 'SuperMax_Promo_Verano.mp3 (1.8MB). Procesamiento automático iniciado.',
        status: 'success'
      },
      {
        id: 'evt-5', cunaId, timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 24 hours ago
        userId: 'sys-1', userName: 'Sistema (Email)',
        action: 'create',
        title: 'SOLICITUD INICIAL',
        description: 'Cliente solicitó nueva cuña para campaña verano. Email recibido de maria@supermax.cl',
        status: 'success'
      }
    ];
  }
}
