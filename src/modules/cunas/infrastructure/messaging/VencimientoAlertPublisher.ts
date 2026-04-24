/**
 * MESSAGING: VENCIMIENTO ALERT PUBLISHER — TIER 0
 *
 * Publicador de alertas relacionadas al vencimientos de cuñas.
 * Coordina notificaciones preventivas (7 días, 3 días, 1 día, hoy)
 * y escala automáticamente según la criticidad.
 *
 * Integra con: módulo Vencimientos, Email, WhatsApp, Dashboard gerencial.
 */

export type NivelAlertaVencimiento =
  | 'preventiva_7dias'     // 7 días antes de vencer
  | 'preventiva_3dias'     // 3 días antes de vencer
  | 'urgente_1dia'         // 24 horas antes
  | 'critica_hoy'          // Vence hoy
  | 'vencida';             // Ya venció sin renovación

export interface AlertaVencimientoPayload {
  cunaId: string;
  tenantId: string;
  codigo: string;               // SPX000000
  nombreCuna: string;
  anuncianteId: string;
  ejecutivoId?: string | null;  // Ejecutivo comercial responsable
  contratoId?: string | null;
  fechaVencimiento: Date;
  diasRestantes: number;
  nivel: NivelAlertaVencimiento;
  requiereAccion: string;       // Texto descripción de acción requerida
}

export type AlertHandler = (alerta: AlertaVencimientoPayload) => Promise<void>;

class VencimientoAlertBus {
  private handlers: AlertHandler[] = [];

  subscribe(handler: AlertHandler): void {
    this.handlers.push(handler);
  }

  async publish(alerta: AlertaVencimientoPayload): Promise<void> {
    await Promise.allSettled(
      this.handlers.map(h =>
        h(alerta).catch(err =>
          console.error(`[VencimientoAlertBus] Error en handler:`, err)
        )
      )
    );
  }
}

const alertBus = new VencimientoAlertBus();

export class VencimientoAlertPublisher {
  /**
   * Dispara alerta preventiva (7 o 3 días antes).
   * Canal: email al ejecutivo comercial.
   */
  static async alertarPreventivaVencimiento(
    payload: Omit<AlertaVencimientoPayload, 'nivel'>
  ): Promise<void> {
    const nivel: NivelAlertaVencimiento =
      payload.diasRestantes >= 5 ? 'preventiva_7dias' : 'preventiva_3dias';

    const alerta: AlertaVencimientoPayload = { ...payload, nivel };
    console.info(
      `[VencimientoAlertPublisher] Alerta preventiva: ${payload.codigo} — ${payload.diasRestantes} días`
    );
    await alertBus.publish(alerta);
  }

  /**
   * Dispara alerta urgente (24 horas antes).
   * Canal: email + WhatsApp al ejecutivo comercial.
   */
  static async alertarUrgenteVencimiento(
    payload: Omit<AlertaVencimientoPayload, 'nivel'>
  ): Promise<void> {
    const alerta: AlertaVencimientoPayload = { ...payload, nivel: 'urgente_1dia' };
    console.warn(
      `[VencimientoAlertPublisher] URGENTE: ${payload.codigo} vence en 24 horas`
    );
    await alertBus.publish(alerta);
  }

  /**
   * Dispara alerta crítica (el día del vencimientos).
   * Canal: email + WhatsApp + dashboard gerencial.
   */
  static async alertarCriticaVencimiento(
    payload: Omit<AlertaVencimientoPayload, 'nivel'>
  ): Promise<void> {
    const alerta: AlertaVencimientoPayload = {
      ...payload,
      nivel: 'critica_hoy',
      requiereAccion: `ACCIÓN INMEDIATA: La cuña ${payload.codigo} vence HOY sin renovación confirmada`,
    };
    console.error(
      `[VencimientoAlertPublisher] CRÍTICO: ${payload.codigo} vence HOY`
    );
    await alertBus.publish(alerta);
  }

  /**
   * Notifica que una cuña ya venció sin renovación.
   * Canal: escalación a gerencia comercial.
   */
  static async notificarCunaVencida(
    payload: Omit<AlertaVencimientoPayload, 'nivel'>
  ): Promise<void> {
    const alerta: AlertaVencimientoPayload = {
      ...payload,
      nivel: 'vencida',
      requiereAccion: `La cuña ${payload.codigo} ha VENCIDO. Retirar de emisión inmediatamente.`,
    };
    console.error(
      `[VencimientoAlertPublisher] VENCIDA: ${payload.codigo} sin renovación`
    );
    await alertBus.publish(alerta);
  }

  /** Registra un handler para recibir las alertas */
  static suscribir(handler: AlertHandler): void {
    alertBus.subscribe(handler);
  }
}
