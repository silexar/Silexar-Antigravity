/**
 * 📊 GET /api/contratos/pipeline — Pipeline de ventas
 * 
 * Obtiene el pipeline de contratos agrupados por estado con 
 * métricas de valor y cantidad.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiServerError, apiError } from '@/lib/api/response'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const pipelineQuerySchema = z.object({
    vendedorId: z.string().uuid('UUID inválido para vendedorId').optional(),
    fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido para fechaDesde').optional(),
    fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido para fechaHasta').optional(),
}).strict()

// ─── GET /api/contratos/pipeline ──────────────────────────────────────────────

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const userId = ctx.userId

        try {
            const url = new URL(req.url)

            // Validar query parameters con Zod
            const queryParams = {
                vendedorId: url.searchParams.get('vendedorId') || undefined,
                fechaDesde: url.searchParams.get('fechaDesde') || undefined,
                fechaHasta: url.searchParams.get('fechaHasta') || undefined,
            }

            const parseResult = pipelineQuerySchema.safeParse(queryParams)
            if (!parseResult.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Parámetros de consulta inválidos',
                    400,
                    parseResult.error.flatten().fieldErrors
                ) as unknown as NextResponse
            }

            const { vendedorId, fechaDesde, fechaHasta } = parseResult.data

            const repo = new DrizzleContratoRepository(tenantId)
            const pipeline = await repo.getPipelineData({
                vendedorId,
                fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
                fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined
            })

            // Log de auditoría para lectura de pipeline
            auditLogger.log({
                type: AuditEventType.DATA_READ,
                userId,
                metadata: {
                tenantId,
                resource: 'contratos',
                resourceId: 'pipeline',
                    vendedorId: vendedorId || 'todos',
                    fechaDesde: fechaDesde || 'sin-limite',
                    fechaHasta: fechaHasta || 'sin-limite',
                }
            })

            return apiSuccess(pipeline, 200, { message: 'Pipeline consultado' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error en pipeline:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'pipeline',
                tenantId
            })

            // Log de auditoría para fallo
            auditLogger.log({
                type: AuditEventType.DATA_READ,
                userId,
                metadata: {
                    tenantId,
                    resource: 'contratos',
                    resourceId: 'pipeline',
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            })

            return apiServerError() as unknown as NextResponse
        }
    }
)