/**
 * EXTERNAL SERVICE: ALERTA VENCIMIENTO — TIER 0
 *
 * Programa alertas automáticas de vencimiento de cuñas.
 * Alertas: 7 días antes (aviso), 1 día antes (urgente).
 *
 * Estado actual: STUB — la implementación real usa el scheduler de alertas
 * del módulo de Vencimientos + notificaciones push/email.
 */

import type { Cuna } from '../../domain/entities/Cuna';

export interface AlertaProgramada {
  cunaId: string;
  tipo: 'aviso_7dias' | 'urgente_1dia';
  fechaDisparo: Date;
  destinatarios: string[];  // userIds
}

export class AlertaVencimientoService {
  /**
   * Programa las dos alertas estándar de vencimiento para una cuña.
   * Solo aplica si la cuña tiene fechaFinVigencia definida.
   */
  async scheduleAlerts(cuna: Cuna): Promise<AlertaProgramada[]> {
    const fechaFin = cuna.fechaFinVigencia;
    if (!fechaFin) return [];

    const alertas: AlertaProgramada[] = [];

    // Alerta 7 días antes
    const aviso7dias = new Date(fechaFin.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (aviso7dias > new Date()) {
      alertas.push({
        cunaId: cuna.id,
        tipo: 'aviso_7dias',
        fechaDisparo: aviso7dias,
        destinatarios: [cuna.subidoPorId],
      });
    }

    // Alerta 1 día antes
    const urgente1dia = new Date(fechaFin.getTime() - 1 * 24 * 60 * 60 * 1000);
    if (urgente1dia > new Date()) {
      alertas.push({
        cunaId: cuna.id,
        tipo: 'urgente_1dia',
        fechaDisparo: urgente1dia,
        destinatarios: [cuna.subidoPorId],
      });
    }

    // STUB: En producción, persistir alertas en tabla cunas_alertas
    // y registrar en el scheduler del módulo de Vencimientos
    return alertas;
  }
}
