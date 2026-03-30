export type TrackingStatus = 'sending' | 'sent' | 'delivered' | 'opened' | 'downloaded' | 'confirmed' | 'failed';

export interface RecipientTracking {
  id: string;
  email: string;
  name: string;
  role: string;
  status: TrackingStatus;
  timeline: {
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    confirmedAt?: Date;
    failedAt?: Date;
    failReason?: string;
  };
}


export interface DeliveryRecord {
  id: string;
  cunaId: string;
  subject: string;
  scheduledAt: Date;
  status: 'active' | 'completed' | 'issues';
  recipients: RecipientTracking[];
  progress: number; // 0-100
}

interface RecipientInput {
  email: string;
  name?: string;
  role: string;
  [key: string]: unknown;
}

export class DistributionTrackingService {
  
  // Storage Mock
  private static activeDeliveries: Record<string, DeliveryRecord> = {};

  static async createDelivery(cunaId: string, recipients: RecipientInput[], subject: string): Promise<DeliveryRecord> {
    const id = `DEL-${Date.now()}`;
    
    // Transformar recipients a tracking objects
    const trackedRecipients: RecipientTracking[] = recipients.map(r => ({
      id: `rcp_${Math.random().toString(36).substr(2, 9)}`,
      email: r.email,
      name: r.name || r.email,
      role: r.role,
      status: 'sending', // Initial status
      timeline: {}
    }));

    const record: DeliveryRecord = {
      id,
      cunaId,
      subject,
      scheduledAt: new Date(),
      status: 'active',
      recipients: trackedRecipients,
      progress: 0
    };

    this.activeDeliveries[id] = record;
    
    // Iniciar simulación de envío asíncrono
    this.simulateDeliveryProcess(id);

    return record;
  }

  static getDeliveryStatus(deliveryId: string): DeliveryRecord | null {
    return this.activeDeliveries[deliveryId] || null;
  }

  // Simulación de eventos del "mundo real" (Opens, Clicks, Failures)
  private static simulateDeliveryProcess(deliveryId: string) {
    const record = this.activeDeliveries[deliveryId];
    if (!record) return;

    record.recipients.forEach((rcp, index) => {
       // 1. Sent (Instant)
       setTimeout(() => {
         this.updateRecipientStatus(deliveryId, rcp.id, 'sent');
       }, 500 * (index + 1));

       // 2. Delivered (1-3s)
       const deliverTime = 1000 + Math.random() * 2000;
       setTimeout(() => {
         // Simular fallo aleatorio (10% chance)
         if (Math.random() > 0.9) {
            this.updateRecipientStatus(deliveryId, rcp.id, 'failed', 'Buzón lleno');
         } else {
            this.updateRecipientStatus(deliveryId, rcp.id, 'delivered');
            
            // 3. Open (3-8s)
            const openTime = 3000 + Math.random() * 5000;
            setTimeout(() => {
               this.updateRecipientStatus(deliveryId, rcp.id, 'opened');

               // 4. Confirm (Solo algunos, 5-15s)
               if (Math.random() > 0.3) { // 70% confirman
                  setTimeout(() => {
                    this.updateRecipientStatus(deliveryId, rcp.id, 'confirmed');
                  }, 5000 + Math.random() * 10000);
               }

            }, openTime);
         }
       }, deliverTime);
    });
  }

  private static updateRecipientStatus(deliveryId: string, rcpId: string, status: TrackingStatus, reason?: string) {
    const record = this.activeDeliveries[deliveryId];
    if (!record) return;

    const rcp = record.recipients.find(r => r.id === rcpId);
    if (rcp) {
      rcp.status = status;
      const now = new Date();
      
      if (status === 'sent') rcp.timeline.sentAt = now;
      if (status === 'delivered') rcp.timeline.deliveredAt = now;
      if (status === 'opened') rcp.timeline.openedAt = now;
      if (status === 'confirmed') rcp.timeline.confirmedAt = now;
      if (status === 'failed') {
         rcp.timeline.failedAt = now;
         rcp.timeline.failReason = reason;
      }
      
      // Recalcular progreso global
      const completed = record.recipients.filter(r => r.status === 'confirmed' || r.status === 'failed').length;
      record.progress = Math.round((completed / record.recipients.length) * 100);
      
      if (completed === record.recipients.length) {
         record.status = record.recipients.some(r => r.status === 'failed') ? 'issues' : 'completed';
      }
    }
  }
}
