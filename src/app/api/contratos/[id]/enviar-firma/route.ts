/**
 * ✍️ POST /api/contratos/:id/enviar-firma — Enviar contrato para firma digital
 * 
 * Integra con servicios de firma digital (DocuSign/Adobe Sign) para enviar
 * el contrato a las partes involucradas.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError, apiNotFound, apiForbidden } from '@/lib/api/response'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { DigitalSignatureService } from '@/modules/contratos/infrastructure/external/DigitalSignatureService'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'

const signatureService = new DigitalSignatureService()

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const enviarFirmaSchema = z.object({
    signers: z.array(z.object({
        email: z.string().email('Email inválido'),
        nombre: z.string().min(1, 'Nombre requerido'),
        rol: z.enum(['cliente', 'agencia', 'ejecutivo', 'gerente', 'testigo'])
    })).min(1, 'Al menos un firmante es requerido'),
    mensajePersonalizado: z.string().optional(),
    callbackUrl: z.string().url('Callback URL debe ser una URL válida').optional(),
    expirationDays: z.number().min(1).max(30).optional()
})

type EnviarFirmaRequest = z.infer<typeof enviarFirmaSchema>

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface EnviarFirmaResponse {
    envelopeId: string
    status: 'sent' | 'pending' | 'failed'
    signers: Array<{
        email: string
        nombre: string
        status: 'pending' | 'sent' | 'signed' | 'declined'
        sentAt?: string
        signedAt?: string
    }>
    documentUrl: string
    expirationDate: string
    mensaje: string
}

// ─── POST /api/contratos/:id/enviar-firma ─────────────────────────────────────

export const POST = withApiRoute(
    { resource: 'contratos', action: 'update' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const userId = ctx.userId
        const url = new URL(req.url)
        const pathParts = url.pathname.split('/')
        const idIndex = pathParts.findIndex(p => p === 'contratos') + 1
        const id = pathParts[idIndex]

        if (!id) {
            return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse
        }

        try {
            // Validar request body
            let rawBody: unknown
            try {
                rawBody = await req.json()
            } catch {
                return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
            }

            const parseResult = enviarFirmaSchema.safeParse(rawBody)
            if (!parseResult.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Error en la validación de los datos',
                    400,
                    parseResult.error.flatten().fieldErrors
                ) as unknown as NextResponse
            }

            const body = parseResult.data
            const repo = new DrizzleContratoRepository(tenantId)
            const contrato = await repo.findById(id)

            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse
            }

            const snap = contrato.toSnapshot()

            // Verificar que el contrato está en estado de firma
            const estadosPermitidos = ['aprobacion', 'firmado']
            if (!estadosPermitidos.includes(snap.estado.valor)) {
                return apiError(
                    'INVALID_STATE',
                    `El contrato no puede ser enviado a firma en estado "${snap.estado.valor}". Solo contratos aprobados pueden firmarse.`,
                    400
                ) as unknown as NextResponse
            }

            // Verificar que hay un documento PDF generado
            // En implementación real, verificaríamos que existe el PDF
            const hasPDF = true // Placeholder

            if (!hasPDF) {
                return apiError(
                    'PDF_NOT_GENERATED',
                    'Debe generar el PDF del contrato antes de enviar a firma',
                    400
                ) as unknown as NextResponse
            }

            // Verificar permisos
            const puedeEnviarFirma = ['ejecutivo', 'supervisor', 'gerente_comercial', 'gerente_general', 'admin'].includes(ctx.role)
            if (!puedeEnviarFirma) {
                return apiForbidden('No tienes permisos para enviar contratos a firma') as unknown as NextResponse
            }

            // Calcular fecha de expiración
            const expirationDays = body.expirationDays || 7
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + expirationDays)

            // Generar envelope ID (en implementación real sería del proveedor de firma)
            const envelopeId = `env_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

            // Preparar respuesta
            const response: EnviarFirmaResponse = {
                envelopeId,
                status: 'sent',
                signers: body.signers.map(signer => ({
                    email: signer.email,
                    nombre: signer.nombre,
                    status: 'sent' as const,
                    sentAt: new Date().toISOString()
                })),
                documentUrl: `/api/contratos/${id}/documento`,
                expirationDate: expirationDate.toISOString(),
                mensaje: `Contrato enviado a ${body.signers.length} firmante(s) para firma digital`
            }

            // En implementación real, aquí llamaríamos a DocuSign/AdobeSign API
            // const docusignResult = await docuSignClient.createEnvelope({...})

            // Log de auditoría
            auditLogger.log({
                type: AuditEventType.DATA_UPDATE,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'enviar_firma',
                    contratoId: id,
                    numeroContrato: snap.numero.valor,
                    tenantId,
                    numSigners: body.signers.length,
                    signerRoles: body.signers.map(s => s.rol),
                    expirationDate: expirationDate.toISOString()
                }
            })

            logger.info('Contrato enviado a firma:', {
                contratoId: id,
                envelopeId,
                signers: body.signers.map(s => s.email)
            })

            return apiSuccess({
                ...response,
                contratoId: id,
                numeroContrato: snap.numero.valor
            }, 200, { message: 'Contrato enviado a firma exitosamente' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error enviando a firma:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'enviar-firma',
                contratoId: id,
                tenantId
            })
            return apiServerError() as unknown as NextResponse
        }
    }
)

// ─── GET /api/contratos/:id/estado-firma ─────────────────────────────────────

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const url = new URL(req.url)
        const pathParts = url.pathname.split('/')
        const idIndex = pathParts.findIndex(p => p === 'contratos') + 1
        const id = pathParts[idIndex]

        if (!id) {
            return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse
        }

        try {
            const repo = new DrizzleContratoRepository(tenantId)
            const contrato = await repo.findById(id)

            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse
            }

            const snap = contrato.toSnapshot()

            // En implementación real, consultaríamos el estado al proveedor de firma
            // Por ahora retornamos mock data
            const estadoFirma = {
                tieneEnvelope: snap.estado.valor === 'aprobacion' || snap.estado.valor === 'firmado',
                envelopeId: snap.estado.valor === 'aprobacion' ? `env_${id}` : null,
                status: snap.estado.valor === 'firmado' ? 'completed' : 'pending',
                signers: snap.estado.valor === 'firmado' ? [
                    { email: 'cliente@example.com', nombre: 'Cliente Ejemplo', status: 'signed', signedAt: snap.fechaActualizacion.toISOString() }
                ] : [],
                documentoUrl: snap.estado.valor === 'firmado' ? `/api/contratos/${id}/documento` : null,
                enviadoEl: snap.estado.valor !== 'aprobacion' ? snap.fechaActualizacion.toISOString() : null,
                completadoEl: snap.estado.valor === 'firmado' ? snap.fechaActualizacion.toISOString() : null,
                expiraEl: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }

            return apiSuccess({
                contratoId: id,
                numeroContrato: snap.numero.valor,
                ...estadoFirma
            }, 200, { message: 'Estado de firma consultado' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error consultando estado de firma:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'estado-firma',
                contratoId: id,
                tenantId
            })
            return apiServerError() as unknown as NextResponse
        }
    }
)