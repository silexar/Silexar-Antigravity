/**
 * GET /api/registro-emision/buscar/spx
 * API simplificada para obtener SPX por campaña y fecha.
 */

import { NextRequest, NextResponse } from 'next/server';

// SPX mock por campaña
const mockSPX: Record<string, { id: string; codigo: string; hora: string; duracion: number; tipo: string; campanhaId: string; emisoras: string[] }[]> = {
  'camp-001': [ // Pauta Matutina Banco de Chile
    { id: 'spx-001', codigo: 'BCH-MAT-08H', hora: '08:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-001', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-002', codigo: 'BCH-MAT-09H', hora: '09:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-001', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-003', codigo: 'BCH-MAT-10H', hora: '10:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-001', emisoras: ['emi-001', 'emi-002', 'emi-003'] },
    { id: 'spx-004', codigo: 'BCH-MAT-11H', hora: '11:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-001', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-005', codigo: 'BCH-MAT-12H', hora: '12:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-001', emisoras: ['emi-001', 'emi-002'] },
  ],
  'camp-002': [ // Pauta Vespertina Banco de Chile
    { id: 'spx-006', codigo: 'BCH-VES-14H', hora: '14:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-002', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-007', codigo: 'BCH-VES-15H', hora: '15:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-002', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-008', codigo: 'BCH-VES-16H', hora: '16:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-002', emisoras: ['emi-001', 'emi-002', 'emi-003'] },
    { id: 'spx-009', codigo: 'BCH-VES-17H', hora: '17:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-002', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-010', codigo: 'BCH-VES-18H', hora: '18:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-002', emisoras: ['emi-001', 'emi-002'] },
  ],
  'camp-003': [ // Navidad Banco de Chile 30s
    { id: 'spx-011', codigo: 'BCH-NAV-08H', hora: '08:30', duracion: 30, tipo: 'jingle', campanhaId: 'camp-003', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-012', codigo: 'BCH-NAV-10H', hora: '10:30', duracion: 30, tipo: 'jingle', campanhaId: 'camp-003', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-013', codigo: 'BCH-NAV-12H', hora: '12:30', duracion: 30, tipo: 'jingle', campanhaId: 'camp-003', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-014', codigo: 'BCH-NAV-15H', hora: '15:30', duracion: 30, tipo: 'jingle', campanhaId: 'camp-003', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-015', codigo: 'BCH-NAV-18H', hora: '18:30', duracion: 30, tipo: 'jingle', campanhaId: 'camp-003', emisoras: ['emi-001', 'emi-002'] },
  ],
  'camp-005': [ // Verano Coca-Cola 2024
    { id: 'spx-016', codigo: 'COKE-VER-08H', hora: '08:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-005', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-017', codigo: 'COKE-VER-10H', hora: '10:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-005', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-018', codigo: 'COKE-VER-12H', hora: '12:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-005', emisoras: ['emi-001', 'emi-002', 'emi-006'] },
    { id: 'spx-019', codigo: 'COKE-VER-14H', hora: '14:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-005', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-020', codigo: 'COKE-VER-16H', hora: '16:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-005', emisoras: ['emi-001', 'emi-002'] },
  ],
  'camp-008': [ // Liquidación Verano Falabella
    { id: 'spx-021', codigo: 'FAL-LIQ-09H', hora: '09:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-008', emisoras: ['emi-001', 'emi-002', 'emi-003'] },
    { id: 'spx-022', codigo: 'FAL-LIQ-11H', hora: '11:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-008', emisoras: ['emi-001', 'emi-002', 'emi-003'] },
    { id: 'spx-023', codigo: 'FAL-LIQ-13H', hora: '13:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-008', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-024', codigo: 'FAL-LIQ-15H', hora: '15:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-008', emisoras: ['emi-001', 'emi-002', 'emi-003'] },
    { id: 'spx-025', codigo: 'FAL-LIQ-17H', hora: '17:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-008', emisoras: ['emi-001', 'emi-002'] },
  ],
  'camp-011': [ // 5G Entel 2024
    { id: 'spx-026', codigo: 'ENT-5G-08H', hora: '08:30', duracion: 20, tipo: 'mension', campanhaId: 'camp-011', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-027', codigo: 'ENT-5G-10H', hora: '10:30', duracion: 20, tipo: 'mension', campanhaId: 'camp-011', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-028', codigo: 'ENT-5G-12H', hora: '12:30', duracion: 20, tipo: 'mension', campanhaId: 'camp-011', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-029', codigo: 'ENT-5G-14H', hora: '14:30', duracion: 20, tipo: 'mension', campanhaId: 'camp-011', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-030', codigo: 'ENT-5G-16H', hora: '16:30', duracion: 20, tipo: 'mension', campanhaId: 'camp-011', emisoras: ['emi-001', 'emi-002'] },
  ],
  'camp-017': [ // Postpago Movistar 2024
    { id: 'spx-031', codigo: 'MOV-POST-08H', hora: '08:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-017', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-032', codigo: 'MOV-POST-09H', hora: '09:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-017', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-033', codigo: 'MOV-POST-10H', hora: '10:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-017', emisoras: ['emi-001', 'emi-002', 'emi-003'] },
    { id: 'spx-034', codigo: 'MOV-POST-11H', hora: '11:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-017', emisoras: ['emi-001', 'emi-002'] },
    { id: 'spx-035', codigo: 'MOV-POST-12H', hora: '12:00', duracion: 30, tipo: 'spot', campanhaId: 'camp-017', emisoras: ['emi-001', 'emi-002'] },
  ],
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campanaId = searchParams.get('campanaId') || '';
    const fecha = searchParams.get('fecha') || '';
    const emisorasParam = searchParams.get('emisoras') || '';

    let results: typeof mockSPX[string] = [];

    if (campanaId && mockSPX[campanaId]) {
      results = mockSPX[campanaId];
    } else {
      // Obtener todos los SPX de todas las campañas
      results = Object.values(mockSPX).flat();
    }

    // Filtrar por emisoras si se especifica
    if (emisorasParam) {
      const emisorasFilter = emisorasParam.split(',');
      results = results.filter(spx =>
        spx.emisoras.some(e => emisorasFilter.includes(e))
      );
    }

    return NextResponse.json({
      success: true,
      data: results,
      meta: { total: results.length, campanaId, fecha, emisoras: emisorasParam }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al buscar SPX' },
      { status: 500 }
    );
  }
}
