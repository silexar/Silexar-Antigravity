import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';

interface Programa {
    id: string;
    codigo: string;
    emiId: string;
    emiNombre: string;
    nombre: string;
    descripcion: string;
    horario: { horaInicio: string; horaFin: string; diasSemana: number[] };
    cupos: {
        tipoA: { total: number; ocupados: number; disponibles: number };
        tipoB: { total: number; ocupados: number; disponibles: number };
        menciones: { total: number; ocupados: number; disponibles: number };
    };
    conductores: Array<{ id: string; nombre: string; rol: string }>;
    estado: string;
    revenueActual: number;
    revenuePotencial: number;
    listaEsperaCount: number;
    disponibilidad: { totalCupos: number; totalOcupados: number; totalDisponibles: number; ocupacionPorcentaje: number };
    esPrime: boolean;
    tieneCuposDisponibles: boolean;
}

// In-memory store for programas (simula base de datos)
export let mockProgramas: Programa[] = [
    {
        id: 'prog-001',
        codigo: 'PROG-2026-001',
        emiId: 'emi-1',
        emiNombre: 'Radio Activa',
        nombre: 'Buenos Días Chile',
        descripcion: 'Programa matinal de noticias y entretenimiento',
        horario: { horaInicio: '07:00', horaFin: '09:00', diasSemana: [1, 2, 3, 4, 5] },
        cupos: {
            tipoA: { total: 10, ocupados: 3, disponibles: 7 },
            tipoB: { total: 20, ocupados: 8, disponibles: 12 },
            menciones: { total: 5, ocupados: 2, disponibles: 3 },
        },
        conductores: [
            { id: 'cond-1', nombre: 'Juan Pérez', rol: 'Conductor principal' },
            { id: 'cond-2', nombre: 'María López', rol: 'Co-conductor' },
        ],
        estado: 'ACTIVO',
        revenueActual: 1500000,
        revenuePotencial: 5000000,
        listaEsperaCount: 2,
        disponibilidad: { totalCupos: 35, totalOcupados: 13, totalDisponibles: 22, ocupacionPorcentaje: 37 },
        esPrime: true,
        tieneCuposDisponibles: true,
    },
    {
        id: 'prog-002',
        codigo: 'PROG-2026-002',
        emiId: 'emi-2',
        emiNombre: 'Radio Central',
        nombre: 'El Informativo',
        descripcion: 'Noticiero central de la mañana',
        horario: { horaInicio: '08:00', horaFin: '09:00', diasSemana: [1, 2, 3, 4, 5] },
        cupos: {
            tipoA: { total: 8, ocupados: 6, disponibles: 2 },
            tipoB: { total: 15, ocupados: 10, disponibles: 5 },
            menciones: { total: 3, ocupados: 3, disponibles: 0 },
        },
        conductores: [
            { id: 'cond-3', nombre: 'Carlos Gómez', rol: 'Conductor' },
        ],
        estado: 'ACTIVO',
        revenueActual: 2800000,
        revenuePotencial: 3200000,
        listaEsperaCount: 0,
        disponibilidad: { totalCupos: 26, totalOcupados: 19, totalDisponibles: 7, ocupacionPorcentaje: 73 },
        esPrime: false,
        tieneCuposDisponibles: true,
    },
];

function calcularMetricAS(programas: Programa[]) {
    const programasActivos = programas.filter(p => p.estado === 'ACTIVO').length;
    const totalCuposDisponibles = programas.reduce((sum, p) => sum + p.disponibilidad.totalDisponibles, 0);
    const ocupacionPromedio = programas.length > 0
        ? Math.round(programas.reduce((sum, p) => sum + p.disponibilidad.ocupacionPorcentaje, 0) / programas.length)
        : 0;

    return {
        totalProgramas: programas.length,
        programasActivos,
        totalCuposDisponibles,
        ocupacionPromedio,
    };
}

export const GET = withApiRoute(
    { action: 'read' },
    async (ctx: RouteContext) => {
        try {
            const req = ctx.req;
            const searchParams = req.nextUrl.searchParams;
            const emiId = searchParams.get('emisoraId');
            const estado = searchParams.get('estado');

            let filteredProgramas = [...mockProgramas];

            if (emiId) {
                filteredProgramas = filteredProgramas.filter(p => p.emiId === emiId);
            }

            if (estado) {
                filteredProgramas = filteredProgramas.filter(p => p.estado === estado);
            }

            const response = {
                success: true,
                data: filteredProgramas,
                metricas: calcularMetricAS(mockProgramas),
            };

            return NextResponse.json(response);
        } catch (error) {
            console.error('Error fetching programas:', error);
            return NextResponse.json(
                { success: false, error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);

export const POST = withApiRoute(
    { action: 'create' },
    async (ctx: RouteContext) => {
        try {
            const req = ctx.req;
            const body = await req.json();
            const {
                emiId,
                emiNombre,
                nombre,
                descripcion,
                estado,
                horarioInicio,
                horarioFin,
                diasSemana,
                cupos,
                conductores,
                vigenciaDesde,
                vigenciaHasta
            } = body;

            if (!nombre || !emiId) {
                return NextResponse.json(
                    { success: false, error: 'Faltan campos requeridos: nombre, emiId' },
                    { status: 400 }
                );
            }

            // Calcular cupos
            const tipoA = cupos?.find((c: any) => c.tipo === 'PREMIUM') || { total: 0, precioBase: 0 };
            const tipoB = cupos?.find((c: any) => c.tipo === 'STANDARD') || { total: 0, precioBase: 0 };
            const menciones = cupos?.find((c: any) => c.tipo === 'MENSAJE') || { total: 0, precioBase: 0 };

            const totalCupos = (tipoA.total || 0) + (tipoB.total || 0) + (menciones.total || 0);
            const revenuePotencial =
                ((tipoA.total || 0) * (tipoA.precioBase || 0)) +
                ((tipoB.total || 0) * (tipoB.precioBase || 0)) +
                ((menciones.total || 0) * (menciones.precioBase || 0));

            const newPrograma: Programa = {
                id: `prog-${Date.now()}`,
                codigo: `PROG-${new Date().getFullYear()}-${String(mockProgramas.length + 1).padStart(3, '0')}`,
                emiId,
                emiNombre: emiNombre || '',
                nombre,
                descripcion: descripcion || '',
                horario: {
                    horaInicio: horarioInicio || '06:00',
                    horaFin: horarioFin || '10:00',
                    diasSemana: diasSemana || [1, 2, 3, 4, 5],
                },
                cupos: {
                    tipoA: { total: tipoA.total || 0, ocupados: 0, disponibles: tipoA.total || 0 },
                    tipoB: { total: tipoB.total || 0, ocupados: 0, disponibles: tipoB.total || 0 },
                    menciones: { total: menciones.total || 0, ocupados: 0, disponibles: menciones.total || 0 },
                },
                conductores: conductores || [],
                estado: estado || 'BORRADOR',
                revenueActual: 0,
                revenuePotencial,
                listaEsperaCount: 0,
                disponibilidad: {
                    totalCupos,
                    totalOcupados: 0,
                    totalDisponibles: totalCupos,
                    ocupacionPorcentaje: 0,
                },
                esPrime: false,
                tieneCuposDisponibles: totalCupos > 0,
            };

            mockProgramas.push(newPrograma);

            return NextResponse.json({
                success: true,
                data: newPrograma,
                metricas: calcularMetricAS(mockProgramas),
            }, { status: 201 });
        } catch (error) {
            console.error('Error creating programa:', error);
            return NextResponse.json(
                { success: false, error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);
