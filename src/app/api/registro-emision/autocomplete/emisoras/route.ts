/**
 * GET /api/registro-emision/autocomplete/emisoras
 * API simplificada para obtener emisoras/radios por campaña.
 */

import { NextRequest, NextResponse } from 'next/server';

// Emisoras mock del sistema
const mockEmisoras = [
    { id: 'emi-001', nombre: 'Duno', frecuencia: '100.5 FM', tipo: ' FM', region: 'Santiago' },
    { id: 'emi-002', nombre: 'Corazón', frecuencia: '101.1 FM', tipo: 'FM', region: 'Santiago' },
    { id: 'emi-003', nombre: 'Musical', frecuencia: '93.3 FM', tipo: 'FM', region: 'Santiago' },
    { id: 'emi-004', nombre: 'Activa', frecuencia: '98.9 FM', tipo: 'FM', region: 'Santiago' },
    { id: 'emi-005', nombre: 'Futura', frecuencia: '89.7 FM', tipo: 'FM', region: 'Santiago' },
    { id: 'emi-006', nombre: 'Canadio', frecuencia: '102.1 FM', tipo: 'FM', region: 'Valparaíso' },
    { id: 'emi-007', nombre: 'Bio-Bio', frecuencia: '98.5 FM', tipo: 'FM', region: 'Concepción' },
    { id: 'emi-008', nombre: 'Cooperativa', frecuencia: '95.1 FM', tipo: 'FM', region: 'Santiago' },
];

// Emisoras por campaña (todas tienen acceso a las principales en este mock)
const emisorasPorCampana: Record<string, string[]> = {
    'camp-001': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-002': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-003': ['emi-001', 'emi-002', 'emi-006'],
    'camp-004': ['emi-001', 'emi-002', 'emi-006', 'emi-007'],
    'camp-005': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005', 'emi-006', 'emi-007', 'emi-008'],
    'camp-006': ['emi-001', 'emi-002', 'emi-006'],
    'camp-007': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-008': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-009': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-010': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-011': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005', 'emi-006', 'emi-007', 'emi-008'],
    'camp-012': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-013': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-014': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-015': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-016': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005'],
    'camp-017': ['emi-001', 'emi-002', 'emi-003', 'emi-004', 'emi-005', 'emi-006', 'emi-007', 'emi-008'],
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const campanaId = searchParams.get('campanaId') || '';

        let emisorIds: string[] = [];

        if (campanaId && emisorasPorCampana[campanaId]) {
            emisorIds = emisorasPorCampana[campanaId];
        } else {
            // Por defecto todas las emisoras
            emisorIds = mockEmisoras.map(e => e.id);
        }

        const results = mockEmisoras.filter(e => emisorIds.includes(e.id));

        return NextResponse.json({
            success: true,
            data: results,
            meta: { total: results.length, campanaId }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al buscar emisoras' },
            { status: 500 }
        );
    }
}