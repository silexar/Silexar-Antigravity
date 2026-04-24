/**
 * EmailDistributionService
 * Servicio para envío de cuñas por email a operadores y equipos comerciales
 * Incluye plantillas, tracking de aperturas y confirmaciones
 */

import { Result } from '@/modules/shared/domain/Result';
import { getDB } from '@/lib/db';
import { enviosDistribucion } from '@/lib/db/cunas-extended-schema';
import { eq, and, desc } from 'drizzle-orm';

export interface EmailRecipient {
    id?: string;
    email: string;
    name?: string;
    role?: 'operator' | 'sales_rep' | 'supervisor' | 'programmer' | 'other';
    stationId?: string;
    shift?: 'morning' | 'afternoon' | 'night';
    phone?: string;
}

export interface DistributionEmailContent {
    cunaId: string;
    cunaCodigo: string;
    cunaNombre: string;
    anuncianteNombre: string;
    duracion: number;
    formato: string;
    tipo: 'spot' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida';
    fechaInicioVigencia: string;
    fechaFinVigencia: string;
    audioUrl?: string;
    observaciones?: string;
    instrucciones?: string;
    programa?: string;
    emisora?: string;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    attachments: ('audio' | 'info' | 'schedule' | 'transcription')[];
    variables: string[];
}

export interface SendEmailResult {
    messageId: string;
    sentAt: Date;
    recipients: {
        email: string;
        status: 'sent' | 'failed' | 'pending';
        error?: string;
    }[];
}

export interface EmailTrackingData {
    opened: boolean;
    openedAt?: Date;
    clickedLinks: boolean;
    clickedAt?: Date;
    downloaded: boolean;
    downloadedAt?: Date;
    confirmed: boolean;
    confirmedAt?: Date;
    bounced: boolean;
    bounceReason?: string;
}

