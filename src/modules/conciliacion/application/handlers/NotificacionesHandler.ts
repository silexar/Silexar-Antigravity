import { NotificacionDiscrepancia } from "../../domain/entities/NotificacionDiscrepancia";
import { logger } from '@/lib/observability';
import { AlertaUrgencia } from "../../domain/value-objects/AlertaUrgencia";
import { Result } from "../core/Result";

export class NotificacionesHandler {
  constructor() {
    // Aquí se inyectarían servicios de Email/Slack/SMS
  }

  public async enviarNotificacionDiscrepancia(discrepanciaId: string, mensaje: string, urgencia: string): Promise<Result<void>> {
    try {
      logger.info(`[Notifications] Enviando alerta ${urgencia}: ${mensaje}`);
      
      const notificacion = NotificacionDiscrepancia.create({
        discrepanciaId,
        urgencia: AlertaUrgencia.create(urgencia),
        stakeholders: ["admin@silexar.pulse", "traffic@silexar.pulse"],
        mensaje: mensaje
      });

      notificacion.marcarComoEnviada();
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error.message : "Error enviando notificación");
    }
  }
}
