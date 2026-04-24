/**
 * 🎨 SILEXAR PULSE - API Routes Agencias Creativas [ID]
 * 
 * @description API REST para operaciones sobre una agencia específica
 * 
 * @version 2025.1.1
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError, apiNotFound, apiValidationError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AgenciaCreativa {
    id: string;
    codigo: string;
    rut: string;
    razonSocial: string;
    nombreFantasia: string;
    tipoAgencia: string;
    porcentajeComision: number;
    emailGeneral: string;
    telefonoGeneral: string;
    paginaWeb: string;
    direccion: string;
    ciudad: string;
    nombreContacto: string;
    cargoContacto: string;
    emailContacto: string;
    telefonoContacto: string;
    estado: string;
    activa: boolean;
    campañasActivas: number;
    facturacionMensual: number;
    scoreRendimiento: number;
    clientesGestionados: number;
    fechaCreacion: string;
    tenantId: string;
}

// Mock data local para esta ruta
const mockAgencias: AgenciaCreativa[] = [
    {
        id: 'agc-001',
        codigo: 'AGC-001',
        rut: '76.111.222-3',
        razonSocial: 'Creativos Asociados Ltda',
        nombreFantasia: 'BlueWave Creative',
        tipoAgencia: 'digital',
        porcentajeComision: 15,
        emailGeneral: 'contacto@bluewave.cl',
        telefonoGeneral: '+56 2 2345 6789',
        paginaWeb: 'www.bluewave.cl',
        direccion: 'Av. Providencia 1234',
        ciudad: 'Santiago',
        nombreContacto: 'Claudia Vera',
        cargoContacto: 'Directora de Cuentas',
        emailContacto: 'cvera@bluewave.cl',
        telefonoContacto: '+56 9 1234 5678',
        estado: 'activa',
        activa: true,
        campañasActivas: 12,
        facturacionMensual: 45000000,
        scoreRendimiento: 92,
        clientesGestionados: 8,
        fechaCreacion: '2023-03-15',
        tenantId: 'tenant-001'
    },
    {
        id: 'agc-002',
        codigo: 'AGC-002',
        rut: '76.222.333-4',
        razonSocial: 'MediaPlan SpA',
        nombreFantasia: 'MediaPlan Agency',
        tipoAgencia: 'broadcast',
        porcentajeComision: 12,
        emailGeneral: 'info@mediaplan.cl',
        telefonoGeneral: '+56 2 3456 7890',
        paginaWeb: 'www.mediaplan.cl',
        direccion: 'Av. Apoquindo 4500',
        ciudad: 'Santiago',
        nombreContacto: 'Roberto Sánchez',
        cargoContacto: 'Gerente Comercial',
        emailContacto: 'rsanchez@mediaplan.cl',
        telefonoContacto: '+56 9 2345 6789',
        estado: 'activa',
        activa: true,
        campañasActivas: 8,
        facturacionMensual: 32000000,
        scoreRendimiento: 88,
        clientesGestionados: 5,
        fechaCreacion: '2023-06-20',
        tenantId: 'tenant-001'
    }
];

// ═══════════════════════════════════════════════════════════════
// GET - Obtener agencia por ID
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'anunciantes', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        try {
            return await withTenantContext(ctx.tenantId, async () => {
                const { searchParams } = new URL(req.url);
                const id = searchParams.get('id');

                if (!id) {
                    return apiValidationError('ID requerido');
                }

                const agencia = mockAgencias.find((a: AgenciaCreativa) => a.id === id);

                if (!agencia) {
                    return apiNotFound('Agencia no encontrada');
                }

                return NextResponse.json({
                    success: true,
                    data: agencia,
                });
            });
        } catch (error) {
            logger.error('[API/AgenciasCreativas/GET] Error:', error instanceof Error ? error : undefined, {
                module: 'agencias-creativas',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError();
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// PUT - Actualizar agencia
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
    { resource: 'anunciantes', action: 'update' },
    async ({ ctx, req }) => {
        try {
            return await withTenantContext(ctx.tenantId, async () => {
                const body = await req.json();
                const { id } = body;

                if (!id) {
                    return apiValidationError('ID requerido');
                }

                const index = mockAgencias.findIndex((a: AgenciaCreativa) => a.id === id);

                if (index === -1) {
                    return apiNotFound('Agencia no encontrada');
                }

                // Update fields
                const agencia = mockAgencias[index];
                if (body.razonSocial) agencia.razonSocial = body.razonSocial;
                if (body.nombreFantasia !== undefined) agencia.nombreFantasia = body.nombreFantasia;
                if (body.tipoAgencia) agencia.tipoAgencia = body.tipoAgencia;
                if (body.porcentajeComision !== undefined) agencia.porcentajeComision = body.porcentajeComision;
                if (body.emailGeneral !== undefined) agencia.emailGeneral = body.emailGeneral;
                if (body.telefonoGeneral !== undefined) agencia.telefonoGeneral = body.telefonoGeneral;
                if (body.paginaWeb !== undefined) agencia.paginaWeb = body.paginaWeb;
                if (body.nombreContacto !== undefined) agencia.nombreContacto = body.nombreContacto;
                if (body.emailContacto !== undefined) agencia.emailContacto = body.emailContacto;
                if (body.telefonoContacto !== undefined) agencia.telefonoContacto = body.telefonoContacto;
                if (body.direccion !== undefined) agencia.direccion = body.direccion;
                if (body.ciudad !== undefined) agencia.ciudad = body.ciudad;
                if (typeof body.activa === 'boolean') {
                    agencia.activa = body.activa;
                    agencia.estado = body.activa ? 'activa' : 'inactiva';
                }

                return apiSuccess({ agencia });
            });
        } catch (error) {
            logger.error('[API/AgenciasCreativas/PUT] Error:', error instanceof Error ? error : undefined, {
                module: 'agencias-creativas',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError();
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// DELETE - Eliminar agencia
// ═══════════════════════════════════════════════════════════════

export const DELETE = withApiRoute(
    { resource: 'anunciantes', action: 'delete' },
    async ({ ctx, req }) => {
        try {
            return await withTenantContext(ctx.tenantId, async () => {
                const { searchParams } = new URL(req.url);
                const id = searchParams.get('id');

                if (!id) {
                    return apiValidationError('ID requerido');
                }

                const index = mockAgencias.findIndex((a: AgenciaCreativa) => a.id === id);

                if (index === -1) {
                    return apiNotFound('Agencia no encontrada');
                }

                // Remove from array
                mockAgencias.splice(index, 1);

                return apiSuccess({ deleted: true });
            });
        } catch (error) {
            logger.error('[API/AgenciasCreativas/DELETE] Error:', error instanceof Error ? error : undefined, {
                module: 'agencias-creativas',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError();
        }
    }
);
