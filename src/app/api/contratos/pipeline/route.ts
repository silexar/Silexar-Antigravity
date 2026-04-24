/**
 * 📊 GET /api/contratos/pipeline — Pipeline de ventas
 * 
 * Obtiene el pipeline de contratos agrupados por estado con 
 * métricas de valor y cantidad.
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiServerError } from '@/lib/api/response'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { logger } from '@/lib/observability'

// ─── GET /api/contratos/pipeline ──────────────────────────────────────────────

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId

        try {
            const url = new URL(req.url)
            const vendedorId = url.searchParams.get('vendedorId') || undefined
            const fechaDesde = url.searchParams.get('fechaDesde') || undefined
            const fechaHasta = url.searchParams.get('fechaHasta') || undefined

            const repo = new DrizzleContratoRepository(tenantId)
            const pipeline = await repo.getPipelineData({
                vendedorId,
                fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
                fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined
            })

            return apiSuccess(pipeline, 200, { message: 'Pipeline consultado' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error en pipeline:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'pipeline',
                tenantId
            })
            return apiServerError() as unknown as NextResponse
        }
    }
)