/**
 * POST /api/registro-emision/evidence-basket
 * Guarda items en la cesta de evidencia del frontend via postMessage.
 * El frontend se encarga de persistir en localStorage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';

interface BasketItem {
    id: string;
    tipo: string;
    nombre: string;
    codigo: string;
    fecha: string;
    hora: string;
    duracion: number;
    url?: string;
    addDate: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, items } = body;

        if (action === 'add' && items?.length) {
            // En producción, esto podría guardarse en la base de datos
            // Por ahora, el frontend maneja la persistencia con localStorage
            logger.info('[API/RegistroEmision/EvidenceBasket] Adding items:', { count: items.length });

            return NextResponse.json({
                success: true,
                data: {
                    addedCount: items.length,
                    message: 'Items agregados a la cesta de evidencia',
                },
            });
        }

        if (action === 'get') {
            // El frontend maneja esto con localStorage directamente
            return NextResponse.json({
                success: true,
                data: {
                    message: 'Usa localStorage directamente para obtener los items',
                },
            });
        }

        return NextResponse.json(
            { error: 'Acción no válida' },
            { status: 400 }
        );
    } catch (error) {
        logger.error('[API/RegistroEmision/EvidenceBasket] Error:', error instanceof Error ? error : undefined);
        return NextResponse.json(
            { error: 'Error interno' },
            { status: 500 }
        );
    }
}