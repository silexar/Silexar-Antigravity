/**
 * WhatsAppDistributionService
 * Servicio para envío de cuñas por WhatsApp a operadores
 * Incluye templates de mensaje, medios y tracking
 */

import { Result } from '@/modules/shared/domain/Result';
import { getDB } from '@/lib/db';
import { enviosDistribucion } from '@/lib/db/cunas-extended-schema';

export interface WhatsAppRecipient {
    phone: string; // Formato: +56912345678
    name?: string;
    role?: 'operator' | 'sales_rep' | 'supervisor';
    stationId?: string;
    shift?: 'morning' | 'afternoon' | 'night';
}

export interface WhatsAppContent {
    cunaId: string;
    cunaCodigo: string;
    cunaNombre: string;
    anuncianteNombre: string;
    duracion: number;
    tipo: 'spot' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida';
    fechaInicioVigencia: string;
    fechaFinVigencia: string;
    instrucciones?: string;
    programa?: string;
    emisora?: string;
}

export interface WhatsAppMessage {
    to: string;
    templateName: string;
    templateData: Record<string, string>;
    mediaUrl?: string;
    caption?: string;
}

export interface WhatsAppSendResult {
    messageId: string;
    sentAt: Date;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    recipients: {
        phone: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        error?: string;
    }[];
}

export interface WhatsAppTemplate {
    id: string;
    name: string;
    text: string;
    useAudio: boolean;
    variables: string[];
}

export class WhatsAppDistributionService {
    // Formato de teléfono válido
    private readonly PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

    // Templates predefinidos
    private readonly TEMPLATES: WhatsAppTemplate[] = [
        {
            id: 'standard_delivery',
            name: 'Entrega Estándar',
            text: `🎵 *Nueva Cuña Recibida*

📢 *{{cunaNombre}}*
━━━━━━━━━━━━━━━
🏢 Cliente: {{anuncianteNombre}}
⏱️ Duración: {{duracion}}s
📅 Vigencia: {{fechaInicioVigencia}} - {{fechaFinVigencia}}
━━━━━━━━━━━━━━━
{{#if instrucciones}}
⚠️ *Instrucciones:*
{{instrucciones}}
━━━━━━━━━━━━━━━
{{/if}}
{{#if programa}}
📻 Programa: {{programa}}
{{#if emisora}}📡 Emisora: {{emisora}}{{/if}}
━━━━━━━━━━━━━━━
{{/if}}
🎧 Audio: {{mediaUrl}}

_Enviado desde Silexar Pulse_`,
            useAudio: true,
            variables: ['cunaNombre', 'anuncianteNombre', 'duracion', 'fechaInicioVigencia', 'fechaFinVigencia', 'instrucciones', 'programa', 'emisora', 'mediaUrl'],
        },
        {
            id: 'urgent_delivery',
            name: 'Entrega Urgente',
            text: `🚨 *URGENTE - EMISIÓN INMEDIATA*

📢 *{{cunaNombre}}*
━━━━━━━━━━━━━━━
🏢 Cliente: {{anuncianteNombre}}
⏱️ Duración: {{duracion}}s
━━━━━━━━━━━━━━━
⚠️ *INSTRUCCIONES:*
{{instrucciones}}

🎧 Audio: {{mediaUrl}}

_Requiere confirmación inmediata_`,
            useAudio: true,
            variables: ['cunaNombre', 'anuncianteNombre', 'duracion', 'instrucciones', 'mediaUrl'],
        },
        {
            id: 'confirmation_request',
            name: 'Solicitud de Confirmación',
            text: `📋 *Confirmación de Recepción*

Hola {{recipientName}},

Se ha enviado una nueva cuña para ti:

📢 *{{cunaNombre}}*
🏢 {{anuncianteNombre}}
⏱️ {{duracion}} segundos

Por favor confirma recepción respondiendo a este mensaje.

_Respuesta automática Silexar Pulse_`,
            useAudio: false,
            variables: ['recipientName', 'cunaNombre', 'anuncianteNombre', 'duracion'],
        },
        {
            id: 'renewal_reminder',
            name: 'Recordatorio Renovación',
            text: `📅 *Recordatorio de Renovación*

La siguiente cuña está por vencer:

📢 *{{cunaNombre}}*
🏢 {{anuncianteNombre}}
⚠️ Vence: {{fechaFinVigencia}}

Por favor contactar al cliente para gestionar renovación.

_Equipo Comercial_`,
            useAudio: false,
            variables: ['cunaNombre', 'anuncianteNombre', 'fechaFinVigencia'],
        },
        {
            id: 'simple_reminder',
            name: 'Mensaje Simple',
            text: `📢 *{{cunaNombre}}* - {{anuncianteNombre}}

Duración: {{duracion}}s
Vigencia: {{fechaInicioVigencia}} - {{fechaFinVigencia}}

🎧 {{mediaUrl}}`,
            useAudio: true,
            variables: ['cunaNombre', 'anuncianteNombre', 'duracion', 'fechaInicioVigencia', 'fechaFinVigencia', 'mediaUrl'],
        },
    ];

