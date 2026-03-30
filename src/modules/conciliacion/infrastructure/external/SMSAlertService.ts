import { logger } from '@/lib/observability';
export class SMSAlertService {
  public async sendUrgentAlert(phone: string, message: string): Promise<void> {
    logger.info(`[SMSService] Enviando alerta crítica a ${phone}: ${message}`);
    // Simulación de envío SMS Gateway
  }
}
