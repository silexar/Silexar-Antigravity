import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';

interface SearchResult {
    id: string;
    tipo: 'programa' | 'cupo' | 'emisora';
    nombre: string;
    descripcion: string;
    metadata: Record<string, any>;
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
    { action: 'read' },
    async (ctx: RouteContext) => {
        try {
            const req = ctx.req;
            const searchParams = req.nextUrl.searchParams;
            const query = searchParams.get('q');
            const tipo = searchParams.get('tipo');

            if (!query || query.length < 2) {
                return NextResponse.json(
                    { error: 'Query debe tener al menos 2 caracteres' },
                    { status: 400 }
                );
            }

            let results = mockResults.filter(r =>
                r.nombre.toLowerCase().includes(query.toLowerCase()) ||
                r.descripcion.toLowerCase().includes(query.toLowerCase())
            );

            if (tipo) {
                results = results.filter(r => r.tipo === tipo);
            }

            return NextResponse.json({
                results,
                total: results.length,
                query,
            });
        } catch (error) {
            console.error('Error en búsqueda:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);