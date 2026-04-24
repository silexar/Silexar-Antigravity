/**
 * GET /api/registro-emision/autocomplete/contratos
 * API simplificada para obtener contratos por anunciante y año.
 */

import { NextRequest, NextResponse } from 'next/server';

// Contratos mock por anunciante - coherente con los anunciantes
const mockContratos: Record<string, { id: string; nombre: string; numero: string; estado: string; anuncianteId: string; fechaInicio: string; fechaFin: string }[]> = {
    'anc-001': [ // Banco de Chile
        { id: 'con-001', nombre: 'Contrato Principal Banco de Chile', numero: 'CON-2024-001', estado: 'activo', anuncianteId: 'anc-001', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
        { id: 'con-002', nombre: 'Pauta Navidades 2024', numero: 'CON-2024-015', estado: 'activo', anuncianteId: 'anc-001', fechaInicio: '2024-11-01', fechaFin: '2024-12-31' },
    ],
    'anc-002': [ // Coca-Cola Chile
        { id: 'con-003', nombre: 'Campaña Verano 2024', numero: 'CON-2024-002', estado: 'activo', anuncianteId: 'anc-002', fechaInicio: '2024-01-15', fechaFin: '2024-03-31' },
        { id: 'con-004', nombre: 'Pauta Invierno 2024', numero: 'CON-2024-008', estado: 'activo', anuncianteId: 'anc-002', fechaInicio: '2024-06-01', fechaFin: '2024-08-31' },
    ],
    'anc-003': [ // LATAM Airlines
        { id: 'con-005', nombre: 'Campaña Destino Chile', numero: 'CON-2024-003', estado: 'activo', anuncianteId: 'anc-003', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
    ],
    'anc-004': [ // Falabella
        { id: 'con-006', nombre: 'Liquidación Verano 2024', numero: 'CON-2024-004', estado: 'activo', anuncianteId: 'anc-004', fechaInicio: '2024-01-01', fechaFin: '2024-06-30' },
        { id: 'con-007', nombre: 'Cyber Day 2024', numero: 'CON-2024-010', estado: 'activo', anuncianteId: 'anc-004', fechaInicio: '2024-05-27', fechaFin: '2024-06-30' },
        { id: 'con-008', nombre: 'Navidades Falabella', numero: 'CON-2024-016', estado: 'activo', anuncianteId: 'anc-004', fechaInicio: '2024-11-01', fechaFin: '2024-12-31' },
    ],
    'anc-005': [ // Entel
        { id: 'con-009', nombre: 'Campaña 5G 2024', numero: 'CON-2024-005', estado: 'activo', anuncianteId: 'anc-005', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
    ],
    'anc-006': [ // Lollapalooza Chile
        { id: 'con-010', nombre: 'Lollapalooza 2024', numero: 'CON-2024-006', estado: 'activo', anuncianteId: 'anc-006', fechaInicio: '2024-03-15', fechaFin: '2024-03-18' },
    ],
    'anc-007': [ // Ripley
        { id: 'con-011', nombre: 'Cyber Ripley 2024', numero: 'CON-2024-007', estado: 'activo', anuncianteId: 'anc-007', fechaInicio: '2024-05-27', fechaFin: '2024-06-03' },
    ],
    'anc-008': [ // Paris
        { id: 'con-012', nombre: 'Cyber Paris 2024', numero: 'CON-2024-011', estado: 'activo', anuncianteId: 'anc-008', fechaInicio: '2024-05-27', fechaFin: '2024-06-30' },
        { id: 'con-013', nombre: 'Liquidación Invierno', numero: 'CON-2024-014', estado: 'activo', anuncianteId: 'anc-008', fechaInicio: '2024-07-01', fechaFin: '2024-07-31' },
    ],
    'anc-009': [ // Samsung Electronics
        { id: 'con-014', nombre: 'Lanzamiento Galaxy S24', numero: 'CON-2024-009', estado: 'activo', anuncianteId: 'anc-009', fechaInicio: '2024-01-17', fechaFin: '2024-02-28' },
    ],
    'anc-010': [ // Movistar
        { id: 'con-015', nombre: 'Pauta Postpago 2024', numero: 'CON-2024-012', estado: 'activo', anuncianteId: 'anc-010', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
    ],
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const anuncianteId = searchParams.get('anuncianteId') || '';
        const estado = searchParams.get('estado') || 'activo';

        // Si no hay anunciante, devolver todos los contratos
        let results: typeof mockContratos[string] = [];

        if (anuncianteId && mockContratos[anuncianteId]) {
            results = mockContratos[anuncianteId];
        } else {
            // Obtener todos los contratos
            results = Object.values(mockContratos).flat();
        }

        // Filtrar por estado si se especifica
        if (estado && estado !== 'todos') {
            results = results.filter(c => c.estado === estado);
        }

        return NextResponse.json({
            success: true,
            data: results,
            meta: { total: results.length, anuncianteId, estado }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al buscar contratos' },
            { status: 500 }
        );
    }
}