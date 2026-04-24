/**
 * 📧 SERVICE: Email Notification Service
 * 
 * Maneja el envío de notificaciones por email usando
 * templates HTML para diferentes tipos de notificaciones.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use server';

import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface EmailNotification {
    id: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html: string;
    text?: string;
    metadata?: Record<string, unknown>;
}

export interface EmailTemplateData {
    [key: string]: string | number | boolean | undefined;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATES HTML
// ═══════════════════════════════════════════════════════════════

const baseTemplate = (content: string, footer?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Silexar Pulse</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .content { background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
    .btn-outline { background: transparent; border: 2px solid #4f46e5; color: #4f46e5; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 8px; }
    .success { background: #d1fae5; border-left-color: #10b981; }
    .error { background: #fee2e2; border-left-color: #ef4444; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📺 Silexar Pulse</h1>
      <p>Sistema de Gestión de Contratos Publicitarios</p>
    </div>
    <div class="content">
      ${content}
    </div>
    ${footer ? `<div class="footer">${footer}</div>` : ''}
  </div>
</body>
</html>
`;

const templates = {
    /**
     * Template para contrato pendientes de firma
     */
    firmaRequerida: (data: {
        clienteNombre: string;
        contratoNumero: string;
        valor: string;
        fechaLimite: string;
        url: string;
    }) => ({
        subject: `✍️ Firma Requerida: Contrato ${data.contratoNumero}`,
        html: baseTemplate(`
      <h2 style="color: #1e293b; margin-top: 0;">Contrato Pendiente de Firma</h2>
      <p>Hola,</p>
      <p>El siguiente contrato requiere tu firma para proceder:</p>
      
      <table>
        <tr><th>Número:</th><td>${data.contratoNumero}</td></tr>
        <tr><th>Cliente:</th><td>${data.clienteNombre}</td></tr>
        <tr><th>Valor:</th><td><strong>${data.valor}</strong></td></tr>
        <tr><th>Fecha Límite:</th><td>${data.fechaLimite}</td></tr>
      </table>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.url}" class="btn">Firmar Contrato</a>
      </div>
      
      <p style="color: #64748b; font-size: 13px;">Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
      <p style="color: #64748b; font-size: 12px; word-break: break-all;">${data.url}</p>
    `)
    }),

    /**
     * Template para contrato aprobado
     */
    contratoAprobado: (data: {
        clienteNombre: string;
        contratoNumero: string;
        valor: string;
        url: string;
    }) => ({
        subject: `✅ Contrato Aprobado: ${data.contratoNumero}`,
        html: baseTemplate(`
      <div class="alert success">
        <strong>¡Felicidades!</strong> Tu contrato ha sido aprobado.
      </div>
      
      <h2 style="color: #1e293b;">Resumen del Contrato</h2>
      <table>
        <tr><th>Número:</th><td>${data.contratoNumero}</td></tr>
        <tr><th>Cliente:</th><td>${data.clienteNombre}</td></tr>
        <tr><th>Valor:</th><td><strong>${data.valor}</strong></td></tr>
      </table>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.url}" class="btn">Ver Contrato</a>
      </div>
    `)
    }),

    /**
     * Template para contrato rechazado
     */
    contratoRechazado: (data: {
        clienteNombre: string;
        contratoNumero: string;
        motivo: string;
        comentarios?: string;
        url: string;
    }) => ({
        subject: `❌ Contrato Rechazado: ${data.contratoNumero}`,
        html: baseTemplate(`
      <div class="alert error">
        <strong>Contrato Rechazado</strong>
      </div>
      
      <h2 style="color: #1e293b;">Información</h2>
      <table>
        <tr><th>Número:</th><td>${data.contratoNumero}</td></tr>
        <tr><th>Cliente:</th><td>${data.clienteNombre}</td></tr>
      </table>
      
      <h3 style="color: #ef4444;">Motivo:</h3>
      <p>${data.motivo}</p>
      
      ${data.comentarios ? `
        <h3 style="color: #475569;">Comentarios:</h3>
        <p>${data.comentarios}</p>
      ` : ''}
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.url}" class="btn btn-outline">Revisar y Modificar</a>
      </div>
    `)
    }),

    /**
     * Template para vencimientos próximo
     */
    vencimientosProximo: (data: {
        clienteNombre: string;
        contratoNumero: string;
        fechaVencimiento: string;
        diasRestantes: number;
        url: string;
    }) => ({
        subject: `📅 Vencimiento en ${data.diasRestantes} días: ${data.contratoNumero}`,
        html: baseTemplate(`
      <div class="alert" style="background: #fef3c7; border-left-color: #f59e0b;">
        <strong>⚠️ Recordatorio de Vencimiento</strong>
        <p style="margin: 8px 0 0;">Este contrato vence en <strong>${data.diasRestantes} días</strong>.</p>
      </div>
      
      <h2 style="color: #1e293b;">Datos del Contrato</h2>
      <table>
        <tr><th>Número:</th><td>${data.contratoNumero}</td></tr>
        <tr><th>Cliente:</th><td>${data.clienteNombre}</td></tr>
        <tr><th>Fecha Vencimiento:</th><td><strong style="color: #f59e0b;">${data.fechaVencimiento}</strong></td></tr>
      </table>
      
      <p>¿Deseas comenzar el proceso de renovación?</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.url}" class="btn">Renovar Contrato</a>
      </div>
    `)
    }),

    /**
     * Template para alerta de pago
     */
    alertaPago: (data: {
        clienteNombre: string;
        contratoNumero: string;
        monto: string;
        fechaVencimiento: string;
        estado: 'pendiente' | 'atrasado' | 'vencido';
        url: string;
    }) => ({
        subject: data.estado === 'atrasado'
            ? `💰 Pago Atrasado: ${data.contratoNumero}`
            : data.estado === 'vencido'
                ? `🚨 Pago Vencido: ${data.contratoNumero}`
                : `💰 Pago Pendiente: ${data.contratoNumero}`,
        html: baseTemplate(`
      <div class="alert ${data.estado === 'atrasado' ? 'error' : data.estado === 'vencido' ? 'error' : ''}">
        <strong>
          ${data.estado === 'pendiente' ? '📋 Pago Pendiente' :
                data.estado === 'atrasado' ? '🚨 Pago Atrasado' :
                    '🚨 Pago Vencido'}
        </strong>
      </div>
      
      <h2 style="color: #1e293b;">Información de Pago</h2>
      <table>
        <tr><th>Número:</th><td>${data.contratoNumero}</td></tr>
        <tr><th>Cliente:</th><td>${data.clienteNombre}</td></tr>
        <tr><th>Monto:</th><td><strong>${data.monto}</strong></td></tr>
        <tr><th>Fecha Vencimiento:</th><td>${data.fechaVencimiento}</td></tr>
        <tr><th>Estado:</th><td>
          <span style="color: ${data.estado === 'atrasado' || data.estado === 'vencido' ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
            ${data.estado === 'pendiente' ? 'PENDIENTE' : data.estado === 'atrasado' ? 'EN MORA' : 'VENCIDO'}
          </span>
        </td></tr>
      </table>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.url}" class="btn">Ver Detalles</a>
      </div>
    `)
    }),

    /**
     * Template genérico
     */
    generic: (data: {
        titulo: string;
        mensaje: string;
        botonTexto?: string;
        botonUrl?: string;
    }) => ({
        subject: `Silexar Pulse: ${data.titulo}`,
        html: baseTemplate(`
      <h2 style="color: #1e293b;">${data.titulo}</h2>
      <p>${data.mensaje}</p>
      ${data.botonTexto && data.botonUrl ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.botonUrl}" class="btn">${data.botonTexto}</a>
        </div>
      ` : ''}
    `)
    })
};

// ═══════════════════════════════════════════════════════════════
// EMAIL SERVICE
// ═══════════════════════════════════════════════════════════════

export const emailNotificationService = {
    /**
     * Enviar email de notificación
     */
    async send(notification: EmailNotification): Promise<EmailResult> {
        try {
            // En producción: usar Resend, SendGrid, AWS SES, etc.
            // const resend = new Resend(process.env.RESEND_API_KEY);
            // const result = await resend.emails.send({ ... });

            logger.info('Email notification sent', {
                to: notification.to,
                subject: notification.subject
            });

            return {
                success: true,
                messageId: `email_${Date.now()}`
            };
        } catch (error) {
            logger.error('Error sending email notification', {
                error: error instanceof Error ? error.message : 'Unknown',
                to: notification.to
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },

    /**
     * Enviar notificación de firma requerida
     */
    async enviarFirmaRequerida(params: {
        destinatarios: string[];
        clienteNombre: string;
        contratoNumero: string;
        valor: number;
        fechaLimite: string;
        contratoId: string;
    }): Promise<EmailResult> {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contratos/${params.contratoId}`;
        const template = templates.firmaRequerida({
            clienteNombre: params.clienteNombre,
            contratoNumero: params.contratoNumero,
            valor: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(params.valor),
            fechaLimite: params.fechaLimite,
            url
        });

        return this.send({
            id: `notif_firma_${Date.now()}`,
            to: params.destinatarios,
            subject: template.subject,
            html: template.html,
            metadata: { tipo: 'firma_requerida', contratoId: params.contratoId }
        });
    },

    /**
     * Enviar notificación de contrato aprobado
     */
    async enviarContratoAprobado(params: {
        destinatarios: string[];
        clienteNombre: string;
        contratoNumero: string;
        valor: number;
        contratoId: string;
    }): Promise<EmailResult> {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contratos/${params.contratoId}`;
        const template = templates.contratoAprobado({
            clienteNombre: params.clienteNombre,
            contratoNumero: params.contratoNumero,
            valor: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(params.valor),
            url
        });

        return this.send({
            id: `notif_aprobado_${Date.now()}`,
            to: params.destinatarios,
            subject: template.subject,
            html: template.html,
            metadata: { tipo: 'contrato_aprobado', contratoId: params.contratoId }
        });
    },

    /**
     * Enviar notificación de contrato rechazado
     */
    async enviarContratoRechazado(params: {
        destinatarios: string[];
        clienteNombre: string;
        contratoNumero: string;
        motivo: string;
        comentarios?: string;
        contratoId: string;
    }): Promise<EmailResult> {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contratos/${params.contratoId}`;
        const template = templates.contratoRechazado({
            clienteNombre: params.clienteNombre,
            contratoNumero: params.contratoNumero,
            motivo: params.motivo,
            comentarios: params.comentarios,
            url
        });

        return this.send({
            id: `notif_rechazado_${Date.now()}`,
            to: params.destinatarios,
            subject: template.subject,
            html: template.html,
            metadata: { tipo: 'contrato_rechazado', contratoId: params.contratoId }
        });
    },

    /**
     * Enviar recordatorio de vencimientos
     */
    async enviarRecordatorioVencimiento(params: {
        destinatarios: string[];
        clienteNombre: string;
        contratoNumero: string;
        fechaVencimiento: string;
        diasRestantes: number;
        contratoId: string;
    }): Promise<EmailResult> {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contratos/${params.contratoId}`;
        const template = templates.vencimientosProximo({
            clienteNombre: params.clienteNombre,
            contratoNumero: params.contratoNumero,
            fechaVencimiento: params.fechaVencimiento,
            diasRestantes: params.diasRestantes,
            url
        });

        return this.send({
            id: `notif_vencimientos_${Date.now()}`,
            to: params.destinatarios,
            subject: template.subject,
            html: template.html,
            metadata: { tipo: 'vencimientos_proximo', contratoId: params.contratoId }
        });
    },

    /**
     * Enviar alerta de pago
     */
    async enviarAlertaPago(params: {
        destinatarios: string[];
        clienteNombre: string;
        contratoNumero: string;
        monto: number;
        fechaVencimiento: string;
        estado: 'pendiente' | 'atrasado' | 'vencido';
        contratoId: string;
    }): Promise<EmailResult> {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contratos/${params.contratoId}`;
        const template = templates.alertaPago({
            clienteNombre: params.clienteNombre,
            contratoNumero: params.contratoNumero,
            monto: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(params.monto),
            fechaVencimiento: params.fechaVencimiento,
            estado: params.estado,
            url
        });

        return this.send({
            id: `notif_pago_${Date.now()}`,
            to: params.destinatarios,
            subject: template.subject,
            html: template.html,
            metadata: { tipo: 'alerta_pago', contratoId: params.contratoId }
        });
    },

    /**
     * Enviar email genérico
     */
    async enviarGenerico(params: {
        destinatarios: string[];
        titulo: string;
        mensaje: string;
        botonTexto?: string;
        botonUrl?: string;
    }): Promise<EmailResult> {
        const template = templates.generic({
            titulo: params.titulo,
            mensaje: params.mensaje,
            botonTexto: params.botonTexto,
            botonUrl: params.botonUrl
        });

        return this.send({
            id: `notif_generic_${Date.now()}`,
            to: params.destinatarios,
            subject: template.subject,
            html: template.html,
            metadata: { tipo: 'generico' }
        });
    }
};
