/**
 * 📋 API: Órdenes de Pauta
 * 
 * POST /api/contratos/[id]/orden-pauta - Generar orden de pauta
 * GET /api/contratos/[id]/orden-pauta - Obtener órdenes de un contrato
 * GET /api/contratos/ordenes/[ordenId] - Obtener orden específica
 * PATCH /api/contratos/ordenes/[ordenId]/lineas/[lineaId] - Actualizar estado línea
 * DELETE /api/contratos/ordenes/[ordenId] - Cancelar orden
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { OrdenPautaService } from '@/modules/contratos/infrastructure/external/OrdenPautaService';

export const POST = withApiRoute(
    { resource: 'contratos', action: 'create' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const idIndex = pathParts.findIndex(p => p === 'contratos') + 1;
        const contratoId = pathParts[idIndex];

        if (!contratoId) {
            return apiError('MISSING_ID', 'ID de contrato es requerido', 400);
        }

        try {
            return await withTenantContext(tenantId, async () => {
                const body = await req.json().catch(() => ({}));

                // STUB: En producción, obtener contrato real
                const mockContrato = {
                    id: contratoId,
                    numero: 'CON-2025-00123',
                    anuncianteId: body.anuncianteId || 'announcer-001',
                    anuncianteNombre: body.anuncianteNombre || 'Banco Chile',
                    campanaId: body.campanaId,
                    campanaNombre: body.campanaNombre,
                    lineas: body.lineas || [
                        {
                            id: 'linea-001',
                            medioId: 'medio-001',
                            medioNombre: 'Radio Corazón Prime',
                            productoId: 'prod-001',
                            productoNombre: 'Prime AM 7-9am',
                            horarioInicio: '07:00',
                            horarioFin: '09:00',
                            fechaInicio: '2024-12-01',
                            fechaFin: '2024-12-31',
                            cantidadSpots: 20,
                            tarifaUnitaria: 50000
                        }
                    ]
                };

                const result = await OrdenPautaService.generarOrden({
                    contratoId: mockContrato.id,
                    contratoNumero: mockContrato.numero,
                    anuncianteId: mockContrato.anuncianteId,
                    anuncianteNombre: mockContrato.anuncianteNombre,
                    campanaId: mockContrato.campanaId,
                    campanaNombre: mockContrato.campanaNombre,
                    lineasContrato: mockContrato.lineas,
                    observaciones: body.observaciones,
                    userId: ctx.userId || 'system'
                });

                if (!result.success) {
                    return apiError('GENERATION_ERROR', result.errores.join(', '), 500);
                }

                return apiSuccess({
                    ordenPauta: result.ordenPauta,
                    ordenesEnviadas: result.ordenesEnviadas
                }, 201, { message: 'Orden de pauta generada exitosamente' });
            });
        } catch (error) {
            logger.error('[OrdenPauta API] Error:', error instanceof Error ? error : undefined);
            return apiServerError();
        }
    }
);

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const idIndex = pathParts.findIndex(p => p === 'contratos') + 1;
        const contratoId = pathParts[idIndex];

        try {
            return await withTenantContext(tenantId, async () => {
                const url = new URL(req.url);
                const ordenId = url.searchParams.get('ordenId');

                if (ordenId) {
                    // Obtener orden específica
                    const orden = await OrdenPautaService.obtenerOrden(ordenId);
                    if (!orden) return apiNotFound('Orden no encontrada');
                    return apiSuccess(orden);
                }

                // Obtener órdenes del contrato
                if (!contratoId) {
                    return apiError('MISSING_ID', 'ID de contrato es requerido', 400);
                }

                const ordenes = await OrdenPautaService.obtenerOrdenesPorContrato(contratoId);
                return apiSuccess({ ordenes, total: ordenes.length });
            });
        } catch (error) {
            logger.error('[OrdenPauta API] Error:', error instanceof Error ? error : undefined);
            return apiServerError();
        }
    }
);
