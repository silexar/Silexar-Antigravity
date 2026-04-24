/**
 * POST /api/contratos/:id/rechazar — Rechazar un contrato
 * 
 * Permite rechazar un contrato que está en proceso de aprobación,
 * registrando el motivo y notificando al creador.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const rechazarContratoSchema = z.object({
    motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
    comentariosAdicionales: z.string().optional()
})

// ─── Helper para extraer ID de la URL ────────────────────────────────────────

function extractIdFromUrl(url: string): string | null {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const rechazarIndex = pathParts.findIndex(p => p === 'rechazar')
    if (rechazarIndex > 0) {
        return pathParts[rechazarIndex - 1]
    }
    return pathParts[pathParts.length - 1]
}

// ─── POST /api/contratos/:id/rechazar ────────────────────────────────────────

export const POST = withApiRoute(
    { resource: 'contratos', action: 'approve' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const userId = ctx.userId
        const id = extractIdFromUrl(req.url)

        if (!id) {
            return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse
        }

        try {
            // Validar body
            let rawBody: unknown
            try {
                rawBody = await req.json()
            } catch {
                return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
            }

            const parseResult = rechazarContratoSchema.safeParse(rawBody)
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

            // Obtener contrato
            const contrato = await repo.findById(id)
            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse
            }

            const snap = contrato.toSnapshot()

            // Verificar que el contrato está en estado de revisión/aprobación
            const estadosPermitidos = ['revision', 'aprobacion', 'pendiente_aprobacion']
            if (!estadosPermitidos.includes(snap.estado.valor)) {
                return apiError(
                    'INVALID_STATE',
                    `El contrato no puede ser rechazado en estado "${snap.estado.valor}". Solo se pueden rechazar contratos en revisión o aprobación.`,
                    400
                ) as unknown as NextResponse
            }

            // Solo supervisores o superior pueden rechazar
            const puedeRechazar = ['supervisor', 'gerente_comercial', 'gerente_general', 'admin'].includes(ctx.role)
            if (!puedeRechazar) {
                return apiError('FORBIDDEN', 'No tienes permisos para rechazar contratos', 403) as unknown as NextResponse
            }

            // Agregar alerta de rechazo con el motivo
            const alertaRechazo = `Rechazado por ${ctx.role}: ${body.motivo}`
            contrato.agregarAlerta(alertaRechazo)

            if (body.comentariosAdicionales) {
                contrato.agregarAlerta(`Comentarios adicionales: ${body.comentariosAdicionales}`)
            }

            // Guardar cambios
            await repo.save(contrato)

            // Log de auditoría
            auditLogger.log({
                type: AuditEventType.DATA_UPDATE,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'rechazar',
                    contratoId: id,
                    numeroContrato: snap.numero.valor,
                    tenantId,
                    motivo: body.motivo,
                    comentariosAdicionales: body.comentariosAdicionales,
                    valorNeto: snap.totales.valorNeto
                }
            })

            const snapActualizado = contrato.toSnapshot()

            return apiSuccess({
                id: snapActualizado.id,
                numeroContrato: snapActualizado.numero.valor,
                estado: snapActualizado.estado.valor,
                motivoRechazo: body.motivo,
                mensaje: 'Contrato rechazado exitosamente'
            }, 200, { message: 'Contrato rechazado' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error in rechazar contrato', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'rechazar',
                contratoId: id,
                tenantId
            })
            return apiServerError() as unknown as NextResponse
        }
    }
)
