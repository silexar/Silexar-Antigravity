/**
 * 📜 SILEXAR PULSE - API de Políticas de Negocio
 * 
 * @description API REST para CRUD de políticas de negocio
 * Incluye evaluación con Rule Engine
 * 
 * @version 2025.1.0
 * @tier TIER_CORE - DDD Completo
 * @phase FASE 2: Security + API
 * 
 * Endpoints:
 *   GET    /api/politicas              - Listar políticas
 *   POST   /api/politicas              - Crear política
 *   POST   /api/politicas/evaluar      - Evaluar políticas contra contexto
 *   GET    /api/politicas/categorias   - Obtener categorías disponibles
 *   GET    /api/politicas/operadores   - Obtener operadores disponibles
 *   GET    /api/politicas/acciones      - Obtener tipos de acción
 *   GET    /api/politicas/[id]         - Obtener política por ID
 *   PUT    /api/politicas/[id]         - Actualizar política
 *   DELETE /api/politicas/[id]         - Eliminar política
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PoliticaNegocio, CATEGORIAS_POLITICA, OPERADORES_DISPONIBLES, TIPOS_ACCION } from '@/modules/configuracion/domain/entities/PoliticaNegocio';
import { ruleEngine } from '@/modules/configuracion/application/RuleEngine';

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════

const CondicionSchema = z.object({
    campo: z.string().min(1),
    operador: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'starts_with', 'ends_with', 'in', 'not_in', 'between', 'is_null', 'is_not_null']),
    valor: z.union([z.string(), z.number(), z.boolean()]).optional(),
    valorFinal: z.union([z.string(), z.number()]).optional(),
});

const AccionAutomaticaSchema = z.object({
    tipo: z.enum(['notificar', 'aprobar', 'rechazar', 'asignar', 'actualizar', 'escalonar', 'generar_alerta', 'bloquear']),
    destino: z.string().optional(),
    plantilla: z.string().optional(),
    parametros: z.record(z.string(), z.unknown()).optional(),
});

const CreatePoliticaSchema = z.object({
    nombre: z.string().min(3).max(200),
    descripcion: z.string().max(1000).optional(),
    categoria: z.enum(['RIESGO', 'PRICING', 'WORKFLOW', 'RENOVACION', 'COMPLIANCE', 'GENERAL']),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).default('MEDIA'),
    condiciones: z.array(z.object({
        operadorLogico: z.enum(['AND', 'OR']).default('AND'),
        condiciones: z.array(CondicionSchema).min(1),
    })).min(1),
    acciones: z.array(AccionAutomaticaSchema).min(1),
    activa: z.boolean().default(true),
    fechaInicio: z.string().datetime().optional(),
    fechaFin: z.string().datetime().optional(),
    requiereAprobacion: z.boolean().default(false),
    aprobadorId: z.string().uuid().optional(),
    metadatos: z.record(z.string(), z.unknown()).optional(),
});

const UpdatePoliticaSchema = CreatePoliticaSchema.partial();

const EvaluarPoliticasSchema = z.object({
    datos: z.record(z.string(), z.unknown()),
    categorias: z.array(z.enum(['RIESGO', 'PRICING', 'WORKFLOW', 'RENOVACION', 'COMPLIANCE', 'GENERAL'])).optional(),
});

const FiltrosSchema = z.object({
    categoria: z.enum(['RIESGO', 'PRICING', 'WORKFLOW', 'RENOVACION', 'COMPLIANCE', 'GENERAL']).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
    activa: z.boolean().optional(),
    busqueda: z.string().max(100).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

// Almacenamiento en memoria para demo (en producción usar DB)
const politicasStore: Map<string, { politica: PoliticaNegocio; eliminado: boolean }> = new Map();

function generateId(): string {
    return crypto.randomUUID();
}

function logAudit(action: string, details: Record<string, unknown>) {
    console.log(`[AUDIT] ${action} - politicas`, details);
}

// ═══════════════════════════════════════════════════════════════════
// GET /api/politicas
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
        const tenantId = req.headers.get('x-silexar-tenant-id') || 'demo-tenant';
        const { searchParams } = new URL(req.url);

        // Endpoints específicos
        if (searchParams.get('categorias') === 'true') {
            return NextResponse.json({ success: true, data: CATEGORIAS_POLITICA });
        }
        if (searchParams.get('operadores') === 'true') {
            return NextResponse.json({ success: true, data: OPERADORES_DISPONIBLES });
        }
        if (searchParams.get('acciones') === 'true') {
            return NextResponse.json({ success: true, data: TIPOS_ACCION });
        }
        if (searchParams.get('metricas') === 'true') {
            return NextResponse.json({ success: true, data: ruleEngine.getMetricas() });
        }

        const filtros = FiltrosSchema.parse({
            categoria: searchParams.get('categoria') || undefined,
            prioridad: searchParams.get('prioridad') || undefined,
            activa: searchParams.get('activa') !== null ? searchParams.get('activa') === 'true' : undefined,
            busqueda: searchParams.get('busqueda') || undefined,
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20',
        });

        // Obtener políticas del tenant
        let politicas = Array.from(politicasStore.values())
            .filter(p => !p.eliminado && p.politica.tenantId === tenantId)
            .map(p => p.politica.toSnapshot());

        // Aplicar filtros
        if (filtros.categoria) {
            politicas = politicas.filter(p => p.categoria === filtros.categoria);
        }
        if (filtros.prioridad) {
            politicas = politicas.filter(p => p.prioridad === filtros.prioridad);
        }
        if (filtros.activa !== undefined) {
            politicas = politicas.filter(p => p.activa === filtros.activa);
        }
        if (filtros.busqueda) {
            const termino = filtros.busqueda.toLowerCase();
            politicas = politicas.filter(p =>
                p.nombre.toLowerCase().includes(termino) ||
                (p.descripcion || '').toLowerCase().includes(termino)
            );
        }

        // Paginación
        const total = politicas.length;
        const totalPages = Math.ceil(total / filtros.limit);
        const offset = (filtros.page - 1) * filtros.limit;
        const paginadas = politicas.slice(offset, offset + filtros.limit);

        logAudit('LIST', { tenantId, filtros, resultCount: paginadas.length, userId });

        return NextResponse.json({
            success: true,
            data: {
                politicas: paginadas,
                pagination: { page: filtros.page, limit: filtros.limit, total, totalPages },
                categoriasDisponibles: CATEGORIAS_POLITICA,
                operadoresDisponibles: OPERADORES_DISPONIBLES,
                accionesDisponibles: TIPOS_ACCION,
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al obtener políticas' } }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════════════
// POST /api/politicas
// ═══════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
        const tenantId = req.headers.get('x-silexar-tenant-id') || 'demo-tenant';

        const body = await req.json();

        // Verificar si es evaluación
        if (body.evaluar) {
            const data = EvaluarPoliticasSchema.parse(body);

            const contexto = {
                tenantId,
                usuarioId: userId,
                datos: data.datos,
            };

            let resultados = ruleEngine.evaluar(contexto);

            // Filtrar por categorías si se especifica
            if (data.categorias && data.categorias.length > 0) {
                resultados = resultados.filter(r => data.categorias!.includes(r.categoria as any));
            }

            logAudit('EVALUATE', { tenantId, categorias: data.categorias, resultCount: resultados.length, userId });

            return NextResponse.json({
                success: true,
                data: {
                    resultados,
                    totalEvaluadas: resultados.length,
                    aplicables: resultados.filter(r => r.cumplo).length,
                    noAplicables: resultados.filter(r => !r.cumplo).length,
                }
            });
        }

        // Crear política
        const data = CreatePoliticaSchema.parse(body);

        const politica = PoliticaNegocio.create({
            tenantId,
            nombre: data.nombre,
            descripcion: data.descripcion,
            categoria: data.categoria,
            prioridad: data.prioridad,
            condiciones: data.condiciones,
            acciones: data.acciones,
            activa: data.activa,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            requiereAprobacion: data.requiereAprobacion,
            aprobadorId: data.aprobadorId,
            metadatos: data.metadatos,
            createdBy: userId,
        });

        politicasStore.set(politica.id, { politica, eliminado: false });

        // Cargar en rule engine
        ruleEngine.agregarPolitica(politica);

        logAudit('CREATE', { tenantId, politicaId: politica.id, nombre: data.nombre, userId });

        return NextResponse.json({ success: true, data: politica.toSnapshot() }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al crear política' } }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════════════
// PUT /api/politicas - Batch create
// ═══════════════════════════════════════════════════════════════════

export async function PUT(req: NextRequest) {
    try {
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
        const tenantId = req.headers.get('x-silexar-tenant-id') || 'demo-tenant';

        const body = await req.json();

        // Soporte para bulk create
        if (Array.isArray(body.politicas)) {
            const creadas: ReturnType<PoliticaNegocio['toSnapshot']>[] = [];

            for (const data of body.politicas) {
                const parsed = CreatePoliticaSchema.parse(data);
                const politica = PoliticaNegocio.create({
                    tenantId,
                    nombre: parsed.nombre,
                    descripcion: parsed.descripcion,
                    categoria: parsed.categoria,
                    prioridad: parsed.prioridad,
                    condiciones: parsed.condiciones,
                    acciones: parsed.acciones,
                    activa: parsed.activa,
                    fechaInicio: parsed.fechaInicio,
                    fechaFin: parsed.fechaFin,
                    requiereAprobacion: parsed.requiereAprobacion,
                    aprobadorId: parsed.aprobadorId,
                    metadatos: parsed.metadatos,
                    createdBy: userId,
                });

                politicasStore.set(politica.id, { politica, eliminado: false });
                ruleEngine.agregarPolitica(politica);
                creadas.push(politica.toSnapshot());
            }

            logAudit('BULK_CREATE', { tenantId, count: creadas.length, userId });

            return NextResponse.json({ success: true, data: { creadas, total: creadas.length } }, { status: 201 });
        }

        return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Se esperaba array de políticas' } }, { status: 400 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error en bulk create' } }, { status: 500 });
    }
}