import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';

export const GET = withApiRoute(
    { action: 'read' },
    async (ctx: RouteContext) => {
        try {
            const req = ctx.req;
            const programaId = ctx.params?.id;

            if (!programaId) {
                return NextResponse.json(
                    { error: 'ID de programa es requerido' },
                    { status: 400 }
                );
            }

            const programa = {
                id: programaId,
                nombre: 'Programa Mock',
                seal: 'SEÑAL-01',
                horario: '07:00 - 09:00',
                duracion: 120,
                diasSemana: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
                estado: 'activo',
                cups: [
                    { id: 'cup-001', hora: '07:30', disponible: true },
                    { id: 'cup-002', hora: '08:00', disponible: false },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            return NextResponse.json(programa);
        } catch (error) {
            console.error('Error fetching programa:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);

export const PATCH = withApiRoute(
    { action: 'update' },
    async (ctx: RouteContext) => {
        try {
            const req = ctx.req;
            const programaId = ctx.params?.id;

            if (!programaId) {
                return NextResponse.json(
                    { error: 'ID de programa es requerido' },
                    { status: 400 }
                );
            }

            const body = await req.json();
            const { nombre, seal, horario, duracion, diasSemana, estado } = body;

            const updatedPrograma = {
                id: programaId,
                nombre: nombre || 'Programa Mock',
                seal: seal || 'SEÑAL-01',
                horario: horario || '07:00 - 09:00',
                duracion: duracion || 120,
                diasSemana: diasSemana || ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
                estado: estado || 'activo',
                updatedAt: new Date().toISOString(),
            };

            return NextResponse.json(updatedPrograma);
        } catch (error) {
            console.error('Error updating programa:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);

export const DELETE = withApiRoute(
    { action: 'delete' },
    async (ctx: RouteContext) => {
        try {
            const programaId = ctx.params?.id;

            if (!programaId) {
                return NextResponse.json(
                    { error: 'ID de programa es requerido' },
                    { status: 400 }
                );
            }

            return NextResponse.json({ success: true, id: programaId });
        } catch (error) {
            console.error('Error deleting programa:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            );
        }
    }
);