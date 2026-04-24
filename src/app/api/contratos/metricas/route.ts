/**
 * 📈 GET /api/contratos/metricas — Métricas de contratos
 * 
 * Obtiene métricas agregadas de contratos para dashboard
 * incluyendo valores, estados y tendencias.
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiServerError } from '@/lib/api/response'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { logger } from '@/lib/observability'

// ─── GET /api/contratos/metricas ─────────────────────────────────────────────

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId

        try {
            const url = new URL(req.url)
            const vendedorId = url.searchParams.get('vendedorId') || undefined
            const fechaDesde = url.searchParams.get('fechaDesde') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            const fechaHasta = url.searchParams.get('fechaHasta') || new Date()

            const repo = new DrizzleContratoRepository(tenantId)
            const metricas = await repo.getMetricasEjecutivo(vendedorId || '', {
                fechaDesde: new Date(fechaDesde as string),
                fechaHasta: new Date(fechaHasta as string)
            })

            return apiSuccess(metricas, 200, { message: 'Métricas consultadas' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error en metricas:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'metricas',
                tenantId
            })
            return apiServerError() as unknown as NextResponse
        }
    }
)