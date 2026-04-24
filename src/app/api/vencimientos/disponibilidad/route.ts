import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';

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
    { action: 'read' },
    async (ctx: RouteContext) => {
        try {
            const req = ctx.req;
            const searchParams = req.nextUrl.searchParams;
            const programaId = searchParams.get('programaId');
            const fecha = searchParams.get('fecha');
            const disponible = searchParams.get('disponible');

            let filteredCupos = [...mockCupos];

            if (programaId) {
                filteredCupos = filteredCupos.filter(c => c.programaId === programaId);
            }

            if (fecha) {
                filteredCupos = filteredCupos.filter(c => c.fecha === fecha);
            }

            if (disponible === 'true') {
                filteredCupos = filteredCupos.filter(c => c.disponible);
            }

            return NextResponse.json({
                cupos: filteredCupos,
                total: filteredCupos.length,
            });
        } catch (error) {
            console.error('Error fetching disponibilidad:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);