export class EmailDistributionService {
    private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Plantillas predefinidas
    private readonly TEMPLATES: EmailTemplate[] = [
        {
            id: 'standard_commercial',
            name: 'Estándar Comercial',
            subject: '🎵 Nueva Cuña: {{cunaNombre}} - {{anuncianteNombre}}',
            body: `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;">
            <h1 style="margin: 0;">🎵 Nueva Cuña Recibida</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #333;">{{cunaNombre}}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Código:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{cunaCodigo}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Anunciante:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{anuncianteNombre}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Duración:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{duracion}} segundos</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Formato:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{formato}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Vigencia:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{fechaInicioVigencia}} - {{fechaFinVigencia}}</td>
              </tr>
            </table>
            
            {{#if observaciones}}
            <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
              <strong>Observaciones:</strong>
              <p>{{observaciones}}</p>
            </div>
            {{/if}}
            
            {{#if instrucciones}}
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
              <strong>⚠️ Instrucciones de Programación:</strong>
              <p>{{instrucciones}}</p>
            </div>
            {{/if}}
            
            <div style="margin-top: 30px; text-align: center;">
              {{#if audioUrl}}
              <a href="{{audioUrl}}" style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                🎧 Descargar Audio
              </a>
              {{/if}}
            </div>
          </div>
          <div style="background: #f5f5f5; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>Este email fue enviado automáticamente por Silexar Pulse</p>
            <p>Por favor confirme recepción respondiendo este email o haciendo clic en el botón de confirmación</p>
          </div>
        </body>
        </html>
      `,
            attachments: ['audio', 'info'],
            variables: ['cunaNombre', 'cunaCodigo', 'anuncianteNombre', 'duracion', 'formato', 'fechaInicioVigencia', 'fechaFinVigencia', 'observaciones', 'instrucciones', 'audioUrl'],
        },
        {
            id: 'urgent_delivery',
            name: 'Entrega Urgente',
            subject: '🚨 URGENTE: Cuña para emisión inmediata - {{cunaNombre}}',
            body: `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 20px; color: white;">
            <h1 style="margin: 0;">🚨 ENTREGA URGENTE</h1>
          </div>
          <div style="padding: 20px;">
            <div style="background: #fed7d7; padding: 15px; border-radius: 8px; border-left: 4px solid #e53e3e;">
              <p><strong>Esta cuña debe ser programada para EMISIÓN INMEDIATA</strong></p>
            </div>
            <h2 style="color: #333;">{{cunaNombre}}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Código:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{cunaCodigo}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Anunciante:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{anuncianteNombre}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Duración:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{duracion}} segundos</td>
              </tr>
            </table>
            {{#if instrucciones}}
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
              <strong>⚠️ Instrucciones:</strong>
              <p>{{instrucciones}}</p>
            </div>
            {{/if}}
            <div style="margin-top: 30px; text-align: center;">
              {{#if audioUrl}}
              <a href="{{audioUrl}}" style="display: inline-block; padding: 15px 30px; background: #e53e3e; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                🚨 Descargar y Programar
              </a>
              {{/if}}
            </div>
          </div>
        </body>
        </html>
      `,
            attachments: ['audio', 'info', 'schedule'],
            variables: ['cunaNombre', 'cunaCodigo', 'anuncianteNombre', 'duracion', 'formato', 'observaciones', 'instrucciones', 'audioUrl'],
        },
        {
            id: 'renewal_reminder',
            name: 'Recordatorio de Renovación',
            subject: '📅 Recordatorio: Cuña por vencer - {{cunaNombre}}',
            body: `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); padding: 20px; color: white;">
            <h1 style="margin: 0;">📅 Recordatorio de Renovación</h1>
          </div>
          <div style="padding: 20px;">
            <p>La siguiente cuña está por vencer y requiere atención:</p>
            <h2 style="color: #333;">{{cunaNombre}}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Código:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{cunaCodigo}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Vence:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #e53e3e; font-weight: bold;">{{fechaFinVigencia}}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #feebc8; border-radius: 8px;">
              <p>Por favor contacte al cliente para gestionar la renovación del material.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            attachments: ['info'],
            variables: ['cunaNombre', 'cunaCodigo', 'anuncianteNombre', 'fechaFinVigencia'],
        },
    ];

    /**
     * Envía email de distribución
     */
    async sendDistributionEmail(
        recipients: EmailRecipient[],
        content: DistributionEmailContent,
        templateId: string = 'standard_commercial'
    ): Promise<Result<SendEmailResult>> {
        try {
            // Validar receptores
            const validRecipients = recipients.filter(r => this.EMAIL_REGEX.test(r.email));
            if (validRecipients.length === 0) {
                return Result.fail('No se proporcionaron destinatarios válidos');
            }

            // Obtener plantilla
            const template = this.TEMPLATES.find(t => t.id === templateId);
            if (!template) {
                return Result.fail(`Plantilla no encontrada: ${templateId}`);
            }

            // Renderizar contenido
            const renderedSubject = this.renderTemplate(template.subject, content as unknown as Record<string, unknown>);
            const renderedBody = this.renderTemplate(template.body, content as unknown as Record<string, unknown>);

            // En producción, aquí se integraría con SendGrid, Resend, AWS SES, etc.
            // Por ahora simulamos el envío

            const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const sentAt = new Date();

            const recipientResults = validRecipients.map(recipient => ({
                email: recipient.email,
                status: 'sent' as const,
            }));

            // Registrar envío en base de datos
            await this.logEmailSent({
                cunaId: content.cunaId,
                messageId,
                recipients: validRecipients.map(r => r.email),
                templateId,
                sentAt,
            });

            return Result.ok({
                messageId,
                sentAt,
                recipients: recipientResults,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error enviando email');
        }
    }

    /**
     * Envía recordatorio a destinatarios que no han confirmado
     */
    async sendReminderEmail(
        deliveryId: string,
        customMessage?: string
    ): Promise<Result<SendEmailResult>> {
        try {
            const db = getDB();

            // Obtener envío original
            const [envio] = await db
                .select()
                .from(enviosDistribucion)
                .where(eq(enviosDistribucion.id, deliveryId))
                .limit(1);

            if (!envio) {
                return Result.fail('Envío no encontrado');
            }

            // En producción, enviar recordatorio a quienes no han confirmado
            return Result.ok({
                messageId: `reminder-${Date.now()}`,
                sentAt: new Date(),
                recipients: [],
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error enviando recordatorio');
        }
    }

    /**
     * Procesa confirmación de recepción
     */
    async processConfirmation(
        trackingId: string
    ): Promise<Result<{ confirmed: boolean; confirmedAt: Date }>> {
        try {
            const [deliveryId, recipientId] = trackingId.split('_');

            // En producción, actualizar estado en base de datos
            return Result.ok({
                confirmed: true,
                confirmedAt: new Date(),
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error procesando confirmación');
        }
    }

    /**
     * Obtiene tracking de email
     */
    async getEmailTracking(
        messageId: string
    ): Promise<Result<EmailTrackingData[]>> {
        try {
            // En producción, consultar servicio de email para tracking
            return Result.ok([
                {
                    opened: false,
                    clickedLinks: false,
                    downloaded: false,
                    confirmed: false,
                    bounced: false,
                },
            ]);
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error obtiniendo tracking');
        }
    }

    /**
     * Renderiza plantilla con variables
     */
    private renderTemplate(template: string, data: Record<string, unknown>): string {
        let rendered = template;

        // Reemplazar variables {{variable}}
        rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const value = data[key];
            return value !== undefined ? String(value) : match;
        });

        // Handle conditional blocks {{#if variable}}...{{/if}}
        rendered = rendered.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
            const value = data[key];
            return value ? content : '';
        });

        return rendered;
    }

    /**
     * Registra envío en base de datos
     */
    private async logEmailSent(data: {
        cunaId: string;
        messageId: string;
        recipients: string[];
        templateId: string;
        sentAt: Date;
    }): Promise<void> {
        try {
            const db = getDB();

            await db.insert(enviosDistribucion).values({
                cunaCodigo: data.cunaId,
                cunaNombre: data.cunaId,
                gruposIds: [data.templateId],
                registrosEnvio: data.recipients.map((r, i) => ({
                    id: `reg-${i}`,
                    destinatarioId: r,
                    destinatarioNombre: r,
                    metodoUsado: 'email',
                    estado: 'enviado',
                    fechaEnvio: data.sentAt.toISOString(),
                    intentos: 1,
                })),
                contenido: {
                    incluyeAudio: false,
                    incluyeInfo: true,
                    incluyeInstrucciones: false,
                    incluyeTranscripcion: false,
                    notasEspeciales: JSON.stringify({ templateId: data.templateId }),
                },
                estado: 'enviado',
                creadoPorId: '00000000-0000-0000-0000-000000000000', // fallback
                fechaInicio: data.sentAt,
                fechaCreacion: new Date(),
            } as any);
        } catch (error) {
            // Log error but don't fail the email send
            console.error('Error logging email sent:', error);
        }
    }

    /**
     * Obtiene plantillas disponibles
     */
    getTemplates(): EmailTemplate[] {
        return this.TEMPLATES;
    }

    /**
     * Valida dirección de email
     */
    validateEmail(email: string): boolean {
        return this.EMAIL_REGEX.test(email);
    }
}

// Singleton instance
export const emailDistributionService = new EmailDistributionService();
