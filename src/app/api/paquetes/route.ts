/**
 * API ROUTE: /api/paquetes
 * 
 * @description CRUD completo para el módulo Paquetes.
 * 
 * @version 2.0.0 - MEJORAS APLICADAS (Módulo 15):
 * - withApiRoute wrapper con RBAC
 * - Zod validation para todos los inputs
 * - Audit logging en todas las operaciones
 */

import { z } from 'zod';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { withApiRoute } from '@/lib/api/with-api-route';
import { getDB } from '@/lib/db';
import { paquetes } from '@/lib/db/paquetes-schema';
import { eq, and, isNull, or, like, desc, count } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════
// ZOD SCHEMAS - Validación de inputs
// ═══════════════════════════════════════════════════════════════

const PaqueteQuerySchema = z.object({
    texto: z.string().optional(),
    tipo: z.string().optional(),
    estado: z.string().optional(),
    editoraId: z.string().optional(),
    pagina: z.coerce.number().int().positive().optional().default(1),
    limite: z.coerce.number().int().positive().max(100).optional().default(20),
});

const CrearPaqueteSchema = z.object({
    nombre: z.string().min(1, 'Nombre es requerido').max(200),
    descripcion: z.string().optional().default(''),
    tipo: z.string().min(1, 'Tipo es requerido'),
    estado: z.string().optional().default('ACTIVO'),
    editoraId: z.string().min(1, 'Editora ID es requerido'),
    editoraNombre: z.string().optional().default('Editora'),
    programaId: z.string().min(1, 'Programa ID es requerido'),
    programaNombre: z.string().optional().default('Programa'),
    horario: z.object({
        inicio: z.string().optional().default('07:00'),
        fin: z.string().optional().default('09:00'),
    }).optional(),
    diasSemana: z.array(z.string()).optional().default(['L', 'M', 'M', 'J', 'V']),
    duraciones: z.array(z.number()).optional().default([15, 30]),
    precioBase: z.number().positive('Precio base debe ser mayor a 0'),
    precioActual: z.number().positive().optional(),
    nivelExclusividad: z.string().optional().default('COMPARTIDO'),
    vigenciaDesde: z.string().optional(),
    vigenciaHasta: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════
// GET /api/paquetes - Listar paquetes
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'paquetes', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default';
        const userId = ctx.userId || 'anonymous';

        try {
            const { searchParams } = new URL(req.url);

            // Validar query params con Zod
            const queryValidation = PaqueteQuerySchema.safeParse({
                texto: searchParams.get('texto') ?? undefined,
                tipo: searchParams.get('tipo') ?? undefined,
                estado: searchParams.get('estado') ?? undefined,
                editoraId: searchParams.get('editoraId') ?? undefined,
                pagina: searchParams.get('pagina') ?? undefined,
                limite: searchParams.get('limite') ?? undefined,
            });

            if (!queryValidation.success) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_READ,
                    severity: AuditSeverity.LOW,
                    userId,
                    resource: 'paquetes',
                    action: 'read',
                    success: false,
                    details: { error: 'Invalid query parameters', tenantId },
                });
                return apiError(
                    'VALIDATION_ERROR',
                    'Parámetros de consulta inválidos',
                    400,
                    queryValidation.error.flatten().fieldErrors
                );
            }

            const validatedQuery = queryValidation.data;
            const db = getDB();

            // Build conditions
            const conditions: Parameters<typeof eq>[0][] = [isNull(paquetes.deletedAt)];

            if (validatedQuery.texto) {
                conditions.push(
                    or(
                        like(paquetes.nombre, `%${validatedQuery.texto}%`),
                        like(paquetes.codigo, `%${validatedQuery.texto}%`),
                        like(paquetes.descripcion, `%${validatedQuery.texto}%`)
                    )!
                );
            }

            if (validatedQuery.tipo) conditions.push(eq(paquetes.tipo, validatedQuery.tipo));
            if (validatedQuery.estado) conditions.push(eq(paquetes.estado, validatedQuery.estado));
            if (validatedQuery.editoraId) conditions.push(eq(paquetes.editoraId, validatedQuery.editoraId));

            // Get total count
            const countResult = await db
                .select({ count: count() })
                .from(paquetes)
                .where(and(...conditions));

            const total = countResult[0]?.count || 0;

            // Get items with pagination
            const items = await db
                .select()
                .from(paquetes)
                .where(and(...conditions))
                .orderBy(desc(paquetes.createdAt))
                .limit(validatedQuery.limite)
                .offset((validatedQuery.pagina - 1) * validatedQuery.limite);

            // Audit log
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                userId,
                resource: 'paquetes',
                action: 'read',
                success: true,
                details: {
                    tenantId,
                    total,
                    pagina: validatedQuery.pagina,
                    limite: validatedQuery.limite,
                    filters: { texto: validatedQuery.texto, tipo: validatedQuery.tipo, estado: validatedQuery.estado }
                },
            });

            return apiSuccess({
                total,
                pagina: validatedQuery.pagina,
                limite: validatedQuery.limite,
                items: items.map(p => ({
                    id: p.id,
                    codigo: p.codigo,
                    nombre: p.nombre,
                    descripcion: p.descripcion,
                    tipo: p.tipo,
                    estado: p.estado,
                    editora: { id: p.editoraId, nombre: p.editoraNombre },
                    programa: { id: p.programaId, nombre: p.programaNombre },
                    horario: { inicio: p.horarioInicio, fin: p.horarioFin },
                    diasSemana: p.diasSemana,
                    duraciones: p.duraciones,
                    precioBase: p.precioBase,
                    precioActual: p.precioActual,
                    nivelExclusividad: p.nivelExclusividad,
                    vigencia: { desde: p.vigenciaDesde, hasta: p.vigenciaHasta }
                }))
            });

        } catch (error) {
            console.error('[Paquetes API] GET error:', error);
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'read',
                success: false,
                details: { error: String(error), tenantId },
            });
            return apiServerError('Error al obtener paquetes');
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// POST /api/paquetes - Crear paquete
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'paquetes', action: 'create' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default';
        const userId = ctx.userId || 'anonymous';

        try {
            const body = await req.json();
            // Validar body con Zod
            const validation = CrearPaqueteSchema.safeParse(body);

            if (!validation.success) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_CREATE,
                    severity: AuditSeverity.MEDIUM,
                    userId,
                    resource: 'paquetes',
                    action: 'create',
                    success: false,
                    details: { error: 'Validation failed', tenantId },
                });
                return apiError(
                    'VALIDATION_ERROR',
                    'Datos de paquete inválidos',
                    400,
                    validation.error.flatten().fieldErrors
                );
            }

            const data = validation.data;
            const db = getDB();

            // Generar código único
            const year = new Date().getFullYear();
            const secuencia = Math.floor(10000 + Math.random() * 90000);
            const codigo = `PAQ-${year}-${secuencia}`;

            // Verificar que el código no existe
            const existente = await db
                .select()
                .from(paquetes)
                .where(eq(paquetes.codigo, codigo))
                .limit(1);

            if (existente.length > 0) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_CREATE,
                    severity: AuditSeverity.MEDIUM,
                    userId,
                    resource: 'paquetes',
                    action: 'create',
                    success: false,
                    details: { error: 'Duplicate code', codigo, tenantId },
                });
                return apiError('DUPLICATE_ERROR', 'Código duplicado, intentar nuevamente', 409);
            }

            const ahora = new Date();
            const id = `paq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

            const [nuevoPaquete] = await db
                .insert(paquetes)
                .values({
                    id,
                    codigo,
                    nombre: data.nombre,
                    descripcion: data.descripcion || '',
                    tipo: data.tipo,
                    estado: data.estado || 'ACTIVO',
                    editoraId: data.editoraId,
                    editoraNombre: data.editoraNombre || 'Editora',
                    programaId: data.programaId,
                    programaNombre: data.programaNombre || 'Programa',
                    horarioInicio: data.horario?.inicio || '07:00',
                    horarioFin: data.horario?.fin || '09:00',
                    diasSemana: data.diasSemana || ['L', 'M', 'M', 'J', 'V'],
                    duraciones: data.duraciones || [15, 30],
                    precioBase: data.precioBase,
                    precioActual: data.precioActual || data.precioBase,
                    nivelExclusividad: data.nivelExclusividad || 'COMPARTIDO',
                    vigenciaDesde: data.vigenciaDesde || ahora.toISOString().split('T')[0],
                    vigenciaHasta: data.vigenciaHasta || new Date(ahora.getFullYear() + 1, 0, 1).toISOString().split('T')[0],
                    createdBy: userId,
                    updatedBy: userId,
                })
                .returning();

            // Audit log success
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_CREATE,
                severity: AuditSeverity.MEDIUM,
                userId,
                resource: 'paquetes',
                action: 'create',
                success: true,
                details: {
                    tenantId,
                    paqueteId: id,
                    codigo,
                    tipo: data.tipo,
                    precioBase: data.precioBase
                },
            });

            return apiSuccess(nuevoPaquete, 201);

        } catch (error) {
            console.error('[Paquetes API] POST error:', error);
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_CREATE,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'create',
                success: false,
                details: { error: String(error), tenantId },
            });
            return apiServerError('Error al crear paquete');
        }
    }
);
