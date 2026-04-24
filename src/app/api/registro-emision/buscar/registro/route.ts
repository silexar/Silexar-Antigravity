/**
 * POST /api/registro-emision/buscar/registro
 * API para buscar registros de emisión con rango ±10 minutos.
 */

import { NextRequest, NextResponse } from 'next/server';

// SPX con resultados simulados (algunos encontrados, otros no)
const spxResults: Record<string, { encontrado: boolean; horaOriginal: string; horaEncontrada?: string; diferenciaMin: number }> = {
    'spx-001': { encontrado: true, horaOriginal: '08:00', horaEncontrada: '08:03', diferenciaMin: 3 },
    'spx-002': { encontrado: true, horaOriginal: '09:00', horaEncontrada: '08:58', diferenciaMin: -2 },
    'spx-003': { encontrado: true, horaOriginal: '10:00', horaEncontrada: '10:07', diferenciaMin: 7 },
    'spx-004': { encontrado: false, horaOriginal: '11:00', diferenciaMin: 0 },
    'spx-005': { encontrado: true, horaOriginal: '12:00', horaEncontrada: '11:56', diferenciaMin: -4 },
    'spx-006': { encontrado: true, horaOriginal: '14:00', horaEncontrada: '14:02', diferenciaMin: 2 },
    'spx-007': { encontrado: false, horaOriginal: '15:00', diferenciaMin: 0 },
    'spx-008': { encontrado: true, horaOriginal: '16:00', horaEncontrada: '15:55', diferenciaMin: -5 },
    'spx-009': { encontrado: true, horaOriginal: '17:00', horaEncontrada: '17:08', diferenciaMin: 8 },
    'spx-010': { encontrado: false, horaOriginal: '18:00', diferenciaMin: 0 },
    'spx-011': { encontrado: true, horaOriginal: '08:30', horaEncontrada: '08:33', diferenciaMin: 3 },
    'spx-012': { encontrado: true, horaOriginal: '10:30', horaEncontrada: '10:27', diferenciaMin: -3 },
    'spx-013': { encontrado: false, horaOriginal: '12:30', diferenciaMin: 0 },
    'spx-014': { encontrado: true, horaOriginal: '15:30', horaEncontrada: '15:35', diferenciaMin: 5 },
    'spx-015': { encontrado: true, horaOriginal: '18:30', horaEncontrada: '18:28', diferenciaMin: -2 },
    'spx-016': { encontrado: true, horaOriginal: '08:00', horaEncontrada: '08:01', diferenciaMin: 1 },
    'spx-017': { encontrado: true, horaOriginal: '10:00', horaEncontrada: '09:58', diferenciaMin: -2 },
    'spx-018': { encontrado: false, horaOriginal: '12:00', diferenciaMin: 0 },
    'spx-019': { encontrado: true, horaOriginal: '14:00', horaEncontrada: '14:05', diferenciaMin: 5 },
    'spx-020': { encontrado: true, horaOriginal: '16:00', horaEncontrada: '15:57', diferenciaMin: -3 },
    'spx-021': { encontrado: true, horaOriginal: '09:00', horaEncontrada: '09:02', diferenciaMin: 2 },
    'spx-022': { encontrado: true, horaOriginal: '11:00', horaEncontrada: '10:58', diferenciaMin: -2 },
    'spx-023': { encontrado: false, horaOriginal: '13:00', diferenciaMin: 0 },
    'spx-024': { encontrado: true, horaOriginal: '15:00', horaEncontrada: '15:04', diferenciaMin: 4 },
    'spx-025': { encontrado: true, horaOriginal: '17:00', horaEncontrada: '16:56', diferenciaMin: -4 },
    'spx-026': { encontrado: true, horaOriginal: '08:30', horaEncontrada: '08:31', diferenciaMin: 1 },
    'spx-027': { encontrado: true, horaOriginal: '10:30', horaEncontrada: '10:29', diferenciaMin: -1 },
    'spx-028': { encontrado: false, horaOriginal: '12:30', diferenciaMin: 0 },
    'spx-029': { encontrado: true, horaOriginal: '14:30', horaEncontrada: '14:32', diferenciaMin: 2 },
    'spx-030': { encontrado: true, horaOriginal: '16:30', horaEncontrada: '16:28', diferenciaMin: -2 },
    'spx-031': { encontrado: true, horaOriginal: '08:00', horaEncontrada: '08:00', diferenciaMin: 0 },
    'spx-032': { encontrado: true, horaOriginal: '09:00', horaEncontrada: '09:03', diferenciaMin: 3 },
    'spx-033': { encontrado: true, horaOriginal: '10:00', horaEncontrada: '09:57', diferenciaMin: -3 },
    'spx-034': { encontrado: false, horaOriginal: '11:00', diferenciaMin: 0 },
    'spx-035': { encontrado: true, horaOriginal: '12:00', horaEncontrada: '12:06', diferenciaMin: 6 },
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { spxIds, campanaId, fecha, emisoras } = body;

        if (!spxIds || !Array.isArray(spxIds) || spxIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Se requiere un array de IDs de SPX'
            }, { status: 400 });
        }

        // Simular delay de búsqueda
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generar resultados para cada SPX
        const resultados = spxIds.map((spxId: string) => {
            const result = spxResults[spxId] || { encontrado: false, horaOriginal: '00:00', diferenciaMin: 0 };

            // Determinar el tipo de material basándose en el SPX
            let tipo = 'spot';
            let nombre = `Material SPX ${spxId}`;

            if (spxId.startsWith('spx-01') && ['1', '2', '3', '4', '5'].some(n => spxId.endsWith(n))) {
                tipo = 'jingle';
                nombre = 'Jingle Navideño';
            } else if (spxId.startsWith('spx-02') && ['6', '7', '8', '9', '0'].some(n => spxId.includes(n))) {
                tipo = 'mencion';
                nombre = 'Mención Especial';
            }

            return {
                id: spxId,
                codigo: `SPX-${spxId.split('-')[1]}`,
                nombre,
                tipo,
                encontrado: result.encontrado,
                hora: result.horaOriginal,
                horaEncontrada: result.horaEncontrada || null,
                diferenciaMin: result.diferenciaMin,
                duracion: 30,
                fecha,
                archivoUrl: result.encontrado ? `/audio/material-${spxId}.mp3` : null,
                emisorAsignada: emisoras?.[0] || 'Duno',
            };
        });

        return NextResponse.json({
            success: true,
            data: resultados,
            meta: {
                total: resultados.length,
                encontrados: resultados.filter(r => r.encontrado).length,
                noEncontrados: resultados.filter(r => !r.encontrado).length
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al buscar registros' },
            { status: 500 }
        );
    }
}