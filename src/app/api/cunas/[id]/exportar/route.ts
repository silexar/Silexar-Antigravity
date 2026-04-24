/**
 * POST /api/cunas/[id]/exportar - Exporta una cuña a sistemas de emisión
 * GET /api/cunas/[id]/exportar - Historial de exportaciones
 * 
 * Sistemas de emisión soportados:
 * - wideorbit: WideOrbit Radio Automation
 * - sara: Sara Radio Automation
 * - dalet: Dalet Radio Galaxy
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { cunas } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { withApiRoute } from '@/lib/api/with-api-route';
import { wideOrbitExportService, WideOrbitStationConfig, CunaExportData } from '@/modules/cunas/infrastructure/external/WideOrbitExportService';
import { SaraExportService } from '@/modules/cunas/infrastructure/external/SaraExportService';
import { DaletExportService } from '@/modules/cunas/infrastructure/external/DaletExportService';

export interface ExportarRequest {
    sistema: 'wideorbit' | 'sara' | 'dalet';
    estacionId: string;
    opciones?: {
        startDate?: string;
        endDate?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        dayparts?: Array<{
            daysOfWeek: number[];
            startTime: string;
            endTime: string;
        }>;
    };
}

export interface ExportarResultado {
    success: boolean;
    cunaId: string;
    sistema: string;
    cartNumber?: string;
    reference: string;
    errors: string[];
    warnings: string[];
    timestamp: Date;
}

export const POST = withApiRoute(
    { resource: 'cunas', action: 'update' },
    async ({ ctx, req }: { ctx: { tenantId: string; userId: string }; req: NextRequest }) => {
        try {
            const db = getDB();
            const tenantId = ctx.tenantId;

            // Extraer ID de la cuña de la URL
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const cunaId = pathParts[pathParts.indexOf('cunas') + 1];

            // Obtener la cuña
            const [cuna] = await db
                .select()
                .from(cunas)
                .where(and(eq(cunas.id, cunaId), eq(cunas.tenantId, tenantId)))
                .limit(1);

            if (!cuna) {
                return NextResponse.json(
                    { success: false, error: 'Cuña no encontrada' },
                    { status: 404 }
                );
            }

            // Obtener cuerpo de la solicitud
            const body: ExportarRequest = await req.json();
            const { sistema, estacionId, opciones } = body;

            if (!sistema || !estacionId) {
                return NextResponse.json(
                    { success: false, error: 'Sistema y estación son requeridos' },
                    { status: 400 }
                );
            }

            // Preparar datos de exportación
            const cunaExportData: CunaExportData = {
                id: cuna.id,
                nombre: cuna.nombre,
                tipo: cuna.tipoCuna || 'spot',
                estado: cuna.estado,
                duracion: cuna.duracionSegundos ? { getSegundos: () => cuna.duracionSegundos! } : undefined,
                pathAudio: cuna.pathAudio || undefined,
                anuncianteNombre: (cuna as Record<string, unknown>).anuncianteNombre as string || 'Unknown',
            };

            // Configuración de estación (en producción vendría de tabla de configuraciones)
            const stationConfig: WideOrbitStationConfig = {
                stationId: estacionId,
                stationName: `Estación ${estacionId}`,
                broadcastSystem: 'wideorbit',
                apiEndpoint: '', // Vacío para modo simulación
                apiKey: '',
                defaultPriority: 'normal',
            };

            let resultado: ExportarResultado;

            switch (sistema) {
                case 'wideorbit':
                    resultado = await exportarWideOrbit(cunaExportData, stationConfig, opciones);
                    break;

                case 'sara':
                    resultado = await exportarSara(cunaExportData, estacionId, opciones);
                    break;

                case 'dalet':
                    resultado = await exportarDalet(cunaExportData, estacionId, opciones);
                    break;

                default:
                    return NextResponse.json(
                        { success: false, error: `Sistema no soportado: ${sistema}` },
                        { status: 400 }
                    );
            }

            return NextResponse.json({
                success: true,
                data: resultado,
            });
        } catch (error) {
            console.error('[API/Cunas/Exportar] Error:', error);
            return NextResponse.json(
                { success: false, error: 'Error al exportar cuña' },
                { status: 500 }
            );
        }
    }
);

export const GET = withApiRoute(
    { resource: 'cunas', action: 'read', skipCsrf: true },
    async ({ ctx, req }: { ctx: { tenantId: string; userId: string }; req: NextRequest }) => {
        try {
            const db = getDB();
            const tenantId = ctx.tenantId;

            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const cunaId = pathParts[pathParts.indexOf('cunas') + 1];

            // En producción, buscar historial de exportaciones en tabla especializada
            // Por ahora retornamos información de la cuña

            const [cuna] = await db
                .select()
                .from(cunas)
                .where(and(eq(cunas.id, cunaId), eq(cunas.tenantId, tenantId)))
                .limit(1);

            if (!cuna) {
                return NextResponse.json(
                    { success: false, error: 'Cuña no encontrada' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: {
                    cunaId: cuna.id,
                    codigo: cuna.codigo,
                    nombre: cuna.nombre,
                    estado: cuna.estado,
                    exportada: (cuna as Record<string, unknown>).exportada ?? false,
                    ultimaExportacion: (cuna as Record<string, unknown>).ultimaExportacion,
                    sistemasExportacion: (cuna as Record<string, unknown>).sistemasExportacion || [],
                },
            });
        } catch (error) {
            console.error('[API/Cunas/Exportar] Error GET:', error);
            return NextResponse.json(
                { success: false, error: 'Error al obtener información de exportación' },
                { status: 500 }
            );
        }
    }
);

// Funciones auxiliares de exportación

async function exportarWideOrbit(
    cuna: CunaExportData,
    stationConfig: WideOrbitStationConfig,
    opciones?: ExportarRequest['opciones']
): Promise<ExportarResultado> {
    const result = await wideOrbitExportService.exportCuna(cuna, stationConfig, {
        startDate: opciones?.startDate ? new Date(opciones.startDate) : undefined,
        endDate: opciones?.endDate ? new Date(opciones.endDate) : undefined,
        priority: opciones?.priority,
        dayparts: opciones?.dayparts,
    });

    if (result.success) {
        return {
            success: result.data.success,
            cunaId: cuna.id,
            sistema: 'wideorbit',
            cartNumber: result.data.cartNumber,
            reference: result.data.reference,
            errors: result.data.errors,
            warnings: result.data.warnings,
            timestamp: new Date(),
        };
    } else {
        return {
            success: false,
            cunaId: cuna.id,
            sistema: 'wideorbit',
            reference: '',
            errors: [result.error as string],
            warnings: [],
            timestamp: new Date(),
        };
    }
}

async function exportarSara(
    cuna: CunaExportData,
    estacionId: string,
    opciones?: ExportarRequest['opciones']
): Promise<ExportarResultado> {
    const saraService = new SaraExportService();

    const startDate = opciones?.startDate ? new Date(opciones.startDate) : undefined;
    const endDate = opciones?.endDate ? new Date(opciones.endDate) : undefined;

    const result = await saraService.exportCuna(cuna, {
        stationId: estacionId,
        stationName: `Estación ${estacionId}`,
        broadcastSystem: 'sara',
        apiEndpoint: '',
        apiKey: '',
    }, {
        startDate,
        endDate,
    });

    if (result.success) {
        return {
            success: true,
            cunaId: cuna.id,
            sistema: 'sara',
            reference: result.data.reference,
            errors: [],
            warnings: result.data.warnings,
            timestamp: new Date(),
        };
    } else {
        return {
            success: false,
            cunaId: cuna.id,
            sistema: 'sara',
            reference: '',
            errors: [result.error as string],
            warnings: [],
            timestamp: new Date(),
        };
    }
}

async function exportarDalet(
    cuna: CunaExportData,
    estacionId: string,
    opciones?: ExportarRequest['opciones']
): Promise<ExportarResultado> {
    const daletService = new DaletExportService();

    const startDate = opciones?.startDate ? new Date(opciones.startDate) : undefined;
    const endDate = opciones?.endDate ? new Date(opciones.endDate) : undefined;

    const result = await daletService.exportCuna(cuna, {
        stationId: estacionId,
        stationName: `Estación ${estacionId}`,
        broadcastSystem: 'dalet',
        apiEndpoint: '',
        apiKey: '',
    }, {
        startDate,
        endDate,
    });

    if (result.success) {
        return {
            success: true,
            cunaId: cuna.id,
            sistema: 'dalet',
            reference: result.data.reference,
            errors: [],
            warnings: result.data.warnings,
            timestamp: new Date(),
        };
    } else {
        return {
            success: false,
            cunaId: cuna.id,
            sistema: 'dalet',
            reference: '',
            errors: [result.error as string],
            warnings: [],
            timestamp: new Date(),
        };
    }
}
