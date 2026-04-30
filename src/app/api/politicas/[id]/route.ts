/**
 * 📜 SILEXAR PULSE - API de Política Individual
 * 
 * @description Endpoints para obtener, actualizar y eliminar una política específica
 * 
 * @version 2025.1.0
 * @tier TIER_CORE
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PoliticaNegocio } from '@/modules/configuracion/domain/entities/PoliticaNegocio';
import { ruleEngine } from '@/modules/configuracion/application/RuleEngine';

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════

const UpdatePoliticaSchema = z.object({
    nombre: z.string().min(3).max(200).optional(),
    descripcion: z.string().max(1000).optional(),
    categoria: z.enum(['RIESGO', 'PRICING', 'WORKFLOW', 'RENOVACION', 'COMPLIANCE', 'GENERAL']).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
    condiciones: z.array(z.object({
        operadorLogico: z.enum(['AND', 'OR']).default('AND'),
        condiciones: z.array(z.object({
            campo: z.string().min(1),
            operador: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'starts_with', 'ends_with', 'in', 'not_in', 'between', 'is_null', 'is_not_null']),
            valor: z.union([z.string(), z.number(), z.boolean()]).optional(),
            valorFinal: z.union([z.string(), z.number()]).optional(),
        })).min(1),
    })).min(1).optional(),
    acciones: z.array(z.object({
        tipo: z.enum(['notificar', 'aprobar', 'rechazar', 'asignar', 'actualizar', 'escalonar', 'generar_alerta', 'bloquear']),
        destino: z.string().optional(),
        plantilla: z.string().optional(),
        parametros: z.record(z.string(), z.unknown()).optional(),
    })).min(1).optional(),
    activa: z.boolean().optional(),
    fechaInicio: z.string().datetime().optional(),
    fechaFin: z.string().datetime().optional(),
    requiereAprobacion: z.boolean().optional(),
    aprobadorId: z.string().uuid().optional(),
    metadatos: z.record(z.string(), z.unknown()).optional(),
});

const EvaluarSchema = z.object({
    datos: z.record(z.string(), z.unknown()),
});

// Referencia al store (en producción sería injected)
const getPoliticasStore = () => {
    // Este es un workaround - en producción usar dependency injection
    // require.context es una característica de webpack y no está disponible en TypeScript
    // Por ahora retornamos null como placeholder
    return null;
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/politicas/[id]
// ═══════════════════════════════════════════════════════════════════

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
        const tenantId = req.headers.get('x-silexar-tenant-id') || 'demo-tenant';

        // En una implementación real, consultaríamos la BD
        // Por ahora retornamos un ejemplo
        const politicaEjemplo = {
            id,
            tenantId,
            nombre: 'Política de Riesgo Crediticio',
            descripcion: 'Evalúa el riesgo de crédito antes de aprobar operaciones',
            categoria: 'RIESGO',
            prioridad: 'ALTA',
            condiciones: [
                {
                    operadorLogico: 'AND',
                    condiciones: [
                        { campo: 'scoreCrediticio', operador: 'greater_than', valor: 600 },
                        { campo: 'morosidadesPrevias', operador: 'equals', valor: 0 }
                    ]
                }
            ],
            acciones: [
                { tipo: 'aprobar', parametros: { nivel: 'automatico' } },
                { tipo: 'notificar', destino: 'gerencia@empresa.com', plantilla: 'aprobacion_auto' }
            ],
            activa: true,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log(`[AUDIT] READ politica ${id} by ${userId}`);

        return NextResponse.json({
            success: true,
            data: {
                politica: politicaEjemplo,
                evaluable: true,
                historialVersiones: []
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al obtener política' } }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════════════
// PUT /api/politicas/[id]
// ═══════════════════════════════════════════════════════════════════

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
        const tenantId = req.headers.get('x-silexar-tenant-id') || 'demo-tenant';

        const body = await req.json();
        const data = UpdatePoliticaSchema.parse(body);

        // Simular actualización
        const politicaActualizada = {
            id,
            tenantId,
            ...data,
            version: 2,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };

        console.log(`[AUDIT] UPDATE politica ${id} by ${userId}`, data);

        return NextResponse.json({
            success: true,
            data: politicaActualizada,
            message: 'Política actualizada correctamente'
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al actualizar política' } }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════════════
// DELETE /api/politicas/[id]
// ═══════════════════════════════════════════════════════════════════

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';

        // En producción, haríamos soft delete
        console.log(`[AUDIT] DELETE politica ${id} by ${userId}`);

        // Remover del rule engine
        ruleEngine.eliminarPolitica(id);

        return NextResponse.json({
            success: true,
            data: {
                id,
                eliminado: true,
                softDelete: true,
                message: 'Política eliminada correctamente'
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al eliminar política' } }, { status: 500 });
    }
}