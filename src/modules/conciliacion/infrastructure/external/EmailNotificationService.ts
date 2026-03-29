import { logger } from '@/lib/observability';
export class EmailNotificationService {
  public async sendNotification(to: string[], subject: string, body: string): Promise<void> {
    logger.info(`[EmailService] Enviando a ${to.join(', ')}: ${subject}`);
    // Simulación de envío
  }
}
