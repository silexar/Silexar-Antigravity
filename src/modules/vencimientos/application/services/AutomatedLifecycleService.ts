/**
 * AUTOMATED LIFECYCLE MANAGEMENT SERVICE
 * Controla renovaciones inteligentes, upselling y alertas de cierre de Customer Journey.
 */

export interface JourneyMilestone {
  contractId: string;
  milestone: 'ONBOARDING' | 'MID_CAMPAIGN' | 'RENEWAL_WINDOW';
  suggestedAction: string;
}

export class AutomatedLifecycleService {
  
  /**
   * Identifica oportunidades de Upselling basadas en la madurez del contrato.
   */
  public async identifyUpselling(contractValue: number, monthsActive: number): Promise<string | null> {
    if (monthsActive > 6 && contractValue > 5000000) {
      return "💡 UPSPELL DETECTADO: Cliente Premium con >6 meses de antigüedad. Sugerir Paquete Prime PM.";
    }
    return null;
  }

  /**
   * Mapea el Customer Journey y alerta sobre el siguiente paso obligatorio.
   */
  public async mapCustomerJourney(contractId: string, daysElapsed: number, totalDays: number): Promise<JourneyMilestone> {
    const progress = (daysElapsed / totalDays) * 100;

    if (progress < 20) {
      return { contractId, milestone: 'ONBOARDING', suggestedAction: 'Enviar bienvenida automática y medir satisfacción incial.' };
    } 
    if (progress >= 80) {
      return { contractId, milestone: 'RENEWAL_WINDOW', suggestedAction: 'Iniciar protocolo de retención CORTEX. Ofrecer descuento algorítmico.' };
    }

    return { contractId, milestone: 'MID_CAMPAIGN', suggestedAction: 'Generar reporte intermedio de ROI y enviarlo por Email.' };
  }
}
