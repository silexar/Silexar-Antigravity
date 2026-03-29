import { subDays } from 'date-fns';
import { logger } from '@/lib/observability';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ExpirationAlert {
  id: string;
  daysBefore: number;
  triggerDate: Date;
  time: string;
  priority: AlertPriority;
  message: string;
  recipients: string[];
}

export interface RenewalPrediction {
  probability: number; // 0-1
  recommendedAction: 'proactive_renewal' | 'standard_followup' | 'autowarn';
  bestContactDate: Date;
  riskFactors: string[];
  suggestedOffer?: string;
}

interface AlertConfig {
  defaultAlerts: { days: number; time: string; priority: AlertPriority; message: string }[];
  recipients: string[];
}

export class ExpirationIntelligenceService {
  
  // Configuración base por tipo de cuña
  private static alertConfigs: Record<string, AlertConfig> = {
    'spot': {
       defaultAlerts: [
         { days: 7, time: '09:00', priority: 'medium', message: 'Audio vence en 7 días' },
         { days: 3, time: '12:00', priority: 'high', message: 'Audio vence en 3 días - Revisar renovación' },
         { days: 1, time: '12:00', priority: 'critical', message: 'URGENTE: Audio vence mañana' },
         { days: 0, time: '08:00', priority: 'critical', message: 'ÚLTIMO DÍA: Audio vence hoy' }
       ],
       recipients: ['sales', 'supervisor', 'traffic']
    },
    'mencion': {
       defaultAlerts: [
         { days: 3, time: '11:00', priority: 'medium', message: 'Mención vence en 3 días' },
         { days: 1, time: '12:00', priority: 'high', message: 'Mención vence mañana' },
         { days: 0, time: '08:00', priority: 'critical', message: 'Mención vence HOY' }
       ],
       recipients: ['sales', 'operator']
    }
  };

  /**
   * Análisis Predictivo de Necesidad de Renovación (Mock ML)
   */
  static async predictRenewalNeeds(cunaId: string, daysTotal: number): Promise<RenewalPrediction> {
    // Simulación de factores (Usar cunaId para simular fetching real user data si fuera necesario)
    logger.info(String(cunaId)); 
    const isShortCampaign = daysTotal < 30;
    const probability = isShortCampaign ? 0.8 : 0.4; // Campañas cortas suelen renovarse más

    const riskFactors = [];
    if (!isShortCampaign) riskFactors.push('Ciclo largo - Posible fatiga de audiencia');
    
    return {
      probability,
      recommendedAction: probability > 0.7 ? 'proactive_renewal' : 'standard_followup',
      bestContactDate: subDays(new Date(), 5), // Mock: Contactar 5 días antes
      riskFactors,
      suggestedOffer: probability > 0.6 ? 'Descuento 10% por renovación anticipada' : undefined
    };
  }

  /**
   * Generación de Alertas Inteligentes
   */
  static async generateSmartAlerts(
    type: string, 
    endDate: Date, 
    recipientsList: Record<string, unknown>[]
  ): Promise<ExpirationAlert[]> {
    const config = this.alertConfigs[type] || this.alertConfigs['spot'];
    const alerts: ExpirationAlert[] = [];
    
    // Calcular predicción para ajustar (Simulada)
    const prediction = await this.predictRenewalNeeds('mock-id', 30);
    
    config.defaultAlerts.forEach((def, idx) => {
       // Ajuste inteligente: Si la prob de renovación es baja, alertar antes para gestionar
       let finalDays = def.days;
       if (prediction.probability < 0.5 && def.priority === 'high') {
          finalDays += 2; // Avisar con 2 días extra de anticipación
       }

       alerts.push({
         id: `alert-${idx}-${Date.now()}`,
         daysBefore: finalDays,
         triggerDate: subDays(endDate, finalDays),
         time: def.time,
         priority: def.priority,
         message: def.message,
         recipients: this.resolveRecipients(config.recipients, recipientsList)
       });
    });

    return alerts;
  }

  private static resolveRecipients(_roles: string[], availableRecipients: Record<string, unknown>[]): string[] {
    // Mapear roles genéricos a emails reales del panel de distribución
    // Mock simple:
    return availableRecipients.map(r => r.email as string).slice(0, 3);
  }
}
