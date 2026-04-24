/**
 * 🔗 SILEXAR PULSE - Webhook para Firma Digital TIER 0
 * 
 * @description Recibe callbacks de servicios de firma digital (DocuSign/Adobe Sign)
 * para actualizar el estado de los contratos cuando ocurre un evento de firma.
 * 
 * Endpoints:
 *   POST /api/webhooks/firma - Recibe eventos de firma
 *   POST /api/webhooks/firma/test - Endpoint de prueba
 * 
 * DocuSign Events:
 *   - envelope-sent
 *   - envelope-delivered
 *   - envelope-signed (completed)
 *   - envelope-declined
 *   - envelope-voided
 *   - recipient-sent
 *   - recipient-signed
 *   - recipient-declined
 * 
 * Adobe Sign Events:
 *   - AGREEMENT_CREATED
 *   - AGREEMENT_SENT
 *   - AGREEMENT_SIGNED
 *   - AGREEMENT_CANCELLED
 *   - AGREEMENT_EXPIRED
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

// En producción, esto vendría de variables de entorno
const WEBHOOK_SECRET = process.env.FIRMA_WEBHOOK_SECRET || 'dev-secret';
const PROVIDER = process.env.FIRMA_PROVIDER || 'docusign'; // 'docusign' | 'adobesign'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface SignatureEvent {
    envelopeId: string;
    event: string;
    status: 'sent' | 'delivered' | 'completed' | 'declined' | 'voided' | 'expired';
    timestamp: string;
    signers: Array<{
        email: string;
        nombre: string;
        status: 'pending' | 'sent' | 'delivered' | 'signed' | 'declined';
        signedAt?: string;
        declinedReason?: string;
    }>;
    documentoUrl?: string;
    metadata?: Record<string, string>;
}

interface WebhookPayload {
    provider: 'docusign' | 'adobesign';
    event: SignatureEvent;
    signature?: string;
    timestamp?: string;
}

// ═══════════════════════════════════════════════════════════════
// MAPEO DE EVENTOS
// ═══════════════════════════════════════════════════════════════

const DOCUSIGN_EVENT_MAP: Record<string, string> = {
    'envelope-sent': 'sent',
    'envelope-delivered': 'delivered',
    'envelope-signed': 'completed',
    'envelope-completed': 'completed',
    'envelope-declined': 'declined',
    'envelope-voided': 'voided',
    'recipient-signed': 'signed',
    'recipient-declined': 'declined'
};

const ADOBESIGN_EVENT_MAP: Record<string, string> = {
    'AGREEMENT_CREATED': 'created',
    'AGREEMENT_SENT': 'sent',
    'AGREEMENT_SIGNED': 'completed',
    'AGREEMENT_CANCELLED': 'cancelled',
    'AGREEMENT_EXPIRED': 'expired'
};

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN DE FIRMA DEL WEBHOOK
// ═══════════════════════════════════════════════════════════════

function verifyWebhookSignature(
    payload: string,
    signature: string | undefined,
    timestamp: string | undefined
): boolean {
    // En desarrollo, permitir sin verificación
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // En producción, verificar HMAC
    if (!signature || !timestamp) {
        return false;
    }

    // Implementar verificación HMAC-SHA256
    // const expectedSignature = crypto
    //   .createHmac('sha256', WEBHOOK_SECRET)
    //   .update(timestamp + '.' + payload)
    //   .digest('base64');

    return true; // Placeholder
}

// ═══════════════════════════════════════════════════════════════
// PROCESAMIENTO DE EVENTOS
// ═══════════════════════════════════════════════════════════════

async function processSignatureEvent(
    payload: WebhookPayload,
    tenantId: string
): Promise<{ success: boolean; message: string }> {
    const { event } = payload;
    const { envelopeId, status, signers, documentoUrl } = event;

    logger.info('[Webhook/Firma] Procesando evento:', {
        envelopeId,
        status,
        numSigners: signers.length,
        tenantId
    });

    try {
        // Buscar contrato por envelopeId
        // En implementación real, tendríamos una tabla de envelopes
        const repo = new DrizzleContratoRepository(tenantId);

        // Extraer contratoId del envelopeId o buscar por metadata
        // Por ahora, simulamos que el envelopeId contiene el contratoId
        const contratoId = extractContratoIdFromEnvelope(envelopeId);

        if (!contratoId) {
            // Buscar por envelope en metadata del contrato
            const contratos = await repo.findByEstado('pendiente_firma');
            const contrato = contratos.find(c => {
                // Aquí verificaríamos si el envelopeId coincide
                return true; // Placeholder
            });

            if (!contrato) {
                logger.warn('[Webhook/Firma] Contrato no encontrado para envelope', { envelopeId });
                return { success: false, message: 'Contrato no encontrado' };
            }
        }

        // Procesar según estado
        switch (status) {
            case 'completed':
                return await handleFirmaCompletada(contratoId!, tenantId, signers, documentoUrl);

            case 'declined':
                return await handleFirmaRechazada(contratoId!, tenantId, signers);

            case 'voided':
            case 'expired':
                return await handleFirmaExpirada(contratoId!, tenantId, status);

            case 'sent':
            case 'delivered':
                return await handleFirmaEnviada(contratoId!, tenantId, signers);

            default:
                return { success: true, message: `Evento ${status} ignorado` };
        }
    } catch (error) {
        logger.error('[Webhook/Firma] Error procesando evento:', error instanceof Error ? error : undefined);
        return { success: false, message: 'Error interno' };
    }
}

function extractContratoIdFromEnvelope(envelopeId: string): string | null {
    // DocuSign envelope IDs typically look like: env_123456_abc
    // We can encode the contratoId in the envelope or look it up
    // For now, return null to trigger lookup
    if (envelopeId.startsWith('env_')) {
        // Extract from format env_{timestamp}_{random}
        return null;
    }
    return envelopeId;
}

async function handleFirmaCompletada(
    contratoId: string,
    tenantId: string,
    signers: SignatureEvent['signers'],
    documentoUrl?: string
): Promise<{ success: boolean; message: string }> {
    logger.info('[Webhook/Firma] Firma completada:', { contratoId, tenantId });

    // Log de auditoría
    auditLogger.log({
        type: AuditEventType.DATA_UPDATE,
        userId: 'webhook',
        metadata: {
            module: 'contratos',
            accion: 'firma_completada',
            contratoId,
            tenantId,
            numFirmas: signers.filter(s => s.status === 'signed').length,
            documentoUrl: documentoUrl || ''
        }
    });

    // En implementación real:
    // 1. Actualizar estado del contrato a 'firmado'
    // 2. Guardar URL del documento firmado
    // 3. Guardar información de firmas
    // 4. Enviar notificación al ejecutivo
    // 5. Guardar en storage el documento

    return {
        success: true,
        message: `Firma completada por ${signers.filter(s => s.status === 'signed').length} firmante(s)`
    };
}

async function handleFirmaRechazada(
    contratoId: string,
    tenantId: string,
    signers: SignatureEvent['signers']
): Promise<{ success: boolean; message: string }> {
    const firmanteRechazo = signers.find(s => s.status === 'declined');

    logger.warn('[Webhook/Firma] Firma rechazada:', {
        contratoId,
        tenantId,
        rechazadoPor: firmanteRechazo?.email,
        razon: firmanteRechazo?.declinedReason
    });

    auditLogger.log({
        type: AuditEventType.DATA_UPDATE,
        userId: 'webhook',
        metadata: {
            module: 'contratos',
            accion: 'firma_rechazada',
            contratoId,
            tenantId,
            rechazadoPor: firmanteRechazo?.email || '',
            razon: firmanteRechazo?.declinedReason || ''
        }
    });

    // En implementación real:
    // 1. Notificar al ejecutivo
    // 2. Posiblemente revertir a estado anterior

    return {
        success: true,
        message: `Firma rechazada por ${firmanteRechazo?.nombre}: ${firmanteRechazo?.declinedReason || 'Sin razón especificada'}`
    };
}

async function handleFirmaExpirada(
    contratoId: string,
    tenantId: string,
    status: string
): Promise<{ success: boolean; message: string }> {
    logger.warn('[Webhook/Firma] Firma expirada/voided:', { contratoId, tenantId, status });

    auditLogger.log({
        type: AuditEventType.DATA_UPDATE,
        userId: 'webhook',
        metadata: {
            module: 'contratos',
            accion: 'firma_expirada',
            contratoId,
            tenantId,
            status
        }
    });

    return { success: true, message: 'Evento procesado' };
}

async function handleFirmaEnviada(
    contratoId: string,
    tenantId: string,
    signers: SignatureEvent['signers']
): Promise<{ success: boolean; message: string }> {
    logger.info('[Webhook/Firma] Firma enviada/entregada:', {
        contratoId,
        tenantId,
        numDestinatarios: signers.length
    });

    return { success: true, message: 'Evento procesado' };
}

// ═══════════════════════════════════════════════════════════════
// POST - Recibir eventos
// ═══════════════════════════════════════════════════════════════

export const POST = async (request: NextRequest) => {
    try {
        const payload = await request.text();
        const signature = request.headers.get('x-docusign-signature-1') ||
            request.headers.get('x-adobesign-clientid');
        const timestamp = request.headers.get('x-docusign-signature-timestamp');

        // Verificar firma del webhook
        if (!verifyWebhookSignature(payload, signature || undefined, timestamp || undefined)) {
            logger.warn('[Webhook/Firma] Firma de webhook inválida');
            return NextResponse.json(
                { success: false, error: 'Firma inválida' },
                { status: 401 }
            );
        }

        // Parsear payload
        let webhookPayload: WebhookPayload;
        try {
            webhookPayload = JSON.parse(payload);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Payload inválido' },
                { status: 400 }
            );
        }

        // Extraer tenantId del metadata o usar default
        const tenantId = webhookPayload.event.metadata?.tenantId || 'default';

        // Normalizar evento según proveedor
        let normalizedEvent: SignatureEvent;

        if (webhookPayload.provider === 'docusign') {
            const docusignData = webhookPayload.event as unknown as Record<string, unknown>;
            normalizedEvent = {
                envelopeId: String(docusignData.envelopeId || docusignData.envelope_id || ''),
                event: String(docusignData.event || ''),
                status: DOCUSIGN_EVENT_MAP[String(docusignData.event || '')] as SignatureEvent['status'] || 'sent',
                timestamp: String(docusignData.timestamp || new Date().toISOString()),
                signers: (docusignData.signers as SignatureEvent['signers']) || [],
                documentoUrl: docusignData.documentoUrl as string | undefined
            };
        } else {
            // Adobe Sign
            const adobesignData = webhookPayload.event as unknown as Record<string, unknown>;
            const signersList = (adobesignData.signers || []) as Array<{ name?: string; email?: string }>;
            normalizedEvent = {
                envelopeId: String(adobesignData.agreementId || adobesignData.agreement_id || ''),
                event: String(adobesignData.event || ''),
                status: ADOBESIGN_EVENT_MAP[String(adobesignData.event || '')] as SignatureEvent['status'] || 'sent',
                timestamp: String(adobesignData.timestamp || new Date().toISOString()),
                signers: [{
                    email: String(adobesignData.email || ''),
                    nombre: String(adobesignData.nombre || signersList[0]?.name || ''),
                    status: adobesignData.status === 'SIGNED' ? 'signed' : 'pending'
                }],
                documentoUrl: adobesignData.documentoUrl as string | undefined
            };
        }

        webhookPayload.event = normalizedEvent;

        logger.info('[Webhook/Firma] Recibido evento:', {
            provider: webhookPayload.provider,
            event: normalizedEvent.event,
            envelopeId: normalizedEvent.envelopeId,
            status: normalizedEvent.status
        });

        // Procesar evento
        const result = await processSignatureEvent(webhookPayload, tenantId);

        return NextResponse.json({
            success: result.success,
            message: result.message,
            receivedAt: new Date().toISOString()
        });

    } catch (error) {
        logger.error('[Webhook/Firma] Error procesando webhook:', error instanceof Error ? error : undefined);
        return NextResponse.json(
            { success: false, error: 'Error interno' },
            { status: 500 }
        );
    }
};

// ═══════════════════════════════════════════════════════════════
// GET - Health check
// ═══════════════════════════════════════════════════════════════

export const GET = async () => {
    return NextResponse.json({
        status: 'ok',
        provider: PROVIDER,
        timestamp: new Date().toISOString(),
        endpoints: {
            POST: 'Recibir eventos de firma',
            documentation: '/api/webhooks/firma/docs'
        }
    });
};
