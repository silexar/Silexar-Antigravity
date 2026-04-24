import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';

interface AnalyticsData {
    totalProgramas: number;
    programasActivos: number;
    cuposDisponibles: number;
    cuposOcupados: number;
    revenueTotal: number;
    ocupacionPromedio: number;
    porEmisora: Array<{
        seal: string;
        programas: number;
        ocupacion: number;
        revenue: number;
    }>;
    topProgramas: Array<{
        id: string;
        nombre: string;
        ocupacion: number;
        revenue: number;
    }>;
}

export const GET = withApiRoute(
    { action: 'read' },
    async (ctx: RouteContext) => {
        try {
            const analytics: AnalyticsData = {
                totalProgramas: 45,
                programasActivos: 38,
                cuposDisponibles: 156,
                cuposOcupados: 89,
                revenueTotal: 45600000,
                ocupacionPromedio: 67.5,
                porEmisora: [
                    { seal: 'SEÑAL-01', programas: 20, ocupacion: 72.5, revenue: 25000000 },
                    { seal: 'SEÑAL-02', programas: 15, ocupacion: 65.0, revenue: 18000000 },
                    { seal: 'SEÑAL-03', programas: 10, ocupacion: 58.3, revenue: 2600000 },
                ],
                topProgramas: [
                    { id: 'prog-001', nombre: 'Buenos Días Chile', ocupacion: 95.0, revenue: 12000000 },
                    { id: 'prog-002', nombre: 'El Informativo', ocupacion: 88.5, revenue: 8500000 },
                    { id: 'prog-003', nombre: 'Sabados Dominicales', ocupacion: 92.0, revenue: 7800000 },
                ],
            };

            return NextResponse.json(analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);