/**
 * 🔗 SILEXAR PULSE - Integrations Service TIER 0
 *
 * Servicio de integraciones con plataformas externas:
 * WhatsApp, Slack, Email, sistemas de emisión
 *
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface NotificacionConfig {
  canal: 'whatsapp' | 'slack' | 'email' | 'push' | 'sms';
  destinatario: string;
  mensaje: string;
  adjuntos?: { nombre: string; url: string }[];
  metadata?: Record<string, string>;
}

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'audio' | 'document' | 'template';
  text?: string;
  mediaUrl?: string;
  templateName?: string;
  templateParams?: string[];
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: unknown[];
  attachments?: unknown[];
}

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: string; encoding: string }[];
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

export class IntegrationsService {
  
  // ─────────────────────────────────────────────────────────────
  // WHATSAPP
  // ─────────────────────────────────────────────────────────────

  async enviarWhatsApp(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string }> {
    // En producción: Integrar con Twilio WhatsApp API o Meta Business API
    logger.info('📱 WhatsApp:', message);
    
    // Simular envío
    return {
      success: true,
      messageId: `wa_${Date.now()}`
    };
  }

  async enviarAprobacionWhatsApp(
    telefono: string,
    cunaInfo: { codigo: string; nombre: string; anunciante: string },
    urlAprobacion: string
  ): Promise<boolean> {
    const mensaje = `🎵 *Nueva cuña para aprobar*\n\n` +
      `📋 Código: ${cunaInfo.codigo}\n` +
      `📝 Nombre: ${cunaInfo.nombre}\n` +
      `🏢 Anunciante: ${cunaInfo.anunciante}\n\n` +
      `✅ Aprobar o ❌ Rechazar:\n${urlAprobacion}\n\n` +
      `_Responde ✅ para aprobar o ❌ seguido del motivo para rechazar_`;

    const result = await this.enviarWhatsApp({
      to: telefono,
      type: 'text',
      text: mensaje
    });

    return result.success;
  }

  async procesarRespuestaWhatsApp(
    from: string,
    mensaje: string
  ): Promise<{ accion: 'aprobar' | 'rechazar' | 'desconocido'; motivo?: string }> {
    const mensajeLower = mensaje.toLowerCase().trim();
    
    if (mensajeLower === '✅' || mensajeLower.includes('aprobado') || mensajeLower.includes('aprobar')) {
      return { accion: 'aprobar' };
    }
    
    if (mensajeLower.startsWith('❌') || mensajeLower.includes('rechazado') || mensajeLower.includes('rechazar')) {
      const motivo = mensaje.replace(/❌/g, '').trim() || 'Sin motivo especificado';
      return { accion: 'rechazar', motivo };
    }
    
    return { accion: 'desconocido' };
  }

  // ─────────────────────────────────────────────────────────────
  // SLACK
  // ─────────────────────────────────────────────────────────────

  async enviarSlack(message: SlackMessage): Promise<{ success: boolean; ts?: string }> {
    // En producción: Usar Slack Web API
    logger.info('💬 Slack:', message);
    
    return {
      success: true,
      ts: Date.now().toString()
    };
  }

  async enviarAlertaSlack(
    channel: string,
    tipo: 'urgente' | 'info' | 'warning' | 'success',
    titulo: string,
    mensaje: string,
    acciones?: { texto: string; url: string }[]
  ): Promise<boolean> {
    const emojis = {
      urgente: '🚨',
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅'
    };
    
    const colors = {
      urgente: '#dc2626',
      info: '#3b82f6',
      warning: '#f59e0b',
      success: '#10b981'
    };

    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${emojis[tipo]} ${titulo}` }
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: mensaje }
      }
    ];

    if (acciones && acciones.length > 0) {
      blocks.push({
        type: 'actions',
        elements: acciones.map(a => ({
          type: 'button',
          text: { type: 'plain_text', text: a.texto },
          url: a.url
        }))
      } as never);
    }

    const result = await this.enviarSlack({
      channel,
      text: `${emojis[tipo]} ${titulo}`,
      blocks,
      attachments: [{ color: colors[tipo] }]
    });

    return result.success;
  }

  // ─────────────────────────────────────────────────────────────
  // EMAIL
  // ─────────────────────────────────────────────────────────────

  async enviarEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string }> {
    // En producción: Usar SendGrid, Resend, AWS SES, etc.
    logger.info('📧 Email:', message);
    
    return {
      success: true,
      messageId: `email_${Date.now()}`
    };
  }

  async enviarNotificacionAprobacion(
    email: string,
    cunaInfo: { codigo: string; nombre: string; anunciante: string; audioUrl?: string },
    urlAprobacion: string,
    urlRechazo: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { background: white; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #10b981; font-size: 24px; font-weight: bold; }
          .info { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #64748b; }
          .info-value { font-weight: 500; color: #0f172a; }
          .buttons { display: flex; gap: 10px; justify-content: center; margin-top: 30px; }
          .btn { padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
          .btn-approve { background: #10b981; color: white; }
          .btn-reject { background: #ef4444; color: white; }
          .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎵 Silexar Pulse</div>
            <h2>Nueva cuña para aprobar</h2>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span class="info-label">Código</span>
              <span class="info-value">${cunaInfo.codigo}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Nombre</span>
              <span class="info-value">${cunaInfo.nombre}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Anunciante</span>
              <span class="info-value">${cunaInfo.anunciante}</span>
            </div>
          </div>
          
          ${cunaInfo.audioUrl ? `
            <p style="text-align: center;">
              <a href="${cunaInfo.audioUrl}" style="color: #10b981;">🔊 Escuchar audio</a>
            </p>
          ` : ''}
          
          <div class="buttons">
            <a href="${urlAprobacion}" class="btn btn-approve">✅ Aprobar</a>
            <a href="${urlRechazo}" class="btn btn-reject">❌ Rechazar</a>
          </div>
          
          <div class="footer">
            <p>Silexar Pulse - Sistema de Gestión Publicitaria</p>
            <p>Este es un mensaje automático, no responda a este correo.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.enviarEmail({
      to: [email],
      subject: `[Aprobación Requerida] ${cunaInfo.codigo} - ${cunaInfo.nombre}`,
      html,
      text: `Nueva cuña para aprobar: ${cunaInfo.codigo} - ${cunaInfo.nombre} (${cunaInfo.anunciante}). Aprobar: ${urlAprobacion} | Rechazar: ${urlRechazo}`
    });

    return result.success;
  }

  // ─────────────────────────────────────────────────────────────
  // SISTEMAS DE EMISIÓN
  // ─────────────────────────────────────────────────────────────

  async enviarASistemaEmision(
    sistema: 'wideorbit' | 'sara' | 'dalet' | 'zetta',
    cunaInfo: {
      id: string;
      codigo: string;
      audioUrl: string;
      duracion: number;
      metadata: Record<string, string>;
    }
  ): Promise<{ success: boolean; referencia?: string }> {
    // En producción: Llamar a API específica de cada sistema
    logger.info(`📡 Enviando a ${sistema}:`, cunaInfo);
    
    // Simular integración
    return {
      success: true,
      referencia: `${sistema}_${Date.now()}`
    };
  }

  // ─────────────────────────────────────────────────────────────
  // NOTIFICACIÓN UNIFICADA
  // ─────────────────────────────────────────────────────────────

  async enviarNotificacion(config: NotificacionConfig): Promise<boolean> {
    switch (config.canal) {
      case 'whatsapp': {
        const waResult = await this.enviarWhatsApp({
          to: config.destinatario,
          type: 'text',
          text: config.mensaje
        });
        return waResult.success;
      }
        
      case 'slack': {
        const slackResult = await this.enviarSlack({
          channel: config.destinatario,
          text: config.mensaje
        });
        return slackResult.success;
      }
        
      case 'email': {
        const emailResult = await this.enviarEmail({
          to: [config.destinatario],
          subject: 'Notificación Silexar Pulse',
          html: `<p>${config.mensaje}</p>`,
          text: config.mensaje
        });
        return emailResult.success;
      }
        
      default:
        logger.info(`Canal ${config.canal} no implementado`);
        return false;
    }
  }
}

export const integrationsService = new IntegrationsService();
export default integrationsService;
