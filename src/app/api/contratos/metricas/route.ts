/**
 * 📈 GET /api/contratos/metricas — Métricas de contratos
 * 
 * Obtiene métricas agregadas de contratos para dashboard
 * incluyendo valores, estados y tendencias.
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

const metricasQuerySchema = z.object({
    vendedorId: z.string().uuid('UUID inválido para vendedorId').optional(),
    fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido para fechaDesde').optional(),
    fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido para fechaHasta').optional(),
}).strict()

// ─── GET /api/contratos/metricas ─────────────────────────────────────────────

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

            const parseResult = metricasQuerySchema.safeParse(queryParams)
            if (!parseResult.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Parámetros de consulta inválidos',
                    400,
                    parseResult.error.flatten().fieldErrors
                ) as unknown as NextResponse
            }

            const { vendedorId, fechaDesde, fechaHasta } = parseResult.data

            // Valores por defecto: últimos 30 días si no se especifican
            const fechaDesdeParsed = fechaDesde
                ? new Date(fechaDesde)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            const fechaHastaParsed = fechaHasta
                ? new Date(fechaHasta)
                : new Date()

            const repo = new DrizzleContratoRepository(tenantId)
            const metricas = await repo.getMetricasEjecutivo(vendedorId || '', {
                fechaDesde: fechaDesdeParsed,
                fechaHasta: fechaHastaParsed
            })

            // Log de auditoría para lectura de métricas
            auditLogger.log({
                type: AuditEventType.DATA_READ,
                userId,
                metadata: {
                    resource: 'contratos',
                    resourceId: 'metricas',
                    tenantId,
                    vendedorId: vendedorId || 'todos',
                    fechaDesde: fechaDesde || 'ultimos-30-dias',
                    fechaHasta: fechaHasta || 'actual',
                }
            })

            return apiSuccess(metricas, 200, { message: 'Métricas consultadas' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error en metricas:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'metricas',
                tenantId
            })

            // Log de auditoría para fallo
            auditLogger.log({
                type: AuditEventType.DATA_READ,
                userId,
                metadata: {
                    resource: 'contratos',
                    resourceId: 'metricas',
                    tenantId,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            })

            return apiServerError() as unknown as NextResponse
        }
    }
)