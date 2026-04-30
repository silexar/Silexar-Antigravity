/**
 * Sellos API - Enterprise Certification and Trust Seals
 * CATEGORY: CRITICAL - DDD + CQRS
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { v4 as uuidv4 } from 'uuid';
import { SelloConfianza, SelloConfianzaProps, NivelSello, NIVEL_LABELS } from '@/modules/configuracion/domain/entities/SelloConfianza';

// ==================== MOCK DATABASE ====================

const mockSellos = new Map<string, SelloConfianzaProps>();

function getSellosByTenant(tenantId: string): SelloConfianzaProps[] {
    return Array.from(mockSellos.values()).filter(s => s.tenantId === tenantId);
}

function getSelloById(id: string): SelloConfianzaProps | undefined {
    return mockSellos.get(id);
}

function createSello(data: Omit<SelloConfianzaProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'puntuacionTotal' | 'estado'>): SelloConfianzaProps {
    const now = new Date().toISOString();
    const sello: SelloConfianzaProps = {
        ...data,
        id: uuidv4(),
        version: 1,
        estado: 'PENDING',
        puntuacionTotal: 0,
        creadoAt: now,
        actualizadoAt: now,
    } as SelloConfianzaProps;
    mockSellos.set(sello.id, sello);
    return sello;
}

// ==================== SCHEMAS ====================

const CreateSelloSchema = z.object({
    clienteId: z.string().uuid(),
    nombre: z.string().min(1).max(255),
    nivel: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
    descripcion: z.string().max(1000).optional(),
});

const EvaluateRequirementSchema = z.object({
    requisitoId: z.string().uuid(),
    cumple: z.boolean(),
    detalles: z.string().optional(),
});

const AddDocumentSchema = z.object({
    tipoDocumento: z.string().min(1),
    nombreArchivo: z.string().min(1),
    urlArchivo: z.string().url().optional(),
    hashSha256: z.string().optional(),
});

// ==================== GET /api/sellos ====================

export const GET = withApiRoute(
    { resource: 'sellos', action: 'read', skipCsrf: true },
    async ({ ctx }) => {
        try {
            const tenantId = ctx.tenantId;
            const sellos = getSellosByTenant(tenantId);

            const response = sellos.map(sello => ({
                id: sello.id,
                clienteId: sello.clienteId,
                nombre: sello.nombre,
                nivel: sello.nivel,
                nivelInfo: NIVEL_LABELS[sello.nivel as NivelSello],
                estado: sello.estado,
                puntuacionTotal: sello.puntuacionTotal,
                fechaSolicitud: sello.fechaSolicitud,
                fechaVencimientos: sello.fechaVencimientos,
                verificadorExterno: sello.verificadorExterno,
                badges: sello.badges,
                requisitosCount: sello.requisitos.length,
                requisitosCumplidos: sello.requisitos.filter(r => r.cumple === true).length,
                documentosCount: sello.documentos.length,
            }));

            return apiSuccess({
                items: response,
                total: response.length,
                niveles: NIVEL_LABELS,
                estados: {
                    PENDING: 'Pendiente',
                    IN_REVIEW: 'En Revisión',
                    APPROVED: 'Aprobado',
                    REJECTED: 'Rechazado',
                    EXPIRED: 'Vencido',
                    REVOKED: 'Revocado',
                },
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/sellos', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== POST /api/sellos ====================

export const POST = withApiRoute(
    { resource: 'sellos', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;
            const body = await req.json();

            const parsed = CreateSelloSchema.safeParse(body);
            if (!parsed.success) {
                return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
            }

            // Create entity to generate default requirements
            const entity = SelloConfianza.createWithDefaults(
                tenantId,
                parsed.data.clienteId,
                parsed.data.nombre,
                parsed.data.nivel as NivelSello
            );

            const snapshot = entity.toSnapshot();

            const sello = createSello({
                tenantId,
                clienteId: parsed.data.clienteId,
                nombre: parsed.data.nombre,
                descripcion: parsed.data.descripcion,
                nivel: parsed.data.nivel as NivelSello,
                fechaSolicitud: snapshot.fechaSolicitud,
                verificadorExterno: snapshot.verificadorExterno,
                verificacionCompletada: false,
                requisitos: snapshot.requisitos,
                documentos: [],
                badges: [],
                tags: [],
                historialCambios: [],
                creadoPorId: userId,
            });

            auditLogger.log({
                type: AuditEventType.DATA_CREATE,
                userId,
                metadata: { module: 'sellos', resourceId: sello.id, nivel: parsed.data.nivel },
            });

            return apiSuccess({
                id: sello.id,
                nombre: sello.nombre,
                nivel: sello.nivel,
                nivelInfo: NIVEL_LABELS[sello.nivel as NivelSello],
                estado: sello.estado,
                requisitosCount: sello.requisitos.length,
            }, 201) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error POST /api/sellos', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);