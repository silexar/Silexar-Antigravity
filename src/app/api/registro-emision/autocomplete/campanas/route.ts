/**
 * GET /api/registro-emision/autocomplete/campanas
 * API simplificada para obtener campañas por contrato.
 */

import { NextRequest, NextResponse } from 'next/server';

// Campañas mock por contrato
const mockCampanas: Record<string, { id: string; nombre: string; codigo: string; contratoId: string; estado: string; fechaInicio: string; fechaFin: string }[]> = {
    'con-001': [ // Contrato Principal Banco de Chile
        { id: 'camp-001', nombre: 'Pauta Matutina Banco de Chile', codigo: 'BCH-MAT-2024', contratoId: 'con-001', estado: 'activa', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
        { id: 'camp-002', nombre: 'Pauta Vespertina Banco de Chile', codigo: 'BCH-VES-2024', contratoId: 'con-001', estado: 'activa', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
    ],
    'con-002': [ // Pauta Navidades 2024
        { id: 'camp-003', nombre: 'Navidad Banco de Chile 30s', codigo: 'BCH-NAV-30', contratoId: 'con-002', estado: 'activa', fechaInicio: '2024-11-01', fechaFin: '2024-12-31' },
        { id: 'camp-004', nombre: 'Navidad Banco de Chile 20s', codigo: 'BCH-NAV-20', contratoId: 'con-002', estado: 'activa', fechaInicio: '2024-11-01', fechaFin: '2024-12-31' },
    ],
    'con-003': [ // Campaña Verano Coca-Cola
        { id: 'camp-005', nombre: 'Verano Coca-Cola 2024', codigo: 'COKE-VER-24', contratoId: 'con-003', estado: 'activa', fechaInicio: '2024-01-15', fechaFin: '2024-03-31' },
    ],
    'con-004': [ // Pauta Invierno Coca-Cola
        { id: 'camp-006', nombre: 'Invierno Coca-Cola 2024', codigo: 'COKE-INV-24', contratoId: 'con-004', estado: 'activa', fechaInicio: '2024-06-01', fechaFin: '2024-08-31' },
    ],
    'con-005': [ // LATAM Airlines
        { id: 'camp-007', nombre: 'Destino Chile LATAM', codigo: 'LAT-CHI-24', contratoId: 'con-005', estado: 'activa', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
    ],
    'con-006': [ // Liquidación Verano Falabella
        { id: 'camp-008', nombre: 'Liquidación Verano Falabella', codigo: 'FAL-LIQ-24', contratoId: 'con-006', estado: 'activa', fechaInicio: '2024-01-01', fechaFin: '2024-06-30' },
    ],
    'con-007': [ // Cyber Day Falabella
        { id: 'camp-009', nombre: 'Cyber Day Falabella', codigo: 'FAL-CYBER-24', contratoId: 'con-007', estado: 'activa', fechaInicio: '2024-05-27', fechaFin: '2024-06-30' },
    ],
    'con-008': [ // Navidades Falabella
        { id: 'camp-010', nombre: 'Navidad Falabella 2024', codigo: 'FAL-NAV-24', contratoId: 'con-008', estado: 'activa', fechaInicio: '2024-11-01', fechaFin: '2024-12-31' },
    ],
    'con-009': [ // Campaña 5G Entel
        { id: 'camp-011', nombre: '5G Entel 2024', codigo: 'ENT-5G-24', contratoId: 'con-009', estado: 'activa', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
    ],
    'con-010': [ // Lollapalooza 2024
        { id: 'camp-012', nombre: 'Lollapalooza Chile 2024', codigo: 'LOLLA-24', contratoId: 'con-010', estado: 'activa', fechaInicio: '2024-03-15', fechaFin: '2024-03-18' },
    ],
    'con-011': [ // Cyber Ripley
        { id: 'camp-013', nombre: 'Cyber Ripley 2024', codigo: 'RIP-CYBER-24', contratoId: 'con-011', estado: 'activa', fechaInicio: '2024-05-27', fechaFin: '2024-06-03' },
    ],
    'con-012': [ // Cyber Paris
        { id: 'camp-014', nombre: 'Cyber Paris 2024', codigo: 'PAR-CYBER-24', contratoId: 'con-012', estado: 'activa', fechaInicio: '2024-05-27', fechaFin: '2024-06-30' },
    ],
    'con-013': [ // Liquidación Invierno Paris
        { id: 'camp-015', nombre: 'Invierno Paris 2024', codigo: 'PAR-INV-24', contratoId: 'con-013', estado: 'activa', fechaInicio: '2024-07-01', fechaFin: '2024-07-31' },
    ],
    'con-014': [ // Lanzamiento Galaxy Samsung
        { id: 'camp-016', nombre: 'Galaxy S24 Launch', codigo: 'SAM-GAL-24', contratoId: 'con-014', estado: 'activa', fechaInicio: '2024-01-17', fechaFin: '2024-02-28' },
    ],
    'con-015': [ // Pauta Postpago Movistar
        { id: 'camp-017', nombre: 'Postpago Movistar 2024', codigo: 'MOV-POST-24', contratoId: 'con-015', estado: 'activa', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' },
    ],
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const contratoId = searchParams.get('contratoId') || '';

        let results: typeof mockCampanas[string] = [];

        if (contratoId && mockCampanas[contratoId]) {
            results = mockCampanas[contratoId];
        } else {
            // Obtener todas las campañas
            results = Object.values(mockCampanas).flat();
        }

        return NextResponse.json({
            success: true,
            data: results,
            meta: { total: results.length, contratoId }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al buscar campañas' },
            { status: 500 }
        );
    }
}