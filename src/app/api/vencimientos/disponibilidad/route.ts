import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';

/**
 * GET /api/vencimientos/disponibilidad
 * Obtiene la disponibilidad de cupos para vencimientos
 * 
 * @security RBAC: vencimientos.disponibilidad:read
 * @audit Logged: DATA_ACCESS
 */

// Zod Schemas para validación
const DisponibilidadQuerySchema = z.object({
    programaId: z.string().uuid().optional(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    disponible: z.enum(['true', 'false']).optional(),
    tipo: z.enum(['spot', 'mencion', 'presentacion']).optional(),
});

interface CupoDisponibilidad {
    id: string;
    programaId: string;
    programaNombre: string;
    fecha: string;
    hora: string;
    seal: string;
    disponible: boolean;
    precioBase: number;
    tipo: 'spot' | 'mencion' | 'presentacion';
}

const mockCupos: CupoDisponibilidad[] = [
    {
        id: 'cup-001',
        programaId: 'prog-001',
        programaNombre: 'Buenos Días Chile',
        fecha: '2026-04-25',
        hora: '07:30',
        seal: 'SEÑAL-01',
        disponible: true,
        precioBase: 150000,
        tipo: 'spot',
    },
    {
        id: 'cup-002',
        programaId: 'prog-001',
        programaNombre: 'Buenos Días Chile',
        fecha: '2026-04-25',
        hora: '08:00',
        seal: 'SEÑAL-01',
        disponible: false,
        precioBase: 150000,
        tipo: 'spot',
    },
    {
        id: 'cup-003',
        programaId: 'prog-002',
        programaNombre: 'El Informativo',
        fecha: '2026-04-25',
        hora: '13:30',
        seal: 'SEÑAL-01',
        disponible: true,
        precioBase: 120000,
        tipo: 'mencion',
    },
];

export const GET = withApiRoute(
    { resource: 'vencimientos.disponibilidad', action: 'read', skipCsrf: true },
    async (context: RouteContext) => {
        const startTime = Date.now();
        const { req } = context;
        const userId = context.ctx.userId;

        try {
            // Validar query params con Zod
            const searchParams = req.nextUrl.searchParams;
            const queryParams = {
                programaId: searchParams.get('programaId') ?? undefined,
                fecha: searchParams.get('fecha') ?? undefined,
                disponible: searchParams.get('disponible') ?? undefined,
                tipo: searchParams.get('tipo') ?? undefined,
            };

            const parsed = DisponibilidadQuerySchema.safeParse(queryParams);
            if (!parsed.success) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_ACCESS,
                    severity: AuditSeverity.MEDIUM,
                    userId,
                    resource: 'vencimientos.disponibilidad',
                    action: 'read',
                    success: false,
                    details: {
                        reason: 'validation_error',
                        errors: parsed.error.flatten(),
                        ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
                    },
                });

                return NextResponse.json(
                    { error: 'Parámetros inválidos', details: parsed.error.flatten() },
                    { status: 400 }
                );
            }

            let filteredCupos = [...mockCupos];

            if (parsed.data.programaId) {
                filteredCupos = filteredCupos.filter(c => c.programaId === parsed.data.programaId);
            }

            if (parsed.data.fecha) {
                filteredCupos = filteredCupos.filter(c => c.fecha === parsed.data.fecha);
            }

            if (parsed.data.disponible === 'true') {
                filteredCupos = filteredCupos.filter(c => c.disponible);
            }

            if (parsed.data.tipo) {
                filteredCupos = filteredCupos.filter(c => c.tipo === parsed.data.tipo);
            }

            // Audit logging exitoso
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_ACCESS,
                severity: AuditSeverity.LOW,
                userId,
                resource: 'vencimientos.disponibilidad',
                action: 'read',
                success: true,
                details: {
                    filtros: parsed.data,
                    resultados: filteredCupos.length,
                    duracionMs: Date.now() - startTime,
                },
            });

            return NextResponse.json({
                cupos: filteredCupos,
                total: filteredCupos.length,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_ACCESS,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'vencimientos.disponibilidad',
                action: 'read',
                success: false,
                details: {
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                    duracionMs: Date.now() - startTime,
                },
            });

            console.error('Error fetching disponibilidad:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);