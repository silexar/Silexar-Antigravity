/**
 * 🔔 GET /api/notificaciones — Lista de notificaciones del usuario
 * PATCH /api/notificaciones/:id/leida — Marcar como leída
 * POST /api/notificaciones/suscripcion — Suscribirse a notificaciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Notificacion {
    id: string;
    tipo: 'alerta' | 'aprobacion' | 'rechazo' | 'firma' | 'vencimientos' | 'pago' | 'mensaje' | 'sistema';
    titulo: string;
    descripcion: string;
    leida: boolean;
    prioridad: 'alta' | 'media' | 'baja';
    datos: Record<string, unknown>;
    createdAt: string;
    expiresAt?: string;
}

// ─── Almacenamiento en memoria (en producción usar DB/Redis) ─────────────────

const notificacionesStore = new Map<string, Notificacion[]>();
const suscripcionesStore = new Map<string, Set<string>>();

// ─── GET /api/notificaciones ──────────────────────────────────────────────────

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const userId = ctx.userId;
        const tenantId = ctx.tenantId;

        try {
            return await withTenantContext(tenantId, async () => {
                const url = new URL(req.url);
                const tipo = url.searchParams.get('tipo');
                const noLeidas = url.searchParams.get('noLeidas') === 'true';
                const limite = parseInt(url.searchParams.get('limite') || '50', 10);

                const notificaciones = notificacionesStore.get(userId) || [];

                let filtradas = notificaciones;

                if (tipo) {
                    filtradas = filtradas.filter(n => n.tipo === tipo);
                }

                if (noLeidas) {
                    filtradas = filtradas.filter(n => !n.leida);
                }

                const resultado = filtradas
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, limite);

                const resumen = {
                    total: notificaciones.length,
                    noLeidas: notificaciones.filter(n => !n.leida).length,
                    porTipo: {
                        alerta: notificaciones.filter(n => n.tipo === 'alerta' && !n.leida).length,
                        aprobacion: notificaciones.filter(n => n.tipo === 'aprobacion' && !n.leida).length,
                        firma: notificaciones.filter(n => n.tipo === 'firma' && !n.leida).length,
                        vencimientos: notificaciones.filter(n => n.tipo === 'vencimientos' && !n.leida).length
                    }
                };

                return NextResponse.json({
                    success: true,
                    data: resultado,
                    resumen,
                    timestamp: new Date().toISOString()
                });
            });
        } catch (error) {
            logger.error('Error consultando notificaciones:', error instanceof Error ? error : undefined);
            return apiServerError();
        }
    }
);

// ─── PATCH /api/notificaciones/:id/leida ─────────────────────────────────────

export const PATCH = withApiRoute(
    { resource: 'contratos', action: 'update' },
    async ({ ctx, req }) => {
        const userId = ctx.userId;
        const tenantId = ctx.tenantId;

        try {
            return await withTenantContext(tenantId, async () => {
                const url = new URL(req.url);
                const pathParts = url.pathname.split('/');
                const idIndex = pathParts.findIndex(p => p === 'notificaciones') + 1;
                const notificacionId = pathParts[idIndex];

                if (!notificacionId) {
                    return apiError('MISSING_ID', 'ID de notificación es requerido', 400);
                }

                const notificaciones = notificacionesStore.get(userId) || [];
                const index = notificaciones.findIndex(n => n.id === notificacionId);

                if (index === -1) {
                    return apiNotFound('Notificación no encontrada');
                }

                // Marcar como leída
                notificaciones[index].leida = true;
                notificacionesStore.set(userId, notificaciones);

                return apiSuccess({
                    id: notificacionId,
                    leida: true,
                    message: 'Notificación marcada como leída'
                }, 200, { message: 'Notificación actualizada' });
            });
        } catch (error) {
            logger.error('Error actualizando notificación:', error instanceof Error ? error : undefined);
            return apiServerError();
        }
    }
);

// ─── POST /api/notificaciones/suscripcion ─────────────────────────────────────

const suscribirSchema = z.object({
    tipo: z.enum(['alerta', 'aprobacion', 'rechazo', 'firma', 'vencimientos', 'pago', 'mensaje', 'sistema']),
    contratoId: z.string().optional(),
    email: z.boolean().optional(),
    push: z.boolean().optional()
});

export const POST = withApiRoute(
    { resource: 'contratos', action: 'update' },
    async ({ ctx, req }) => {
        const userId = ctx.userId;
        const tenantId = ctx.tenantId;

        try {
            const body = await req.json().catch(() => ({}));
            const parseResult = suscribirSchema.safeParse(body);

            if (!parseResult.success) {
                return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, parseResult.error.flatten().fieldErrors);
            }

            const { tipo, contratoId, email, push } = parseResult.data;

            if (!suscripcionesStore.has(userId)) {
                suscripcionesStore.set(userId, new Set());
            }

            const suscripcionKey = `${tipo}:${contratoId || 'all'}`;
            suscripcionesStore.get(userId)!.add(suscripcionKey);

            logger.info('Suscripción creada:', { userId, tipo, contratoId });

            return apiSuccess({
                suscripcion: {
                    tipo,
                    contratoId,
                    email: email ?? true,
                    push: push ?? true
                },
                message: 'Suscripción creada exitosamente'
            }, 201, { message: 'Suscripción creada' });

        } catch (error) {
            logger.error('Error creando suscripción:', error instanceof Error ? error : undefined);
            return apiServerError();
        }
    }
);

// ─── Función helper para crear notificaciones ────────────────────────────────

export function crearNotificacion(
    userId: string,
    tipo: Notificacion['tipo'],
    titulo: string,
    descripcion: string,
    datos: Record<string, unknown> = {},
    prioridad: Notificacion['prioridad'] = 'media'
): Notificacion {
    const notificacion: Notificacion = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        tipo,
        titulo,
        descripcion,
        leida: false,
        prioridad,
        datos,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    };

    if (!notificacionesStore.has(userId)) {
        notificacionesStore.set(userId, []);
    }

    notificacionesStore.get(userId)!.push(notificacion);

    return notificacion;
}