/**
 * 🔍 GET /api/contratos/[id]/validar-material
 * 
 * Valida disponibilidad de material creativo (cuñas) para un contrato.
 * Se ejecuta antes de aprobar para verificar que el anunciante tiene material.
 * 
 * @route GET /api/contratos/{id}/validar-material
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { MaterialCreativoValidationService } from '@/modules/contratos/infrastructure/external/MaterialCreativoValidationService';

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
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
                // STUB: En producción, obtener contrato real de la BD
                // const contrato = await contratoRepository.findById(contratoId, tenantId);
                // if (!contrato) return apiNotFound('Contrato no encontrado');

                // STUB: Datos simulados
                const mockContrato = {
                    id: contratoId,
                    anuncianteId: 'announcer-001',
                    anuncianteNombre: 'Banco Chile',
                    campanaId: 'campana-001',
                    campanaNombre: 'Campaña Navidad 2024',
                    lineas: [
                        { productoId: 'prod-001', productoNombre: 'Radio Prime AM', cantidadSpots: 10 },
                        { productoId: 'prod-002', productoNombre: 'TV Prime', cantidadSpots: 5 }
                    ]
                };

                const validacion = await MaterialCreativoValidationService.validarMaterial({
                    announcerId: mockContrato.anuncianteId,
                    campanaId: mockContrato.campanaId,
                    productosContrato: mockContrato.lineas
                });

                logger.info('[MaterialValidation API] Validación completada', {
                    contratoId,
                    announcerId: mockContrato.anuncianteId,
                    puedeAprobar: validacion.puedeAprobar,
                    cuñasDisponibles: validacion.cuñasDisponibles
                });

                return apiSuccess({
                    contratoId,
                    validacion,
                    recomendaciones: validacion.puedeAprobar
                        ? []
                        : [
                            'Crear material creativo para el anunciante antes de aprobar',
                            'O aprobar con advertencia y crear material posteriormente'
                        ]
                }, 200, { message: 'Validación de material completada' });
            });
        } catch (error) {
            logger.error('[MaterialValidation API] Error:', error instanceof Error ? error : undefined);
            return apiServerError();
        }
    }
);
