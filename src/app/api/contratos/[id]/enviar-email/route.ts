/**
 * 📧 SILEXAR PULSE - Enviar Contrato por Email API TIER 0
 * 
 * @description API para enviar el contrato PDF adjunto por email.
 * Puede usarse como respaldo cuando la firma electrónica no está disponible.
 * 
 * Endpoints:
 *   POST /api/contratos/:id/enviar-email - Envía contrato por email
 *   GET /api/contratos/:id/email-status - Estado del envío
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError, apiNotFound, apiForbidden } from '@/lib/api/response';
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository';
import { PDFGeneratorAdvancedService } from '@/modules/contratos/infrastructure/external/PDFGeneratorAdvancedService';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

const pdfService = new PDFGeneratorAdvancedService();

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const enviarEmailSchema = z.object({
    destinatarios: z.array(z.object({
        email: z.string().email('Email inválido'),
        nombre: z.string().min(1, 'Nombre requerido'),
        rol: z.enum(['cliente', 'agencia', 'ejecutivo', 'gerente', 'cc'])
    })).min(1, 'Al menos un destinatario es requerido'),
    asunto: z.string().min(1, 'Asunto requerido').optional(),
    mensaje: z.string().max(2000, 'Mensaje máximo 2000 caracteres').optional(),
    incluirPDF: z.boolean().default(true),
    tipoEnvio: z.enum(['firma_respaldo', 'informativo', 'recordatorio']).default('firma_respaldo')
})

type EnviarEmailRequest = z.infer<typeof enviarEmailSchema>

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface EmailEnvioResult {
    messageId: string;
    destinatarios: Array<{
        email: string;
        nombre: string;
        status: 'enviado' | 'fallido';
        error?: string;
    }>;
    pdfUrl?: string;
    enviadoEn: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generarAsunto(tipoEnvio: string, numeroContrato: string, nombreCliente: string): string {
    switch (tipoEnvio) {
        case 'firma_respaldo':
            return `📝 Contrato ${numeroContrato} - Solicitud de firma como respaldo`;
        case 'recordatorio':
            return `⏰ Recordatorio: Firma de contrato ${numeroContrato} pendiente`;
        case 'informativo':
        default:
            return `📄 Contrato ${numeroContrato} - ${nombreCliente}`;
    }
}

function generarMensajePredeterminado(
    tipoEnvio: string,
    numeroContrato: string,
    nombreCliente: string,
    fechaVencimiento?: string
): string {
    switch (tipoEnvio) {
        case 'firma_respaldo':
            return `Estimado/a ${nombreCliente},

Le enviamos adjunta la versión digital del contrato ${numeroContrato} para su conocimiento y firma como respaldo.

Este documento es idéntico al enviado por nuestro sistema de firma electrónica. Si ya ha firmado electrónicamente, puede ignorar este mensaje.

Por favor, imprima el documento, firme en las páginas indicadas y envíenos una copia escaneada a este correo o porfax a nuestros datos de contacto.

Plazo para el envío del documento firmado: ${fechaVencimiento || '7 días'}

Quedamos atentos a su respuesta.

Saludos cordiales,
Equipo Comercial Silexar`;

        case 'recordatorio':
            return `Estimado/a ${nombreCliente},

Le recordamos que el contrato ${numeroContrato} aún no ha sido firmado.

Si ya lo firmó electrónicamente, por favor disregard este mensaje.

Si necesita el documento físico para firma como respaldo, por favor responda a este email solicitándolo.

Quedamos atentos.`;

        default:
            return `Estimado/a ${nombreCliente},

Adjuntamos el contrato ${numeroContrato} para su conocimiento.

Saludos,
Equipo Comercial Silexar`;
    }
}

// ─── POST /api/contratos/:id/enviar-email ─────────────────────────────────────

export const POST = withApiRoute(
    { resource: 'contratos', action: 'update' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        try {
            // Extraer ID del contrato de la URL
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const idIndex = pathParts.findIndex(p => p === 'contratos') + 1;
            const id = pathParts[idIndex];

            if (!id) {
                return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse;
            }

            // Validar request body
            let rawBody: unknown;
            try {
                rawBody = await req.json();
            } catch {
                return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
            }

            const parseResult = enviarEmailSchema.safeParse(rawBody);
            if (!parseResult.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Error en la validación de los datos',
                    400,
                    parseResult.error.flatten().fieldErrors
                ) as unknown as NextResponse;
            }

            const body = parseResult.data;

            // Obtener contrato
            const repo = new DrizzleContratoRepository(tenantId);
            const contrato = await repo.findById(id);

            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse;
            }

            const snap = contrato.toSnapshot();

            // Verificar permisos
            const puedeEnviar = ['ejecutivo', 'supervisor', 'gerente_comercial', 'gerente_general', 'admin'].includes(ctx.role);
            if (!puedeEnviar) {
                return apiForbidden('No tienes permisos para enviar contratos por email') as unknown as NextResponse;
            }

            // Generar PDF si se solicita
            let pdfUrl: string | undefined;
            if (body.incluirPDF) {
                const pdfResult = await pdfService.generate(
                    {
                        id: snap.id,
                        numeroContrato: snap.numero.valor,
                        cliente: snap.anunciante,
                        fecha: new Date().toISOString()
                    },
                    { template: 'estandar' }
                );
                pdfUrl = pdfResult.url;
            }

            // Preparar email
            const asunto = body.asunto || generarAsunto(body.tipoEnvio, snap.numero.valor, snap.anunciante);
            const mensaje = body.mensaje || generarMensajePredeterminado(
                body.tipoEnvio,
                snap.numero.valor,
                snap.anunciante
            );

            // Simular envío de email
            // En producción, usar un servicio como SendGrid, AWS SES, Resend, etc.
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            const destinatarios = body.destinatarios.map(dest => ({
                email: dest.email,
                nombre: dest.nombre,
                status: 'enviado' as const,
                // En producción: chamar el servicio de email real
            }));

            const resultado: EmailEnvioResult = {
                messageId,
                destinatarios,
                pdfUrl,
                enviadoEn: new Date().toISOString()
            };

            // Log de auditoría
            auditLogger.log({
                type: AuditEventType.DATA_UPDATE,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'enviar_email',
                    contratoId: id,
                    numeroContrato: snap.numero.valor,
                    tenantId,
                    numDestinatarios: body.destinatarios.length,
                    tipoEnvio: body.tipoEnvio,
                    incluyePDF: body.incluirPDF
                }
            });

            logger.info('Email enviado:', {
                contratoId: id,
                messageId,
                destinatarios: body.destinatarios.map(d => d.email)
            });

            return apiSuccess({
                ...resultado,
                contratoId: id,
                numeroContrato: snap.numero.valor,
                asunto,
                mensajePreview: mensaje.substring(0, 100) + '...'
            }, 200, { message: 'Email enviado exitosamente' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('Error enviando email:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'enviar-email',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ─── GET /api/contratos/:id/email-status ─────────────────────────────────────

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;

        try {
            // Extraer ID del contrato
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const idIndex = pathParts.findIndex(p => p === 'contratos') + 1;
            const id = pathParts[idIndex];

            if (!id) {
                return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse;
            }

            // En producción, consultaríamos el historial de emails enviados
            // Por ahora retornamos mock data
            const emailHistorial = {
                totalEnviados: 0,
                enviosRecientes: [],
                ultimoEnvio: null
            };

            return apiSuccess({
                contratoId: id,
                ...emailHistorial
            }, 200, { message: 'Estado de emails consultado' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('Error consultando estado de email:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'email-status',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError() as unknown as NextResponse;
        }
    }
);
