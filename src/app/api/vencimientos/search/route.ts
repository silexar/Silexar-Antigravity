import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';

/**
 * GET /api/VENCIMIENTOS/search
 * Búsqueda de programas, cupos y emisoras en vencimientos
 * 
 * @security RBAC: VENCIMIENTOS.search:read
 * @audit Logged: DATA_ACCESS
 */

// Zod Schema para validación de query params
const SearchQuerySchema = z.object({
    q: z.string().min(2, 'Query debe tener al menos 2 caracteres'),
    tipo: z.enum(['programa', 'cupo', 'emisora']).optional(),
    limite: z.coerce.number().min(1).max(100).optional().default(20),
});

interface SearchResult {
    id: string;
    tipo: 'programa' | 'cupo' | 'emisora';
    nombre: string;
    descripcion: string;
    metadata: Record<string, unknown>;
}

const mockResults: SearchResult[] = [
    {
        id: 'prog-001',
        tipo: 'programa',
        nombre: 'Buenos Días Chile',
        descripcion: 'Programa matutino de noticias y entretenimiento',
        metadata: { seal: 'SEÑAL-01', horario: '07:00 - 09:00', estado: 'activo' },
    },
    {
        id: 'prog-002',
        tipo: 'programa',
        nombre: 'El Informativo',
        descripcion: 'Noticiero central del mediodía',
        metadata: { seal: 'SEÑAL-01', horario: '13:00 - 14:00', estado: 'activo' },
    },
    {
        id: 'cup-001',
        tipo: 'cupo',
        nombre: 'Cupo 07:30 - Buenos Días Chile',
        descripcion: 'Espacio disponible para spot de 30 segundos',
        metadata: { programaId: 'prog-001', hora: '07:30', disponible: true },
    },
];

export const GET = withApiRoute(
    { resource: 'vencimientos.search', action: 'read', skipCsrf: true },
    async (context: RouteContext) => {
        const startTime = Date.now();
        const { req } = context;
        const userId = context.ctx.userId;

        try {
            // Validar query params con Zod
            const searchParams = req.nextUrl.searchParams;
            const queryParams = {
                q: searchParams.get('q') ?? '',
                tipo: searchParams.get('tipo') ?? undefined,
                limite: searchParams.get('limite') ?? undefined,
            };

            const parsed = SearchQuerySchema.safeParse(queryParams);
            if (!parsed.success) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_ACCESS,
                    severity: AuditSeverity.MEDIUM,
                    userId,
                    resource: 'VENCIMIENTOS.search',
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

            const { q, tipo, limite } = parsed.data;

            let results = mockResults.filter(r =>
                r.nombre.toLowerCase().includes(q.toLowerCase()) ||
                r.descripcion.toLowerCase().includes(q.toLowerCase())
            );

            if (tipo) {
                results = results.filter(r => r.tipo === tipo);
            }

            // Limitar resultados
            results = results.slice(0, limite);

            // Audit logging exitoso
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_ACCESS,
                severity: AuditSeverity.LOW,
                userId,
                resource: 'VENCIMIENTOS.search',
                action: 'read',
                success: true,
                details: {
                    query: q,
                    tipo,
                    resultados: results.length,
                    duracionMs: Date.now() - startTime,
                },
            });

            return NextResponse.json({
                results,
                total: results.length,
                query: q,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_ACCESS,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'VENCIMIENTOS.search',
                action: 'read',
                success: false,
                details: {
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                    duracionMs: Date.now() - startTime,
                },
            });

            console.error('Error en búsqueda:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);
