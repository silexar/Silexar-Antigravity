/**
 * GET /api/registro-emision/secure-link/[codigo]
 * Valida un link seguro usando el código de 6 caracteres.
 * Esta ruta es pública (no requiere autenticación).
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';

// Mock database (en producción sería Drizzle + PostgreSQL)
const linksStore = new Map<string, {
    id: string;
    codigo: string;
    materialId: string;
    materialNombre: string;
    tipoMaterial: string;
    codigoAcceso: string;
    clipUrl?: string;
    archivoUrl?: string;
    anunciante?: string;
    campana?: string;
    emisora?: string;
    fecha?: string;
    hora?: string;
    duracion?: number;
    estado: 'activo' | 'usado' | 'expirado' | 'revocado';
    requireCode: boolean;
    fechaExpiracion: string;
    maxAccessCount: number;
    accessCount: number;
}>();

// Inicializar con datos de prueba
const testLink = {
    id: '1',
    codigo: 'ABC123',
    materialId: 'material-001',
    materialNombre: 'Cuña Patagonia - Abril 2024',
    tipoMaterial: 'audio_pregrabado',
    codigoAcceso: 'ABC123',
    clipUrl: '/audio-demo.mp3',
    archivoUrl: '/audio-demo.mp3',
    anunciante: 'Patagonia Publicidad',
    campana: 'Campaña Verano 2024',
    广播电台: 'Radio active',
    fecha: '2024-04-15',
    hora: '08:30:00',
    duracion: 45,
    estado: 'activo' as const,
    requireCode: false,
    fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    maxAccessCount: 0,
    accessCount: 0,
};
linksStore.set('ABC123', testLink);

function isExpired(fechaExpiracion: string): boolean {
    return new Date(fechaExpiracion) < new Date();
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ codigo: string }> }
) {
    try {
        const { codigo } = await params;

        if (!codigo || codigo.length !== 6) {
            return NextResponse.json(
                { error: 'Código inválido' },
                { status: 400 }
            );
        }

        // Buscar link por código
        const link = linksStore.get(codigo.toUpperCase());

        if (!link) {
            return NextResponse.json(
                { error: 'Este link ha expirado o no existe' },
                { status: 404 }
            );
        }

        // Verificar expiración
        if (isExpired(link.fechaExpiracion)) {
            return NextResponse.json(
                { error: 'Este link ha expirado', expiredAt: link.fechaExpiracion },
                { status: 410 }
            );
        }

        // Verificar estado
        if (link.estado === 'revocado') {
            return NextResponse.json(
                { error: 'Este link ha sido revocado' },
                { status: 403 }
            );
        }

        // Incrementar contador de accesos
        link.accessCount++;

        // Devolver datos del material
        return NextResponse.json({
            success: true,
            data: {
                id: link.id,
                codigo: link.codigo,
                materialId: link.materialId,
                nombreMaterial: link.materialNombre,
                tipoMaterial: link.tipoMaterial,
                codigoAcceso: link.requireCode ? link.codigoAcceso : null,
                requireCode: link.requireCode,
                clipUrl: link.clipUrl,
                archivoUrl: link.archivoUrl,
                anunciante: link.anunciante,
                campana: link.campana,
                emisora: link.emisora,
                fecha: link.fecha,
                hora: link.hora,
                duracion: link.duracion,
                expiresAt: link.fechaExpiracion,
            },
        });
    } catch (error) {
        logger.error('[API/RegistroEmision/SecureLink/Code] Error:', error instanceof Error ? error : undefined);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}