    /**
     * Envía mensaje de WhatsApp
     */
    async sendWhatsAppMessage(
        recipients: WhatsAppRecipient[],
        content: WhatsAppContent,
        templateId: string = 'standard_delivery'
    ): Promise<Result<WhatsAppSendResult>> {
        try {
            // Validar receptores
            const validRecipients = recipients.filter(r => this.PHONE_REGEX.test(r.phone.replace(/\s/g, '')));
            if (validRecipients.length === 0) {
                return Result.fail('No se proporcionaron destinatarios válidos con teléfonos');
            }

            // Obtener plantilla
            const template = this.TEMPLATES.find(t => t.id === templateId);
            if (!template) {
                return Result.fail(`Plantilla no encontrada: ${templateId}`);
            }

            // Renderizar mensaje
            const renderedText = this.renderTemplate(template.text, content as unknown as Record<string, unknown>);

            // En producción, aquí se integraría con WhatsApp Business API
            // Por ahora simulamos el envío

            const messageId = `wa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const sentAt = new Date();

            const recipientResults = validRecipients.map(recipient => ({
                phone: recipient.phone,
                status: 'sent' as const,
            }));

            // Registrar envío
            await this.logWhatsAppSent({
                cunaId: content.cunaId,
                messageId,
                recipients: validRecipients.map(r => r.phone),
                templateId,
                sentAt,
            });

            return Result.ok({
                messageId,
                sentAt,
                status: 'sent',
                recipients: recipientResults,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error enviando WhatsApp');
        }
    }

    /**
     * Envía audio directamente (sin template)
     */
    async sendAudioDirectly(
        recipients: WhatsAppRecipient[],
        audioUrl: string,
        caption: string
    ): Promise<Result<WhatsAppSendResult>> {
        try {
            const validRecipients = recipients.filter(r => this.PHONE_REGEX.test(r.phone.replace(/\s/g, '')));
            if (validRecipients.length === 0) {
                return Result.fail('No se proporcionaron destinatarios válidos');
            }

            const messageId = `wa-audio-${Date.now()}`;
            const sentAt = new Date();

            const recipientResults = validRecipients.map(recipient => ({
                phone: recipient.phone,
                status: 'sent' as const,
            }));

            return Result.ok({
                messageId,
                sentAt,
                status: 'sent',
                recipients: recipientResults,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error enviando audio');
        }
    }

    /**
     * Envía recordatorio a quienes no han confirmado
     */
    async sendReminder(
        deliveryId: string,
        message: string
    ): Promise<Result<WhatsAppSendResult>> {
        try {
            const messageId = `wa-reminder-${Date.now()}`;

            return Result.ok({
                messageId,
                sentAt: new Date(),
                status: 'sent',
                recipients: [],
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error enviando recordatorio');
        }
    }

    /**
     * Procesa webhook de entrega de WhatsApp
     */
    async processDeliveryWebhook(
        webhookData: {
            messageId: string;
            status: 'delivered' | 'read' | 'failed';
            timestamp: string;
            error?: string;
        }
    ): Promise<Result<void>> {
        try {
            // En producción, actualizar estado del mensaje
            console.log('WhatsApp delivery webhook:', webhookData);
            return Result.ok(undefined);
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error procesando webhook');
        }
    }

    /**
     * Renderiza template con variables
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
    private async logWhatsAppSent(data: {
        cunaId: string;
        messageId: string;
        recipients: string[];
        templateId: string;
        sentAt: Date;
    }): Promise<void> {
        try {
            const db = getDB();

            await db.insert(enviosDistribucion).values({
                tenantId: 'default-tenant',
                cunaId: data.cunaId,
                cunaCodigo: data.cunaId,
                cunaNombre: data.cunaId,
                gruposIds: [data.templateId],
                registrosEnvio: data.recipients.map((phone, idx) => ({
                    id: `reg-${Date.now()}-${idx}`,
                    destinatarioId: `wa-${idx}`,
                    destinatarioNombre: phone,
                    metodoUsado: 'whatsapp',
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
                totalDestinatarios: data.recipients.length,
                enviados: data.recipients.length,
                creadoPorId: 'system',
                fechaInicio: data.sentAt,
            });
        } catch (error) {
            console.error('Error logging WhatsApp sent:', error);
        }
    }

    /**
     * Obtiene templates disponibles
     */
    getTemplates(): WhatsAppTemplate[] {
        return this.TEMPLATES;
    }

    /**
     * Formatea número de teléfono
     */
    formatPhoneNumber(phone: string): string {
        // Remover espacios y caracteres especiales
        let formatted = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');

        // Agregar código de país si no lo tiene
        if (!formatted.startsWith('+')) {
            if (formatted.startsWith('9')) {
                // Número chileno sin código
                formatted = '+56' + formatted;
            } else {
                formatted = '+' + formatted;
            }
        }

        return formatted;
    }

    /**
     * Valida número de teléfono
     */
    validatePhoneNumber(phone: string): boolean {
        const formatted = this.formatPhoneNumber(phone);
        return this.PHONE_REGEX.test(formatted);
    }
}

// Singleton instance
export const whatsAppDistributionService = new WhatsAppDistributionService();
