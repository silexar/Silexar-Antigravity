/**
 * 🔒 SILEXAR PULSE - API Reservas de Inventario TIER 0
 * 
 * @description Sistema de reservas temporales de inventario (24 horas).
 * Permite crear, consultar y liberar reservas de espacios publicitarios.
 * 
 * Endpoints:
 *   POST /api/contratos/reservas - Crear reserva temporal
 *   GET /api/contratos/reservas?reservaId=X - Consultar reserva
 *   DELETE /api/contratos/reservas?reservaId=X - Liberar reserva
 *   POST /api/contratos/reservas/:id/confirmar - Confirmar reserva (convertir a contrato)
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

// ═══════════════════════════════════════════════════════════════
// STORAGE DE RESERVAS (en producción usar Redis o DB)
// ═══════════════════════════════════════════════════════════════

interface Reserva {
    reservaId: string;
    contratoId?: string;
    tenantId: string;
    medioId: string;
    formatoId: string;
    horario: string;
    fechaInicio: string;
    fechaFin: string;
    cantidadSpots: number;
    status: 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'converted';
    expiresAt: string;
    createdAt: string;
    createdBy: string;
    source: 'wideorbit' | 'sara' | 'dalet' | 'local';
}

const reservasStore = new Map<string, Reserva>();

// Limpiar reservas expiradas cada 5 minutos
setInterval(() => {
    const now = new Date();
    for (const [id, reserva] of reservasStore.entries()) {
        if (reserva.status === 'pending' && new Date(reserva.expiresAt) < now) {
            reserva.status = 'expired';
            logger.info('[Reservas] Reserva expirada automáticamente', { reservaId: id });
        }
    }
}, 5 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════
// SCHEMAS ZOD
// ═══════════════════════════════════════════════════════════════

const crearReservaSchema = z.object({
    medioId: z.string().min(1, 'medioId es requerido'),
    formatoId: z.string().min(1, 'formatoId es requerido'),
    horario: z.string().min(1, 'horario es requerido'),
    fechaInicio: z.string().or(z.date()),
    fechaFin: z.string().or(z.date()),
    cantidadSpots: z.number().min(1).default(1),
    contratoId: z.string().optional(),
    source: z.enum(['wideorbit', 'sara', 'dalet', 'local']).default('local')
});

type CrearReservaRequest = z.infer<typeof crearReservaSchema>;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generateReservaId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function calculateExpiration(): string {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    return expiresAt.toISOString();
}

function formatDateForResponse(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
}

// ═══════════════════════════════════════════════════════════════
// POST - Crear reserva
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'contratos', action: 'create' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        try {
            let rawBody: unknown;
            try {
                rawBody = await req.json();
            } catch {
                return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
            }

            const parseResult = crearReservaSchema.safeParse(rawBody);
            if (!parseResult.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Error en la validación de los datos',
                    400,
                    parseResult.error.flatten().fieldErrors
                ) as unknown as NextResponse;
            }

            const body = parseResult.data;

            // Verificar que no existe una reserva activa para el mismo medio/horario/fecha
            const reservaExistente = Array.from(reservasStore.values()).find(r =>
                r.tenantId === tenantId &&
                r.medioId === body.medioId &&
                r.formatoId === body.formatoId &&
                r.horario === body.horario &&
                r.status === 'pending' &&
                new Date(r.expiresAt) > new Date()
            );

            if (reservaExistente) {
                return apiError(
                    'RESERVA_EXISTENTE',
                    'Ya existe una reserva activa para este espacio',
                    409,
                    { reservaId: reservaExistente.reservaId }
                ) as unknown as NextResponse;
            }

            // Crear reserva
            const reservaId = generateReservaId();
            const reserva: Reserva = {
                reservaId,
                contratoId: body.contratoId,
                tenantId,
                medioId: body.medioId,
                formatoId: body.formatoId,
                horario: body.horario,
                fechaInicio: formatDateForResponse(body.fechaInicio),
                fechaFin: formatDateForResponse(body.fechaFin),
                cantidadSpots: body.cantidadSpots,
                status: 'pending',
                expiresAt: calculateExpiration(),
                createdAt: new Date().toISOString(),
                createdBy: userId || 'system',
                source: body.source
            };

            reservasStore.set(reservaId, reserva);

            // Log de auditoría
            auditLogger.log({
                type: AuditEventType.DATA_UPDATE,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'crear_reserva',
                    reservaId,
                    tenantId,
                    medioId: body.medioId
                }
            });

            logger.info('[Reservas] Reserva creada', {
                reservaId,
                medioId: body.medioId,
                expiresAt: reserva.expiresAt
            });

            return apiSuccess({
                reservaId,
                status: 'pending',
                expiresAt: reserva.expiresAt,
                createdAt: reserva.createdAt,
                message: 'Reserva creada exitosamente. Tiene 24 horas para confirmar.'
            }, 201, { message: 'Reserva creada' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('[Reservas] Error creando reserva', error instanceof Error ? error : undefined, {
                module: 'reservas',
                action: 'create',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// GET - Consultar reserva
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;

        try {
            const { searchParams } = new URL(req.url);
            const reservaId = searchParams.get('reservaId');

            if (reservaId) {
                // Obtener reserva específica
                const reserva = reservasStore.get(reservaId);

                if (!reserva || reserva.tenantId !== tenantId) {
                    return apiNotFound('Reserva no encontrada') as unknown as NextResponse;
                }

                // Verificar si expiró
                if (reserva.status === 'pending' && new Date(reserva.expiresAt) < new Date()) {
                    reserva.status = 'expired';
                }

                return apiSuccess({
                    reserva: {
                        reservaId: reserva.reservaId,
                        medioId: reserva.medioId,
                        formatoId: reserva.formatoId,
                        horario: reserva.horario,
                        fechaInicio: reserva.fechaInicio,
                        fechaFin: reserva.fechaFin,
                        cantidadSpots: reserva.cantidadSpots,
                        status: reserva.status,
                        expiresAt: reserva.expiresAt,
                        createdAt: reserva.createdAt,
                        contratoId: reserva.contratoId
                    }
                }, 200, { message: 'Reserva consultada' }) as unknown as NextResponse;
            }

            // Listar todas las reservas del tenant
            const reservas = Array.from(reservasStore.values())
                .filter(r => r.tenantId === tenantId)
                .map(r => ({
                    reservaId: r.reservaId,
                    medioId: r.medioId,
                    formatoId: r.formatoId,
                    horario: r.horario,
                    fechaInicio: r.fechaInicio,
                    fechaFin: r.fechaFin,
                    cantidadSpots: r.cantidadSpots,
                    status: r.status,
                    expiresAt: r.expiresAt,
                    createdAt: r.createdAt,
                    contratoId: r.contratoId
                }));

            return apiSuccess({
                reservas,
                total: reservas.length,
                activas: reservas.filter(r => r.status === 'pending').length,
                expiradas: reservas.filter(r => r.status === 'expired').length
            }, 200, { message: 'Reservas consultadas' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('[Reservas] Error consultando reserva', error instanceof Error ? error : undefined, {
                module: 'reservas',
                action: 'get',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// DELETE - Liberar reserva
// ═══════════════════════════════════════════════════════════════

export const DELETE = withApiRoute(
    { resource: 'contratos', action: 'delete' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        try {
            const { searchParams } = new URL(req.url);
            const reservaId = searchParams.get('reservaId');

            if (!reservaId) {
                return apiError('MISSING_PARAM', 'reservaId es requerido', 400) as unknown as NextResponse;
            }

            const reserva = reservasStore.get(reservaId);

            if (!reserva || reserva.tenantId !== tenantId) {
                return apiNotFound('Reserva no encontrada') as unknown as NextResponse;
            }

            if (reserva.status === 'converted') {
                return apiError(
                    'RESERVA_CONVERTIDA',
                    'No se puede liberar una reserva que ya fue convertida a contrato',
                    400
                ) as unknown as NextResponse;
            }

            reserva.status = 'cancelled';

            // Log de auditoría
            auditLogger.log({
                type: AuditEventType.DATA_UPDATE,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'liberar_reserva',
                    reservaId,
                    tenantId
                }
            });

            logger.info('[Reservas] Reserva liberada', { reservaId, releasedBy: userId });

            return apiSuccess({
                reservaId,
                status: 'cancelled',
                message: 'Reserva liberada exitosamente'
            }, 200, { message: 'Reserva liberada' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('[Reservas] Error liberando reserva', error instanceof Error ? error : undefined, {
                module: 'reservas',
                action: 'delete',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError() as unknown as NextResponse;
        }
    }
);
